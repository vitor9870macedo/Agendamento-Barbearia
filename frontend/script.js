// script.js
// Lógica do chatbot e integração com Supabase
// Documentado para fácil entendimento e manutenção

import {
  buscarHorariosDisponiveis,
  criarAgendamento,
  buscarAgendamentosPorData,
  buscarAgendamentoPorTelefone,
} from "./supabaseService.js";

// Lista fixa de horários possíveis
// Gera horários de 10 em 10 minutos entre 09:00 e 18:00
function gerarHorariosPossiveis() {
  const horarios = [];
  for (let h = 9; h <= 18; h++) {
    for (let m = 0; m < 60; m += 10) {
      if (h === 18 && m > 0) break; // Não passa de 18:00
      const hora = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
      horarios.push(hora);
    }
  }
  return horarios;
}
const horariosPossiveis = gerarHorariosPossiveis();

const perguntas = [
  { texto: "Qual seu número de telefone? (apenas números)", campo: "telefone" },
  { texto: "Qual seu nome?", campo: "nome" },
  { texto: "Escolha o(s) serviço(s) desejado(s):", campo: "servicos" },
  {
    texto: "Qual método de pagamento? (Dinheiro, Cartão, Pix)",
    campo: "pagamento",
  },
  { texto: "Informe a data do agendamento (AAAA-MM-DD):", campo: "data" },
  // Após a data, o sistema mostrará os horários disponíveis para escolha
];

// Tabela de preços dos serviços
const precosServicos = {
  Corte: 30,
  Barba: 20,
  Sobrancelha: 15,
  "Corte + Barba": 45,
  "Corte + Sobrancelha": 40,
  "Barba + Sobrancelha": 32,
  "Corte + Barba + Sobrancelha": 55,
};

const opcoesServicos = [
  "Corte",
  "Barba",
  "Sobrancelha",
  "Corte + Barba",
  "Corte + Sobrancelha",
  "Barba + Sobrancelha",
  "Corte + Barba + Sobrancelha",
];

let respostas = {};
let etapa = 0;

const chatbot = document.getElementById("chatbot");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");

function adicionarMensagem(texto, autor = "bot") {
  const msg = document.createElement("div");
  msg.className = `message ${autor}`;
  msg.textContent = texto;
  chatbot.appendChild(msg);
  // Não faz scroll automático para o final, deixa o padrão do navegador
}

