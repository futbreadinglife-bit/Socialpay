# SocialPay Web App v5.0 — Complete Deployment Guide

## 🆕 What's New in v5.0
- ✅ **SQLite Database** — replaces all JSON files. Handles 100,000+ users easily
- ✅ **Auto-delete submissions** after admin approval (DB stays clean forever)
- ✅ **Admin can manually delete** any submission record (pending/approved/rejected)
- ✅ **Delete User** — Super Admin can delete user + all their data permanently
- ✅ **PalmPay-style green design** — beautiful, modern mobile UI
- ✅ All features from v4 preserved + improved

---

## 📁 FOLDER STRUCTURE

```
socialpay_v5/
├── app.py                    ← Main backend (Flask + SQLite)
├── Procfile                  ← Railway startup command
├── requirements.txt          ← Python packages
├── static/
│   ├── css/style.css         ← PalmPay-style green design
│   ├── js/app.js             ← Client-side JavaScript
│   ├── icons/                ← PWA icons
│   ├── manifest.json         ← PWA manifest
│   └── sw.js                 ← Service Worker
└── templates/
    ├── login.html
    ├── dashboard.html
    ├── tasks.html
    ├── balance.html
    ├── profile.html
    ├── referrals.html
    ├── notifications.html
    ├── my_submissions.html
    ├── support.html
    └── admin/
        ├── dashboard.html
        ├── users.html
        ├── user_detail.html
        ├── tasks.html
        ├── submissions.html   ← Has Delete button
        ├── withdrawals.html
        ├── broadcast.html
        ├── settings.html
        ├── logs.html
        ├── transfers.html
        └── support.html
```

---

## 🚀 HOW TO DEPLOY ON RAILWAY

### Step 1 — Upload files
Upload everything exactly as shown above.

### Step 2 — Push to GitHub
```bash
git init
git add .
git commit -m "SocialPay v5.0 SQLite"
git push origin main
```

### Step 3 — Connect to Railway
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo
3. Select your repo → Railway auto-detects Python

### Step 4 — Done ✅
Railway reads `Procfile` and runs:
```
gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --timeout 120
```

---

## 👑 ADMIN LOGIN

| Field    | Value                          |
|----------|-------------------------------|
| Email    | socialpay.app.ng@gmail.com    |
| Password | @ Ahmerdee4622                |

> Admin account is **created automatically** on first startup.

---

## 🗄️ DATABASE (SQLite)

The database `data/socialpay.db` is created automatically.

**Tables:**
| Table | Contents |
|-------|----------|
| users | All user accounts |
| wallets | Balances (Naira + Dollar) |
| tasks | Available tasks |
| submissions | Task proofs (auto-deleted after approval) |
| withdrawals | Withdrawal requests |
| transfers | P2P transfer records |
| transactions | Full transaction log |
| referrals | Referral relationships (L1 + L2) |
| notifications | User notifications |
| bank_details | Saved bank/wallet info |
| pins | Transfer PINs (hashed) |
| settings | App configuration |
| audit_logs | Admin action trail |
| support_tickets | Support tickets |
| daily_logins | Login streak tracking |
| spins | Spin & Win records |

### Capacity
| Users | Status |
|-------|--------|
| 1 — 5,000 | ✅ Perfect |
| 5,000 — 50,000 | ✅ Excellent |
| 50,000 — 200,000 | ✅ Works well |
| 200,000+ | ⚠️ Consider PostgreSQL |

---

## ✨ ALL FEATURES

### User Features
| Feature | Description |
|---------|-------------|
| Register / Login | Direct (no OTP) |
| Dashboard | Balance, stats, quick actions |
| Tasks | Browse & submit tasks |
| Screenshot Upload | Upload image proof |
| Wallet | Naira + Dollar balance |
| Withdraw | Full bank/crypto dropdown |
| Transfer | Send money via ID + PIN |
| Exchange | Convert Naira ↔ Dollar |
| Referrals | L1 + L2 referral system |
| Notifications | Real-time in-app alerts |
| Daily Login Reward | Auto-credited on login |
| Spin & Win 🎰 | Cost-based spinning |
| Support Tickets | Submit & track tickets |
| PWA | Installable on mobile |
| 3 Languages | English, Arabic, Hausa |

### Admin Features
| Feature | Description |
|---------|-------------|
| Dashboard | Full stats overview |
| User Management | View, ban, adjust balance |
| **Delete User** | Permanently remove user + all data |
| Task Management | Create/delete tasks |
| **Submissions** | Approve/Reject + **Delete any record** |
| **Auto-delete** | Submissions deleted after approval automatically |
| Withdrawals | Approve/reject |
| Broadcast | Send to all users |
| Settings | All app settings |
| Audit Logs | Full action history |
| Transfers | View & reverse P2P |
| Support | Reply to tickets |

---

## ⚙️ DEFAULT SETTINGS

| Setting | Default |
|---------|---------|
| Referral Bonus L1 | ₦30 |
| Referral Bonus L2 | ₦15 |
| Tasks for referral bonus | 10 |
| Withdrawal Fee | 5% |
| Min Withdrawal | ₦500 |
| Max Withdrawal | ₦100,000 |
| Exchange Rate | $1 = ₦1,500 |
| Sign-up Bonus | ₦50 |
| Daily Login Reward | ₦10 |
| Spin Cost | ₦50 |

---

## 🌍 LANGUAGE SUPPORT
- 🇬🇧 English
- 🇸🇦 Arabic (RTL)
- 🇳🇬 Hausa

---

## ✅ TESTED ON
- Railway (Python 3.12, Gunicorn)
- Pydroid3 (Android local dev)
- Chrome, Firefox, Safari mobile

---

*SocialPay v5.0 — Flask + SQLite + PalmPay Design*

---

## v6.0 Security Changes

### What Changed
- **Password hashing**: upgraded to `werkzeug`'s `pbkdf2:sha256` (260,000 iterations). Existing v5 passwords still work — no forced reset required.
- **Secret key**: now randomized per-process in dev. **Set `SECRET_KEY` env var in production.**
- **Admin password**: read from `ADMIN_PASSWORD` env var (falls back to default if not set).
- **Session lifetime**: reduced from 10 years → 30 days.
- **SESSION_COOKIE_SECURE**: enabled automatically when `FLASK_ENV=production`.
- **CSRF token**: generated per-session and available as `{{ csrf_token() }}` in all templates. Use `X-CSRF-Token` header or `_csrf_token` form field.
- **Error handlers**: added 400, 403, 404, 429 handlers.

### Production Deployment Checklist
```bash
export SECRET_KEY="your-random-64-char-hex-here"
export ADMIN_EMAIL="your-admin@email.com"
export ADMIN_PASSWORD="your-strong-password"
export FLASK_ENV="production"
```
