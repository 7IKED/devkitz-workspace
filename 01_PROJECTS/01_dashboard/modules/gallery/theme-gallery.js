// === TRIPLE THEME GALLERY — Engine ===
// DkZ XSS Protection
function esc(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML}

// --- ASSET DATA (56 OBS FX + Basis) ---
const ASSETS=[
  {id:'B1',name:'Hexagon Neon BG',cat:'cyber',prompt:'High-end abstract neon green and black honeycomb hexagon matrix background, 3D render, glowing volumetric light, streaming overlay background, premium 8k resolution, transparent look',file:'obs_neon_hexagon_bg'},
  {id:'B2',name:'Neon Particles',cat:'particle',prompt:'Glowing neon green particles exploding in a dark void, 3D render, depth of field, high contrast, streaming effects, 4k',file:'obs_neon_particles'},
  {id:'01',name:'Neon Hearts Rain',cat:'love',prompt:'Dozens of glowing neon pink hearts falling like rain from top, sparkling trails, isolated on pure black background, 4K, volumetric glow, OBS streaming overlay effect',file:'fx_01_neon_hearts_rain'},
  {id:'02',name:'Gold Confetti Burst',cat:'celebration',prompt:'Explosive burst of golden metallic confetti and glitter particles radiating from center, isolated on pure black background, 4K, celebration effect, OBS overlay, luxury premium feel',file:'fx_02_gold_confetti_burst'},
  {id:'03',name:'Electric Lightning',cat:'gaming',prompt:'Multiple electric blue and purple lightning bolts branching across frame, plasma energy crackling, isolated on pure black background, 4K, high voltage effect, dramatic',file:'fx_03_electric_lightning'},
  {id:'04',name:'Fire Embers Rising',cat:'particle',prompt:'Hundreds of glowing orange and red fire embers floating upward, sparks and ash particles rising, isolated on pure black background, 4K, cinematic, campfire embers effect',file:'fx_04_fire_embers_rising'},
  {id:'05',name:'Snowfall Gentle',cat:'atmosphere',prompt:'Soft white snowflakes falling gently with bokeh blur, various sizes, delicate crystalline shapes, isolated on pure black background, 4K, winter snow effect, peaceful',file:'fx_05_snowfall_gentle'},
  {id:'06',name:'Neon Hex Border',cat:'cyber',prompt:'Glowing neon green hexagonal frame border around edges of frame, honeycomb pattern dissolving inward, isolated on pure black background, 4K, cyberpunk streaming webcam frame overlay',file:'fx_06_neon_hex_border'},
  {id:'07',name:'Sakura Petals',cat:'atmosphere',prompt:'Beautiful pink cherry blossom sakura petals floating and swirling through the air, soft glow, isolated on pure black background, 4K, Japanese aesthetic streaming overlay, dreamy',file:'fx_07_sakura_petals'},
  {id:'08',name:'Matrix Rain',cat:'cyber',prompt:'Green digital matrix code rain falling vertically, glowing characters and symbols, cyberpunk hacker aesthetic, isolated on pure black background, 4K, streaming overlay effect',file:'fx_08_matrix_rain'},
  {id:'09',name:'Galaxy Dust',cat:'atmosphere',prompt:'Swirling galaxy stardust and cosmic nebula particles, purple blue and pink cosmic clouds, isolated on pure black background, 4K, space streaming overlay, ethereal',file:'fx_09_galaxy_dust'},
  {id:'10',name:'Neon Frame Corners',cat:'cyber',prompt:'Four glowing neon cyan corner brackets forming a rectangular frame, minimalist tech HUD overlay, scanlines, isolated on pure black background, 4K, futuristic webcam frame',file:'fx_10_neon_frame_corners'},
  {id:'11',name:'Rainbow Sparkles',cat:'celebration',prompt:'Magical rainbow colored sparkles and glitter dust scattered across frame, prismatic light refractions, diamond-like twinkles, isolated on pure black background, 4K',file:'fx_11_rainbow_sparkles'},
  {id:'12',name:'Smoke Fog Roll',cat:'atmosphere',prompt:'Dramatic volumetric fog and smoke rolling across bottom of frame, dense atmospheric haze, subtle blue tint, isolated on pure black background, 4K, moody streaming overlay',file:'fx_12_smoke_fog_roll'},
  {id:'13',name:'Laser Grid Floor',cat:'cyber',prompt:'Retro synthwave laser grid floor perspective, neon pink and purple grid lines extending to horizon, 80s vaporwave aesthetic, isolated on pure black background, 4K',file:'fx_13_laser_grid_floor'},
  {id:'14',name:'Flame Border',cat:'gaming',prompt:'Intense orange and blue flames forming a rectangular frame border, fire licking around edges, dramatic heat haze, isolated on pure black background, 4K, fire webcam frame',file:'fx_14_flame_border'},
  {id:'15',name:'Bubble Float',cat:'atmosphere',prompt:'Iridescent soap bubbles of various sizes floating upward, rainbow reflections on bubble surfaces, translucent and shiny, isolated on pure black background, 4K, dreamy',file:'fx_15_bubble_float'},
  {id:'16',name:'Cyber Glitch',cat:'cyber',prompt:'Digital glitch distortion effect with RGB split, scan lines, pixel corruption artifacts, chromatic aberration streaks, isolated on pure black background, 4K, cyberpunk glitch',file:'fx_16_cyber_glitch'},
  {id:'17',name:'Aurora Borealis',cat:'atmosphere',prompt:'Vivid aurora borealis northern lights ribbons flowing across top of frame, green and purple luminous curtains, isolated on pure black background, 4K, nature streaming overlay',file:'fx_17_aurora_borealis'},
  {id:'18',name:'Fireworks Burst',cat:'celebration',prompt:'Multiple colorful fireworks exploding simultaneously, golden red blue green bursts with sparkling trails, isolated on pure black background, 4K, celebration streaming overlay',file:'fx_18_fireworks_burst'},
  {id:'19',name:'Neon Music EQ',cat:'celebration',prompt:'Glowing neon equalizer bars at bottom of frame, music visualizer effect, cyan and magenta frequency bars pulsing, isolated on pure black background, 4K, music streaming overlay',file:'fx_19_neon_music_eq'},
  {id:'20',name:'Diamond Shower',cat:'celebration',prompt:'Sparkling diamonds and crystals falling from above, brilliant light refractions, prismatic rainbow light, luxury and wealth aesthetic, isolated on pure black background, 4K',file:'fx_20_diamond_shower'},
  {id:'21',name:'Electric Orb',cat:'gaming',prompt:'Central glowing electric plasma orb with tendrils of electricity reaching outward, tesla coil energy, blue white lightning sphere, isolated on pure black background, 4K',file:'fx_21_electric_orb'},
  {id:'22',name:'Autumn Leaves',cat:'atmosphere',prompt:'Autumn leaves in orange red gold brown falling and swirling through air, maple and oak leaves with soft glow, isolated on pure black background, 4K, cozy fall streaming overlay',file:'fx_22_leaf_autumn'},
  {id:'23',name:'Hologram Grid',cat:'cyber',prompt:'Futuristic holographic wireframe grid sphere rotating, teal and cyan hologram projection, sci-fi technology aesthetic, isolated on pure black background, 4K, tech streaming overlay',file:'fx_23_hologram_grid'},
  {id:'24',name:'Star Explosion',cat:'particle',prompt:'Massive supernova star explosion with expanding shockwave rings, brilliant white core with orange and blue energy waves, cosmic debris, isolated on pure black background, 4K',file:'fx_24_star_explosion'},
  {id:'25',name:'Water Droplets',cat:'atmosphere',prompt:'Water droplets and splashes frozen in motion, crystalline water beads with light refractions, rain drops impact effect, isolated on pure black background, 4K',file:'fx_25_water_droplets'},
  {id:'26',name:'Neon Butterflies',cat:'atmosphere',prompt:'Dozens of glowing neon butterflies in cyan pink and purple, luminescent wings with particle trails, magical forest feel, isolated on pure black background, 4K',file:'fx_26_neon_butterfly'},
  {id:'27',name:'Speed Lines',cat:'gaming',prompt:'Anime-style speed lines radiating from center, white and blue motion blur streaks, dramatic action zoom effect, manga aesthetic, isolated on pure black background, 4K',file:'fx_27_speed_lines'},
  {id:'28',name:'Galaxy Portal',cat:'gaming',prompt:'Swirling galaxy portal vortex in center of frame, purple blue and gold cosmic spiral, event horizon with light bending, isolated on pure black background, 4K',file:'fx_28_galaxy_portal'},
  {id:'29',name:'Pixel Explosion',cat:'gaming',prompt:'Colorful pixel art blocks exploding outward, retro 8-bit game aesthetic, voxel cubes in neon colors shattering, isolated on pure black background, 4K',file:'fx_29_pixel_explosion'},
  {id:'30',name:'Energy Wings',cat:'love',prompt:'Majestic glowing energy angel wings spread wide, ethereal white and gold light feathers, divine radiance, isolated on pure black background, 4K, epic streaming overlay',file:'fx_30_energy_wings'},
  {id:'31',name:'Neon Rain',cat:'cyber',prompt:'Neon colored rain drops in cyan and teal falling with streaks of light, cyberpunk city rain, glowing water trails, isolated on pure black background, 4K',file:'fx_31_neon_rain'},
  {id:'32',name:'Shockwave Ring',cat:'particle',prompt:'Circular shockwave energy ring expanding outward from center, distortion wave with golden light, sonic boom visual, isolated on pure black background, 4K',file:'fx_32_shockwave_ring'},
  {id:'33',name:'Dragon Fire',cat:'gaming',prompt:'Dragon fire breath sweeping across frame from left, intense orange and blue flames with smoke, fantasy medieval aesthetic, isolated on pure black background, 4K',file:'fx_33_dragon_fire'},
  {id:'34',name:'Golden Crown',cat:'celebration',prompt:'Magnificent golden crown descending from above with sparkling jewels and light rays, royal luxury effect, diamond encrusted, isolated on pure black background, 4K',file:'fx_34_crown_gold'},
  {id:'35',name:'Hex Dissolve',cat:'cyber',prompt:'Hexagonal tiles shattering and dissolving from center outward, glowing neon green edges on each hex piece, geometric destruction, isolated on pure black background, 4K',file:'fx_35_hex_dissolve'},
  {id:'36',name:'Music Notes',cat:'celebration',prompt:'Glowing colorful music notes and treble clefs floating upward like bubbles, neon pink cyan gold musical symbols, isolated on pure black background, 4K',file:'fx_36_music_notes'},
  {id:'37',name:'Ice Frost',cat:'gaming',prompt:'Spreading ice crystal frost pattern growing across frame edges, frozen icicle formations, cold blue white crystalline structures, isolated on pure black background, 4K',file:'fx_37_ice_frost'},
  {id:'38',name:'Comic POW',cat:'gaming',prompt:'Comic book style POW explosion with bright yellow starburst, halftone dots pattern, pop art action effect, bold red and yellow, isolated on pure black background, 4K',file:'fx_38_comic_pow'},
  {id:'39',name:'DNA Helix',cat:'cyber',prompt:'Glowing neon DNA double helix strand rotating vertically, bioluminescent cyan and green molecular structure, science aesthetic, isolated on pure black background, 4K',file:'fx_39_dna_helix'},
  {id:'40',name:'Skull Flame',cat:'gaming',prompt:'Flaming neon skull with fire burning from eye sockets and top, ghostly green and purple flames, edgy dark aesthetic, isolated on pure black background, 4K',file:'fx_40_skull_flame'},
  {id:'41',name:'Feather Float',cat:'love',prompt:'Luminous white and gold feathers gently floating downward, ethereal angelic soft glow, graceful movement, isolated on pure black background, 4K, elegant streaming overlay',file:'fx_41_feather_float'},
  {id:'42',name:'Neon Circle Pulse',cat:'cyber',prompt:'Concentric neon circles pulsing outward from center, cyan and magenta rings of light expanding, radar pulse effect, isolated on pure black background, 4K',file:'fx_42_neon_circle_pulse'},
  {id:'43',name:'Thunder Storm',cat:'gaming',prompt:'Dramatic thunderstorm with multiple lightning strikes, dark storm clouds with electric bolts, rain and wind, apocalyptic atmosphere, isolated on pure black background, 4K',file:'fx_43_thunder_storm'},
  {id:'44',name:'Glitter Curtain',cat:'celebration',prompt:'Vertical curtain of falling golden glitter and shimmer particles, dense sparkling waterfall of light, glamorous and luxurious, isolated on pure black background, 4K',file:'fx_44_glitter_curtain'},
  {id:'45',name:'Hex Tunnel',cat:'cyber',prompt:'Flying through a tunnel of glowing hexagonal rings, infinite depth perspective, neon green and cyan hexagons zooming past camera, warp speed, isolated on pure black background, 4K',file:'fx_45_hex_tunnel'},
  {id:'46',name:'Meteor Shower',cat:'atmosphere',prompt:'Blazing meteors and shooting stars streaking diagonally across frame, fiery trails with orange and white glow, cosmic debris, isolated on pure black background, 4K',file:'fx_46_meteor_shower'},
  {id:'47',name:'Rose Petals',cat:'love',prompt:'Red rose petals scattered and falling gracefully through air, romantic deep crimson petals with soft glow, love and passion, isolated on pure black background, 4K',file:'fx_47_rose_petals'},
  {id:'48',name:'Laser Beams',cat:'celebration',prompt:'Multiple colored laser beams crossing and intersecting, red green blue purple laser show effect, nightclub concert aesthetic, volumetric light, isolated on pure black background, 4K',file:'fx_48_laser_beams'},
  {id:'49',name:'Energy Shield',cat:'gaming',prompt:'Futuristic energy shield dome with hexagonal panels, force field deflecting impacts, glowing cyan blue barrier with ripple effects, sci-fi technology, isolated on pure black background, 4K',file:'fx_49_energy_shield'},
  {id:'50',name:'Neon LOVE Text',cat:'love',prompt:'Glowing neon sign spelling LOVE in hot pink cursive lettering, buzzing neon tube effect, warm ambient glow, surrounded by tiny hearts, isolated on pure black background, 4K',file:'fx_50_neon_love_text'},
];

