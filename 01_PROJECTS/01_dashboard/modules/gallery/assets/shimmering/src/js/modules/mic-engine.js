/* ═══════════════════════════════════════════════ */
/* WISPE™ — Mic Engine (Web Audio API)            */
/* ═══════════════════════════════════════════════ */

const MicEngine = (() => {
    let stream = null;
    let audioCtx = null;
    let analyser = null;
    let dataArray = null;
    let mediaRecorder = null;
    let chunks = [];
    let isRecording = false;
    let selectedDeviceId = null;
    let timerInterval = null;
    let seconds = 0;

    async function requestMic(deviceId) {
        const constraints = {
            audio: deviceId ? { deviceId: { exact: deviceId } } : true
        };
        try {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioCtx.createMediaStreamSource(stream);
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.7;
            source.connect(analyser);
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            return true;
        } catch (e) {
            return false;
        }
    }

    function startRecording() {
        if (!stream) return false;
        chunks = [];
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };
        mediaRecorder.start();
        isRecording = true;
        seconds = 0;
        startTimer();
        return true;
    }

    function stopRecording() {
        return new Promise((resolve) => {
            if (!mediaRecorder || mediaRecorder.state === 'inactive') {
                resolve(null);
                return;
            }
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                isRecording = false;
                stopTimer();
                resolve(blob);
            };
            mediaRecorder.stop();
        });
    }

    function getVolume() {
        if (!analyser || !dataArray) return 0;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        return sum / dataArray.length / 255;
    }

    function getFrequencyData() {
        if (!analyser || !dataArray) return [];
        analyser.getByteFrequencyData(dataArray);
        return Array.from(dataArray);
    }

    function startTimer() {
        const timerEl = document.getElementById('timerText');
        timerInterval = setInterval(() => {
            seconds++;
            const m = String(Math.floor(seconds / 60)).padStart(2, '0');
            const s = String(seconds % 60).padStart(2, '0');
            if (timerEl) timerEl.textContent = `${m}:${s}`;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        seconds = 0;
    }

    function setDevice(id) {
        selectedDeviceId = id;
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
            requestMic(id);
        }
    }

    function cleanup() {
        if (stream) stream.getTracks().forEach(t => t.stop());
        if (audioCtx) audioCtx.close();
        stopTimer();
    }

    return {
        requestMic,
        startRecording,
        stopRecording,
        getVolume,
        getFrequencyData,
        setDevice,
        cleanup,
        get isRecording() { return isRecording; },
        get selectedDeviceId() { return selectedDeviceId; }
    };
})();
