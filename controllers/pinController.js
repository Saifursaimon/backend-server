const db = require('../db/index');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config()

exports.verifyPin = async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) {
      return res.status(400).json({ message: 'PIN required' });
    }

    const user = db
      .prepare('SELECT * FROM users WHERE id = 1')
      .get();

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(pin, user.pin);

    if (!isMatch) {
      return res.status(401).json({ message: 'Wrong PIN' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // ✅ SEND TOKEN IN HEADER
    res.setHeader('Authorization', `Bearer ${token}`);
    res.json({ user: {
      id: user.id,
      name: user.name
    } });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
};
