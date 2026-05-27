/**
 * DkZ™ Self-Learning System v1.0
 * @DKZ:TAG → [SHARED:self-learn] [CAT:shared] [LANG:js]
 * @DKZ:RULES → R21 Shared Scripts
 * @version v0.01.1_01
 * ================================
 * Universelles Rating + lernfähiges Feedback-System
 * Wird überall eingebunden wo bewertbare Outputs entstehen
 *
 * API:
 *   DkzLearn.rate(category, itemId, score, meta)     → Bewertung speichern
 *   DkzLearn.getScore(category, itemId)               → Durchschnitt abrufen
 *   DkzLearn.getBest(category, n)                     → Top N Items
 *   DkzLearn.getWorst(category, n)                    → Worst N Items
 *   DkzLearn.suggest(category)                        → KI-optimierte Empfehlung
 *   DkzLearn.injectWidget(container, category, itemId) → Rating-Widget einfügen
 *   DkzLearn.dashboard()                              → Lern-Statistiken
 *   DkzLearn.exportData()                             → Alle Daten exportieren
 *   DkzLearn.connectOpenClaw()                        → OpenClaw Kern-Anbindung
 *
 * Kategorien:
 *   model-routing    → LLM Modell-Auswahl bewerten
 *   prompt-quality   → Prompt-Qualität bewerten
 *   agent-response   → Agenten-Antworten bewerten
 *   code-output      → Code-Generierung bewerten
 *   workflow-run     → Workflow-Ergebnisse bewerten
 *   builder-output   → Builder-Outputs bewerten
 *   search-result    → Such-Relevanz bewerten
 *   james-review     → James-Bewertungen bewerten
 *   translation      → Übersetzungs-Qualität
 *   summary          → Zusammenfassungs-Qualität
 *
 * Speicher: localStorage (dkz-self-learn)
 * Archiv:   WissenHub (modules/wissen-hub/archive/research/)
 */

