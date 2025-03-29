// backend/config/passport-setup.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./db'); // Conexão com o banco
require('dotenv').config(); // Para pegar as credenciais do Google

passport.use(
  new GoogleStrategy(
    {
      // Opções da estratégia Google (pega do .env)
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback', // A ROTA NO NOSSO BACKEND para onde o Google redireciona
      scope: ['profile', 'email'] // Pedimos acesso ao perfil básico e email
    },
    async (accessToken, refreshToken, profile, done) => {
      // Esta função (verify callback) é chamada QUANDO o Google redireciona de volta com sucesso
      // 'profile' contém os dados do usuário do Google
      console.log('Google profile:', profile); // Útil para ver os dados recebidos

      const googleId = profile.id;
      // O email pode estar em profile.emails[0].value
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      // O nome pode estar em profile.displayName ou separado
      const name = profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim();

      if (!email) {
        // Se não conseguirmos o email do Google, não podemos prosseguir (caso raro)
        return done(new Error('Não foi possível obter o email do Google.'), null);
      }

      try {
        // 1. Tenta encontrar usuário pelo Google ID
        let findUserSql = "SELECT * FROM users WHERE google_id = ?";
        let [users] = await pool.query(findUserSql, [googleId]);

        if (users.length > 0) {
          // Usuário encontrado pelo Google ID - Login bem-sucedido!
          console.log('Usuário encontrado pelo Google ID:', users[0].id);
          return done(null, users[0]); // Passa o usuário encontrado para o Passport
        } else {
          // Usuário NÃO encontrado pelo Google ID
          // 2. Tenta encontrar pelo email (pode ser um usuário já registrado pelo método padrão)
          findUserSql = "SELECT * FROM users WHERE email = ?";
          [users] = await pool.query(findUserSql, [email]);

          if (users.length > 0) {
            // Usuário encontrado pelo email - Vincular Google ID (ou apenas logar)
            console.log('Usuário encontrado pelo Email, vinculando Google ID:', users[0].id);
            // Opcional: Atualizar o google_id no banco se estiver faltando
             if (!users[0].google_id) {
                 const updateSql = "UPDATE users SET google_id = ? WHERE id = ?";
                 await pool.query(updateSql, [googleId, users[0].id]);
             }
            return done(null, users[0]); // Passa o usuário existente para o Passport
          } else {
            // Usuário NÃO encontrado pelo email também - Criar novo usuário
            console.log('Criando novo usuário com dados do Google');
            const insertSql = "INSERT INTO users (email, name, google_id, password_hash) VALUES (?, ?, ?, NULL)";
             // Inserimos NULL para password_hash, pois é login Google
            const values = [email, name || 'Usuário Google', googleId];
            const [results] = await pool.query(insertSql, values);

            // Busca o usuário recém-criado para retornar completo
            const [newUser] = await pool.query("SELECT * FROM users WHERE id = ?", [results.insertId]);
            return done(null, newUser[0]); // Passa o novo usuário para o Passport
          }
        }
      } catch (err) {
        // Erro no banco de dados
        return done(err, null);
      }
    }
  )
);

// Nota: Não precisamos de serializeUser/deserializeUser se usarmos JWT (session: false)