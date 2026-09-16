(()=>{
  // Completed appointments must continue to occupy their original diary time.
  const baseFreeFor=freeFor;
  freeFor=function(date,b,booked,hours,blocks){
    const protectedBookings=(booked||[]).map(x=>x.status==='completed'?{...x,status:'confirmed'}:x);
    return baseFreeFor(date,b,protectedBookings,hours,blocks);
  };

  function mins(text){
    const m=String(text||'').match(/(\d{1,2}):(\d{2})/);
    return m?(Number(m[1])*60+Number(m[2])):null;
  }
  function markShortSlots(){
    document.querySelectorAll('.free-grid').forEach(grid=>{
      const slots=[...grid.querySelectorAll('.free-slot')];
      const times=slots.map(s=>mins(s.querySelector('b')?.textContent));
      slots.forEach((slot,i)=>{
        const t=times[i],next=times[i+1];
        const hasAnother15=Number.isFinite(t)&&Number.isFinite(next)&&next-t===15;
        slot.classList.toggle('free-slot-short',!hasAnother15);
        const label=slot.querySelector('span');
        if(label){
          const barber=(label.textContent||'').split(' · ')[0];
          label.textContent=!hasAnother15?`${barber} · 15 min only`:`${barber} · available start`;
        }
      });
    });
  }
  const observer=new MutationObserver(()=>requestAnimationFrame(markShortSlots));
  const root=document.querySelector('#admin');
  if(root)observer.observe(root,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',markShortSlots);
  requestAnimationFrame(markShortSlots);
})();