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
