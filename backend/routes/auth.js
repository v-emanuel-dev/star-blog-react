// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // <-- Importado
const pool = require('../config/db');
const router = express.Router();
const saltRounds = 10;
const passport = require('passport'); // <-- Importar Passport

// --- NOVA ROTA ---
// ROTA POST /login (corresponderá a POST /api/auth/login)
router.post('/login', async (req, res) => {
  // 1. Extrai email e senha do corpo
  const { email, password } = req.body;

  // 2. Validação básica
  if (!email || !password) {
    return res.status(400).json({ message: "Email e senha são obrigatórios." });
  }

  try {
    // 3. Busca o usuário pelo email no banco
    //    Seleciona campos necessários, incluindo o hash da senha
    const sql = "SELECT id, email, password_hash, name FROM users WHERE email = ?";
    const [users] = await pool.query(sql, [email]);

    // 4. Verifica se o usuário existe
    if (users.length === 0) {
      // Usuário não encontrado - retorna erro 401 (Unauthorized) genérico
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    // Pega os dados do usuário encontrado
    const user = users[0];

    // 5. Compara a senha fornecida com o hash armazenado
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      // Senha não bate - retorna erro 401 genérico
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    // 6. SENHA CORRETA - Gerar o JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("ERRO CRÍTICO: JWT_SECRET não está definido no .env!");
      // Em produção, não envie detalhes do erro. Apenas logue e envie 500.
      return res.status(500).json({ message: "Erro interno do servidor - configuração de segurança ausente." });
    }

    // Cria o payload (carga útil) do token com dados não sensíveis do usuário
    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name
      // Não inclua a senha ou hash aqui!
    };

    // Assina o token com o segredo e define um tempo de expiração (ex: 1 hora)
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' }); // '1h', '7d', '30m'

    // 7. Envia a resposta de sucesso com o token e alguns dados do usuário
    res.status(200).json({
      message: "Login bem-sucedido!",
      token: token,
      user: { // Envia dados seguros do usuário para o frontend usar
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    // 8. Tratamento de erro genérico
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ message: "Erro interno do servidor ao tentar fazer login.", error: error.message });
  }
});

// backend/routes/auth.js
// ... router, saltRounds ...
// ... Rota POST /register ...
// ... Rota POST /login ...


// --- ROTAS GOOGLE OAUTH ---

// ROTA GET /google - Inicia o fluxo de autenticação Google
// O usuário será redirecionado para o Google ao acessar esta rota
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
    // 'google': Usa a GoogleStrategy que configuramos
    // scope: Pede permissão para ver perfil e email
    // session: false: Não usamos sessões do Passport, vamos gerar nosso JWT
  );
  
  // ROTA GET /google/callback - O Google redireciona para cá após autenticação
  router.get('/google/callback',
    // Primeiro, Passport tenta autenticar usando o código que o Google enviou
    passport.authenticate('google', {
        // Se falhar (usuário negou, erro no Google, etc.), redireciona para o frontend com erro
        // Idealmente, o frontend teria uma página ou lógica para tratar esse parâmetro de erro
        failureRedirect: 'http://localhost:5173/login?error=google-auth-failed', // <-- URL do SEU FRONTEND
        session: false // Novamente, sem sessões Passport
    }),
    // Se passport.authenticate funcionar, ele anexa o usuário (do nosso DB) em req.user
    // Esta função SÓ RODA se a autenticação Google via Passport for bem-sucedida
    (req, res) => {
      // Usuário autenticado com sucesso pelo Google e encontrado/criado no nosso DB!
      // req.user contém os dados do usuário vindos do 'done(null, user)' no passport-setup.js
      console.log('Usuário autenticado via Google callback:', req.user);
  
      // Geramos o NOSSO JWT para este usuário (igual ao login padrão)
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret || !req.user) {
           console.error("Erro ao gerar JWT no callback do Google: segredo ou usuário ausente.");
           // Redireciona para o frontend com erro genérico
           return res.redirect('http://localhost:5173/login?error=jwt-generation-failed');
      }
  
      const payload = {
        userId: req.user.id,
        email: req.user.email,
        name: req.user.name
      };
  
      try {
           const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
  
           // Redireciona de volta para o FRONTEND com o token como parâmetro de query
           // O frontend precisará ter uma rota ou lógica para capturar este token
           res.redirect(`http://localhost:5173/auth/callback?token=${token}`); // <-- URL do SEU FRONTEND
  
      } catch(error) {
           console.error("Erro ao assinar JWT no callback do Google:", error);
           res.redirect('http://localhost:5173/login?error=jwt-signing-failed');
      }
    }
  );
  
module.exports = router;
