const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Conectar ou criar banco
const db = new sqlite3.Database('./feedback.db', (err) => {
  if (err) return console.error(err.message);
  console.log('Conectado ao banco SQLite.');
});

// Criar tabela se não existir (com campo nome)
db.run(`
  CREATE TABLE IF NOT EXISTS feedbacks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    resposta TEXT NOT NULL,
    data DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Rota para receber feedback
app.post('/feedback', (req, res) => {
  const { nome, resposta } = req.body;

  if (!nome || !resposta) {
    return res.status(400).json({ mensagem: 'Nome e feedback são obrigatórios.' });
  }

  db.run(
    'INSERT INTO feedbacks (nome, resposta) VALUES (?, ?)',
    [nome, resposta],
    (err) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ mensagem: 'Erro ao salvar feedback.' });
      }

      res.json({ mensagem: 'Feedback recebido. Obrigado!' });
    }
  );
});

// Rota para listar todos feedbacks
app.get('/feedbacks', (req, res) => {
  db.all('SELECT * FROM feedbacks ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar feedbacks' });
    }
    res.json(rows);
  });
});

// Rota para deletar feedback por id
app.delete('/feedback/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM feedbacks WHERE id = ?', [id], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ mensagem: 'Erro ao deletar feedback.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ mensagem: 'Feedback não encontrado.' });
    }

    res.json({ mensagem: 'Feedback deletado com sucesso.' });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
