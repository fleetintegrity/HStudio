// Staff appointment cancellation enhancement.
// Keeps cancelled bookings for reporting while immediately releasing the slot.
async function cancelStaffAppointment(id){
  if(!confirm('Cancel this appointment? The time slot will become available for booking again.')) return;
  const {error}=await sb.from('bookings').update({status:'cancelled'}).eq('id',id);
  if(error){ alert(error.message); return; }
  document.querySelector('#apptModal')?.remove();
  location.reload();
}

const hstudioOpenAppointment=openAppointment;
openAppointment=async function(id){
  await hstudioOpenAppointment(id);
  const modal=document.querySelector('#apptModal');
  if(!modal) return;
  const actions=modal.querySelector('.modal-actions');
  if(!actions || actions.querySelector('[data-cancel-appointment]')) return;
  const btn=document.createElement('button');
  btn.className='btn ghost';
  btn.type='button';
  btn.dataset.cancelAppointment='true';
  btn.textContent='Cancel appointment';
  btn.onclick=()=>cancelStaffAppointment(id);
  actions.appendChild(btn);
};