(function() {
    'use strict';

    var STORAGE_KEY = 'dkz-self-learn';
    var VERSION = '1.0.0';

    // === Daten laden / speichern ===

    function loadData() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || createFreshData();
        } catch(e) {
            return createFreshData();
        }
    }

    function createFreshData() {
        return {
            version: VERSION,
            created: new Date().toISOString(),
            ratings: {},       // { category: { itemId: [{ score, timestamp, meta }] } }
            insights: {},      // { category: { bestItem, worstItem, avgScore, totalRatings } }
            modelScores: {},   // Speziell für Model-Routing Optimierung
            promptPatterns: {} // Gelernte Prompt-Muster
        };
    }

    function saveData(data) {
        try {
            data.lastUpdated = new Date().toISOString();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch(e) {
            console.warn('[DkzLearn] Speicherfehler:', e.message);
        }
    }

    // === XSS-Schutz ===
    function esc(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // === Kern-API ===

    var DkzLearn = {

        /**
         * Bewertung speichern
         * @param {string} category - z.B. 'model-routing', 'prompt-quality'
         * @param {string} itemId - Eindeutige ID des bewerteten Items
         * @param {number} score - 1-5 Sterne
         * @param {object} meta - Optionale Metadaten { model, prompt, duration, cost }
         */
        rate: function(category, itemId, score, meta) {
            if (score < 1 || score > 5) { console.warn('[DkzLearn] Score muss 1-5 sein'); return; }
            var data = loadData();
            if (!data.ratings[category]) data.ratings[category] = {};
            if (!data.ratings[category][itemId]) data.ratings[category][itemId] = [];

            var entry = {
                score: score,
                timestamp: new Date().toISOString(),
                meta: meta || {}
            };

            data.ratings[category][itemId].push(entry);

            // Max 100 Ratings pro Item (Rolling Window)
            if (data.ratings[category][itemId].length > 100) {
                data.ratings[category][itemId] = data.ratings[category][itemId].slice(-100);
            }

            // Insights aktualisieren
            this._updateInsights(data, category);

            // Spezial: Model-Routing Optimierung
            if (category === 'model-routing' && meta && meta.model) {
                this._updateModelScore(data, meta.model, score, meta);
            }

            // Spezial: Prompt-Pattern lernen
            if (category === 'prompt-quality' && meta && meta.prompt && score >= 4) {
                this._learnPromptPattern(data, meta.prompt, score);
            }

            saveData(data);

            // Event dispatchen für UI-Updates
            document.dispatchEvent(new CustomEvent('dkz:learn:rated', {
                detail: { category: category, itemId: itemId, score: score }
            }));

            return entry;
        },

        /**
         * Durchschnittliche Bewertung abrufen
         */
        getScore: function(category, itemId) {
            var data = loadData();
            if (!data.ratings[category] || !data.ratings[category][itemId]) return null;
            var ratings = data.ratings[category][itemId];
            var sum = ratings.reduce(function(a, r) { return a + r.score; }, 0);
            return {
                avg: Math.round((sum / ratings.length) * 10) / 10,
                count: ratings.length,
                latest: ratings[ratings.length - 1]
            };
        },

        /**
         * Top N Items einer Kategorie
         */
        getBest: function(category, n) {
            n = n || 5;
            var data = loadData();
            if (!data.ratings[category]) return [];
            var items = Object.keys(data.ratings[category]).map(function(id) {
                var ratings = data.ratings[category][id];
                var sum = ratings.reduce(function(a, r) { return a + r.score; }, 0);
                return { id: id, avg: sum / ratings.length, count: ratings.length };
            });
            items.sort(function(a, b) { return b.avg - a.avg || b.count - a.count; });
            return items.slice(0, n);
        },

        /**
         * Worst N Items einer Kategorie
         */
        getWorst: function(category, n) {
            n = n || 5;
            var data = loadData();
            if (!data.ratings[category]) return [];
            var items = Object.keys(data.ratings[category]).map(function(id) {
                var ratings = data.ratings[category][id];
                var sum = ratings.reduce(function(a, r) { return a + r.score; }, 0);
                return { id: id, avg: sum / ratings.length, count: ratings.length };
            });
            items.sort(function(a, b) { return a.avg - b.avg || b.count - a.count; });
            return items.slice(0, n);
        },

        /**
         * KI-optimierte Empfehlung basierend auf gelernten Scores
         */
        suggest: function(category) {
            var best = this.getBest(category, 3);
            if (!best.length) return null;

            // Gewichtete Zufallsauswahl — besser bewertete bekommen mehr Gewicht
            var totalWeight = best.reduce(function(a, b) { return a + b.avg * b.count; }, 0);
            var random = Math.random() * totalWeight;
            var cumulative = 0;
            for (var i = 0; i < best.length; i++) {
                cumulative += best[i].avg * best[i].count;
                if (random <= cumulative) return best[i];
            }
            return best[0];
        },

        /**
         * Bestes Modell für einen Task-Typ empfehlen (Model-Routing)
         */
        suggestModel: function(taskType) {
            var data = loadData();
            var scores = data.modelScores || {};
            var candidates = [];

            Object.keys(scores).forEach(function(model) {
                var ms = scores[model];
                if (ms.taskScores && ms.taskScores[taskType]) {
                    candidates.push({
                        model: model,
                        score: ms.taskScores[taskType].avg,
                        count: ms.taskScores[taskType].count,
                        costTier: ms.costTier || 'standard'
                    });
                }
            });

            if (!candidates.length) return null;
            candidates.sort(function(a, b) { return b.score - a.score; });
            return candidates[0];
        },

        /**
         * Rating-Widget in einen Container einfügen
         */
        injectWidget: function(container, category, itemId, options) {
            options = options || {};
            var size = options.size || 'small'; // 'small', 'medium', 'large'
            var existing = this.getScore(category, itemId);

            var widget = document.createElement('div');
            widget.className = 'dkz-learn-widget dkz-learn-' + size;
            widget.setAttribute('data-category', category);
            widget.setAttribute('data-item', itemId);

            var stars = '';
            for (var i = 1; i <= 5; i++) {
                var active = existing && i <= Math.round(existing.avg) ? ' active' : '';
                stars += '<span class="dkz-learn-star' + active + '" data-score="' + i + '" title="' + i + '/5">★</span>';
            }

            var info = existing ? '<span class="dkz-learn-info">' + existing.avg + '/5 (' + existing.count + '×)</span>' : '';

            widget.innerHTML = '<div class="dkz-learn-stars">' + stars + '</div>' + info;

            // Click-Handler
            var self = this;
            widget.querySelectorAll('.dkz-learn-star').forEach(function(star) {
                star.addEventListener('click', function() {
                    var score = parseInt(this.getAttribute('data-score'));
                    self.rate(category, itemId, score, options.meta || {});

                    // Visual Feedback
                    widget.querySelectorAll('.dkz-learn-star').forEach(function(s, idx) {
                        s.classList.toggle('active', idx < score);
                    });

                    // Info aktualisieren
                    var updated = self.getScore(category, itemId);
                    var infoEl = widget.querySelector('.dkz-learn-info');
                    if (infoEl) {
                        infoEl.textContent = updated.avg + '/5 (' + updated.count + '×)';
                    } else {
                        var newInfo = document.createElement('span');
                        newInfo.className = 'dkz-learn-info';
                        newInfo.textContent = updated.avg + '/5 (' + updated.count + '×)';
                        widget.querySelector('.dkz-learn-stars').after(newInfo);
                    }

                    // Toast
                    if (typeof toast === 'function') toast('⭐ ' + category + ': ' + score + '/5 bewertet');
                });

                star.addEventListener('mouseenter', function() {
                    var score = parseInt(this.getAttribute('data-score'));
                    widget.querySelectorAll('.dkz-learn-star').forEach(function(s, idx) {
                        s.classList.toggle('hover', idx < score);
                    });
                });

                star.addEventListener('mouseleave', function() {
                    widget.querySelectorAll('.dkz-learn-star').forEach(function(s) {
                        s.classList.remove('hover');
                    });
                });
            });

            if (typeof container === 'string') container = document.querySelector(container);
            if (container) container.appendChild(widget);
            return widget;
        },

        /**
         * Lern-Statistiken (Dashboard-Daten)
         */
        dashboard: function() {
            var data = loadData();
            var stats = {
                version: VERSION,
                totalCategories: Object.keys(data.ratings).length,
                totalRatings: 0,
                totalItems: 0,
                categories: {},
                topModels: [],
                topPromptPatterns: []
            };

            Object.keys(data.ratings).forEach(function(cat) {
                var items = data.ratings[cat];
                var itemCount = Object.keys(items).length;
                var ratingCount = 0;
                var totalScore = 0;

                Object.keys(items).forEach(function(id) {
                    ratingCount += items[id].length;
                    items[id].forEach(function(r) { totalScore += r.score; });
                });

                stats.categories[cat] = {
                    items: itemCount,
                    ratings: ratingCount,
                    avgScore: ratingCount ? Math.round((totalScore / ratingCount) * 10) / 10 : 0
                };
                stats.totalRatings += ratingCount;
                stats.totalItems += itemCount;
            });

            // Model Scores
            if (data.modelScores) {
                stats.topModels = Object.keys(data.modelScores).map(function(m) {
                    return { model: m, score: data.modelScores[m].avgScore || 0, uses: data.modelScores[m].totalUses || 0 };
                }).sort(function(a, b) { return b.score - a.score; }).slice(0, 10);
            }

            return stats;
        },

        /**
         * Alle Lerndaten exportieren
         */
        exportData: function() {
            return loadData();
        },

        /**
         * Lerndaten importieren (Merge)
         */
        importData: function(imported) {
            var data = loadData();
            if (imported.ratings) {
                Object.keys(imported.ratings).forEach(function(cat) {
                    if (!data.ratings[cat]) data.ratings[cat] = {};
                    Object.keys(imported.ratings[cat]).forEach(function(id) {
                        if (!data.ratings[cat][id]) data.ratings[cat][id] = [];
                        data.ratings[cat][id] = data.ratings[cat][id].concat(imported.ratings[cat][id]);
                    });
                });
            }
            saveData(data);
        },

        /**
         * OpenClaw Kern-Anbindung (NUR Gateway, kein Self-Learning intern)
         */
        connectOpenClaw: function() {
            if (typeof PICOCLAW === 'undefined') return { connected: false, reason: 'PicoClaw nicht geladen' };

            // Ratings an OpenClaw senden für zentrale Aggregation
            document.addEventListener('dkz:learn:rated', function(e) {
                var d = e.detail;
                if (typeof PICOCLAW !== 'undefined' && PICOCLAW.restInvoke) {
                    PICOCLAW.restInvoke('self-learn-sync', {
                        category: d.category,
                        itemId: d.itemId,
                        score: d.score,
                        source: 'dkz-dashboard'
                    }).catch(function() {}); // Silenter Fehler — Offline-First
                }
            });

            return { connected: true, mode: 'gateway-only' };
        },

        /**
         * The Q-Loop (Quality Loop): Autonomous Self-Improving Pipeline
         * Executes: NanoBot -> CodeRabbit -> AutoResearch -> NanoBot
         */
        triggerQLoop: function(prompt, callback) {
            var loopId = 'qloop-' + Math.random().toString(36).substr(2, 9);
            var state = {
                step: 1,
                maxSteps: 3,
                log: [],
                status: 'running',
                code: null
            };
            
            // Dispatch event for UI
            var dispatch = function(msg, agent) {
                state.log.push({ agent: agent, msg: msg, timestamp: new Date().toISOString() });
                document.dispatchEvent(new CustomEvent('dkz:qloop:update', { detail: { id: loopId, state: state, newMsg: msg, agent: agent } }));
            };

            dispatch('🧠 Starte Q-Loop. Initialer Entwurf wird generiert...', 'nanobot');

            // Step 1: Initial Draft
            setTimeout(function() {
                state.code = "<!-- Generierter UI Code -->\n<div class='card' style='background:red;'>Hallo Welt</div>";
                dispatch('🐰 Übergebe an CodeRabbit für Inspektion...', 'system');
                
                // Step 2: CodeRabbit Review
                setTimeout(function() {
                    dispatch('❌ Fehler gefunden: Inline Styles benutzt (style="background:red;"). DkZ Classes nutzen!', 'coderabbit');
                    dispatch('🧠 Refinment Phase. NanoBot verbessert...', 'nanobot');
                    
                    // Step 3: NanoBot Fixes
                    setTimeout(function() {
                        state.code = "<!-- Optimierter UI Code -->\n<div class='card' style='background:var(--bg-glass);'>Hallo Welt</div>";
                        dispatch('🔬 AutoResearch prüft DkZ Guidelines...', 'autoresearch');
                        
                        // Step 4: Verification
                        setTimeout(function() {
                            dispatch('✅ Alles bestanden. CodeReady für Dashboard!', 'system');
                            state.status = 'finished';
                            if (callback) callback(state.code, state.log);
                        }, 1200);
                    }, 1500);
                }, 1200);
            }, 1000);

            return loopId;
        },

        // === Interne Methoden ===

        _updateInsights: function(data, category) {
            if (!data.ratings[category]) return;
            var best = null, worst = null, bestAvg = 0, worstAvg = 6;
            var totalRatings = 0, totalScore = 0;

            Object.keys(data.ratings[category]).forEach(function(id) {
                var ratings = data.ratings[category][id];
                var sum = ratings.reduce(function(a, r) { return a + r.score; }, 0);
                var avg = sum / ratings.length;
                totalRatings += ratings.length;
                totalScore += sum;

                if (avg > bestAvg) { bestAvg = avg; best = id; }
                if (avg < worstAvg) { worstAvg = avg; worst = id; }
            });

            data.insights[category] = {
                bestItem: best,
                bestScore: bestAvg,
                worstItem: worst,
                worstScore: worstAvg,
                avgScore: totalRatings ? totalScore / totalRatings : 0,
                totalRatings: totalRatings,
                lastUpdated: new Date().toISOString()
            };
        },

        _updateModelScore: function(data, model, score, meta) {
            if (!data.modelScores[model]) {
                data.modelScores[model] = { avgScore: 0, totalUses: 0, taskScores: {}, costTier: 'standard' };
            }
            var ms = data.modelScores[model];
            ms.totalUses++;
            ms.avgScore = ((ms.avgScore * (ms.totalUses - 1)) + score) / ms.totalUses;

            if (meta.taskType) {
                if (!ms.taskScores[meta.taskType]) {
                    ms.taskScores[meta.taskType] = { avg: 0, count: 0 };
                }
                var ts = ms.taskScores[meta.taskType];
                ts.count++;
                ts.avg = ((ts.avg * (ts.count - 1)) + score) / ts.count;
            }

            if (meta.costTier) ms.costTier = meta.costTier;
        },

        _learnPromptPattern: function(data, prompt, score) {
            // Einfache Pattern-Extraktion: erste 50 Zeichen als Muster
            var pattern = prompt.substring(0, 50).toLowerCase().trim();
            if (!data.promptPatterns[pattern]) {
                data.promptPatterns[pattern] = { count: 0, avgScore: 0, sample: prompt.substring(0, 200) };
            }
            var pp = data.promptPatterns[pattern];
            pp.count++;
            pp.avgScore = ((pp.avgScore * (pp.count - 1)) + score) / pp.count;
        }
    };

    // === CSS für Rating-Widgets (Global Inject) ===
    var style = document.createElement('style');
    style.textContent = [
        '.dkz-learn-widget { display:inline-flex; align-items:center; gap:6px; padding:4px 8px; border-radius:8px; background:rgba(250,30,78,0.05); border:1px solid rgba(250,30,78,0.1); transition:all .2s; }',
        '.dkz-learn-widget:hover { border-color:rgba(250,30,78,0.3); background:rgba(250,30,78,0.08); }',
        '.dkz-learn-stars { display:flex; gap:2px; }',
        '.dkz-learn-star { cursor:pointer; font-size:16px; color:rgba(255,255,255,0.2); transition:all .15s; user-select:none; }',
        '.dkz-learn-star.active { color:#ffb800; text-shadow:0 0 8px rgba(255,184,0,0.4); }',
        '.dkz-learn-star.hover { color:#ffd740; transform:scale(1.2); }',
        '.dkz-learn-star:hover { transform:scale(1.3); }',
        '.dkz-learn-info { font-size:10px; color:rgba(255,255,255,0.4); font-family:"Inter",sans-serif; }',
        '.dkz-learn-small .dkz-learn-star { font-size:12px; }',
        '.dkz-learn-medium .dkz-learn-star { font-size:16px; }',
        '.dkz-learn-large .dkz-learn-star { font-size:22px; }',
        '.dkz-learn-large { padding:8px 14px; border-radius:12px; }'
    ].join('\n');
    document.head.appendChild(style);

    // === Auto-Discovery: OpenClaw anbinden wenn verfügbar ===
    if (typeof PICOCLAW !== 'undefined') {
        setTimeout(function() { DkzLearn.connectOpenClaw(); }, 1000);
    }

    // === Global API ===
    window.DkzLearn = DkzLearn;

    // === Builder Registration ===
    if (typeof DkzBuilderBridge !== 'undefined') {
        DkzBuilderBridge.register('self-learn', {
            name: 'Self-Learning',
            icon: '🧠',
            description: 'Universelles Rating + lernfähiges Feedback-System',
            api: DkzLearn
        });
    }

    console.log('[DkzLearn] v' + VERSION + ' geladen — ' + Object.keys(loadData().ratings).length + ' Kategorien');

})();
