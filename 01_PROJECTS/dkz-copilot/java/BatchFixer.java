package de.devkitz.copilot;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * BatchFixer — Fixt einfache Patterns automatisch (Regex-basiert, kein LLM).
 *
 * Fixes:
 *   1. Meta dkz-version Tag hinzufuegen wenn fehlend
 *   2. Hub-Button hinzufuegen wenn fehlend
 *   3. console.log/warn/error/debug Aufrufe entfernen
 *
 * Optionen:
 *   --dry-run    Nur pruefen, nichts aendern
 *   --no-backup  Kein Backup erstellen (Standard: .bak Dateien)
 *   --verbose    Ausfuehrliche Ausgabe
 *
 * Kompilieren: javac -d out de/devkitz/copilot/BatchFixer.java
 * Ausfuehren:  java -cp out de.devkitz.copilot.BatchFixer "C:\DEVKiTZ\01_PROJECTS\01_dashboard\modules" --dry-run
 *
 * Kompatibel mit Java 11+
 */
public class BatchFixer {

    // --- Konfiguration ---

    private static final String META_VERSION_TAG =
        "    <meta name=\"dkz-version\" content=\"v1.00.0_01\">";

    private static final String HUB_BUTTON_HTML =
        "  <a href=\"../../hub/index.html\" class=\"hub-btn\">\u25C0 Hub</a>";

    /** Regex: Meta dkz-version vorhanden? */
    private static final Pattern META_VERSION_PATTERN = Pattern.compile(
        "<meta\\s+name\\s*=\\s*[\"']dkz-version[\"']",
        Pattern.CASE_INSENSITIVE
    );

    /** Regex: Hub-Button vorhanden? */
    private static final Pattern HUB_BUTTON_PATTERN = Pattern.compile(
        "(class\\s*=\\s*[\"'][^\"']*hub-btn[^\"']*[\"']|href\\s*=\\s*[\"'][^\"']*hub[/\\\\]index\\.html[\"'])",
        Pattern.CASE_INSENSITIVE
    );

    /** Regex: console.log/warn/error/debug/info Zeilen (ganze Zeile) */
    private static final Pattern CONSOLE_LOG_LINE = Pattern.compile(
        "^\\s*console\\.(log|warn|error|debug|info)\\s*\\(.*\\);?\\s*$"
    );

    /** Regex: Alle <meta> Tags finden */
    private static final Pattern META_TAG_PATTERN = Pattern.compile(
        "<meta\\s[^>]*>", Pattern.CASE_INSENSITIVE
    );

    /** Regex: <body> Tag finden */
    private static final Pattern BODY_TAG = Pattern.compile(
        "(<body[^>]*>)", Pattern.CASE_INSENSITIVE
    );

    // --- Datenmodell (Java 11 kompatibel) ---

    private static final class FixAction {
        final String rule;
        final String description;

        FixAction(String rule, String description) {
            this.rule = rule;
            this.description = description;
        }
    }

    private static final class ModuleReport {
        final String module;
        final String path;
        final List<FixAction> actions;
        final boolean modified;

        ModuleReport(String module, String path, List<FixAction> actions, boolean modified) {
            this.module = module;
            this.path = path;
            this.actions = actions;
            this.modified = modified;
        }
    }

    // --- Fix-Logik ---

