export {};
type TourScreen={src:string;alt:string;description:string};
const tours:Record<string,TourScreen[]>={
 customer:[
  {src:'/images/customer.png',alt:'ZAYA customer app: browse shops in a chosen area. Seeded demo data.',description:'Start with the shops in your chosen area.'},
  {src:'/images/compare.png',alt:'ZAYA customer app: compare product prices across shops. Seeded demo data.',description:'Compare products and prices before deciding where to shop.'}
 ],
 merchant:[
  {src:'/images/merchant.png',alt:'ZAYA merchant app: daily dashboard. Seeded demo data.',description:'See your shop’s daily activity in one place.'},
  {src:'/images/credit.png',alt:'ZAYA merchant app: customer credit ledger. Seeded demo data.',description:'Keep a clear record of customer credit and repayments.'}
 ]
};
document.querySelectorAll<HTMLElement>('[data-tour]').forEach(tour=>{
 const id=tour.dataset.tour!;
 const img=document.querySelector<HTMLImageElement>(`#screen-${id}`)!;
 tour.querySelectorAll<HTMLButtonElement>('[data-screen]').forEach(button=>button.addEventListener('click',()=>{
  const screen=tours[id][Number(button.dataset.screen)];
  img.src=screen.src;img.alt=screen.alt;
  tour.querySelector('.tour-description')!.textContent=screen.description;
  tour.querySelectorAll('[data-screen]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 }));
});
const dialog=document.querySelector<HTMLDialogElement>('#screen-dialog')!;
let opener:HTMLButtonElement|null=null;
document.querySelectorAll<HTMLButtonElement>('[data-enlarge]').forEach(button=>button.addEventListener('click',()=>{
 opener=button;
 const image=document.querySelector<HTMLImageElement>(`#screen-${button.dataset.enlarge}`)!;
 const enlarged=document.querySelector<HTMLImageElement>('#dialog-screen')!;
 enlarged.src=image.src;enlarged.alt=image.alt;
 if(typeof dialog.showModal==='function'){
  dialog.showModal();
  document.body.classList.add('dialog-open');
  dialog.querySelector<HTMLButtonElement>('.dialog-close')?.focus({preventScroll:true});
 }
 else{window.open(image.src,'_blank','noopener');}
}));
document.querySelector('.dialog-close')!.addEventListener('click',()=>dialog.close());
dialog.addEventListener('cancel',event=>{event.preventDefault();dialog.close();});
dialog.addEventListener('close',()=>{document.body.classList.remove('dialog-open');opener?.focus({preventScroll:true});});
dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
const deliveryDescriptions=[
 'The shop confirms the order and prepares it for collection.',
 'The shop’s own deliverer collects the order and takes it to the customer.',
 'The delivery outcome is recorded and cash collection is settled against the order.'
];
const deliverySteps=[...document.querySelectorAll<HTMLButtonElement>('[data-delivery]')];
const showDeliveryStep=(step:number)=>{
 document.querySelector<HTMLElement>('.ride-visual')!.dataset.stage=String(step);
 document.querySelector('.delivery-description')!.textContent=deliveryDescriptions[step];
 deliverySteps.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===step)));
};
// "Play the journey" walks the three steps in order; any manual step choice stops it.
const journeyButton=document.querySelector<HTMLButtonElement>('[data-delivery-play]');
const journeyLabel=journeyButton?.querySelector('span');
let journeyTimer=0;
const stopJourney=(label='Replay the journey')=>{
 window.clearTimeout(journeyTimer);journeyTimer=0;
 if(journeyLabel)journeyLabel.textContent=label;
 journeyButton?.removeAttribute('data-playing');
};
const playJourney=(step=0)=>{
 showDeliveryStep(step);
 if(step>=deliverySteps.length-1){stopJourney();return;}
 journeyTimer=window.setTimeout(()=>playJourney(step+1),2200);
};
deliverySteps.forEach((button,step)=>button.addEventListener('click',()=>{
 if(journeyTimer)stopJourney('Play the journey');
 showDeliveryStep(step);
}));
if(journeyButton){
 journeyButton.hidden=false;
 journeyButton.addEventListener('click',()=>{
  if(journeyTimer){stopJourney('Play the journey');return;}
  journeyButton.setAttribute('data-playing','');
  if(journeyLabel)journeyLabel.textContent='Stop the journey';
  playJourney(0);
 });
}