const CAT_LABELS={
  all:'Alle',particle:'🔥 Partikel',love:'❤️ Liebe',
  atmosphere:'🌌 Atmosphäre',gaming:'🎮 Gaming',
  cyber:'🔮 Cyber',celebration:'🎉 Celebration'
};

const ASSET_PATH='../obs-fx-overlay/assets/';
let currentFilter='all';
let currentTheme=localStorage.getItem('dkz-gallery-theme')||'dkz';
let currentMode=localStorage.getItem('dkz-gallery-mode')||'dunkel';

// --- INIT ---
function init(){
  applyTheme();
  buildFilters();
  renderGallery();
  updateStats();
  document.getElementById('themeSelect').value=currentTheme;
  document.getElementById('modeSelect').value=currentMode;
}

function applyTheme(){
  document.body.setAttribute('data-theme',currentTheme);
  document.body.setAttribute('data-mode',currentMode);
  localStorage.setItem('dkz-gallery-theme',currentTheme);
  localStorage.setItem('dkz-gallery-mode',currentMode);
  // Update badge
  const badge=document.getElementById('themeBadge');
  const labels={dkz:'DkZ v2+',claude:'Claude',stitch:'Stitch'};
  const modes={dunkel:'Dark',hell:'Light',matrix:'Matrix'};
  if(badge) badge.textContent=labels[currentTheme]+' · '+modes[currentMode];
}