    /**
     * Fixt ein einzelnes Modul und gibt Report zurueck.
     */
    private static ModuleReport fixModule(Path moduleDir, boolean dryRun, boolean noBackup, boolean verbose) {
        String moduleName = moduleDir.getFileName().toString();
        Path indexPath = moduleDir.resolve("index.html");
        List<FixAction> actions = new ArrayList<>();

        if (!Files.exists(indexPath)) {
            return new ModuleReport(moduleName, moduleDir.toString(), actions, false);
        }

        String content;
        try {
            byte[] bytes = Files.readAllBytes(indexPath);
            content = new String(bytes, StandardCharsets.UTF_8);
        } catch (IOException e) {
            System.err.println("  FEHLER: Kann nicht lesen: " + indexPath + " — " + e.getMessage());
            return new ModuleReport(moduleName, indexPath.toString(), actions, false);
        }

        String original = content;

        // --- Fix 1: Meta dkz-version Tag ---
        if (!META_VERSION_PATTERN.matcher(content).find()) {
            int insertPos = findMetaInsertPosition(content);
            if (insertPos > 0) {
                content = content.substring(0, insertPos) + "\n" + META_VERSION_TAG + content.substring(insertPos);
                actions.add(new FixAction("META_VERSION", "Meta dkz-version Tag eingefuegt"));
                if (verbose) {
                    System.err.println("    [+] Meta dkz-version Tag eingefuegt");
                }
            }
        }

        // --- Fix 2: Hub-Button ---
        if (!HUB_BUTTON_PATTERN.matcher(content).find()) {
            Matcher bodyMatcher = BODY_TAG.matcher(content);
            if (bodyMatcher.find()) {
                int insertPos = bodyMatcher.end();
                content = content.substring(0, insertPos)
                    + "\n\n" + HUB_BUTTON_HTML + "\n"
                    + content.substring(insertPos);
                actions.add(new FixAction("HUB_BUTTON", "Hub-Button eingefuegt nach <body>"));
                if (verbose) {
                    System.err.println("    [+] Hub-Button eingefuegt");
                }
            }
        }

        // --- Fix 3: console.log entfernen ---
        String[] lines = content.split("\n", -1);
        List<String> cleanedLines = new ArrayList<>();
        int removedCount = 0;
        boolean insideScript = false;

        for (String line : lines) {
            String lower = line.toLowerCase().trim();

            // Script-Block tracking
            if (lower.contains("<script")) insideScript = true;
            if (lower.contains("</script>")) insideScript = false;

            // Nur innerhalb von <script> Bloecken console.* entfernen
            if (insideScript && CONSOLE_LOG_LINE.matcher(line).matches()) {
                removedCount++;
                if (verbose) {
                    System.err.println("    [-] console.* entfernt: " + line.trim());
                }
                continue; // Zeile ueberspringen
            }
            cleanedLines.add(line);
        }

        if (removedCount > 0) {
            content = String.join("\n", cleanedLines);
            actions.add(new FixAction("CONSOLE_LOG",
                removedCount + " console.* Aufrufe entfernt"));
        }

        // --- Aenderungen schreiben ---
        boolean modified = !content.equals(original);

        if (modified && !dryRun) {
            try {
                // Backup erstellen
                if (!noBackup) {
                    Path backupPath = indexPath.resolveSibling("index.html.bak");
                    Files.copy(indexPath, backupPath, StandardCopyOption.REPLACE_EXISTING);
                }
                // Geaenderte Datei schreiben
                Files.write(indexPath, content.getBytes(StandardCharsets.UTF_8));
            } catch (IOException e) {
                System.err.println("  FEHLER: Kann nicht schreiben: " + indexPath + " — " + e.getMessage());
                return new ModuleReport(moduleName, indexPath.toString(), actions, false);
            }
        }

        return new ModuleReport(moduleName, indexPath.toString(), actions, modified);
    }

    /**
     * Findet die Position nach dem letzten <meta>-Tag im <head>,
     * um den dkz-version Tag sauber einzufuegen.
     */
    private static int findMetaInsertPosition(String content) {
        Matcher matcher = META_TAG_PATTERN.matcher(content);
        int lastMetaEnd = -1;

        // Position von </head> finden
        int headCloseIdx = content.toLowerCase().indexOf("</head>");

        while (matcher.find()) {
            // Nur Metas im <head> beruecksichtigen
            if (headCloseIdx < 0 || matcher.end() < headCloseIdx) {
                lastMetaEnd = matcher.end();
            }
        }

        // Falls Meta-Tags gefunden, nach dem letzten einfuegen
        if (lastMetaEnd > 0) {
            return lastMetaEnd;
        }

        // Fallback: direkt nach <head>
        int headIdx = content.toLowerCase().indexOf("<head>");
        if (headIdx >= 0) {
            return headIdx + "<head>".length();
        }

        // Letzter Fallback: nach <html>
        int htmlIdx = content.toLowerCase().indexOf("<html");
        if (htmlIdx >= 0) {
            int closeTag = content.indexOf('>', htmlIdx);
            if (closeTag >= 0) return closeTag + 1;
        }

        return -1;
    }

    // --- Report-Ausgabe ---

    /**
     * Druckt den Report als JSON nach stdout.
     */
    private static void printJsonReport(List<ModuleReport> reports, boolean dryRun) {
        StringBuilder sb = new StringBuilder();
        sb.append("{\n");
        sb.append("  \"timestamp\": \"").append(escapeJson(LocalDateTime.now()
            .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))).append("\",\n");
        sb.append("  \"dryRun\": ").append(dryRun).append(",\n");
        sb.append("  \"totalModules\": ").append(reports.size()).append(",\n");

        long modifiedCount = 0;
        for (ModuleReport r : reports) {
            if (!r.actions.isEmpty()) modifiedCount++;
        }
        sb.append("  \"modulesModified\": ").append(modifiedCount).append(",\n");
        sb.append("  \"modules\": [\n");

        // Nur Module mit Aenderungen ausgeben
        List<ModuleReport> withActions = new ArrayList<>();
        for (ModuleReport r : reports) {
            if (!r.actions.isEmpty()) withActions.add(r);
        }

        for (int i = 0; i < withActions.size(); i++) {
            ModuleReport report = withActions.get(i);
            sb.append("    {\n");
            sb.append("      \"module\": \"").append(escapeJson(report.module)).append("\",\n");
            sb.append("      \"path\": \"").append(escapeJson(report.path)).append("\",\n");
            sb.append("      \"modified\": ").append(report.modified).append(",\n");
            sb.append("      \"actions\": [\n");

            for (int j = 0; j < report.actions.size(); j++) {
                FixAction action = report.actions.get(j);
                sb.append("        {\n");
                sb.append("          \"rule\": \"").append(escapeJson(action.rule)).append("\",\n");
                sb.append("          \"description\": \"").append(escapeJson(action.description)).append("\"\n");
                sb.append("        }");
                if (j < report.actions.size() - 1) sb.append(",");
                sb.append("\n");
            }

            sb.append("      ]\n");
            sb.append("    }");
            if (i < withActions.size() - 1) sb.append(",");
            sb.append("\n");
        }