// Função principal para avançar no fluxo de perguntas
async function proximaPergunta() {
  // Personaliza a saudação após o nome ser informado
  if (etapa < perguntas.length) {
    let textoPergunta = perguntas[etapa].texto;
    if (etapa > 1 && respostas.nome) {
      textoPergunta = `${respostas.nome}, ${textoPergunta.charAt(0).toLowerCase() + textoPergunta.slice(1)}`;
    }
    // Limpa qualquer evento anterior
    chatForm.onsubmit = null;
    userInput.disabled = false;
    chatForm.querySelector('button[type="submit"]').disabled = false;
    // Etapa de serviços: mostrar tabela de preços e botões
    if (etapa === 2) {
      adicionarMensagem("Veja nossa tabela de preços:", "bot");
      let tabela = "";
      Object.entries(precosServicos).forEach(([serv, preco]) => {
        tabela += `• ${serv}: R$ ${preco}\n`;
      });
      adicionarMensagem(tabela.trim(), "bot");
      adicionarMensagem(textoPergunta, "bot");
      userInput.disabled = true;
      chatForm.querySelector('button[type="submit"]').disabled = true;
      const btnContainer = document.createElement("div");
      btnContainer.style.display = "flex";
      btnContainer.style.flexWrap = "wrap";
      btnContainer.style.gap = "8px";
      opcoesServicos.forEach((serv) => {
        const btn = document.createElement("button");
        btn.textContent = serv;
        btn.className = "servico-btn";
        btn.style.padding = "8px 16px";
        btn.style.borderRadius = "16px";
        btn.style.border = "none";
        btn.style.background = "#4f46e5";
        btn.style.color = "#fff";
        btn.style.cursor = "pointer";
        btn.onclick = async (e) => {
          e.preventDefault();
          adicionarMensagem(serv, "user");
          respostas.servicos = serv;
          etapa++;
          btnContainer.remove();
          userInput.disabled = false;
          chatForm.querySelector('button[type="submit"]').disabled = false;
          await proximaPergunta();
        };
        btnContainer.appendChild(btn);
      });
      chatbot.appendChild(btnContainer);
      chatbot.scrollTop = chatbot.scrollHeight;
      return;
    }
    // Etapa do telefone
    if (etapa === 0) {
      userInput.type = "text";
      userInput.value = "";
      chatForm.onsubmit = async function (e) {
        e.preventDefault();
        const telefone = userInput.value.trim();
        if (!/^\d{10,11}$/.test(telefone)) {
          adicionarMensagem(
            "Por favor, digite um número de telefone válido (apenas números, com DDD, ex: 47999999999 ou 4733334444).",
            "bot",
          );
          userInput.value = "";
          return;
        }
        adicionarMensagem(telefone, "user");
        respostas.telefone = telefone;
        userInput.value = "";
        const agendamentoExistente =
          await buscarAgendamentoPorTelefone(telefone);
        if (agendamentoExistente) {
          adicionarMensagem(
            `Você já possui um agendamento para o dia ${agendamentoExistente.data} às ${agendamentoExistente.hora}. Caso queira remarcar, entre em contato com a barbearia.`,
            "bot",
          );
          userInput.disabled = true;
          chatForm.querySelector('button[type="submit"]').disabled = true;
          return;
        }
        etapa++;
        await proximaPergunta();
      };
      adicionarMensagem(textoPergunta, "bot");
      return;
    }
    // Nome e pagamento
    if ([1, 3].includes(etapa)) {
      userInput.type = "text";
      userInput.value = "";
      chatForm.onsubmit = async function (e) {
        e.preventDefault();
        const resposta = userInput.value.trim();
        let campo = perguntas[etapa].campo;
        if (!resposta) {
          adicionarMensagem(
            "Este campo é obrigatório. Por favor, preencha.",
            "bot",
          );
          return;
        }
        adicionarMensagem(resposta, "user");
        respostas[campo] = resposta;
        userInput.value = "";
        etapa++;
        await proximaPergunta();
      };
      adicionarMensagem(textoPergunta, "bot");
      return;
    }
    // Data
    if (etapa === 4) {
      userInput.type = "date";
      userInput.value = "";
      chatForm.onsubmit = async function (e) {
        e.preventDefault();
        const resposta = userInput.value;
        if (!resposta) {
          adicionarMensagem("Por favor, selecione uma data.", "bot");
          return;
        }
        adicionarMensagem(resposta, "user");
        respostas["data"] = resposta;
        userInput.type = "text";
        userInput.value = "";
        etapa++;
        await proximaPergunta();
      };
      adicionarMensagem(textoPergunta, "bot");
      return;
    }
  } else if (etapa === perguntas.length) {
    // Buscar agendamentos já feitos para a data informada
    adicionarMensagem("Buscando horários disponíveis...", "bot");
    userInput.disabled = true;
    chatForm.querySelector('button[type="submit"]').disabled = true;
    try {
      const agendamentos = await buscarAgendamentosPorData(respostas.data);
      // Lista de horários já reservados
      const horariosReservados = agendamentos.map((a) => a.hora);
      // Se todos os horários estão reservados
      if (horariosReservados.length === horariosPossiveis.length) {
        adicionarMensagem(
          "Nenhum horário disponível para esta data. Por favor, informe outra data.",
          "bot",
        );
        etapa = perguntas.findIndex((p) => p.campo === "data");
        userInput.disabled = false;
        chatForm.querySelector('button[type="submit"]').disabled = false;
      } else {
        adicionarMensagem("Escolha um dos horários disponíveis:", "bot");
        // Cria botões para cada horário possível, desabilitando os reservados
        const btnContainer = document.createElement("div");
        btnContainer.style.display = "flex";
        btnContainer.style.flexWrap = "wrap";
        btnContainer.style.gap = "8px";
        horariosPossiveis.forEach((hora) => {
          const btn = document.createElement("button");
          btn.textContent = hora;
          btn.className = "horario-btn";
          btn.style.padding = "8px 16px";
          btn.style.borderRadius = "16px";
          btn.style.border = "none";
          btn.style.background = horariosReservados.includes(hora)
            ? "#ccc"
            : "#4f46e5";
          btn.style.color = horariosReservados.includes(hora) ? "#888" : "#fff";
          btn.style.cursor = horariosReservados.includes(hora)
            ? "not-allowed"
            : "pointer";
          btn.disabled = horariosReservados.includes(hora);
          btn.onclick = async () => {
            if (btn.disabled) return;
            adicionarMensagem(hora, "user");
            respostas.hora = hora;
            etapa++;
            btnContainer.remove();
            await proximaPergunta();
          };
          btnContainer.appendChild(btn);
        });
        chatbot.appendChild(btnContainer);
        chatbot.scrollTop = chatbot.scrollHeight;
      }
    } catch (err) {
      adicionarMensagem("Erro ao buscar horários. Tente novamente.", "bot");
      etapa = perguntas.findIndex((p) => p.campo === "data");
      userInput.disabled = false;
      chatForm.querySelector('button[type="submit"]').disabled = false;
    }
  } else if (etapa === perguntas.length + 1) {
    // Finalizar agendamento
    adicionarMensagem("Registrando seu agendamento...", "bot");
    try {
      // Calcular preço do serviço
      const servicoEscolhido = respostas.servicos;
      const valor = precosServicos[servicoEscolhido] || 0;
      await criarAgendamento({
        telefone: respostas.telefone,
        nome: respostas.nome,
        servico: servicoEscolhido,
        pagamento: respostas.pagamento,
        data: respostas.data,
        hora: respostas.hora,
        valor: valor,
      });
      adicionarMensagem(
        `Agendamento realizado com sucesso!\nResumo:\nNome: ${respostas.nome}\nServiço(s): ${servicoEscolhido}\nValor: R$ ${valor}\nData: ${respostas.data}\nHora: ${respostas.hora}\nPagamento: ${respostas.pagamento}`,
        "bot",
      );
      chatForm.style.display = "none";
    } catch (err) {
      adicionarMensagem(
        "Erro ao registrar agendamento. Tente novamente.",
        "bot",
      );
    }
  }
}

// Remove o submit global. O controle de submit é feito por etapa dentro de proximaPergunta.

// Inicia a primeira pergunta após carregamento

window.onload = () => {
  userInput.disabled = false;
  chatForm.querySelector('button[type="submit"]').disabled = false;
  adicionarMensagem(
    "Olá! Bem-vindo à Barbearia. Vamos agendar seu horário?",
    "bot",
  );
  setTimeout(proximaPergunta, 600);
};
