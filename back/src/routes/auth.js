const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

router.post('/cadastro', async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha || senha.length < 8) {
    return res.status(400).json({ erro: 'Informe nome, e-mail e uma senha com pelo menos 8 caracteres.' });
  }
  try {
    const senha_hash = await bcrypt.hash(senha, 10);
    const result = await pool.query(
      'INSERT INTO usuarias (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email',
      [nome, email.toLowerCase(), senha_hash]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ erro: 'E-mail já cadastrado.' });
    console.error(err);
    res.status(500).json({ erro: 'Erro no servidor.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: 'Informe e-mail e senha.' });
  try {
    const result = await pool.query('SELECT * FROM usuarias WHERE email = $1', [email.toLowerCase()]);
    const usuaria = result.rows[0];
    const ok = usuaria && (await bcrypt.compare(senha, usuaria.senha_hash));
    if (!ok) return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });

    const token = jwt.sign({ id: usuaria.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro no servidor.' });
  }
});

module.exports = router;