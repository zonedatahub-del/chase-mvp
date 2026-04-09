const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

// Railway injects PORT automatically — this is required for the service to be reachable
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

// Suppress the MemoryStore production warning — fine for single-user MVP
const sessionStore = new session.MemoryStore();

app.use(session({
  secret: 'chase-mvp-persistent-secret-key',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  store: sessionStore,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 30  // 30 days
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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  if (req.session && req.session.loggedIn) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

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

app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

app.use((req, res) => {
  res.status(404).redirect('/');
});

// ── Start — must listen on 0.0.0.0 for Railway to expose it ──
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅  Chase MVP running on port ${PORT}`);
  console.log(`    Email:    kellychristopher581@gmail.com`);
  console.log(`    Password: beloyal246`);
});
