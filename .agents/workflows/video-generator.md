---
description: Veo 3.1 Video-Prompts generieren — Cineastische Clip-Szenen und Kurzfilm-Serien
---

# /video-generator — Cinematic AI Video-Prompts

> **Kernregel:** Der passende und ordentlich eingetragene Workflow mit allen Regeln ist wichtiger als das Ergebnis.

## Prompt-Struktur (Cinema-Grade)
```
[KAMERA] [SUBJEKT] [AKTION] in [SETTING].
[LICHT]. [FARB-GRADE]. [ATMOSPHÄRE].
Shot on [KAMERA/LINSE]. [FILM-LOOK].
[DIALOG/AUDIO falls Veo 3.1]
```

## 10 Serien à 10 Clips = 100 Prompts
```markdown
| Serie | Genre | Setting | Stimmung |
|:------|:------|:--------|:---------|
| 1 | Tech/Sci-Fi | Lab/Datacenter | Futuristisch |
| 2 | Urban/Neon | Tokyo/Berlin | Cyberpunk |
| 3 | Nature/Epic | Berge/Meer | Majestätisch |
| 4 | Corporate | Office/Meeting | Professionell |
| 5 | Creative | Studio/Werkstatt | Inspirierend |
| 6 | Data/Abstract | Datenströme | Minimalistisch |
| 7 | Brand/Logo | Intro/Outro | Premium |
| 8 | Behind-Scenes | Workshop/Coding | Authentisch |
| 9 | Launch/Event | Bühne/Crowd | Energie |
| 10 | Documentary | Alltag/Interview | Intim |
```

## Kamera-Referenz
| Bewegung | Wirkung | Keyword |
|:---------|:--------|:--------|
| Dolly Forward | Intimität | "slow dolly forward" |
| Tracking | Energie | "tracking shot" |
| Drone | Epik | "aerial drone" |
| Static Wide | Kontext | "wide establishing" |
| Close-Up | Emotion | "extreme close-up" |
| Pull-back | Überraschung | "pull-back revealing" |
| Steadicam | Immersion | "steadicam following" |

## Output
```
Downloads/[Projekt]-Prompts/
├── serie-01/ (prompt-01.txt bis 10.txt)
├── serie-02/
└── master-prompts.json
```
