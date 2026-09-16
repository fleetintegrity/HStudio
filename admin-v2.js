let ADMIN_DATE=new Date().toLocaleDateString('en-CA',{timeZone:'Europe/London'});
const isOwner=me=>me.role==='owner'||me.role==='admin';
const londonDay=d=>new Date(d+'T12:00:00').getDay();
const dayBounds=d=>({a:new Date(d+'T00:00:00').toISOString(),z:new Date(d+'T23:59:59').toISOString()});
const hm=x=>new Date(x).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/London'});
const longDate=d=>new Date(d+'T12:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});

async function renderDiary(me){
 const el=document.querySelector('#admin'),{a,z}=dayBounds(ADMIN_DATE);
 let q=sb.from('bookings').select('*,services(name,price_pence,duration_minutes),barbers(name)').gte('starts_at',a).lte('starts_at',z).order('starts_at');
 const {data,error}=await q;if(error){el.innerHTML=`<p class="error">${esc(error.message)}</p>`;return}
 const booked=(data||[]).filter(x=>x.status==='confirmed');
 const barberList=isOwner(me)?await barbers():[me.barbers];
 let hoursQ=sb.from('working_hours').select('*').eq('weekday',londonDay(ADMIN_DATE));
 let blocksQ=sb.from('time_blocks').select('*').lt('starts_at',z).gt('ends_at',a);
 const [hoursRes,blocksRes]=await Promise.all([hoursQ,blocksQ]);
 const free=[];
 for(const b of barberList){
   const wh=(hoursRes.data||[]).find(x=>x.barber_id===b.id&&!x.is_closed);if(!wh)continue;
   const occupied=[...booked.filter(x=>x.barber_id===b.id).map(x=>[new Date(x.starts_at),new Date(x.ends_at)]),...(blocksRes.data||[]).filter(x=>!x.barber_id||x.barber_id===b.id).map(x=>[new Date(x.starts_at),new Date(x.ends_at)])].sort((x,y)=>x[0]-y[0]);
   let cursor=new Date(`${ADMIN_DATE}T${wh.start_time}+01:00`),end=new Date(`${ADMIN_DATE}T${wh.end_time}+01:00`);
   for(const [s,e] of occupied){if(s>cursor&&s-cursor>=15*60000)free.push({barber:b.name,start:new Date(cursor),end:new Date(Math.min(s,end))});if(e>cursor)cursor=e;if(cursor>=end)break}
   if(cursor<end&&end-cursor>=15*60000)free.push({barber:b.name,start:cursor,end});
 }
 const revenue=booked.reduce((n,x)=>n+(x.services?.price_pence||0),0);
 el.innerHTML=`<div class="admin-hero"><div><span class="eyebrow">${isOwner(me)?'Shop dashboard':'My dashboard'}</span><h1>${esc(me.barbers?.name||'HStudio')}'s diary</h1><p>${longDate(ADMIN_DATE)}</p></div><div class="date-control"><button class="date-arrow" id="prevDay">‹</button><input id="diaryDate" type="date" value="${ADMIN_DATE}"><button class="date-arrow" id="nextDay">›</button><button class="btn ghost" id="todayDay">Today</button></div></div>
 <div class="stats"><div class="stat"><small>Appointments</small><b>${booked.length}</b><span>confirmed</span></div><div class="stat"><small>Booked value</small><b>${money(revenue)}</b><span>for this day</span></div><div class="stat"><small>Free windows</small><b>${free.length}</b><span>15+ minutes</span></div></div>
 <section class="dash-section"><div class="section-head"><div><span class="eyebrow">Schedule</span><h2>Day diary</h2></div><span class="pill">Time order</span></div><div class="appointment-list">${booked.length?booked.map(x=>`<article class="appointment"><div class="appt-time">${hm(x.starts_at)}<small>${hm(x.ends_at)}</small></div><div class="appt-main"><b>${esc(x.guest_name||'Account customer')}</b><span>${esc(x.services?.name||'Service')} · ${esc(x.barbers?.name||'')}</span><small>${esc(x.guest_phone||'')}</small></div><span class="status-dot">Booked</span></article>`).join(''):'<div class="empty-state"><b>No bookings yet</b><span>This day is completely clear.</span></div>'}</div></section>
 <section class="dash-section"><div class="section-head"><div><span class="eyebrow">Availability</span><h2>Free slots</h2></div><span class="pill">Live gaps</span></div><div class="free-grid">${free.length?free.map(x=>`<div class="free-slot"><b>${hm(x.start)} – ${hm(x.end)}</b><span>${esc(x.barber)}</span></div>`).join(''):'<div class="empty-state"><b>No free windows</b><span>Fully booked or unavailable.</span></div>'}</div></section>`;
 document.querySelector('#diaryDate').onchange=e=>{ADMIN_DATE=e.target.value;renderDiary(me)};
 document.querySelector('#prevDay').onclick=()=>shiftDiary(-1,me);document.querySelector('#nextDay').onclick=()=>shiftDiary(1,me);
 document.querySelector('#todayDay').onclick=()=>{ADMIN_DATE=new Date().toLocaleDateString('en-CA',{timeZone:'Europe/London'});renderDiary(me)};
}
function shiftDiary(n,me){let d=new Date(ADMIN_DATE+'T12:00:00');d.setDate(d.getDate()+n);ADMIN_DATE=d.toLocaleDateString('en-CA');renderDiary(me)}

const legacyAdminView=adminView;
adminView=async function(v,me){if(v==='diary')return renderDiary(me);return legacyAdminView(v,me)};
