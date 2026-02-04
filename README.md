# Sistema de Agendamento para Barbearia

## Visão Geral

Este projeto é um sistema de agendamento online para barbearias, com foco em experiência do usuário, responsividade e integração com Supabase (backend e banco de dados na nuvem). O frontend é um chatbot interativo, que guia o cliente pelo agendamento e envia os dados para o backend.

## Estrutura do Projeto

```
BarbeariaAgendamentos/
├── backend/
│   └── supabase_schema.sql         # Script SQL para criar e atualizar as tabelas no Supabase
├── frontend/
│   ├── index.html                 # Página principal do chatbot
│   ├── style.css                  # Estilos responsivos e modo escuro
│   ├── script.js                  # Lógica do chatbot, fluxo de perguntas e integração Supabase
│   ├── supabaseConfig.js          # Chaves e URL do Supabase
│   └── supabaseService.js         # Funções de acesso ao banco (CRUD)
├── vercel.json                    # Configuração para deploy automático na Vercel
└── README.md                      # (Este arquivo)
```

## Fluxo do Chatbot

1. Saudação automática.
2. Pergunta o telefone do cliente (validação e bloqueio de duplicidade).
3. Pergunta o nome.
4. Mostra tabela de preços e opções de serviço (botões, combinações possíveis).
5. Pergunta método de pagamento.
6. Pergunta a data (input de calendário).
7. Mostra horários disponíveis (botões, sem conflitos).
8. Confirma e registra o agendamento no Supabase.
9. Mostra resumo do agendamento.

## Responsividade e Acessibilidade

- Layout 100% responsivo para mobile, tablet e desktop.
- Formulário fixo no rodapé no mobile, chat sempre começa do topo.
- Modo escuro/claro com alternância por botão.
- Botões grandes e acessíveis.

## Backend (Supabase)

- Tabelas: `agendamentos` (nome, telefone, serviço, valor, pagamento, data, hora), `horarios` (data, hora, disponivel).
- Todas as operações de leitura e escrita são feitas via Supabase REST API.
- Políticas de segurança devem ser configuradas no painel do Supabase.

## Deploy

- Deploy automático via Vercel: qualquer push no GitHub publica a nova versão.
- O arquivo `vercel.json` garante que a pasta `frontend` seja servida corretamente.

## Como rodar localmente

1. Clone o repositório.
2. Configure as chaves do Supabase em `frontend/supabaseConfig.js`.
3. Abra `frontend/index.html` em um navegador moderno.

## Como publicar

1. Faça alterações e dê `git add . && git commit -m "sua mensagem" && git push`.
2. A Vercel publica automaticamente.

## Observações para IA ou futuros desenvolvedores

- O fluxo do chatbot é controlado por etapas no `script.js`.
- Todas as integrações com banco estão em `supabaseService.js`.
- O CSS usa variáveis para fácil customização de temas.
- O sistema é modular e fácil de expandir (ex: adicionar novos serviços, métodos de pagamento, integrações de notificação).
- O código está comentado e segue boas práticas de UX e acessibilidade.

---

Dúvidas ou melhorias? Abra uma issue ou pull request!
