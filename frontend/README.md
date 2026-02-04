# Frontend

Esta pasta contém todo o código da interface do usuário.

## Estrutura

- `index.html`: Página principal do sistema.
- `style.css`: Estilos visuais.
- `script.js`: Lógica do chatbot e integração com Supabase.
- `supabaseConfig.js`: Configuração do Supabase.
- `supabaseService.js`: Serviços de comunicação com o backend.

## Como usar

1. Preencha as credenciais do Supabase em `supabaseConfig.js`.
2. Instale as dependências necessárias (ex: `@supabase/supabase-js`).
3. Abra `index.html` em um servidor local ou serviço de hospedagem estática.

## Observações

- O frontend é desacoplado e consome apenas a API do Supabase.
- O código está documentado para facilitar manutenção e evolução.

---

> Consulte os comentários nos arquivos JS para detalhes de cada função.
