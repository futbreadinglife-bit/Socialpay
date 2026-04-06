// SocialPay v3.0 UPGRADED

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/static/sw.js').catch(()=>{}));
}

let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault(); deferredPrompt = e;
  const shown = sessionStorage.getItem('pwa_shown');
  if (!shown) setTimeout(() => {
    const b = document.getElementById('pwa-banner');
    if (b) { b.style.display = 'flex'; sessionStorage.setItem('pwa_shown','1'); }
  }, 4000);
});
function installPWA() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(() => { deferredPrompt = null; dismissPWA(); });
}
function dismissPWA() { const b=document.getElementById('pwa-banner'); if(b) b.style.display='none'; }

function showToast(msg, type='info') {
  const icons = {success:'✅',error:'❌',info:'ℹ️',warning:'⚠️'};
  let c = document.getElementById('toast-container');
  if (!c) { c=document.createElement('div'); c.id='toast-container'; c.className='toast-container'; document.body.appendChild(c); }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${icons[type]||'•'}</span><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; t.style.transform='translateY(20px)'; t.style.transition='all .3s'; setTimeout(()=>t.remove(),320); }, 3400);
}

function openModal(id) { const el=document.getElementById(id); if(el){el.classList.add('active');document.body.style.overflow='hidden';} }
function closeModal(id) { const el=document.getElementById(id); if(el){el.classList.remove('active');document.body.style.overflow='';} }
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) { e.target.classList.remove('active'); document.body.style.overflow=''; }
});

async function postForm(url, fd, btn) {
  const orig = btn ? btn.innerHTML : '';
  if (btn) { btn.disabled=true; btn.innerHTML='<span class="spinner"></span>'; }
  try {
    const res = await fetch(url, {method:'POST', body:fd});
    const data = await res.json();
    if (data.success) {
      if (data.message) showToast(data.message,'success');
      if (data.redirect) setTimeout(()=>location.href=data.redirect, 700);
    } else { showToast(data.message||'Error','error'); }
    return data;
  } catch(e) { showToast('Network error. Check connection.','error'); return null; }
  finally { if(btn){btn.disabled=false;btn.innerHTML=orig;} }
}

let balHidden = false;
function toggleBalance() {
  balHidden = !balHidden;
  document.querySelectorAll('.balance-amount,.chip-value').forEach(el=>el.style.filter=balHidden?'blur(10px)':'none');
  const eb = document.getElementById('eyeBtn');
  if (eb) eb.textContent = balHidden ? '🙈' : '👁️';
}

function copyText(text, msg) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(()=>showToast(msg||'Copied!','success'));
  } else {
    const ta=document.createElement('textarea'); ta.value=text; document.body.appendChild(ta);
    ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    showToast(msg||'Copied!','success');
  }
}

