/* DkZ Display Config — app.js v1.0 */

// === Tab System ===
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
  });
});

// === Before/After Compare Slider ===
(function initCompare() {
  const wrap = document.getElementById('compareSlider');
  if (!wrap) return;
  const line = document.getElementById('compareLine');
  const handle = document.getElementById('compareHandle');
  const imgAfter = document.getElementById('imgAfter');
  let isDragging = false;

  function updatePosition(x) {
    const rect = wrap.getBoundingClientRect();
    let pct = ((x - rect.left) / rect.width) * 100;
    pct = Math.max(2, Math.min(98, pct));
    line.style.left = pct + '%';
    handle.style.left = pct + '%';
    imgAfter.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
  }

  wrap.addEventListener('mousedown', (e) => { isDragging = true; updatePosition(e.clientX); });
  window.addEventListener('mousemove', (e) => { if (isDragging) updatePosition(e.clientX); });
  window.addEventListener('mouseup', () => { isDragging = false; });

  // Touch Support
  wrap.addEventListener('touchstart', (e) => { isDragging = true; updatePosition(e.touches[0].clientX); }, { passive: true });
  wrap.addEventListener('touchmove', (e) => { if (isDragging) updatePosition(e.touches[0].clientX); }, { passive: true });
  wrap.addEventListener('touchend', () => { isDragging = false; });
})();

// === Preset Selection ===
function selectPreset(el, parentId) {
  const parent = el.parentElement;
  parent.querySelectorAll('.preset').forEach(p => p.classList.remove('selected'));
  el.classList.add('selected');

  // Animate selection
  el.style.transform = 'scale(0.97)';
  setTimeout(() => { el.style.transform = ''; }, 150);

  // Update stats based on preset
  const preset = el.dataset.preset;
  if (preset === '4k-hdr') {
    setText('resolution', '3840×2160'); setText('bitrate', '45 Mbps'); setText('colorDepth', '10-bit');
  } else if (preset === '4k') {
    setText('resolution', '3840×2160'); setText('bitrate', '25 Mbps'); setText('colorDepth', '8-bit');
  } else if (preset === '1440p') {
    setText('resolution', '2560×1440'); setText('bitrate', '15 Mbps'); setText('colorDepth', '8-bit');
  } else if (preset === '1080p') {
    setText('resolution', '1920×1080'); setText('bitrate', '8 Mbps'); setText('colorDepth', '8-bit');
  }
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) {
    el.style.opacity = '0'; el.style.transform = 'translateY(-4px)';
    setTimeout(() => { el.textContent = val; el.style.opacity = '1'; el.style.transform = 'none'; }, 120);
  }
}

// === Settings Persistence (localStorage) ===
function saveSettings() {
  const settings = {};
  document.querySelectorAll('input[type=checkbox]').forEach(cb => {
    settings[cb.id || cb.closest('.toggle-row')?.querySelector('span')?.textContent] = cb.checked;
  });
  document.querySelectorAll('input[type=range]').forEach(r => {
    settings['range_' + (r.id || r.closest('.range-row')?.querySelector('label')?.textContent.trim())] = r.value;
  });
  localStorage.setItem('dkz-display-config', JSON.stringify(settings));
}

function loadSettings() {
  try {
    const data = JSON.parse(localStorage.getItem('dkz-display-config'));
    if (!data) return;
    document.querySelectorAll('input[type=checkbox]').forEach(cb => {
      const key = cb.id || cb.closest('.toggle-row')?.querySelector('span')?.textContent;
      if (key && key in data) cb.checked = data[key];
    });
  } catch (e) { /* first run */ }
}

// Auto-save on any change
document.addEventListener('change', saveSettings);
document.addEventListener('input', saveSettings);

// Load on init
loadSettings();

// === Stats Update ===
function updateStats() {
  const boost = document.getElementById('gfxBoost');
  if (boost && boost.checked) {
    document.querySelectorAll('.compare-label.after').forEach(l => l.textContent = '4K HDR ✦ BOOST');
  } else {
    document.querySelectorAll('.compare-label.after').forEach(l => l.textContent = '4K HDR');
  }
}

console.log('%c DkZ™ Display Configurator v1.0 geladen', 'color:#fa1e4e;font-weight:bold');
