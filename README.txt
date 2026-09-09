ELENOR WAR TRACKER V3

1) Execute database_v3.sql no Supabase SQL Editor.
2) No Edge Function sync-wotserver, substitua todo o index.ts pelo arquivo supabase/functions/sync-wotserver/index.ts e faça Deploy.
3) No GitHub Pages, substitua os arquivos da raiz pelos arquivos deste pacote (index.html, viewer.js, style.css, admin.html, admin.js, admin.css, config.js, .nojekyll).
4) Abra /admin.html e entre com a conta de administrador já existente.
5) Cadastre outras guilds pelo ID do WOTServer.
6) Cadastre players Randoms pelo nome. Eles serão consultados individualmente.

EXIVA: cada player tem botão “⧉ exiva”. Ele copia para a área de transferência exatamente: exiva "Nome do Player".

O coletor mantém:
🟢 UPANDO = XP ganho nos últimos 3 minutos
🟡 ONLINE / PARADO = online sem ganho de XP por 3 minutos
⚫ OFFLINE = WOTServer informa offline

Observação: o GitHub Pages continua com o endereço atual até você configurar um domínio próprio.