async function lookupUser(uid, targetId) {
  const el=document.getElementById(targetId);
  if (!uid||uid.length<5){if(el)el.textContent='';return;}
  try {
    const res=await fetch('/api/user_lookup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:uid})});
    const data=await res.json();
    if(el){el.textContent=data.found?`✅ ${data.name}`:'❌ Not found';el.style.color=data.found?'#06D6A0':'#EF233C';}
  } catch {}
}

async function updateNotifBadge() {
  try {
    const res=await fetch('/api/notif_count'); const data=await res.json();
    const el=document.getElementById('notif-badge');
    if(el){if(data.count>0){el.textContent=data.count>9?'9+':data.count;el.style.display='flex';}else{el.style.display='none';}}
  } catch {}
}
if (document.getElementById('notif-badge')) { updateNotifBadge(); setInterval(updateNotifBadge,30000); }

document.addEventListener('DOMContentLoaded', () => {
  const path = location.pathname;
  document.querySelectorAll('.nav-item').forEach(item => {
    const href = item.getAttribute('href');
    if (href&&path===href) item.classList.add('active');
    else if (href&&href!=='/'&&path.startsWith(href)) item.classList.add('active');
  });
});

function togglePw(inputId, btn) {
  const inp=document.getElementById(inputId); if(!inp) return;
  if (inp.type==='password'){inp.type='text';btn.innerHTML='🙈';}
  else{inp.type='password';btn.innerHTML='👁️';}
}

function openImageFull(src) {
  let overlay=document.getElementById('img-modal-overlay');
  if (!overlay) {
    overlay=document.createElement('div'); overlay.id='img-modal-overlay'; overlay.className='img-modal-overlay';
    overlay.innerHTML=`<button class="img-modal-close" onclick="closeImageFull()">✕</button><img id="img-modal-img" src="" alt="Proof" onclick="event.stopPropagation()" style="max-width:100%;max-height:90vh;border-radius:12px">`;
    overlay.addEventListener('click',closeImageFull); document.body.appendChild(overlay);
  }
  document.getElementById('img-modal-img').src=src;
  overlay.classList.add('active'); document.body.style.overflow='hidden';
}
function closeImageFull() {
  const o=document.getElementById('img-modal-overlay'); if(o){o.classList.remove('active');document.body.style.overflow='';}
}

function openTelegram(tgUrl, webUrl) {
  const start=Date.now(); window.location.href=tgUrl;
  const timer=setTimeout(()=>{ if(Date.now()-start<2000) window.location.href=webUrl||'https://telegram.org/'; },1500);
  document.addEventListener('visibilitychange',function h(){if(document.hidden){clearTimeout(timer);document.removeEventListener('visibilitychange',h);}});
}

function closeBanner(){document.getElementById('announceWrap')?.remove();document.getElementById('bannerSpacer')?.remove();sessionStorage.setItem('sp_bc','1');}
if(sessionStorage.getItem('sp_bc')){document.getElementById('announceWrap')?.remove();document.getElementById('bannerSpacer')?.remove();}

// Spin Wheel
const SPIN_COLORS=['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD','#98D8C8','#F7DC6F'];
let spinRunning=false;
function initSpinWheel(prizes) {
  const canvas=document.getElementById('spin-canvas'); if(!canvas) return;
  const ctx=canvas.getContext('2d'); const W=canvas.width=260; const H=canvas.height=260;
  const cx=W/2,cy=H/2,r=cx-6; const n=prizes.length; const arc=(Math.PI*2)/n;
  function draw(rot) {
    ctx.clearRect(0,0,W,H);
    prizes.forEach((p,i) => {
      const s=rot+i*arc,e=s+arc;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,r,s,e); ctx.closePath();
      ctx.fillStyle=SPIN_COLORS[i%SPIN_COLORS.length]; ctx.fill();
      ctx.strokeStyle='white'; ctx.lineWidth=2; ctx.stroke();
      ctx.save(); ctx.translate(cx,cy); ctx.rotate(s+arc/2); ctx.textAlign='right';
      ctx.fillStyle='white'; ctx.font='bold 11px Nunito,Arial'; ctx.fillText(p.label,r-10,4);
      ctx.restore();
    });
    ctx.beginPath(); ctx.arc(cx,cy,28,0,Math.PI*2); ctx.fillStyle='white'; ctx.fill();
    ctx.beginPath(); ctx.arc(cx,cy,22,0,Math.PI*2); ctx.fillStyle='#0A2463'; ctx.fill();
    ctx.fillStyle='white'; ctx.font='bold 14px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('SP',cx,cy);
  }
  let rotation=0; draw(rotation);
  window._spinWheel=function(winIdx,cb) {
    if(spinRunning) return; spinRunning=true;
    const target=(Math.PI*2)-(winIdx*arc)-arc/2;
    const total=Math.PI*2*(5+Math.random()*3)+target-(rotation%(Math.PI*2));
    const duration=4200; const start=performance.now(); const sr=rotation;
    function animate(now) {
      const el=now-start; const prog=Math.min(el/duration,1);
      const ease=1-Math.pow(1-prog,4);
      rotation=sr+total*ease; draw(rotation);
      if(prog<1){requestAnimationFrame(animate);}else{spinRunning=false;if(cb)cb();}
    }
    requestAnimationFrame(animate);
  };
}
async function doSpin(prizes) {
  const btn=document.getElementById('spin-btn'); if(spinRunning) return;
  const cost = (typeof SPIN_COST !== 'undefined') ? SPIN_COST : 50;
  if(btn){btn.disabled=true;btn.innerHTML='<span class="spinner"></span> Spinning...';}
  const fd=new FormData();
  const res=await postForm('/spin',fd,null);
  if(res&&res.success!==undefined) {
    if(res.prizes && res.prizes.length>0) {
      initSpinWheel(res.prizes);
    }
    const idx=res.index!==undefined?res.index:0;
    window._spinWheel&&window._spinWheel(idx,()=>{
      setTimeout(()=>{
        if(btn){btn.disabled=false;btn.innerHTML='🎰 Spin Now!';}
        if(res.amount>0) showToast(`🎉 You won ${res.prize}! (Cost: ₦${cost.toLocaleString()})`, 'success');
        else showToast(`😔 Try Again! ₦${cost.toLocaleString()} spent.`, 'info');
        setTimeout(()=>location.reload(),2500);
      },500);
    });
  } else {
    if(btn){btn.disabled=false;btn.innerHTML='🎰 Spin Now!';}
  }
}

