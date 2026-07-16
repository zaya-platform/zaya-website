// ZAYA site interactions — ecosystem canvas, lightbox, scroll-reveal.
// Ported from approved V2. Runs client-side (Astro <script>).
// (Removed: the dormant #eco ecosystem-canvas IIFE. Its <canvas id="eco"> was
//  taken out of the page in the V2 redesign, so it never ran — and its source
//  still declared retired "Riders"/"Suppliers" nodes. Deleted for honesty + weight.)

  // Signal that the interaction bundle actually executed. The html.js fallback in
  // <head> drops 'js' (un-hiding all reveal content) if this never fires — so a
  // bundle load/parse failure can never leave content trapped hidden.
  document.documentElement.classList.add('zr-armed');
  // lightbox
  (function(){var lb=document.getElementById('lb');if(!lb)return;var im=lb.querySelector('img'),cp=lb.querySelector('.lbcap');
    document.querySelectorAll('.shot,.pframe').forEach(function(el){el.addEventListener('click',function(){var g=el.querySelector('img');if(!g)return;im.src=g.src;var c=el.querySelector('.cap');cp.textContent=c?c.textContent:'';lb.classList.add('open');});});
    lb.addEventListener('click',function(){lb.classList.remove('open');});
  })();
  // Ecosystem canvas (#eco): the ZAYA hub with pulses flowing out to the HONEST audience +
  // capability nodes (no riders/suppliers; roadmap items are DIMMED "coming"). Vanilla
  // canvas, no deps. Pauses when offscreen or the tab is hidden (cancelAnimationFrame);
  // reduced-motion draws ONE static frame. Decorative (aria-hidden) — the hero reads
  // fully without it, and it no-ops if canvas/2d is unavailable.
  (function(){
    var c = document.getElementById('eco'); if(!c) return;
    var ctx = c.getContext && c.getContext('2d'); if(!ctx) return;
    var DPR = Math.min(window.devicePixelRatio || 1, 2), W = 0, H = 0, hubGrad = null;
    var mq = window.matchMedia('(prefers-reduced-motion:reduce)'), reduce = mq.matches;
    var TEAL = '#0EA5A4', CORAL = '#FF7A45', NAVY = '#1E2A4A', DIM = '#93A0AD';
    // Honest set only. Live: Customers/Merchants/Shops + Sales/Credit book/Inventory/
    // Find nearby/Price comparison. DIMMED "· soon" (not full-colour live): Orders (customer
    // ordering is gated off at pilot) + Smart search (roadmap). No riders/suppliers.
    var nodes = [
      { l:'Customers', t:'p', a:-90, r:.86, c:TEAL },
      { l:'Merchants', t:'p', a:30,  r:.86, c:TEAL },
      { l:'Shops',     t:'p', a:150, r:.86, c:CORAL },
      { l:'Find nearby',      t:'f', a:-64, r:.54, c:NAVY },
      { l:'Price comparison', t:'f', a:-13, r:.54, c:NAVY },
      { l:'Sales',            t:'f', a:38,  r:.54, c:NAVY },
      { l:'Credit book',      t:'f', a:90,  r:.54, c:NAVY },
      { l:'Inventory',        t:'f', a:141, r:.54, c:NAVY },
      { l:'Orders',           t:'f', a:192, r:.54, c:DIM, dim:true },
      { l:'Smart search',     t:'f', a:243, r:.54, c:DIM, dim:true }
    ];
    function size(){ var r = c.getBoundingClientRect(); W = r.width; H = r.height; c.width = W * DPR; c.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      hubGrad = ctx.createRadialGradient(W / 2, H / 2, 4, W / 2, H / 2, 54); hubGrad.addColorStop(0, 'rgba(19,183,180,.28)'); hubGrad.addColorStop(1, 'rgba(19,183,180,0)'); }
    window.addEventListener('resize', function(){ size(); if(!running) draw(0); }); size();
    function pos(n, tt){ var cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.44;
      var bob = reduce ? 0 : Math.sin(tt / 1000 + n.a) * (n.t === 'p' ? 7 : 5);
      var ar = n.a * Math.PI / 180;
      return { x: cx + Math.cos(ar) * R * n.r, y: cy + Math.sin(ar) * R * n.r + bob }; }
    function draw(tt){
      ctx.clearRect(0, 0, W, H);
      var cx = W / 2, cy = H / 2, i, n, p;
      for(i = 0; i < nodes.length; i++){ n = nodes[i]; p = pos(n, tt);
        var a0 = n.dim ? 0.12 : 0.28, a1 = n.dim ? 0.03 : 0.05;
        var g = ctx.createLinearGradient(cx, cy, p.x, p.y);
        g.addColorStop(0, 'rgba(19,183,180,' + a0 + ')'); g.addColorStop(1, 'rgba(19,183,180,' + a1 + ')');
        ctx.strokeStyle = g; ctx.lineWidth = n.t === 'p' ? 1.4 : 1;
        ctx.setLineDash(n.dim ? [3, 4] : []);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p.x, p.y); ctx.stroke();
        ctx.setLineDash([]);
        if(!reduce && !n.dim){ var ph = ((tt / 1600) + i * 0.12) % 1, px = cx + (p.x - cx) * ph, py = cy + (p.y - cy) * ph;
          ctx.beginPath(); ctx.arc(px, py, 2.4, 0, 7); ctx.fillStyle = n.t === 'p' ? 'rgba(255,122,69,.85)' : 'rgba(19,183,180,.7)'; ctx.fill(); }
      }
      ctx.fillStyle = hubGrad; ctx.beginPath(); ctx.arc(cx, cy, 54, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, 30, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
      ctx.lineWidth = 2.5; ctx.strokeStyle = TEAL; ctx.stroke();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for(i = 0; i < nodes.length; i++){ var m = nodes[i], q = pos(m, tt), rad = m.t === 'p' ? 7 : 4.5;
        ctx.globalAlpha = m.dim ? 0.55 : 1;
        ctx.beginPath(); ctx.arc(q.x, q.y, rad + 4, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
        ctx.beginPath(); ctx.arc(q.x, q.y, rad, 0, 7); ctx.fillStyle = m.c; ctx.fill();
        ctx.globalAlpha = m.dim ? 0.9 : 1; // label stays legible even when the node is dimmed
        ctx.font = (m.t === 'p' ? '700 ' : '600 ') + (m.t === 'p' ? 13 : 11) + "px 'Poppins','Segoe UI',system-ui,sans-serif";
        ctx.fillStyle = m.t === 'p' ? NAVY : '#54617A';
        var ly = q.y + (q.y < cy ? -rad - 11 : rad + 13), lab = m.l + (m.dim ? ' · soon' : '');
        ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.strokeText(lab, q.x, ly);
        ctx.fillText(lab, q.x, ly);
        ctx.globalAlpha = 1;
      }
    }
    var raf = null, running = false, visible = true, near = true;
    function frame(tt){ draw(tt || 0); raf = requestAnimationFrame(frame); }
    function start(){ if(running || reduce) return; running = true; raf = requestAnimationFrame(frame); }
    function stop(){ running = false; if(raf) cancelAnimationFrame(raf); raf = null; }
    function update(){ if(near && visible && !reduce){ start(); } else { stop(); if(near) draw(0); } }
    if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ near = es[0].isIntersecting; update(); }, { rootMargin: '150px' }).observe(c); }
    document.addEventListener('visibilitychange', function(){ visible = !document.hidden; update(); });
    // Re-evaluate the OS reduced-motion setting if the user toggles it while the page is open.
    if(mq.addEventListener){ mq.addEventListener('change', function(e){ reduce = e.matches; if(reduce){ stop(); draw(0); } else { update(); } }); }
    if(reduce){ draw(0); } else { update(); }
  })();
  // scroll reveal
  (function(){var els=document.querySelectorAll('.reveal,.reveal-seq');if(!('IntersectionObserver'in window)){els.forEach(function(e){e.classList.add('in')});return;}
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}})},{threshold:.12});
    els.forEach(function(e){io.observe(e);});
  })();

