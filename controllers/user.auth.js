const db = require('../config/db')
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Some fields are missing' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    db.query(
      `INSERT INTO users (username, email, password) VALUES (?,?,?)`,
      [username, email, hash],
      (err, result) => {
        if (err) {
    console.log(err);

          return res.status(500).json({ error: err });
        }

        const newUser = { id: result.insertId, email, username };
        req.session.user = newUser;

        return res.status(201).json({
          message: 'Registered & logged in',
          user: newUser
        });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Server error' });
  }
};



exports.login = async  (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'email & password required' });

  db.query('SELECT id, email, password FROM users WHERE email = ?', [email], async (err, rows) => {

    if (err) {
    console.log(err);
      
      return res.status(500).json({ message: 'db error' })
    };
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'invalid credentials' });

    req.session.user = { id: user.id, email: user.email };
    console.log('sessionID=', req.sessionID);

    return res.json({ message: 'logged in' });
  });
};
