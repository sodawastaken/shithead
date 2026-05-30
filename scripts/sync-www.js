// Generates www/index.html from game/shithead(2).html by applying all iOS patches.
// Run: node scripts/sync-www.js
// Then: npx cap sync ios

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

let html = fs.readFileSync(path.join(root, 'game/shithead(2).html'), 'utf8');

// ── 1. Viewport: add viewport-fit=cover ──────────────────────────────────────
html = html.replace(
  'content="width=device-width, initial-scale=1.0"',
  'content="width=device-width, initial-scale=1.0, viewport-fit=cover"'
);

// ── 2. Replace Google Fonts CDN with local @font-face (offline support) ──────
html = html.replace(
  `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cinzel+Decorative:wght@400;700;900&display=swap" rel="stylesheet">`,
  `<style>
@font-face{font-family:'Cinzel';font-style:normal;font-weight:400 900;font-display:swap;src:url(fonts/cinzel.woff2) format('woff2')}
@font-face{font-family:'Cinzel Decorative';font-style:normal;font-weight:400;font-display:swap;src:url(fonts/cinzel-decorative-400.woff2) format('woff2')}
@font-face{font-family:'Cinzel Decorative';font-style:normal;font-weight:700;font-display:swap;src:url(fonts/cinzel-decorative-700.woff2) format('woff2')}
@font-face{font-family:'Cinzel Decorative';font-style:normal;font-weight:900;font-display:swap;src:url(fonts/cinzel-decorative-900.woff2) format('woff2')}
</style>`
);

// ── 3. Touch responsiveness on * rule ────────────────────────────────────────
html = html.replace(
  '*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}',
  '*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;touch-action:manipulation}'
);

// ── 4. :root — add iOS safe area variables (keep --ui-scale) ─────────────────
html = html.replace(
  '  --ui-scale:1;\n}',
  `  --ui-scale:1;
  /* iOS safe areas */
  --sat:env(safe-area-inset-top);
  --sab:env(safe-area-inset-bottom);
  --sal:env(safe-area-inset-left);
  --sar:env(safe-area-inset-right);
}`
);

// ── 5. Game board height: 100vh → 100svh (avoids iOS browser chrome) ─────────
html = html.replace(
  'width:100vw;height:100vh;display:flex;flex-direction:column;',
  'width:100vw;height:100svh;display:flex;flex-direction:column;'
);

// ── 6. Human area: clear iPhone home bar ─────────────────────────────────────
html = html.replace(
  'padding:10px 8px 8px;gap:7px;',
  'padding:10px 8px calc(8px + env(safe-area-inset-bottom));gap:7px;'
);

// ── 7. Landscape phone layout — insert before Classic theme block ─────────────
const landscapeCSS = `
/* ── Landscape phone layout ── */
@media(orientation:landscape) and (max-height:500px){
  :root{--cw:44px;--ch:63px;--cr:5px}
  #top-bar{
    height:32px;
    padding-left:calc(12px + env(safe-area-inset-left));
    padding-right:calc(12px + env(safe-area-inset-right));
  }
  #status-bar{display:none}
  #ai-top{
    padding-top:2px;
    padding-left:calc(8px + env(safe-area-inset-left));
    padding-right:calc(8px + env(safe-area-inset-right));
    gap:10px;
  }
  #table-row{
    padding-left:calc(4px + env(safe-area-inset-left));
    padding-right:calc(4px + env(safe-area-inset-right));
  }
  #human-area{
    padding:5px calc(8px + env(safe-area-inset-right)) calc(4px + env(safe-area-inset-bottom)) calc(8px + env(safe-area-inset-left));
    gap:4px;
  }
  #ai-left,#ai-right{min-width:70px;gap:4px}
  .card.mini{width:32px;height:46px}
  #action-buttons{gap:5px}
  button{padding:5px 9px;font-size:9px}
  .card-row.fan-hand{height:calc(var(--ch) + 20px)}
  .card-row.fan-hand.ai-fan{height:calc(var(--ch)*0.7 + 16px)}
  .tstack{height:calc(var(--ch) + 8px)}
}

`;
html = html.replace(
  '/* ═══════════════════════════════════════════════════════\n   CLASSIC THEME',
  landscapeCSS + '/* ═══════════════════════════════════════════════════════\n   CLASSIC THEME'
);

// ── 8. applyScale: landscape-aware base dimensions ───────────────────────────
html = html.replace(
  `function applyScale(){
  const s=CFG.scale/100;
  document.documentElement.style.setProperty('--scale',s);
  // We scale card sizes directly via CSS vars
  const baseCW=78,baseCH=110;
  document.documentElement.style.setProperty('--cw',Math.round(baseCW*s)+'px');
  document.documentElement.style.setProperty('--ch',Math.round(baseCH*s)+'px');
}`,
  `function applyScale(){
  const s=CFG.scale/100;
  document.documentElement.style.setProperty('--scale',s);
  const landscape=window.innerWidth>window.innerHeight&&window.innerHeight<500;
  const baseCW=landscape?44:78, baseCH=landscape?63:110;
  document.documentElement.style.setProperty('--cw',Math.round(baseCW*s)+'px');
  document.documentElement.style.setProperty('--ch',Math.round(baseCH*s)+'px');
}`
);

// ── 9. Orientation change + resize listeners ──────────────────────────────────
html = html.replace(
  `  buildSettingSelects();
  renderHistory();
});`,
  `  buildSettingSelects();
  renderHistory();

  // Re-apply scale and re-render on orientation change (landscape ↔ portrait)
  window.addEventListener('orientationchange',function(){
    setTimeout(function(){applyScale();if(G)renderAll();},150);
  });
  window.addEventListener('resize',function(){
    applyScale();if(G)renderAll();
  });
});`
);

fs.writeFileSync(path.join(root, 'www/index.html'), html);
console.log('✓ www/index.html synced from game/shithead(2).html with iOS patches applied');
