# Elenor War Tracker

Painel web inicial para monitoramento da guild inimiga **Soul Tatics** e de **Hunteds** no mundo **Elenor**.

## Como abrir
Basta abrir `index.html` no navegador.

## O que já funciona
- Dashboard com contagem de Upando / PZ / Offline
- Aba Soul Tatics
- Aba Hunteds
- Cadastro e exclusão de personagens
- Busca por nome
- Filtros de status
- Persistência no navegador via localStorage
- Layout responsivo

## Próxima etapa: dados automáticos
O WOTServer possui páginas públicas de personagens com mundo, level e último login. A integração automática deve ser feita em um backend/cron para consultar esses dados e atualizar o banco. A identificação de "UPANDO" versus "PZ" exige uma fonte que forneça posição/estado online em tempo real; a página pública de personagem, por si só, não expõe isso.

O painel foi separado para facilitar essa integração depois.