// Interactive audience explorer: accessible tabs, keyboard support, and hero shortcuts.
(function(){
  var explorer=document.querySelector('[data-role-explorer]'); if(!explorer) return;
  var tabs=Array.prototype.slice.call(explorer.querySelectorAll('[role="tab"][data-role]'));
  var panes=Array.prototype.slice.call(explorer.querySelectorAll('[data-role-pane]'));
  function activate(role,moveFocus){
    var next=tabs.find(function(t){return t.dataset.role===role;}); if(!next) return;
    tabs.forEach(function(tab){
      var active=tab===next;
      tab.setAttribute('aria-selected',active?'true':'false');
      tab.tabIndex=active?0:-1;
    });
    panes.forEach(function(pane){
      var active=pane.dataset.rolePane===role;
      pane.hidden=!active;
      pane.classList.toggle('is-active',active);
    });
    if(moveFocus) next.focus();
  }
  tabs.forEach(function(tab,index){
    tab.addEventListener('click',function(){activate(tab.dataset.role,false);});
    tab.addEventListener('keydown',function(event){
      var next=index;
      if(event.key==='ArrowRight'||event.key==='ArrowDown') next=(index+1)%tabs.length;
      else if(event.key==='ArrowLeft'||event.key==='ArrowUp') next=(index-1+tabs.length)%tabs.length;
      else if(event.key==='Home') next=0;
      else if(event.key==='End') next=tabs.length-1;
      else return;
      event.preventDefault(); activate(tabs[next].dataset.role,true);
    });
  });
  document.querySelectorAll('[data-role-jump]').forEach(function(link){
    link.addEventListener('click',function(){activate(link.dataset.roleJump,false);});
  });
})();

