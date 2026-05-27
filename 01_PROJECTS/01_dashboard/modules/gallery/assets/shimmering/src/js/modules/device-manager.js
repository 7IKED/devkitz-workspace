/* ═══════════════════════════════════════════════ */
/* WISPE™ — Device Manager (Audio Devices)        */
/* ═══════════════════════════════════════════════ */

const DeviceManager = (() => {
    let devices = [];

    async function enumerate() {
        try {
            const allDevices = await navigator.mediaDevices.enumerateDevices();
            devices = allDevices.filter(d => d.kind === 'audioinput');
            renderList();
            return devices;
        } catch (e) {
            return [];
        }
    }

    function renderList() {
        const list = document.getElementById('deviceList');
        if (!list) return;
        if (devices.length === 0) {
            list.innerHTML = '<div class="device-placeholder">Keine Geräte gefunden. Mikrofon erlauben.</div>';
            return;
        }
        list.innerHTML = devices.map((d, i) => {
            const name = d.label || `Mikrofon ${i + 1}`;
            const isBT = name.toLowerCase().includes('bluetooth');
            const icon = isBT ? '🎧' : '🎙️';
            const type = isBT ? 'Bluetooth' : 'Built-in';
            const selected = d.deviceId === MicEngine.selectedDeviceId ? 'selected' : '';
            return `<div class="device-item ${selected}" data-device-id="${d.deviceId}">
                <span class="device-icon">${icon}</span>
                <span class="device-name">${escapeHTML(name)}</span>
                <span class="device-type">${type}</span>
            </div>`;
        }).join('');

        list.querySelectorAll('.device-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.deviceId;
                MicEngine.setDevice(id);
                list.querySelectorAll('.device-item').forEach(el => el.classList.remove('selected'));
                item.classList.add('selected');
            });
        });
    }

    function autoSelectBluetooth() {
        const bt = devices.find(d => d.label && d.label.toLowerCase().includes('bluetooth'));
        if (bt) {
            MicEngine.setDevice(bt.deviceId);
            renderList();
        }
    }

    function show() {
        const modal = document.getElementById('deviceModal');
        if (modal) modal.classList.remove('hidden');
        enumerate();
    }

    function hide() {
        const modal = document.getElementById('deviceModal');
        if (modal) modal.classList.add('hidden');
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function init() {
        const btnDevice = document.getElementById('btnDevice');
        const deviceClose = document.getElementById('deviceClose');
        const backdrop = document.querySelector('#deviceModal .modal-backdrop');
        const btnRefresh = document.getElementById('btnRefreshDevices');

        if (btnDevice) btnDevice.addEventListener('click', show);
        if (deviceClose) deviceClose.addEventListener('click', hide);
        if (backdrop) backdrop.addEventListener('click', hide);
        if (btnRefresh) btnRefresh.addEventListener('click', enumerate);
    }

    return { init, enumerate, autoSelectBluetooth, show, hide };
})();