function toggleWdFields() {
  const c=document.getElementById('wd-curr')?.value; if(!c) return;
  document.getElementById('naira-banks').style.display=c==='naira'?'':'none';
  document.getElementById('crypto-banks').style.display=c==='dollar'?'':'none';
}
function onBankSel(){document.getElementById('bank-other-wrap').style.display=document.getElementById('wd-bank-sel')?.value==='OTHER'?'':'none';}
function onCryptoSel(){document.getElementById('crypto-other-wrap').style.display=document.getElementById('wd-crypto-sel')?.value==='OTHER'?'':'none';}
function buildBankInfo() {
  const c=document.getElementById('wd-curr')?.value;
  if(c==='naira'){
    const sel=document.getElementById('wd-bank-sel')?.value;
    const bank=sel==='OTHER'?document.getElementById('wd-bank-other')?.value.trim():sel;
    const acct=document.getElementById('wd-acct')?.value.trim();
    const nm=document.getElementById('wd-aname')?.value.trim();
    if(!bank||!acct||!nm){showToast('Fill all bank details','warning');return null;}
    return `Bank: ${bank}\nAccount: ${acct}\nName: ${nm}`;
  } else {
    const sel=document.getElementById('wd-crypto-sel')?.value;
    const w=sel==='OTHER'?document.getElementById('wd-crypto-other')?.value.trim():sel;
    const addr=document.getElementById('wd-addr')?.value.trim();
    const net=document.getElementById('wd-net')?.value;
    if(!w||!addr){showToast('Fill wallet details','warning');return null;}
    return `Wallet: ${w}\nAddress: ${addr}\nNetwork: ${net}`;
  }
}
async function doWithdraw() {
  const bi=buildBankInfo(); if(!bi) return;
  const pin=document.getElementById('wd-pin')?.value||'';
  if(!pin||pin.length!==4){showToast('Please enter your 4-digit PIN','warning');return;}
  const fd=new FormData();
  fd.append('currency',document.getElementById('wd-curr').value);
  fd.append('amount',document.getElementById('wd-amt').value);
  fd.append('bank_info',bi);
  fd.append('pin',pin);
  const r=await postForm('/withdraw',fd,document.getElementById('wd-btn'));
  if(r?.success){closeModal('withdrawModal');setTimeout(()=>location.reload(),1400);}
}
async function doTransfer() {
  const fd=new FormData();
  fd.append('receiver_id',document.getElementById('tr-recv')?.value.trim());
  fd.append('amount',document.getElementById('tr-amt')?.value);
  fd.append('pin',document.getElementById('tr-pin')?.value);
  const r=await postForm('/transfer',fd,document.getElementById('tr-btn'));
  if(r?.success){closeModal('transferModal');setTimeout(()=>location.reload(),1400);}
}
async function doExchange() {
  const fd=new FormData();
  fd.append('from_currency',document.getElementById('ex-from')?.value);
  fd.append('amount',document.getElementById('ex-amt')?.value);
  const r=await postForm('/exchange',fd,document.getElementById('ex-btn'));
  if(r?.success){
    const prev=document.getElementById('ex-preview');
    if(prev) prev.style.display='none';
    closeModal('exchangeModal');
    setTimeout(()=>location.reload(),1400);
  }
}
