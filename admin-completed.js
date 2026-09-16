(()=>{
  const stampCard=card=>{
    if(!card||card.nodeType!==1)return;
    const status=card.querySelector('.status-dot');
    if(!status||status.textContent.trim().toLowerCase()!=='completed')return;
    card.classList.add('is-completed');
    status.className='completed-stamp';
    status.setAttribute('aria-label','Appointment completed');
    status.textContent='✓ COMPLETED';
  };
  const scan=root=>{
    if(root?.matches?.('.appointment'))stampCard(root);
    root?.querySelectorAll?.('.appointment').forEach(stampCard);
  };
  const run=()=>scan(document);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>scan(n)))).observe(document.documentElement,{childList:true,subtree:true});
  setInterval(run,500);
})();