/**
 * Busca agendamento existente por telefone
 * @param {string} telefone
 * @returns {Promise<Object|null>} Agendamento ou null
 */
export async function buscarAgendamentoPorTelefone(telefone) {
  const { data: agendamentos, error } = await supabase
    .from("agendamentos")
    .select("*")
    .eq("telefone", telefone);
  if (error) return null;
  return agendamentos && agendamentos.length > 0 ? agendamentos[0] : null;
}
/**
 * Busca todos os agendamentos para uma data específica
 * @param {string} data - Data no formato 'YYYY-MM-DD'
 * @returns {Promise<Array>} Lista de agendamentos
 */
export async function buscarAgendamentosPorData(data) {
  const { data: agendamentos, error } = await supabase
    .from("agendamentos")
    .select("*")
    .eq("data", data);
  if (error) throw error;
  return agendamentos;
}
// Serviço de integração com Supabase
// Responsável por toda comunicação entre frontend e banco de dados
// Funções documentadas para fácil entendimento

import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabaseConfig.js";
// Usa o createClient global injetado pelo CDN
const createClient = window.supabaseCreateClient;
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Busca horários disponíveis para uma data específica
 * @param {string} data - Data no formato 'YYYY-MM-DD'
 * @returns {Promise<Array>} Lista de horários disponíveis
 */
export async function buscarHorariosDisponiveis(data) {
  const { data: horarios, error } = await supabase
    .from("horarios")
    .select("*")
    .eq("data", data)
    .eq("disponivel", true);
  if (error) throw error;
  return horarios;
}

/**
 * Cria um novo agendamento
 * @param {Object} agendamento - Dados do agendamento
 * @returns {Promise<Object>} Agendamento criado
 */
export async function criarAgendamento(agendamento) {
  const { data, error } = await supabase
    .from("agendamentos")
    .insert([agendamento]);
  if (error) throw error;
  return data;
}
