/* ═══════════════════════════════════════════════ */
/* WISPE™ — Nanobot Auto-Classifier               */
/* ═══════════════════════════════════════════════ */

const Nanobot = (() => {
    const CATEGORIES = {
        notiz: {
            icon: '📋', label: 'Notiz',
            keywords: ['todo','aufgabe','merken','erledigen','nicht vergessen','einkaufen','liste','punkt','check']
        },
        idee: {
            icon: '💡', label: 'Idee',
            keywords: ['idee','was wäre','könnte man','vielleicht','brainstorm','kreativ','konzept','vorschlag','innovation']
        },
        meeting: {
            icon: '🎙️', label: 'Meeting',
            keywords: ['treffen','call','besprochen','meeting','protokoll','teilnehmer','agenda','ergebnis','action item']
        },
        lead: {
            icon: '📊', label: 'Lead',
            keywords: ['kunde','kontakt','angebot','lead','verkauf','projekt','anfrage','interessent']
        }
    };

    function classify(text) {
        if (!text || text.length < 3) return 'notiz';
        const lower = text.toLowerCase();

        let bestCat = 'notiz';
        let bestScore = 0;

        for (const [cat, data] of Object.entries(CATEGORIES)) {
            let score = 0;
            data.keywords.forEach(keyword => {
                if (lower.includes(keyword)) score++;
            });
            if (score > bestScore) {
                bestScore = score;
                bestCat = cat;
            }
        }

        // Long recordings default to meeting
        if (text.length > 500 && bestScore === 0) return 'meeting';

        return bestCat;
    }

    function getCategoryInfo(cat) {
        return CATEGORIES[cat] || CATEGORIES.notiz;
    }

    function updateUI(category) {
        const catText = document.getElementById('categoryText');
        const catDot = document.querySelector('.cat-dot');
        const info = getCategoryInfo(category);

        if (catText) catText.textContent = `${info.icon} ${info.label} erkannt`;
        if (catDot) {
            catDot.classList.add('active');
        }

        // Update chips
        document.querySelectorAll('.chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.cat === category);
        });
    }

    return { classify, getCategoryInfo, updateUI };
})();