function setTheme(t){currentTheme=t;applyTheme();renderGallery()}
function setMode(m){currentMode=m;applyTheme();renderGallery()}

function buildFilters(){
  const bar=document.getElementById('filterBar');
  if(!bar) return;
  bar.innerHTML='<input class="search-input" id="searchBox" placeholder="🔍 Suche..." oninput="renderGallery()">';
  Object.entries(CAT_LABELS).forEach(([k,v])=>{
    const b=document.createElement('button');
    b.className='filter-btn'+(k==='all'?' active':'');
    b.textContent=v;
    b.onclick=()=>{
      currentFilter=k;
      bar.querySelectorAll('.filter-btn').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      renderGallery();
    };
    bar.appendChild(b);
  });
}

function renderGallery(){
  const grid=document.getElementById('galleryGrid');
  const q=(document.getElementById('searchBox')?.value||'').toLowerCase();
  const filtered=ASSETS.filter(a=>{
    if(currentFilter!=='all'&&a.cat!==currentFilter) return false;
    if(q&&!a.name.toLowerCase().includes(q)&&!a.prompt.toLowerCase().includes(q)&&!a.cat.includes(q)) return false;
    return true;
  });
  
  grid.innerHTML=filtered.map((a,i)=>`
    <div class="tile" onclick="openLightbox(${ASSETS.indexOf(a)})" style="animation:fadeUp .4s ${i*30}ms both">
      <img class="tile-img" src="${esc(ASSET_PATH+a.file)}.png" alt="${esc(a.name)}" loading="lazy"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
      >
      <div style="display:none;height:160px;align-items:center;justify-content:center;background:var(--bg2);font-size:42px">🎨</div>
      <span class="tile-badge">FX-${esc(a.id)}</span>
      <div class="tile-info">
        <div class="tile-name">${esc(a.name)}</div>
        <div class="tile-prompt">${esc(a.prompt.substring(0,120))}…</div>
        <div class="tile-tags"><span class="tile-tag cat-${a.cat}">${esc(CAT_LABELS[a.cat]||a.cat)}</span></div>
        <div class="tile-actions">
          <button class="tile-act" onclick="event.stopPropagation();copyText('${a.prompt.replace(/'/g,"\\'")}')">📋 Prompt</button>
          <button class="tile-act" onclick="event.stopPropagation();window.open('${ASSET_PATH+a.file}.png','_blank')">🔗 Open</button>
        </div>
      </div>
    </div>
  `).join('');
  
  updateStats(filtered.length);
}

