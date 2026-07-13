// ZAYA site interactions — ecosystem canvas, lightbox, scroll-reveal.
// Ported from approved V2. Runs client-side (Astro <script>).
(function(){
  var c=document.getElementById('eco'); if(!c) return;
  var ctx=c.getContext('2d'), DPR=Math.min(window.devicePixelRatio||1,2), W=0,H=0;
  var reduce=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  // participants (outer ring) + capability tags (mid) around a ZAYA hub
  var TEAL='#0EA5A4', CORAL='#FF7A45', NAVY='#1E2A4A', MINT='#5DCAA5';
  var nodes=[
    {l:'Customers',t:'p',a:-90,r:.88,c:TEAL},
    {l:'Merchants',t:'p',a:-18,r:.88,c:TEAL},
    {l:'Riders',t:'p',a:54,r:.88,c:CORAL},
    {l:'Diaspora',t:'p',a:126,r:.88,c:CORAL},
    {l:'Suppliers',t:'p',a:198,r:.88,c:TEAL},
    {l:'Nearby shops',t:'f',a:-56,r:.56,c:NAVY},
    {l:'Best prices',t:'f',a:-9,r:.56,c:NAVY},
    {l:'Orders',t:'f',a:40,r:.56,c:NAVY},
    {l:'Smart search',t:'f',a:90,r:.56,c:NAVY},
    {l:'Credit',t:'f',a:150,r:.56,c:NAVY},
    {l:'Inventory',t:'f',a:216,r:.56,c:NAVY},
    {l:'Smart tools',t:'f',a:270,r:.56,c:NAVY}
  ];
  function size(){ var r=c.getBoundingClientRect(); W=r.width; H=r.height; c.width=W*DPR; c.height=H*DPR; ctx.setTransform(DPR,0,0,DPR,0,0); }
  window.addEventListener('resize',size); size();
  function pos(n,tt){ var cx=W/2, cy=H/2, R=Math.min(W,H)*0.44;
    var bob=reduce?0:Math.sin(tt/1000 + n.a)*(n.t==='p'?7:5);
    var ar=(n.a)*Math.PI/180;
    return {x:cx+Math.cos(ar)*R*n.r, y:cy+Math.sin(ar)*R*n.r + bob, cx:cx, cy:cy}; }
  function draw(tt){
    ctx.clearRect(0,0,W,H);
    var cx=W/2, cy=H/2;
    // links hub -> features -> participants
    for(var i=0;i<nodes.length;i++){ var n=nodes[i], p=pos(n,tt);
      var grad=ctx.createLinearGradient(cx,cy,p.x,p.y);
      grad.addColorStop(0,'rgba(19,183,180,.28)'); grad.addColorStop(1,'rgba(19,183,180,.05)');
      ctx.strokeStyle=grad; ctx.lineWidth=n.t==='p'?1.4:1; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(p.x,p.y); ctx.stroke();
      // travelling pulse
      if(!reduce){ var ph=((tt/1600)+i*0.12)%1; var px=cx+(p.x-cx)*ph, py=cy+(p.y-cy)*ph;
        ctx.beginPath(); ctx.arc(px,py,2.4,0,7); ctx.fillStyle=n.t==='p'?'rgba(255,122,69,.85)':'rgba(19,183,180,.7)'; ctx.fill(); }
    }
    // hub glow
    var hg=ctx.createRadialGradient(cx,cy,4,cx,cy,54); hg.addColorStop(0,'rgba(19,183,180,.28)'); hg.addColorStop(1,'rgba(19,183,180,0)');
    ctx.fillStyle=hg; ctx.beginPath(); ctx.arc(cx,cy,54,0,7); ctx.fill();
    ctx.beginPath(); ctx.arc(cx,cy,30,0,7); ctx.fillStyle='#fff'; ctx.fill();
    ctx.lineWidth=2.5; ctx.strokeStyle=TEAL; ctx.stroke();
    // nodes
    ctx.textAlign='center'; ctx.textBaseline='middle';
    for(var j=0;j<nodes.length;j++){ var m=nodes[j], q=pos(m,tt);
      var rad=m.t==='p'?7:4.5;
      ctx.beginPath(); ctx.arc(q.x,q.y,rad+4,0,7); ctx.fillStyle='#fff'; ctx.fill();
      ctx.beginPath(); ctx.arc(q.x,q.y,rad,0,7); ctx.fillStyle=m.c; ctx.fill();
      ctx.font=(m.t==='p'?'700 ':'600 ')+(m.t==='p'?13:11)+"px 'Segoe UI',system-ui,sans-serif";
      ctx.fillStyle=m.t==='p'?NAVY:'#54617A';
      var ly=q.y + (q.y<cy? -rad-11 : rad+13);
      // keep the whole label inside the canvas horizontally (no edge clipping)
      var lw=ctx.measureText(m.l).width, lx=Math.max(lw/2+3, Math.min(W-lw/2-3, q.x));
      // white halo for legibility
      ctx.lineWidth=3; ctx.strokeStyle='rgba(255,255,255,.9)'; ctx.strokeText(m.l,lx,ly);
      ctx.fillText(m.l,lx,ly);
    }
  }
  var raf; function loop(tt){ draw(tt||0); raf=requestAnimationFrame(loop); }
  if(reduce){ draw(0); } else { loop(0); }
})();

  // lightbox
  (function(){var lb=document.getElementById('lb');if(!lb)return;var im=lb.querySelector('img'),cp=lb.querySelector('.lbcap');
    document.querySelectorAll('.shot,.pframe').forEach(function(el){el.addEventListener('click',function(){var g=el.querySelector('img');if(!g)return;im.src=g.src;var c=el.querySelector('.cap');cp.textContent=c?c.textContent:'';lb.classList.add('open');});});
    lb.addEventListener('click',function(){lb.classList.remove('open');});
  })();
  // scroll reveal
  (function(){var els=document.querySelectorAll('.reveal');if(!('IntersectionObserver'in window)){els.forEach(function(e){e.classList.add('in')});return;}
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
