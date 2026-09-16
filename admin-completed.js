(()=>{
  function applyCompletedStamps(root=document){
    root.querySelectorAll?.('.appointment').forEach(card=>{
      const status=card.querySelector('.status-dot');
      if(!status || status.textContent.trim().toLowerCase()!=='completed') return;
      card.classList.add('is-completed');
      if(card.querySelector('.completed-stamp')) return;
      const stamp=document.createElement('span');
      stamp.className='completed-stamp';
      stamp.setAttribute('aria-label','Appointment completed');
      stamp.textContent='✓ COMPLETED';
      status.replaceWith(stamp);
    });
  }
  const run=()=>applyCompletedStamps(document);
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run); else run();
  new MutationObserver(mutations=>{
    for(const m of mutations){
      for(const node of m.addedNodes){
        if(node.nodeType===1){
          if(node.matches?.('.appointment')) applyCompletedStamps(node.parentElement||document);
          else applyCompletedStamps(node);
        }
      }
    }
  }).observe(document.documentElement,{childList:true,subtree:true});
})();