        sb.append("  ]\n");
        sb.append("}\n");

        System.out.print(sb);
    }

    /**
     * Druckt die Zusammenfassung nach stderr.
     */
    private static void printSummary(List<ModuleReport> reports, boolean dryRun) {
        int totalModules = reports.size();
        int fixedModules = 0;
        int metaFixes = 0, hubFixes = 0, consoleFixes = 0;

        for (ModuleReport r : reports) {
            if (!r.actions.isEmpty()) fixedModules++;
            for (FixAction a : r.actions) {
                switch (a.rule) {
                    case "META_VERSION": metaFixes++;   break;
                    case "HUB_BUTTON":   hubFixes++;    break;
                    case "CONSOLE_LOG":  consoleFixes++; break;
                }
            }
        }

        String mode = dryRun ? "DRY-RUN" : "APPLIED";

        System.err.println();
        System.err.println("==============================================");
        System.err.println("   DkZ BatchFixer — " + mode);
        System.err.println("==============================================");
        System.err.printf("  Module gesamt:       %-18d%n", totalModules);
        System.err.printf("  Module %s:   %-18d%n", dryRun ? "betroffen" : "geaendert", fixedModules);
        System.err.println("----------------------------------------------");
        System.err.printf("  Meta-Tags:           %-18d%n", metaFixes);
        System.err.printf("  Hub-Buttons:         %-18d%n", hubFixes);
        System.err.printf("  Console-Removes:     %-18d%n", consoleFixes);
        System.err.println("==============================================");

        if (dryRun) {
            System.err.println();
            System.err.println("  DRY-RUN Modus — keine Dateien geaendert.");
            System.err.println("  Ohne --dry-run ausfuehren um Fixes anzuwenden.");
        }
    }

    private static String escapeJson(String s) {
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    // --- Main ---

    public static void main(String[] args) {
        if (args.length < 1) {
            System.err.println("Usage: java de.devkitz.copilot.BatchFixer <modules-pfad> [optionen]");
            System.err.println();
            System.err.println("Optionen:");
            System.err.println("  --dry-run     Nur pruefen, nichts aendern");
            System.err.println("  --no-backup   Kein .bak Backup erstellen");
            System.err.println("  --verbose     Ausfuehrliche Ausgabe");
            System.err.println();
            System.err.println("Beispiel:");
            System.err.println("  java de.devkitz.copilot.BatchFixer \"01_PROJECTS/01_dashboard/modules\" --dry-run");
            System.exit(2);
        }

        // Argumente parsen
        Path modulesRoot = Paths.get(args[0]).toAbsolutePath();
        boolean dryRun = false;
        boolean noBackup = false;
        boolean verbose = false;

        for (int i = 1; i < args.length; i++) {
            switch (args[i]) {
                case "--dry-run":   dryRun = true;   break;
                case "--no-backup": noBackup = true;  break;
                case "--verbose":   verbose = true;   break;
                default:
                    System.err.println("Unbekannte Option: " + args[i]);
                    System.exit(2);
            }
        }

        if (!Files.isDirectory(modulesRoot)) {
            System.err.println("FEHLER: Verzeichnis nicht gefunden: " + modulesRoot);
            System.exit(2);
        }

        // Alle Modul-Verzeichnisse sammeln
        List<Path> moduleDirs = new ArrayList<>();
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(modulesRoot)) {
            for (Path entry : stream) {
                if (Files.isDirectory(entry)) {
                    moduleDirs.add(entry);
                }
            }
        } catch (IOException e) {
            System.err.println("FEHLER: Kann Module nicht lesen: " + e.getMessage());
            System.exit(2);
        }

        Collections.sort(moduleDirs);
        System.err.println("DkZ BatchFixer — " + (dryRun ? "DRY-RUN" : "LIVE") +
            " Modus, " + moduleDirs.size() + " Module...");
        System.err.println();

        // Sequentiell fixen (Dateisystem-Writes nicht parallelisieren)
        List<ModuleReport> reports = new ArrayList<>();

        for (Path dir : moduleDirs) {
            String name = dir.getFileName().toString();
            if (verbose) {
                System.err.println("  Pruefe: " + name);
            }

            ModuleReport report = fixModule(dir, dryRun, noBackup, verbose);
            reports.add(report);

            // Kurzinfo fuer geaenderte Module
            if (!report.actions.isEmpty() && !verbose) {
                StringBuilder rules = new StringBuilder();
                for (int j = 0; j < report.actions.size(); j++) {
                    if (j > 0) rules.append(", ");
                    rules.append(report.actions.get(j).rule);
                }
                System.err.println("  " + (dryRun ? "WUERDE" : "FIX") + ": " + name + " — " + rules);
            }
        }

        // JSON Report nach stdout
        printJsonReport(reports, dryRun);

        // Zusammenfassung nach stderr
        printSummary(reports, dryRun);
    }
}