function updateStats(shown){
  const el=document.getElementById('statsInfo');
  if(!el) return;
  const cats={};
  ASSETS.forEach(a=>{cats[a.cat]=(cats[a.cat]||0)+1});
  el.innerHTML=`
    <span>Gesamt: <span class="num">${ASSETS.length}</span></span>
    <span>Angezeigt: <span class="num">${shown??ASSETS.length}</span></span>
    <span>Kategorien: <span class="num">${Object.keys(cats).length}</span></span>
    <span>Theme: <span class="num">${currentTheme.toUpperCase()}</span></span>
  `;
}

// --- LIGHTBOX ---
function openLightbox(idx){
  const a=ASSETS[idx];
  if(!a)return;
  const lb=document.getElementById('lightbox');
  document.getElementById('lbImg').src=ASSET_PATH+a.file+'.png';
  document.getElementById('lbName').textContent=a.name;
  document.getElementById('lbPrompt').textContent=a.prompt;
  lb.classList.add('open');
  lb.onclick=e=>{if(e.target===lb)closeLightbox()};
}
function closeLightbox(){document.getElementById('lightbox').classList.remove('open')}

// --- UTILS ---
function copyText(t){
  navigator.clipboard.writeText(t).then(()=>showToast('📋 Prompt kopiert!'));
}
function showToast(m){
  const t=document.getElementById('toast');
  t.textContent=m;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2500);
}

// --- FADE ANIMATION ---
const style=document.createElement('style');
style.textContent='@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}';
document.head.appendChild(style);

// --- START ---
document.addEventListener('DOMContentLoaded',init);
