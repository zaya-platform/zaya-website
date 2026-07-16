// ZAYA site interactions — hero hub-and-spoke canvas, lightbox, scroll-reveal,
// dropdown menus, role tabs, FAQ, forms. Astro-native, vanilla, no deps. Runs
// client-side (Astro <script>), JS-gated so the static page always renders.

  // Signal that the interaction bundle actually executed. The html.js fallback in
  // <head> drops 'js' (un-hiding all reveal content) if this never fires — so a
  // bundle load/parse failure can never leave content trapped hidden.
  document.documentElement.classList.add('zr-armed');
  // lightbox
  (function(){var lb=document.getElementById('lb');if(!lb)return;var im=lb.querySelector('img'),cp=lb.querySelector('.lbcap');
    document.querySelectorAll('.shot,.pframe').forEach(function(el){el.addEventListener('click',function(){var g=el.querySelector('img');if(!g)return;im.src=g.src;var c=el.querySelector('.cap');cp.textContent=c?c.textContent:'';lb.classList.add('open');});});
    lb.addEventListener('click',function(){lb.classList.remove('open');});
  })();
  // Hero hub-and-spoke (#eco): the central ZAYA hub linked to six honest nodes. The
  // hub + node cards are real DOM; this canvas draws ONLY the dashed teal spokes and
  // the travelling pulses (the "wave") between them — measuring each card's live
  // layout position (offsetLeft/Top, which ignore CSS transforms) so the spokes always
  // meet the cards, at any size and while the diagram parallax-tilts. Vanilla canvas,
  // no deps. Pauses offscreen / on a hidden tab (cancelAnimationFrame); reduced-motion
  // draws ONE static frame. Decorative (aria-hidden) — the hero reads fully without it
  // (hub + labelled cards are HTML), and it no-ops if canvas/2d is unavailable.
  (function(){
    var c = document.getElementById('eco'); if(!c) return;
    var ctx = c.getContext && c.getContext('2d'); if(!ctx) return;
    var wrap = c.parentNode, core = wrap.querySelector('.hub-core');
    var cards = [].slice.call(wrap.querySelectorAll('.hub-node'));
    if(!core || !cards.length) return;
    var DPR = Math.min(window.devicePixelRatio || 1, 2), W = 0, H = 0;
    var mq = window.matchMedia('(prefers-reduced-motion:reduce)'), reduce = mq.matches;
    var TEAL = 'rgba(14,165,164,', CORAL = '#FF7A45';
    var hub = { x:0, y:0, r:0 }, pts = [];
    function measure(){
      DPR = Math.min(window.devicePixelRatio || 1, 2);   // refresh: DPR changes on zoom / monitor move
      var r = c.getBoundingClientRect(); W = r.width; H = r.height;
      c.width = W * DPR; c.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      hub.x = core.offsetLeft; hub.y = core.offsetTop; hub.r = core.offsetWidth / 2;
      pts = cards.map(function(card){
        return { card: card, x: card.offsetLeft, y: card.offsetTop,
          hw: card.offsetWidth / 2, hh: card.offsetHeight / 2,
          coral: card.classList.contains('hub-coral') };
      });
    }
    // point on a half-(hw,hh) box centred at (bx,by), along the ray toward (tx,ty)
    function boxEdge(bx, by, hw, hh, tx, ty){
      var dx = tx - bx, dy = ty - by, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
      var t = Math.min(hw / Math.max(Math.abs(ux), 1e-4), hh / Math.max(Math.abs(uy), 1e-4));
      return { x: bx + ux * t, y: by + uy * t };
    }
    function draw(tt){
      ctx.clearRect(0, 0, W, H);
      for(var i = 0; i < pts.length; i++){
        var p = pts[i];
        var dx = p.x - hub.x, dy = p.y - hub.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
        var sx = hub.x + ux * (hub.r + 2), sy = hub.y + uy * (hub.r + 2);          // start at hub edge
        var e = boxEdge(p.x, p.y, p.hw + 2, p.hh + 2, hub.x, hub.y);               // end at card near-edge
        var ex = e.x, ey = e.y, on = p.card.classList.contains('is-on');
        ctx.setLineDash([5, 5]); ctx.lineDashOffset = reduce ? 0 : -(tt / 26) % 10;
        ctx.strokeStyle = TEAL + (on ? '.85)' : '.4)'); ctx.lineWidth = on ? 2 : 1.4;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = TEAL + '.55)';                                            // connection dots
        ctx.beginPath(); ctx.arc(sx, sy, 2, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(ex, ey, 2, 0, 7); ctx.fill();
        if(!reduce){ var ph = ((tt / 1500) + i * 0.18) % 1, mx = sx + (ex - sx) * ph, my = sy + (ey - sy) * ph;
          ctx.beginPath(); ctx.arc(mx, my, on ? 3.4 : 2.6, 0, 7);
          ctx.fillStyle = on ? (p.coral ? CORAL : 'rgba(14,165,164,.95)') : TEAL + '.8)'; ctx.fill(); }
      }
    }
    var raf = null, running = false, visible = true, near = true;
    function frame(tt){ draw(tt || 0); raf = requestAnimationFrame(frame); }
    function start(){ if(running || reduce) return; running = true; raf = requestAnimationFrame(frame); }
    function stop(){ running = false; if(raf) cancelAnimationFrame(raf); raf = null; }
    function update(){ if(near && visible && !reduce){ start(); } else { stop(); if(near) draw(0); } }
    measure();
    window.addEventListener('resize', function(){ measure(); if(!running) draw(0); });
    if(window.document.fonts && document.fonts.ready){ document.fonts.ready.then(function(){ measure(); if(!running) draw(0); }); }
    // hover / tap emphasis — brightens the node's spoke + pulse (labels are always visible)
    cards.forEach(function(card){
      card.addEventListener('mouseenter', function(){ card.classList.add('is-on'); if(!running) draw(0); });
      card.addEventListener('mouseleave', function(){ card.classList.remove('is-on'); if(!running) draw(0); });
      card.addEventListener('click', function(){ card.classList.toggle('is-on'); if(!running) draw(0); });
    });
    // cursor-tilt parallax — fine pointer only (touch uses tap). Listeners are wired
    // unconditionally but the handler no-ops while reduced-motion is active, so if the
    // user turns reduced-motion OFF mid-session the tilt starts working (and CSS also
    // pins transform:none under reduced-motion, so it can never move meanwhile).
    if(window.matchMedia('(hover:hover) and (pointer:fine)').matches){
      wrap.addEventListener('pointermove', function(ev){
        if(reduce) return;
        var b = wrap.getBoundingClientRect();
        var rx = (ev.clientX - b.left) / b.width - .5, ry = (ev.clientY - b.top) / b.height - .5;
        wrap.style.setProperty('--ty', (rx * 7).toFixed(2) + 'deg');
        wrap.style.setProperty('--tx', (ry * -7).toFixed(2) + 'deg');
      });
      wrap.addEventListener('pointerleave', function(){ wrap.style.setProperty('--tx', '0deg'); wrap.style.setProperty('--ty', '0deg'); });
    }
    if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ near = es[0].isIntersecting; update(); }, { rootMargin: '150px' }).observe(c); }
    document.addEventListener('visibilitychange', function(){ visible = !document.hidden; update(); });
    // Re-evaluate the OS reduced-motion setting if the user toggles it while the page is open.
    if(mq.addEventListener){ mq.addEventListener('change', function(e){ reduce = e.matches; if(reduce){ stop(); measure(); draw(0); } else { update(); } }); }
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
