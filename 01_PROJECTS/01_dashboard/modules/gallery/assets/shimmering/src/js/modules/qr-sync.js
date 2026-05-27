/* ═══════════════════════════════════════════════ */
/* WISPE™ — QR Sync Module                        */
/* ═══════════════════════════════════════════════ */

const QRSync = (() => {
    let generated = false;

    function show() {
        const modal = document.getElementById('qrModal');
        if (!modal) return;
        modal.classList.remove('hidden');
        if (!generated) generate();
    }

    function hide() {
        const modal = document.getElementById('qrModal');
        if (modal) modal.classList.add('hidden');
    }

    function generate() {
        const box = document.getElementById('qrCodeBox');
        if (!box || typeof QRCode === 'undefined') return;
        box.innerHTML = '';
        const url = window.location.href;
        QRCode.toCanvas(url, {
            width: 180,
            margin: 0,
            color: { dark: '#060608', light: '#ffffff' }
        }, (err, canvas) => {
            if (!err && canvas) {
                box.appendChild(canvas);
                generated = true;
            }
        });
    }

    function init() {
        const btnQR = document.getElementById('btnQR');
        const qrClose = document.getElementById('qrClose');
        const backdrop = document.querySelector('#qrModal .modal-backdrop');

        if (btnQR) btnQR.addEventListener('click', show);
        if (qrClose) qrClose.addEventListener('click', hide);
        if (backdrop) backdrop.addEventListener('click', hide);
    }

    return { init, show, hide };
})();
