package de.devkitz.copilot;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * ModuleScanner — Scannt alle Dashboard-Module parallel auf Qualitaetsprobleme.
 *
 * Prueft pro Modul:
 *   1. XSS: innerHTML ohne esc() → severity HIGH
 *   2. Hardcoded Farben (#fa1e4e, #000000 etc.) in JS → severity MEDIUM
 *   3. Fehlende Shared Scripts (dkz-debug.js etc.) → severity LOW
 *   4. Fehlendes meta dkz-version → severity LOW
 *   5. Fehlender Hub-Button → severity LOW
 *
 * Kompilieren: javac -d out de/devkitz/copilot/ModuleScanner.java
 * Ausfuehren:  java -cp out de.devkitz.copilot.ModuleScanner "C:\DEVKiTZ\01_PROJECTS\01_dashboard\modules"
 * Exit:        0 = alle OK, 1 = Findings vorhanden
 *
 * Kompatibel mit Java 11+
 */
public class ModuleScanner {

    // --- Konfiguration ---

    /** Shared Scripts die in jedem Modul vorhanden sein muessen */
    private static final String[] REQUIRED_SHARED_SCRIPTS = {
        "dkz-debug.js",
        "dkz-guide.js",
        "dkz-navbar.js",
        "dkz-copilot.js",
        "dkz-james.js"
    };

    /** Hardcoded Farben die durch CSS-Variablen ersetzt werden sollen */
    private static final String[] HARDCODED_COLORS = {
        "#fa1e4e", "#000000", "#060608", "#00ff88",
        "#ffb800", "#ff3b5c", "#ffffff"
    };

    /**
     * Regex: innerHTML/outerHTML Zuweisung OHNE esc()-Aufruf.
     * Erkennt Muster wie: .innerHTML = variable  (ohne esc())
     * Ignoriert sichere Patterns wie: .innerHTML = '' oder .innerHTML = esc(...)
     */
    private static final Pattern XSS_PATTERN = Pattern.compile(
        "\\.(innerHTML|outerHTML)\\s*[+]?=\\s*(?!\\s*['\"`]\\s*$)(?!.*\\besc\\s*\\()",
        Pattern.MULTILINE
    );

    /** Erkennt meta dkz-version Tag */
    private static final Pattern META_VERSION_PATTERN = Pattern.compile(
        "<meta\\s+name\\s*=\\s*[\"']dkz-version[\"']",
        Pattern.CASE_INSENSITIVE
    );

    /** Erkennt Hub-Button (Link zurueck zum Hub) */
    private static final Pattern HUB_BUTTON_PATTERN = Pattern.compile(
        "(class\\s*=\\s*[\"'][^\"']*hub-btn[^\"']*[\"']|href\\s*=\\s*[\"'][^\"']*hub[/\\\\]index\\.html[\"'])",
        Pattern.CASE_INSENSITIVE
    );

    /** console.log Aufrufe (Info, kein Severity) */
    private static final Pattern CONSOLE_LOG_PATTERN = Pattern.compile(
        "\\bconsole\\.(log|warn|error|debug|info)\\s*\\(",
        Pattern.MULTILINE
    );

    // --- Datenmodell (Java 11 kompatibel) ---

    private enum Severity { HIGH, MEDIUM, LOW, INFO }

    private static final class Issue {
        final String rule;
        final Severity severity;
        final String message;
        final int line;

        Issue(String rule, Severity severity, String message, int line) {
            this.rule = rule;
            this.severity = severity;
            this.message = message;
            this.line = line;
        }
    }

    private static final class ModuleResult {
        final String module;
        final List<Issue> issues;
        final int score;
        final String path;

        ModuleResult(String module, List<Issue> issues, int score, String path) {
            this.module = module;
            this.issues = issues;
            this.score = score;
            this.path = path;
        }
    }

    // --- Scanner-Logik ---

    /**
     * Scannt ein einzelnes Modul (index.html) auf alle Regeln.
     */
    private static ModuleResult scanModule(Path moduleDir) {
        String moduleName = moduleDir.getFileName().toString();
        Path indexPath = moduleDir.resolve("index.html");
        List<Issue> issues = new ArrayList<>();

        if (!Files.exists(indexPath)) {
            issues.add(new Issue("FILE_MISSING", Severity.HIGH,
                "index.html nicht gefunden", 0));
            return new ModuleResult(moduleName, issues, 0, moduleDir.toString());
        }

        List<String> lines;
        String content;
        try {
            lines = Files.readAllLines(indexPath, StandardCharsets.UTF_8);
            content = String.join("\n", lines);
        } catch (IOException e) {
            issues.add(new Issue("READ_ERROR", Severity.HIGH,
                "Datei nicht lesbar: " + e.getMessage(), 0));
            return new ModuleResult(moduleName, issues, 0, moduleDir.toString());
        }

        // --- Regel 1: XSS — innerHTML ohne esc() ---
        checkXss(lines, issues);

        // --- Regel 2: Hardcoded Farben in <script>-Bloecken ---
        checkHardcodedColors(lines, issues);

        // --- Regel 3: Fehlende Shared Scripts ---
        checkSharedScripts(content, issues);

        // --- Regel 4: Meta dkz-version ---
        if (!META_VERSION_PATTERN.matcher(content).find()) {
            issues.add(new Issue("META_VERSION", Severity.LOW,
                "Fehlender <meta name=\"dkz-version\"> Tag", 0));
        }

        // --- Regel 5: Hub-Button ---
        if (!HUB_BUTTON_PATTERN.matcher(content).find()) {
            issues.add(new Issue("HUB_BUTTON", Severity.LOW,
                "Fehlender Hub-Button (Zurueck zum Hub)", 0));
        }

        // --- Bonus: console.log in Produktion ---
        checkConsoleLogs(lines, issues);

        // Score berechnen (100 = perfekt)
        int score = calculateScore(issues);

        return new ModuleResult(moduleName, issues, score, indexPath.toString());
    }

    /**
     * Prueft auf innerHTML-Zuweisungen ohne esc().
     * Ignoriert sichere Muster: leere Strings, HTML-Literals, esc() Aufrufe.
     */
    private static void checkXss(List<String> lines, List<Issue> issues) {
        for (int i = 0; i < lines.size(); i++) {
            String line = lines.get(i).trim();

            // Nur Zeilen mit innerHTML/outerHTML pruefen
            if (!line.contains("innerHTML") && !line.contains("outerHTML")) continue;

            // Sichere Patterns ueberspringen
            if (line.contains("innerHTML=''") || line.contains("innerHTML=\"\"")) continue;
            if (line.contains("innerHTML = ''") || line.contains("innerHTML = \"\"")) continue;

            Matcher m = XSS_PATTERN.matcher(line);
            if (m.find()) {
                // Pruefen ob esc() irgendwo in der gleichen Zuweisung ist
                String afterAssignment = line.substring(m.start());
                if (!afterAssignment.contains("esc(")) {
                    issues.add(new Issue("XSS_INNERHTML", Severity.HIGH,
                        "innerHTML ohne esc() erkannt: " + truncate(line, 80),
                        i + 1));
                }
            }
        }
    }

    /**
     * Prueft auf hardcoded Farben (#fa1e4e etc.) innerhalb von Script-Tags.
     * CSS-Definitionen in :root / style sind erlaubt.
     */
    private static void checkHardcodedColors(List<String> lines, List<Issue> issues) {
        boolean insideScript = false;

        for (int i = 0; i < lines.size(); i++) {
            String line = lines.get(i);
            String lower = line.toLowerCase();

            if (lower.contains("<script")) insideScript = true;
            if (lower.contains("</script>")) { insideScript = false; continue; }

            if (!insideScript) continue;

            for (String color : HARDCODED_COLORS) {
                if (lower.contains(color.toLowerCase())) {
                    // Nur melden wenn es NICHT in einem CSS-Variable-Block steht
                    if (!lower.contains("var(--") && !lower.contains(":root")) {
                        issues.add(new Issue("HARDCODED_COLOR", Severity.MEDIUM,
                            "Hardcoded Farbe " + color + " in JS (Zeile " + (i + 1) + "), nutze CSS Variable",
                            i + 1));
                    }
                }
            }
        }
    }

    /**
     * Prueft ob die erforderlichen Shared Scripts eingebunden sind.
     */
    private static void checkSharedScripts(String content, List<Issue> issues) {
        for (String script : REQUIRED_SHARED_SCRIPTS) {
            if (!content.contains(script)) {
                issues.add(new Issue("SHARED_SCRIPT", Severity.LOW,
                    "Fehlendes Shared Script: " + script, 0));
            }
        }
    }

    /**
     * Prueft auf console.log/warn/error Aufrufe (kein Produktionscode).
     */
    private static void checkConsoleLogs(List<String> lines, List<Issue> issues) {
        for (int i = 0; i < lines.size(); i++) {
            Matcher m = CONSOLE_LOG_PATTERN.matcher(lines.get(i));
            if (m.find()) {
                issues.add(new Issue("CONSOLE_LOG", Severity.INFO,
                    "console." + m.group(1) + "() gefunden — nicht fuer Produktion",
                    i + 1));
            }
        }
    }

    /**
     * Score-Berechnung: 100 Punkte, Abzug je nach Severity.
     */
    private static int calculateScore(List<Issue> issues) {
        int score = 100;
        for (Issue issue : issues) {
            switch (issue.severity) {
                case HIGH:   score -= 20; break;
                case MEDIUM: score -= 10; break;
                case LOW:    score -= 5;  break;
                case INFO:   score -= 1;  break;
            }
        }
        return Math.max(0, score);
    }

    /** Kuerzt einen String auf maxLen Zeichen */
    private static String truncate(String s, int maxLen) {
        return s.length() <= maxLen ? s : s.substring(0, maxLen) + "...";
    }

    // --- JSON Ausgabe (ohne externe Libraries) ---

    private static String escapeJson(String s) {
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private static String toJson(ModuleResult result) {
        StringBuilder sb = new StringBuilder();
        sb.append("  {\n");
        sb.append("    \"module\": \"").append(escapeJson(result.module)).append("\",\n");
        sb.append("    \"path\": \"").append(escapeJson(result.path)).append("\",\n");
        sb.append("    \"score\": ").append(result.score).append(",\n");
        sb.append("    \"issueCount\": ").append(result.issues.size()).append(",\n");
        sb.append("    \"issues\": [\n");

        for (int i = 0; i < result.issues.size(); i++) {
            Issue issue = result.issues.get(i);
            sb.append("      {\n");
            sb.append("        \"rule\": \"").append(escapeJson(issue.rule)).append("\",\n");
            sb.append("        \"severity\": \"").append(issue.severity.name()).append("\",\n");
            sb.append("        \"message\": \"").append(escapeJson(issue.message)).append("\",\n");
            sb.append("        \"line\": ").append(issue.line).append("\n");
            sb.append("      }");
            if (i < result.issues.size() - 1) sb.append(",");
            sb.append("\n");
        }

        sb.append("    ]\n");
        sb.append("  }");
        return sb.toString();
    }

    // --- Zusammenfassung (stderr) ---

    private static void printSummary(List<ModuleResult> results) {
        int totalModules = results.size();
        int cleanModules = 0;
        int totalHigh = 0, totalMedium = 0, totalLow = 0, totalInfo = 0;

        for (ModuleResult r : results) {
            boolean hasFindings = false;
            for (Issue issue : r.issues) {
                switch (issue.severity) {
                    case HIGH:   totalHigh++;   hasFindings = true; break;
                    case MEDIUM: totalMedium++; hasFindings = true; break;
                    case LOW:    totalLow++;    hasFindings = true; break;
                    case INFO:   totalInfo++; break;
                }
            }
            if (!hasFindings) cleanModules++;
        }

        System.err.println();
        System.err.println("==============================================");
        System.err.println("   DkZ ModuleScanner — Zusammenfassung");
        System.err.println("==============================================");
        System.err.printf("  Module gescannt:  %-20d%n", totalModules);
        System.err.printf("  Sauber (100%%):    %-20d%n", cleanModules);
        System.err.printf("  HIGH   Findings:  %-20d%n", totalHigh);
        System.err.printf("  MEDIUM Findings:  %-20d%n", totalMedium);
        System.err.printf("  LOW    Findings:  %-20d%n", totalLow);
        System.err.printf("  INFO   Findings:  %-20d%n", totalInfo);
        System.err.println("==============================================");
    }

    // --- Main ---

    public static void main(String[] args) {
        if (args.length < 1) {
            System.err.println("Usage: java de.devkitz.copilot.ModuleScanner <modules-pfad>");
            System.err.println("  z.B.: java de.devkitz.copilot.ModuleScanner \"01_PROJECTS/01_dashboard/modules\"");
            System.exit(2);
        }

        Path modulesRoot = Paths.get(args[0]).toAbsolutePath();
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
        System.err.println("DkZ ModuleScanner — Starte Scan von " + moduleDirs.size() + " Modulen...");

        // Parallel scannen mit ExecutorService
        int threadCount = Math.min(moduleDirs.size(), Runtime.getRuntime().availableProcessors() * 2);
        ExecutorService executor = Executors.newFixedThreadPool(Math.max(1, threadCount));

        List<Future<ModuleResult>> futures = new ArrayList<>();
        for (Path dir : moduleDirs) {
            futures.add(executor.submit(new Callable<ModuleResult>() {
                @Override
                public ModuleResult call() {
                    return scanModule(dir);
                }
            }));
        }

        List<ModuleResult> results = new ArrayList<>();
        boolean hasFindings = false;

        for (Future<ModuleResult> future : futures) {
            try {
                ModuleResult result = future.get();
                results.add(result);
                if (result.score < 100) hasFindings = true;
            } catch (Exception e) {
                System.err.println("FEHLER bei Modul-Scan: " + e.getMessage());
            }
        }

        executor.shutdown();

        // Sortieren nach Score (schlechteste zuerst)
        results.sort((a, b) -> Integer.compare(a.score, b.score));

        // JSON nach stdout
        StringBuilder json = new StringBuilder("[\n");
        for (int i = 0; i < results.size(); i++) {
            json.append(toJson(results.get(i)));
            if (i < results.size() - 1) json.append(",");
            json.append("\n");
        }
        json.append("]\n");
        System.out.print(json);

        // Zusammenfassung nach stderr
        printSummary(results);

        // Exit Code: 0 = clean, 1 = Findings
        System.exit(hasFindings ? 1 : 0);
    }
}
