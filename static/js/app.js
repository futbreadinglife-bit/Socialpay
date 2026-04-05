// SocialPay V2 — app.js

// ===== TOAST =====
function showToast(msg, type = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  let c = document.getElementById('toast-container');
  if (!c) {
    c = document.createElement('div');
    c.id = 'toast-container';
    c.className = 'toast-container';
    document.body.appendChild(c);
  }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span class="toast-icon">${icons[type]||'•'}</span><span style="flex:1">${msg}</span><button class="toast-close" onclick="this.parentElement.remove()">✕</button>`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3400);
}

// ===== MODAL =====
function openModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('active'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('active'); document.body.style.overflow = ''; }
}
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// ===== AJAX POST =====
async function postForm(url, fd, btn) {
  const orig = btn ? btn.innerHTML : '';
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Loading...'; }
  try {
    const res = await fetch(url, { method: 'POST', body: fd });
    const data = await res.json();
    if (data.success) {
      if (data.message) showToast(data.message, 'success');
      if (data.redirect) setTimeout(() => location.href = data.redirect, 600);
    } else {
      showToast(data.message || 'Error occurred', 'error');
    }
    return data;
  } catch (e) {
    showToast('Network error. Check your connection.', 'error');
    return null;
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = orig; }
  }
}

// ===== BALANCE TOGGLE =====
let balHidden = false;
function toggleBalance() {
  balHidden = !balHidden;
  document.querySelectorAll('.balance-amount, .chip-value').forEach(el => {
    el.style.filter = balHidden ? 'blur(10px)' : 'none';
  });
  const eb = document.getElementById('eyeBtn');
  if (eb) eb.innerHTML = balHidden ? '🙈' : '👁️';
  localStorage.setItem('sp_bal_hidden', balHidden ? '1' : '0');
}

// ===== COPY =====
function copyText(text, msg) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => showToast(msg || 'Copied!', 'success'));
  } else {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta);
    ta.select(); document.execCommand('copy');
    document.body.removeChild(ta);
    showToast(msg || 'Copied!', 'success');
  }
}

// ===== OTP BOXES =====
function initOtpBoxes() {
  const boxes = document.querySelectorAll('.otp-input');
  boxes.forEach((box, i) => {
    box.addEventListener('input', e => {
      const val = e.target.value.replace(/\D/g, '');
      e.target.value = val.slice(-1);
      if (val) {
        e.target.classList.add('filled');
        if (i < boxes.length - 1) boxes[i + 1].focus();
      } else {
        e.target.classList.remove('filled');
      }
      collectOtp();
    });
    box.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !box.value && i > 0) {
        boxes[i-1].classList.remove('filled');
        boxes[i-1].focus();
      }
    });
    box.addEventListener('paste', e => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g,'');
      boxes.forEach((b, j) => {
        b.value = pasted[j] || '';
        if (b.value) b.classList.add('filled');
        else b.classList.remove('filled');
      });
      collectOtp();
      boxes[Math.min(pasted.length, boxes.length - 1)].focus();
    });
  });
}

function collectOtp() {
  const boxes = document.querySelectorAll('.otp-input');
  const otp = Array.from(boxes).map(b => b.value).join('');
  const hidden = document.getElementById('otp-hidden');
  if (hidden) hidden.value = otp;
  if (otp.length === 6) {
    setTimeout(() => document.getElementById('otp-form-btn')?.click(), 100);
  }
}

// ===== USER LOOKUP =====
async function lookupUser(uid, targetId) {
  const el = document.getElementById(targetId);
  if (!uid || uid.length < 5) { if (el) el.textContent = ''; return; }
  try {
    const res = await fetch('/api/user_lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: uid })
    });
    const data = await res.json();
    if (el) {
      if (data.found) {
        el.innerHTML = `<span style="color:var(--green);font-weight:700">✅ ${data.name}</span>`;
      } else {
        el.innerHTML = `<span style="color:var(--red);font-weight:700">❌ User not found</span>`;
      }
    }
  } catch {}
}

// ===== NOTIF BADGE =====
async function updateNotifBadge() {
  try {
    const res = await fetch('/api/notif_count');
    const data = await res.json();
    const badges = document.querySelectorAll('.notif-badge-count');
    badges.forEach(el => {
      if (data.count > 0) {
        el.textContent = data.count > 9 ? '9+' : data.count;
        el.style.display = 'flex';
      } else {
        el.style.display = 'none';
      }
    });
    const legacyBadge = document.getElementById('notif-badge');
    if (legacyBadge) {
      if (data.count > 0) {
        legacyBadge.textContent = data.count > 9 ? '9+' : data.count;
        legacyBadge.style.display = 'flex';
      } else {
        legacyBadge.style.display = 'none';
      }
    }
  } catch {}
}

if (document.querySelector('.notif-badge-count, #notif-badge')) {
  updateNotifBadge();
  setInterval(updateNotifBadge, 30000);
}

// ===== ACTIVE NAV =====
document.addEventListener('DOMContentLoaded', () => {
  const path = location.pathname;
  document.querySelectorAll('.nav-item').forEach(item => {
    const href = item.getAttribute('href');
    if (href && path === href) item.classList.add('active');
    else if (href && href !== '/' && path.startsWith(href)) item.classList.add('active');
  });
  initOtpBoxes();

  // Restore balance visibility
  if (localStorage.getItem('sp_bal_hidden') === '1') {
    balHidden = false;
    toggleBalance();
  }

  // Animate stats counters
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const isFloat = el.dataset.float === '1';
    let start = 0;
    const duration = 800;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = target * ease;
      el.textContent = prefix + (isFloat ? current.toFixed(2) : Math.floor(current).toLocaleString()) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });

  // Page load animation
  const loader = document.getElementById('pageLoader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 800);
    setTimeout(() => loader.remove(), 1200);
  }
});

// ===== TIMER =====
function startResendTimer(btnId, seconds = 60) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  let left = seconds;
  btn.disabled = true;
  const iv = setInterval(() => {
    left--;
    btn.textContent = `Resend (${left}s)`;
    if (left <= 0) {
      clearInterval(iv);
      btn.disabled = false;
      btn.textContent = btn.dataset.label || 'Resend OTP';
    }
  }, 1000);
}

// ===== PASSWORD TOGGLE =====
function togglePw(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  if (inp.type === 'password') { inp.type = 'text'; btn.textContent = '🙈'; }
  else { inp.type = 'password'; btn.textContent = '👁️'; }
}

// ===== FORMAT MONEY =====
function fmtMoney(n, curr = 'naira') {
  const num = parseFloat(n);
  if (curr === 'dollar') return `$${num.toFixed(4)}`;
  return `₦${num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ===== HAPTIC FEEDBACK (if supported) =====
function haptic(type = 'light') {
  if ('vibrate' in navigator) {
    if (type === 'light') navigator.vibrate(30);
    else if (type === 'medium') navigator.vibrate(60);
    else if (type === 'heavy') navigator.vibrate([60, 30, 60]);
  }
}

// ===== PULL TO REFRESH =====
let touchStartY = 0;
document.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, { passive: true });
document.addEventListener('touchend', e => {
  const diff = e.changedTouches[0].clientY - touchStartY;
  if (diff > 100 && window.scrollY === 0) {
    // User pulled down at top — show refresh indicator
    const indicator = document.createElement('div');
    indicator.style.cssText = 'position:fixed;top:60px;left:50%;transform:translateX(-50%);background:white;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,.15);z-index:9000;animation:spin .5s linear infinite';
    indicator.innerHTML = '<span class="spinner spinner-dark"></span>';
    document.body.appendChild(indicator);
    setTimeout(() => { indicator.remove(); location.reload(); }, 600);
  }
}, { passive: true });

// ===== CLOSE ANNOUNCE BANNER =====
function closeBanner() {
  document.getElementById('announceWrap')?.remove();
  document.getElementById('bannerSpacer')?.remove();
  sessionStorage.setItem('sp_bc', '1');
}
if (sessionStorage.getItem('sp_bc')) {
  document.getElementById('announceWrap')?.remove();
  document.getElementById('bannerSpacer')?.remove();
}

// ===== V2: Daily Login Reward =====
async function claimDailyReward() {
  const btn = document.getElementById('dailyRewardBtn');
  const fd = new FormData();
  const r = await postForm('/claim_daily', fd, btn);
  if (r?.success) {
    document.getElementById('dailyRewardModal') && closeModal('dailyRewardModal');
    setTimeout(() => location.reload(), 1200);
  }
}

// ===== V2: Spin Wheel =====
let spinRunning = false;
async function spinWheel() {
  if (spinRunning) return;
  spinRunning = true;
  const btn = document.getElementById('spinBtn');
  if (btn) btn.disabled = true;
  const wheel = document.getElementById('spinWheel');
  if (wheel) {
    const deg = 720 + Math.floor(Math.random() * 360);
    wheel.style.transition = 'transform 3s cubic-bezier(0.17,0.67,0.12,0.99)';
    wheel.style.transform = `rotate(${deg}deg)`;
  }
  await new Promise(r => setTimeout(r, 3200));
  const fd = new FormData();
  const res = await postForm('/spin_reward', fd, null);
  if (res?.success) setTimeout(() => location.reload(), 1500);
  if (btn) btn.disabled = false;
  spinRunning = false;
}
