const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Credentials ──
const USER = {
  email: 'kellychristopher581@gmail.com',
  password: 'beloyal246'
};

// ── Middleware ──
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'chase-mvp-persistent-secret-key',
  resave: false,
  saveUninitialized: false,
  rolling: true,           // resets cookie expiry on every active request
  cookie: {
    secure: false,         // set to true when using HTTPS in production
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 30  // 30 days — persistent login
  }
}));

// ── Auth guard ──
function requireAuth(req, res, next) {
  if (req.session && req.session.loggedIn) {
    return next();
  }
  res.redirect('/login');
}

// ── Routes ──

// Public landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Login page — skip straight to dashboard if already logged in
app.get('/login', (req, res) => {
  if (req.session && req.session.loggedIn) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Login handler (POST)
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (
    email && email.toLowerCase().trim() === USER.email &&
    password === USER.password
  ) {
    req.session.loggedIn = true;
    req.session.email = USER.email;
    return res.redirect('/dashboard');
  }

  res.redirect('/login?error=1');
});

// Dashboard — protected
app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).redirect('/');
});

// ── Start ──
app.listen(PORT, () => {
  console.log(`\n✅  Chase MVP running → http://localhost:${PORT}`);
  console.log(`    Email:    kellychristopher581@gmail.com`);
  console.log(`    Password: beloyal246`);
  console.log(`    Session:  persistent 30 days\n`);
});
