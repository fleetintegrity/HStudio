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
    if(effectiveStatus==='paid'&&!tender){const msg=document.querySelector('#apptMsg');if(msg)msg.textContent='Choose how the customer paid (cash, card, online or other).';return false}
    const {error}=await sb.from('bookings').update({tender_method:effectiveStatus==='paid'?tender:null}).eq('id',id);
    if(error){const msg=document.querySelector('#apptMsg');if(msg)msg.textContent=error.message;return false}
    return originalSave(id,complete);
  };
}
const reportRows=async()=>{
  const from=document.querySelector('#reportFrom')?.value,to=document.querySelector('#reportTo')?.value,scope=document.querySelector('#reportScope')?.value;
  if(!from||!to)return[];
  const end=new Date(to+'T12:00:00');end.setDate(end.getDate()+1);
  let q=sb.from('bookings').select('*,services(name,price_pence),barbers(name)').gte('starts_at',new Date(from+'T00:00:00').toISOString()).lt('starts_at',new Date(end.toLocaleDateString('en-CA')+'T00:00:00').toISOString()).order('starts_at');
  if(scope&&scope!=='all')q=q.eq('barber_id',scope);
  const {data,error}=await q;if(error)throw error;return data||[];
};
const addTenderSummary=async()=>{
  if(!document.querySelector('#accountantReportBody')||document.querySelector('#tenderSummary'))return;
  try{const rows=await reportRows(),paid=rows.filter(x=>x.status==='completed'&&x.payment_status==='paid'),sum=t=>paid.filter(x=>x.tender_method===t).reduce((n,x)=>n+(x.actual_amount_pence??x.services?.price_pence??0),0),unrecorded=paid.filter(x=>!x.tender_method).reduce((n,x)=>n+(x.actual_amount_pence??x.services?.price_pence??0),0),section=document.createElement('section');section.id='tenderSummary';section.className='dash-section';section.innerHTML=`<div class="section-head"><div><span class="eyebrow">Payment reconciliation</span><h2>Takings by payment type</h2></div></div><div class="stats owner-stats"><div class="stat"><small>Cash</small><b>${money(sum('cash'))}</b><span>recorded cash takings</span></div><div class="stat"><small>Card</small><b>${money(sum('card'))}</b><span>recorded card takings</span></div><div class="stat"><small>Online</small><b>${money(sum('online'))}</b><span>online takings</span></div><div class="stat"><small>Not recorded</small><b>${money(unrecorded)}</b><span>paid but tender missing</span></div></div>`;document.querySelector('#accountantReportBody').prepend(section)}catch(e){}
};
new MutationObserver(()=>{if(document.querySelector('#accountantReportBody'))setTimeout(addTenderSummary,50)}).observe(document.body,{childList:true,subtree:true});
window.downloadAccountantCSV=async function(){
  try{const rows=await reportRows();if(!rows.length)return alert('There are no bookings in this report to export.');const cell=v=>'"'+String(v??'').replace(/"/g,'""')+'"',date=x=>new Date(x).toLocaleDateString('en-GB',{timeZone:'Europe/London'}),time=x=>new Date(x).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/London'}),pence=x=>x.actual_amount_pence??x.services?.price_pence??0,head=['Booking ID','Date','Time','Barber','Customer','Service','Status','Payment status','Paid by','Booking payment method','Standard price GBP','Actual amount GBP','Adjustment GBP','Payment note','Completed at'],body=rows.map(x=>[x.id,date(x.starts_at),time(x.starts_at),x.barbers?.name||'',x.guest_name||'Account customer',x.services?.name||'',x.status,x.payment_status,x.tender_method||'',x.payment_method||'',((x.services?.price_pence||0)/100).toFixed(2),(pence(x)/100).toFixed(2),((pence(x)-(x.services?.price_pence||0))/100).toFixed(2),x.payment_note||'',x.completed_at?new Date(x.completed_at).toISOString():'']),csv=[head,...body].map(r=>r.map(cell).join(',')).join('\r\n'),blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=`HStudio-accountant-report-${document.querySelector('#reportFrom').value}-to-${document.querySelector('#reportTo').value}.csv`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(u)}catch(e){alert(e.message)}
};
})();