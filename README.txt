ELENOR WAR TRACKER - VERSAO AUTOMATICA

1) O banco e a Edge Function sync-wotserver ja foram configurados no Supabase.
2) Para otimizar a funcao, execute database_sync.sql no SQL Editor e depois substitua o codigo da Edge Function pelo arquivo supabase/functions/sync-wotserver/index.ts e faça Deploy.
3) Publique os arquivos da raiz no GitHub Pages, substituindo a versao anterior.
4) O navegador chama sync-wotserver a cada 10 segundos e lê o banco a cada 2 segundos.
5) UPANDO = XP aumentado nos ultimos 3 minutos. ONLINE/PARADO = online sem ganho por 3 minutos. OFFLINE = offline no WOTServer.
6) Nunca coloque Secret key no GitHub/config.js. A chave do navegador em config.js e a publishable key.
