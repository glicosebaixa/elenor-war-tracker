# ELENOR WAR TRACKER V2

Esta versão separa:
- `index.html` = link para seus amigos, somente visualização.
- `soul.html` = lista Soul Tatics.
- `hunteds.html` = lista Hunteds.
- `admin.html` = painel administrativo protegido por login.
- `database.sql` = banco e regras de segurança Supabase.
- `config.js` = URL/chave pública do Supabase.

## Configuração
1. Crie um projeto gratuito no Supabase.
2. Authentication > Users: crie seu usuário (somente você).
3. SQL Editor: execute `database.sql`.
4. Pegue o UUID do seu usuário e execute o INSERT indicado no final do SQL.
5. Settings > API: copie Project URL e a chave pública para `config.js`.
6. Suba todos os arquivos para o GitHub Pages.

Links:
- Amigos: `https://SEU_USUARIO.github.io/elenor-war-tracker/`
- Administração: `https://SEU_USUARIO.github.io/elenor-war-tracker/admin.html`

IMPORTANTE:
A chave pública/anon do Supabase pode ficar no JavaScript do site quando RLS está configurado corretamente. Nunca coloque a `service_role` key no GitHub ou no navegador.

A versão atual permite cadastro e atualização manual. A próxima etapa pode automatizar a leitura do WOTServer, se houver uma fonte de dados adequada.
