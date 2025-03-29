// backend/server.js
const express = require('express');
const cors = require('cors'); // <-- Adicionar esta linha
require('dotenv').config();
const passport = require('passport');
require('./config/passport-setup'); // <-- Executa o arquivo de configuração do Passport
const postsRouter = require('./routes/posts'); // <-- Adicionar esta linha
const authRouter = require('./routes/auth'); // <-- Adicionar esta linha

const app = express();
const PORT = process.env.PORT || 4000;

// --- MIDDLEWARE ---
// Habilita o CORS para todas as origens (bom para desenvolvimento)
app.use(cors()); // <-- Adicionar esta linha ANTES das definições de rota

// (Opcional) Habilita o parsing de JSON no corpo das requisições (útil para POST/PUT)
app.use(express.json());
// (Opcional) Habilita o parsing de dados de formulários URL-encoded
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize()); // <-- Adicionar esta linha

// --- ROTAS ---
app.get('/', (req, res) => {
  res.json({ message: 'Olá do Backend Star Blog!' });
});

app.use('/api/posts', postsRouter); // <-- Adicionar esta linha
app.use('/api/auth', authRouter);  // <-- Adicionar esta linha para Rotas de Auth

// --- INICIAR SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});