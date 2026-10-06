const express = require('express');
const pool = require('./db');

const app = express();
app.use(express.json());

app.get('/saude', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ ok: true, hora_do_banco: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false });
  }
});

app.listen(3000, () => console.log('API rodando na porta 3000'));