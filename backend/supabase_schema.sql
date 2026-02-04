# Supabase Schema

Script SQL para criar as tabelas necessárias no Supabase para o sistema de agendamento da barbearia.

---

-- Tabela de horários disponíveis
CREATE TABLE IF NOT EXISTS horarios (
    id SERIAL PRIMARY KEY,
    data DATE NOT NULL,
    hora VARCHAR(5) NOT NULL, -- Ex: '14:00'
    disponivel BOOLEAN DEFAULT TRUE
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    servico VARCHAR(100) NOT NULL,
    pagamento VARCHAR(50) NOT NULL,
    data DATE NOT NULL,
    hora VARCHAR(5) NOT NULL,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Adicione policies e permissões conforme necessidade de segurança.
