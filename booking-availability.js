// HStudio customer date availability indicators.
// Runs after app.js and replaces only the date-picker renderer.
(function(){
  const dateKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const availabilityClass=count=>count===0?'none':count<=3?'limited':'plenty';
  const availabilityLabel=count=>count===0?'No availability':count<=3?'Limited':'Plenty available';

  async function slotsForDate(d){
    const {data,error}=await sb.rpc('get_available_slots',{
      p_service_id:B.service.id,
      p_date:dateKey(d),
      p_barber_id:B.barber.id
    });
    if(error) throw error;
    return data||[];
  }

  window.chooseDate=async function(){
    B.step=2;
    const ds=nextDates();
    setPanel(`<span class="eyebrow">Step 3 of 5</span><h2>Pick a date</h2><div class="date-availability-key"><span class="key-plenty">Plenty</span><span class="key-limited">Limited</span><span class="key-none">None</span></div><div class="date-strip">${ds.map((d,i)=>`<button class="datebtn availability-loading" data-date-index="${i}"><small>${d.toLocaleDateString('en-GB',{weekday:'short'})}</small><br><b>${d.getDate()}</b><br><small>${d.toLocaleDateString('en-GB',{month:'short'})}</small><span class="availability-text">Checking…</span></button>`).join('')}</div><div id="slots"></div>`);

    const buttons=[...document.querySelectorAll('.datebtn')];
    buttons.forEach((button,i)=>button.onclick=()=>{
      if(button.classList.contains('availability-none')) return;
      buttons.forEach(x=>x.classList.remove('selected'));
      button.classList.add('selected');
      B.date=dateKey(ds[i]);
      loadSlots();
    });

    // Check each visible day against the same live RPC used for the actual booking slots.
    await Promise.all(ds.map(async(d,i)=>{
      const button=buttons[i];
      try{
        const slots=await slotsForDate(d),count=slots.length,kind=availabilityClass(count);
        button.classList.remove('availability-loading');
        button.classList.add(`availability-${kind}`);
        const label=button.querySelector('.availability-text');
        if(label) label.textContent=availabilityLabel(count);
        if(count===0){button.disabled=true;button.setAttribute('aria-disabled','true')}
        button.title=count===0?'No times available for this service':`${count} appointment time${count===1?'':'s'} available`;
      }catch(e){
        button.classList.remove('availability-loading');
        const label=button.querySelector('.availability-text');
        if(label) label.textContent='Check date';
      }
    }));
  };
})();