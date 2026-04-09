const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Silence MemoryStore warning ──
const { emitWarning } = process;
process.emitWarning = (warning, ...args) => {
  if (typeof warning === 'string' && warning.includes('MemoryStore')) return;
  emitWarning(warning, ...args);
};
const session = require('express-session');
process.emitWarning = emitWarning;

// ── User accounts ──
const USERS = {
  'kellychristopher581@gmail.com': {
    password: 'beloyal246',
    name: 'Kelly Christopher',
    initials: 'KC',
    checking: { balance: 2200000, number: '4821' },
    savings:  { balance: 800000,  number: '7934' },
    total: 3000000,
    transactions: [
      { icon: 'dep', emoji: '💵', name: 'Salary Deposit',        detail: 'Direct Deposit',       date: 'Apr 5, 2021 · 8:02 AM',  amount: '+$5,200.00',  pos: true,  status: 'Completed' },
      { icon: 'wd',  emoji: '🛒', name: 'Grocery Purchase',       detail: 'Whole Foods Market',   date: 'Apr 4, 2021 · 3:47 PM',  amount: '−$87.45',    pos: false, status: 'Completed' },
      { icon: 'tr',  emoji: '🔄', name: 'Transfer to Savings',    detail: 'Chase ••7934',         date: 'Apr 3, 2021 · 11:15 AM', amount: '−$1,000.00', pos: false, status: 'Completed' },
      { icon: 'bl',  emoji: '⚡', name: 'Utility Bill',           detail: 'Con Edison',           date: 'Apr 2, 2021 · 9:30 AM',  amount: '−$124.30',   pos: false, status: 'Completed' },
      { icon: 'zl',  emoji: '⚡', name: 'Zelle® Payment Received',detail: 'From Marcus T.',       date: 'Apr 1, 2021 · 6:55 PM',  amount: '+$350.00',   pos: true,  status: 'Completed' },
      { icon: 'wd',  emoji: '🍽️', name: 'Restaurant',             detail: 'Nobu Restaurant NYC',  date: 'Mar 31, 2021 · 8:12 PM', amount: '−$214.60',   pos: false, status: 'Completed' },
      { icon: 'atm', emoji: '🏧', name: 'ATM Withdrawal',         detail: 'Chase ATM #04821',     date: 'Mar 30, 2021 · 1:20 PM', amount: '−$400.00',   pos: false, status: 'Completed' },
      { icon: 'dep', emoji: '💵', name: 'Wire Transfer Received', detail: 'JPMorgan',             date: 'Mar 29, 2021 · 10:05 AM',amount: '+$12,500.00', pos: true,  status: 'Completed' },
      { icon: 'bl',  emoji: '🌐', name: 'Internet & Cable Bill',  detail: 'Spectrum',             date: 'Mar 28, 2021 · 7:00 AM', amount: '−$89.99',    pos: false, status: 'Completed' },
      { icon: 'wd',  emoji: '✈️', name: 'Flight Booking',         detail: 'Delta Airlines',       date: 'Mar 27, 2021 · 2:38 PM', amount: '−$548.00',   pos: false, status: 'Completed' },
    ]
  },

  'stanleymaeschen4@gmail.com': {
    password: 'Success12',
    name: 'Stanley Maeschen',
    initials: 'SM',
    checking: { balance: 180568.96, number: '3047' },
    savings:  { balance: 70000.00,  number: '6612' },
    total: 250568.96,
    transactions: [
      { icon: 'dep', emoji: '💵', name: 'Salary Deposit',         detail: 'Direct Deposit',       date: 'Mar 31, 2026 · 8:00 AM',  amount: '+$4,800.00', pos: true,  status: 'Completed' },
      { icon: 'wd',  emoji: '🛒', name: 'Grocery Purchase',        detail: 'Walmart Supercenter',  date: 'Mar 29, 2026 · 5:22 PM',  amount: '−$63.14',   pos: false, status: 'Completed' },
      { icon: 'bl',  emoji: '⚡', name: 'Electric Bill',           detail: 'Duke Energy',          date: 'Mar 27, 2026 · 9:00 AM',  amount: '−$98.50',   pos: false, status: 'Completed' },
      { icon: 'tr',  emoji: '🔄', name: 'Transfer to Savings',     detail: 'Chase ••6612',         date: 'Mar 25, 2026 · 12:10 PM', amount: '−$500.00',  pos: false, status: 'Completed' },
      { icon: 'zl',  emoji: '⚡', name: 'Zelle® Received',         detail: 'From James W.',        date: 'Mar 22, 2026 · 3:44 PM',  amount: '+$200.00',  pos: true,  status: 'Completed' },
      { icon: 'wd',  emoji: '⛽', name: 'Gas Station',             detail: 'Shell #4412',          date: 'Mar 20, 2026 · 7:55 AM',  amount: '−$54.80',   pos: false, status: 'Completed' },
      { icon: 'bl',  emoji: '📱', name: 'Phone Bill',              detail: 'AT&T Wireless',        date: 'Mar 17, 2026 · 8:00 AM',  amount: '−$85.00',   pos: false, status: 'Completed' },
      { icon: 'wd',  emoji: '🍽️', name: 'Restaurant',              detail: 'Olive Garden',         date: 'Mar 14, 2026 · 7:30 PM',  amount: '−$47.20',   pos: false, status: 'Completed' },
      { icon: 'dep', emoji: '💵', name: 'Tax Refund',              detail: 'IRS Direct Deposit',   date: 'Mar 10, 2026 · 10:15 AM', amount: '+$1,240.00', pos: true,  status: 'Completed' },
      { icon: 'atm', emoji: '🏧', name: 'ATM Withdrawal',          detail: 'Chase ATM #03047',     date: 'Mar 7, 2026 · 2:00 PM',   amount: '−$200.00',  pos: false, status: 'Completed' },
    ]
  }
};

// ── Middleware ──
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'chase-mvp-persistent-secret-key',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 30  // 30 days
  }
}));

// ── Auth guard ──
function requireAuth(req, res, next) {
  if (req.session && req.session.loggedIn) return next();
  res.redirect('/login');
}

// ── Routes ──
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  if (req.session && req.session.loggedIn) return res.redirect('/dashboard');
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const key = email && email.toLowerCase().trim();
  const user = USERS[key];
  if (user && password === user.password) {
    req.session.loggedIn = true;
    req.session.email = key;
    return res.redirect('/dashboard');
  }
  res.redirect('/login?error=1');
});

// API — serves logged-in user's account data to the dashboard
app.get('/api/me', requireAuth, (req, res) => {
  const user = USERS[req.session.email];
  if (!user) return res.status(401).json({ error: 'Not found' });
  // Don't send password
  const { password, ...safeUser } = user;
  res.json(safeUser);
});

app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

app.use((req, res) => res.status(404).redirect('/'));

// ── Start ──
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅  Chase MVP running on port ${PORT}`);
});
