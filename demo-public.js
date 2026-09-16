(()=>{
  // The original HStudio build skipped Mondays because its owner did not work Mondays.
  // The generic demo must derive bookable days from live barber availability instead.
  window.nextDates=function(){
    const out=[],today=new Date();
    for(let i=0;out.length<28&&i<45;i++){
      const d=new Date(today); d.setDate(today.getDate()+i);
      if(d.getDay()!==0) out.push(d);
    }
    return out;
  };
  const replaceBrand=()=>{
    document.querySelectorAll('body *').forEach(el=>{
      if(el.children.length===0 && /HStudio/i.test(el.textContent||'')) el.textContent=(el.textContent||'').replace(/HStudio/gi,'North & Co.');
    });
  };
  document.addEventListener('DOMContentLoaded',replaceBrand);
  new MutationObserver(replaceBrand).observe(document.documentElement,{childList:true,subtree:true});
})();