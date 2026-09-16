(()=>{
const originalSave=window.saveAppointmentPayment;
const addTenderControl=()=>{
  const modal=document.querySelector('#apptModal');
  if(!modal||modal.querySelector('#tenderMethod'))return;
  const box=modal.querySelector('.payment-box');
  if(!box)return;
  const id=(modal.querySelector('.modal-actions .btn')?.getAttribute('onclick')||'').match(/'([^']+)'/)?.[1];
  if(!id)return;
  const label=document.createElement('label');
  label.innerHTML='Paid by<select id="tenderMethod"><option value="">Not recorded</option><option value="cash">Cash</option><option value="card">Card</option><option value="online">Online</option><option value="other">Other</option></select>';
  box.appendChild(label);
  sb.from('bookings').select('tender_method').eq('id',id).single().then(({data})=>{const s=document.querySelector('#tenderMethod');if(s&&data?.tender_method)s.value=data.tender_method});
};
new MutationObserver(addTenderControl).observe(document.body,{childList:true,subtree:true});
if(typeof originalSave==='function'){
  window.saveAppointmentPayment=async function(id,complete=false){
    const tender=document.querySelector('#tenderMethod')?.value||null;
    const status=document.querySelector('#payStatus')?.value;
    const effectiveStatus=complete&&status==='unpaid'?'paid':status;
    if(effectiveStatus==='paid'&&!tender){
      const msg=document.querySelector('#apptMsg');
      if(msg)msg.textContent='Choose how the customer paid (cash, card, online or other).';
      return false;
    }
    const {error}=await sb.from('bookings').update({tender_method:effectiveStatus==='paid'?tender:null}).eq('id',id);
    if(error){const msg=document.querySelector('#apptMsg');if(msg)msg.textContent=error.message;return false}
    return originalSave(id,complete);
  };
}
})();