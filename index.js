require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { requireAuth } = require('./middleware/auth');

const getRedis = require('./config/redis');
const app = express();
const port = 2525;

const http = require('http');
const initSocketIO = require('./controllers/user.support.chatting');

// CORS
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

// express settings
app.use(express.json());
app.use(express.static('public'));

app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
}));

const PUBLIC_PATHS = [
    '/auth/login',
    '/auth/register',
    '/health/redis',
];

app.use((req, res, next) => {
    if (PUBLIC_PATHS.some(p => req.path.startsWith(p))) return next();
    return requireAuth(req, res, next);
});

const server = http.createServer(app);

const io = initSocketIO(server);

// Routes
const auth = require('./routes/auth/auth');
app.use('/auth', auth);
app.use('/resturant', require('./routes/resturant/order'));
app.use('/user/profile', require('./routes/user/profile/profile'));
app.use('/user/payment', require('./routes/user/payment/payment'));
app.use('/user/order', require('./routes/user/order/order'));
app.use('/driver', require('./routes/driver/driver'));
app.use('/notifications', require('./routes/notifications/notifications'));
app.use('/upload', require('./routes/upload/upload'));
const { client: redis, ready } = getRedis();

app.get("/health/redis", async (_req, res) => {
    const pong = await redis.ping();
    res.json({ ok: pong === "PONG" });
});

server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});