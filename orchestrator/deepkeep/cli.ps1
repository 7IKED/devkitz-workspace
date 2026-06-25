# DEEPKEEP Sanitizer CLI Wrapper
# Lädt Aliase lokal im DEVKiTZ-Workspace-Kontext (nicht global)
# Teil des DEEPKEEP 7-Tage-Archiv-Systems — REGEL #0: Never delete, only archive.

$DEEPKEEP_MODULE = Join-Path -Path $PSScriptRoot -ChildPath ".." | Join-Path -ChildPath "deepkeep"

function Safe-RemoveItem {
    <#
    .SYNOPSIS
        Überschreibt Remove-Item/del/rm — leitet Löschungen an DEEPKEEP Sanitizer um.
    .PARAMETER Path
        Pfad der zu "löschenden" Datei oder des Ordners.
    #>
    param(
        [Parameter(Mandatory, ValueFromPipeline)]
        [string]$Path
    )
    $resolved = Resolve-Path -LiteralPath $Path -ErrorAction Stop | Select-Object -ExpandProperty Path
    python -m orchestrator.deepkeep sanitize --path "$resolved"
}

function Invoke-DeepKeepStatus {
    <#
    .SYNOPSIS
        Zeigt Registry-Status: Anzahl Files, Größe, komprimiert/migriert.
    #>
    python -m orchestrator.deepkeep status
}

function Invoke-DeepKeepRetention {
    <#
    .SYNOPSIS
        Führt manuellen Retention-Run aus (Stufe 1: GZip, Stufe 2: Tresor-Push).
    #>
    python -m orchestrator.deepkeep retention
}

# Aliase — Scope Script = nur im aktuellen Agenten-Kontext, kein globaler Eingriff
Set-Alias -Name del -Value Safe-RemoveItem -Scope Script
Set-Alias -Name rm -Value Safe-RemoveItem -Scope Script
Set-Alias -Name Remove-Item -Value Safe-RemoveItem -Scope Script

Export-ModuleMember -Function Safe-RemoveItem, Invoke-DeepKeepStatus, Invoke-DeepKeepRetention
Export-ModuleMember -Alias del, rm, Remove-Item
