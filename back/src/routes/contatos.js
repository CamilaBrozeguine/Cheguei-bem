const express = require('express');
const pool = require('../db');
const auth = require('../middlewares/auth');

const router = express.Router();
router.use(auth); // todas as rotas daqui exigem login

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nome, telefone FROM contatos WHERE usuaria_id = $1 ORDER BY nome',
      [req.usuariaId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro no servidor.' });
  }
});

router.post('/', async (req, res) => {
  const { nome, telefone } = req.body;
  if (!nome || !telefone) {
    return res.status(400).json({ erro: 'Informe nome e telefone.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO contatos (usuaria_id, nome, telefone) VALUES ($1, $2, $3) RETURNING id, nome, telefone',
      [req.usuariaId, nome, telefone]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro no servidor.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM contatos WHERE id = $1 AND usuaria_id = $2 RETURNING id',
      [req.params.id, req.usuariaId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Contato não encontrado.' });
    }
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro no servidor.' });
  }
});

module.exports = router;