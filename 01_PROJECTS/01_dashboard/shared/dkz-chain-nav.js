/**
 * DkZ Chain Nav — Standardisierte Builder-Kette mit Dropdown
 * @DKZ:TAG → [SHARED:chain-nav] [CAT:shared] [LANG:js]
 * @DKZ:RULES → R21 Shared Scripts
 * @version v0.01.1_01
 *
 * Immer sichtbar: Actions → Skills → Workflows → Agents → Teams → Leadership → Quellen
 * Dropdown (▼): JAMEZ™ · TEN0R™ · BLACK8™
 * © DEVKiTZ™ 2026
 */
(function(){
  'use strict';

  const CHAIN_ITEMS = [
    { label:'Actions', href:'../action-builder/index.html', id:'action-builder' },
    { label:'Skills', href:'../skill-builder/index.html', id:'skill-builder' },
    { label:'Workflows', href:'../workflow-builder/index.html', id:'workflow-builder' },
    { label:'Agents', href:'../agent-builder/index.html', id:'agent-builder' },
    { label:'Teams', href:'../team-builder/index.html', id:'team-builder' },
    { label:'Leadership', href:'../leadership-builder/index.html', id:'leadership-builder' },
    { label:'Quellen', href:'../source-registry/index.html', id:'source-registry' }
  ];

  const DROPDOWN_ITEMS = [
    { label:'JAMEZ™', href:'../agent-builder/jamez-builder.html', id:'jamez-builder', color:'#f59e0b' },
    { label:'TEN0R™', href:'../tenor-builder/index.html', id:'tenor-builder', color:'#00e5ff' },
    { label:'BLACK8™', href:'../black8-builder/index.html', id:'black8-builder', color:'#a855f7' }
  ];

  function detectActiveModule(){
    var path = window.location.pathname.replace(/\\/g,'/');
    // Extract module folder name from path
    var parts = path.split('/');
    for(var i=0;i<parts.length;i++){
      if(parts[i]==='modules' && parts[i+1]) return parts[i+1];
    }
    // Fallback: check for specific page names
    if(path.includes('jamez-builder')) return 'jamez-builder';
    return '';
  }

  function init(){
    var nav = document.querySelector('.chain-nav');
    if(!nav) return;

    var activeModule = detectActiveModule();
    var html = '';

    // Always-visible items
    CHAIN_ITEMS.forEach(function(item){
      var isActive = activeModule === item.id;
      html += '<a class="chain-btn' + (isActive ? ' active' : '') + '"' +
              (isActive ? '' : ' href="' + item.href + '"') +
              '>' + item.label + '</a>';
    });

    // Dropdown trigger
    var isDropdownActive = DROPDOWN_ITEMS.some(function(d){ return activeModule === d.id; });
    html += '<div class="chain-dropdown" style="position:relative;display:inline-block">';
    html += '<button class="chain-btn chain-dropdown-trigger' + (isDropdownActive ? ' active' : '') + '" ' +
            'onclick="this.parentElement.classList.toggle(\'open\')" ' +
            'style="display:flex;align-items:center;gap:.3rem' +
            (isDropdownActive ? '' : '') + '">';
    // If dropdown has active item, show its label
    if(isDropdownActive){
      var act = DROPDOWN_ITEMS.find(function(d){ return activeModule === d.id; });
      html += (act ? act.label : 'Builder') + ' ▾';
    } else {
      html += 'Builder ▾';
    }
    html += '</button>';
    html += '<div class="chain-dropdown-menu">';
    DROPDOWN_ITEMS.forEach(function(item){
      var isActive = activeModule === item.id;
      html += '<a class="chain-dropdown-item' + (isActive ? ' active' : '') + '"' +
              (isActive ? '' : ' href="' + item.href + '"') +
              ' style="color:' + item.color + '">' +
              item.label + '</a>';
    });
    html += '</div></div>';

    nav.innerHTML = html;

    // Close dropdown on click outside
    document.addEventListener('click', function(e){
      if(!e.target.closest('.chain-dropdown')){
        document.querySelectorAll('.chain-dropdown.open').forEach(function(d){ d.classList.remove('open'); });
      }
    });
  }

  // Inject CSS for dropdown
  var style = document.createElement('style');
  style.textContent = [
    '.chain-dropdown-menu{display:none;position:absolute;top:calc(100% + 4px);right:0;background:#1a1a1c;border:1px solid #2a2a2e;border-radius:8px;padding:4px;min-width:140px;z-index:100;box-shadow:0 8px 24px rgba(0,0,0,.5);backdrop-filter:blur(12px)}',
    '.chain-dropdown.open .chain-dropdown-menu{display:flex;flex-direction:column;gap:2px}',
    '.chain-dropdown-item{padding:.4rem .7rem;border-radius:6px;font-size:.65rem;font-weight:700;text-decoration:none;transition:all .2s;white-space:nowrap;display:block}',
    '.chain-dropdown-item:hover{background:rgba(255,255,255,.08)}',
    '.chain-dropdown-item.active{background:rgba(255,255,255,.1);font-weight:900}',
    '.chain-dropdown-trigger{border-style:dashed !important}'
  ].join('\n');
  document.head.appendChild(style);

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Small delay to let existing DOM render
    setTimeout(init, 50);
  }
})();