// Header feature dropdowns: reflect open state for a11y (aria-expanded), keyboard-open
// via CSS :focus-within, and close on Escape. Each trigger is ALSO a real link to its
// section, so the menu degrades to plain nav links with no JS.
(function(){
  var items = document.querySelectorAll('.menu > .item');
  Array.prototype.forEach.call(items, function(item){
    var trigger = item.querySelector('a[aria-haspopup]');
    var drop = item.querySelector('.drop');
    if(!trigger || !drop) return;
    function set(open){ trigger.setAttribute('aria-expanded', open ? 'true' : 'false'); }
    item.addEventListener('mouseenter', function(){ set(true); });
    item.addEventListener('mouseleave', function(){ set(false); });
    item.addEventListener('focusin', function(){ set(true); });
    item.addEventListener('focusout', function(){ set(false); });
    item.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ set(false); if(trigger.blur) trigger.blur(); } });
  });
})();

// Keep the FAQ focused: opening one answer closes the previous answer.
(function(){
  var items=Array.prototype.slice.call(document.querySelectorAll('.faq details'));
  items.forEach(function(item){item.addEventListener('toggle',function(){
    if(!item.open) return;
    items.forEach(function(other){if(other!==item) other.open=false;});
  });});
})();

// Netlify Forms: show an on-brand success note after a submission redirect (?joined).
(function(){
  try{
    if(location.search.indexOf('joined')>-1){
      var f=document.querySelector('.pilot-form'); if(f){f.classList.add('sent');}
      var el=document.getElementById('contact'); if(el){el.scrollIntoView();}
    }
  }catch(e){}
})();

// Mobile/tablet menu: toggle the slide-down nav; close on link tap, Escape, or resize to desktop.
(function(){
  var burger=document.querySelector('.burger'), hdr=document.querySelector('header');
  if(!burger||!hdr) return;
  function set(open){ hdr.classList.toggle('nav-open',open); burger.setAttribute('aria-expanded',open?'true':'false'); }
  burger.addEventListener('click',function(){ set(!hdr.classList.contains('nav-open')); });
  hdr.querySelectorAll('.menu a,.menu button').forEach(function(a){ a.addEventListener('click',function(){ set(false); }); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') set(false); });
  window.addEventListener('resize',function(){ if(window.innerWidth>940) set(false); });
})();
