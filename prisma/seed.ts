import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Limpar dados existentes (opcional - comentar se não quiser limpar)
  await prisma.evolucao.deleteMany()
  await prisma.prontuario.deleteMany()
  await prisma.respostaFormulario.deleteMany()
  await prisma.formulario.deleteMany()
  await prisma.agendamento.deleteMany()
  await prisma.disponibilidade.deleteMany()
  await prisma.cliente.deleteMany()
  await prisma.profissional.deleteMany()

  console.log('✅ Dados antigos removidos')

  // Criar Profissionais
  const nutricionista1 = await prisma.profissional.create({
    data: {
      nome: 'Dra. Ana Carolina Silva',
      email: 'ana.silva@nutricao.com',
      senha: '$2a$10$K7L1OJ45/iXp/MuZ0/DkF. L7HvVXkHPKqZZt6x6JZ6PZQw6ZqZQwm', // senha: senha123
      telefone: '11987654321',
      cpf: '123. 456.789-01',
      tipo: 'NUTRICIONISTA',
      especialidade: 'Nutrição Esportiva',
      registro: 'CRN-12345',
      bio: 'Nutricionista especializada em nutrição esportiva com mais de 10 anos de experiência.',
      instagram: 'https://instagram.com/ana.silva',
      linkedin: 'https://linkedin.com/in/ana.silva',
      whatsApp: '5511987654321',
      ativo: true,
    },
  })

  const nutricionista2 = await prisma.profissional.create({
    data: {
      nome: 'Dr. Carlos Eduardo Santos',
      email: 'carlos.santos@nutricao.com',
      senha: '$2a$10$K7L1OJ45/iXp/MuZ0/DkF. L7HvVXkHPKqZZt6x6JZ6PZQw6ZqZQwm',
      telefone: '11987654322',
      cpf:  '234.567.890-12',
      tipo: 'NUTRICIONISTA',
      especialidade: 'Nutrição Clínica',
      registro: 'CRN-23456',
      bio: 'Especialista em nutrição clínica e emagrecimento saudável.',
      instagram: 'https://instagram.com/carlos.santos',
      linkedin: 'https://linkedin.com/in/carlos.santos',
      whatsApp: '5511987654322',
      ativo: true,
    },
  })

  const psicologo1 = await prisma.profissional.create({
    data: {
      nome: 'Dra.  Mariana Oliveira',
      email: 'mariana.oliveira@psicologia.com',
      senha: '$2a$10$K7L1OJ45/iXp/MuZ0/DkF.L7HvVXkHPKqZZt6x6JZ6PZQw6ZqZQwm',
      telefone: '11987654323',
      cpf: '345.678.901-23',
      tipo: 'PSICOLOGO',
      especialidade: 'Terapia Cognitivo-Comportamental',
      registro: 'CRP-34567',
      bio: 'Psicóloga clínica com abordagem cognitivo-comportamental.',
      ativo: true,
    },
  })

  const psicologo2 = await prisma.profissional. create({
    data: {
      nome: 'Dr. Roberto Ferreira',
      email: 'roberto.ferreira@psicologia.com',
      senha: '$2a$10$K7L1OJ45/iXp/MuZ0/DkF.L7HvVXkHPKqZZt6x6JZ6PZQw6ZqZQwm',
      telefone: '11987654324',
      cpf: '456.789.012-34',
      tipo: 'PSICOLOGO',
      especialidade: 'Psicologia Infantil',
      registro: 'CRP-45678',
      bio: 'Especialista em atendimento infantil e familiar.',
      ativo: true,
    },
  })

  console.log('✅ Profissionais criados')

  // Criar Disponibilidades
  // Nutricionista 1 - Segunda a Sexta, 8h às 18h
  for (let dia = 1; dia <= 5; dia++) {
    await prisma.disponibilidade.create({
      data: {
        profissionalId: nutricionista1.id,
        diaSemana: dia,
        horaInicio: '08:00',
        horaFim:  '12:00',
        ativo: true,
      },
    })
    await prisma.disponibilidade.create({
      data: {
        profissionalId: nutricionista1.id,
        diaSemana: dia,
        horaInicio: '14:00',
        horaFim: '18:00',
        ativo:  true,
      },
    })
  }

  // Psicólogo 1 - Segunda, Quarta e Sexta, 9h às 17h
  for (let dia of [1, 3, 5]) {
    await prisma.disponibilidade.create({
      data: {
        profissionalId:  psicologo1.id,
        diaSemana: dia,
        horaInicio:  '09:00',
        horaFim: '17:00',
        ativo: true,
      },
    })
  }

  console.log('✅ Disponibilidades criadas')

  // Criar Clientes
  const cliente1 = await prisma. cliente.create({
    data: {
      nome: 'João Pedro Costa',
      email: 'joao.costa@email.com',
      senha: '$2a$10$K7L1OJ45/iXp/MuZ0/DkF.L7HvVXkHPKqZZt6x6JZ6PZQw6ZqZQwm',
      telefone: '11998765432',
      cpf:  '567.890.123-45',
      dataNascimento: new Date('1990-05-15'),
      genero: 'MASCULINO',
      endereco: 'Rua das Flores, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
      ativo: true,
    },
  })

  const cliente2 = await prisma. cliente.create({
    data: {
      nome: 'Maria Fernanda Lima',
      email: 'maria.lima@email.com',
      senha: '$2a$10$K7L1OJ45/iXp/MuZ0/DkF.L7HvVXkHPKqZZt6x6JZ6PZQw6ZqZQwm',
      telefone: '11998765433',
      cpf: '678.901.234-56',
      dataNascimento:  new Date('1985-08-20'),
      genero: 'FEMININO',
      endereco: 'Av. Paulista, 1000',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-100',
      ativo: true,
    },
  })

  const cliente3 = await prisma.cliente.create({
    data: {
      nome: 'Pedro Henrique Alves',
      email: 'pedro.alves@email.com',
      telefone: '11998765434',
      cpf: '789.012.345-67',
      dataNascimento:  new Date('1995-03-10'),
      genero: 'MASCULINO',
      endereco: 'Rua Augusta, 500',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01305-000',
      ativo: true,
    },
  })

  const cliente4 = await prisma. cliente.create({
    data: {
      nome: 'Juliana Santos',
      email: 'juliana.santos@email. com',
      telefone: '11998765435',
      dataNascimento: new Date('1992-11-25'),
      genero: 'FEMININO',
      cidade: 'São Paulo',
      estado: 'SP',
      ativo: true,
    },
  })

  console.log('✅ Clientes criados')

  // Criar Formulários
  const formularioNutricao = await prisma.formulario.create({
    data: {
      profissionalId: nutricionista1.id,
      titulo: 'Anamnese Nutricional',
      descricao: 'Formulário de avaliação nutricional inicial',
      tipo: 'NUTRICIONISTA',
      perguntas: [
        {
          id: 1,
          pergunta: 'Qual seu objetivo principal? ',
          tipo: 'multipla_escolha',
          opcoes: ['Emagrecimento', 'Ganho de massa', 'Reeducação alimentar', 'Tratamento de doença'],
        },
        {
          id: 2,
          pergunta: 'Possui alguma restrição alimentar?',
          tipo: 'texto',
        },
        {
          id:  3,
          pergunta:  'Pratica atividade física? ',
          tipo: 'sim_nao',
        },
        {
          id: 4,
          pergunta: 'Quantas refeições faz por dia?',
          tipo: 'numero',
        },
        {
          id: 5,
          pergunta: 'Histórico de doenças na família',
          tipo: 'texto_longo',
        },
      ],
      ativo: true,
      obrigatorio: true,
    },
  })

  const formularioPsicologia = await prisma.formulario.create({
    data: {
      profissionalId: psicologo1.id,
      titulo: 'Avaliação Psicológica Inicial',
      descricao: 'Questionário para primeira consulta psicológica',
      tipo:  'PSICOLOGO',
      perguntas: [
        {
          id: 1,
          pergunta: 'O que te motivou a buscar atendimento psicológico?',
          tipo: 'texto_longo',
        },
        {
          id: 2,
          pergunta: 'Como você descreveria seu estado emocional atual?',
          tipo: 'multipla_escolha',
          opcoes: ['Muito bem', 'Bem', 'Neutro', 'Ansioso', 'Triste', 'Angustiado'],
        },
        {
          id: 3,
          pergunta: 'Já fez terapia anteriormente?',
          tipo: 'sim_nao',
        },
        {
          id:  4,
          pergunta:  'Está tomando alguma medicação psiquiátrica?',
          tipo: 'sim_nao',
        },
        {
          id: 5,
          pergunta: 'Histórico familiar de transtornos mentais',
          tipo: 'texto',
        },
      ],
      ativo: true,
      obrigatorio: true,
    },
  })

  const formularioGeral = await prisma.formulario. create({
    data: {
      titulo: 'Termo de Consentimento',
      descricao: 'Termo de consentimento para atendimento',
      tipo: null,
      perguntas: [
        {
          id: 1,
          pergunta: 'Li e concordo com os termos de uso',
          tipo: 'sim_nao',
        },
        {
          id: 2,
          pergunta: 'Autorizo o compartilhamento de dados para fins de tratamento',
          tipo: 'sim_nao',
        },
      ],
      ativo: true,
      obrigatorio: true,
    },
  })

  console.log('✅ Formulários criados')

  // Criar Respostas de Formulários
  await prisma.respostaFormulario.create({
    data: {
      formularioId: formularioNutricao.id,
      clienteId: cliente1.id,
      respostas: [
        { perguntaId: 1, resposta: 'Ganho de massa' },
        { perguntaId: 2, resposta: 'Intolerância à lactose' },
        { perguntaId: 3, resposta: true },
        { perguntaId: 4, resposta: 5 },
        { perguntaId: 5, resposta:  'Diabetes na família' },
      ],
    },
  })

  await prisma.respostaFormulario.create({
    data: {
      formularioId: formularioPsicologia.id,
      clienteId: cliente2.id,
      respostas: [
        { perguntaId: 1, resposta:  'Ansiedade e estresse no trabalho' },
        { perguntaId: 2, resposta: 'Ansioso' },
        { perguntaId: 3, resposta: false },
        { perguntaId: 4, resposta: false },
        { perguntaId: 5, resposta: 'Nenhum histórico conhecido' },
      ],
    },
  })

  console.log('✅ Respostas de formulários criadas')

  // Criar Agendamentos
  const agendamento1 = await prisma.agendamento.create({
    data: {
      profissionalId: nutricionista1.id,
      clienteId: cliente1.id,
      dataHora: new Date('2026-01-20T10:00:00'),
      duracao: 60,
      tipo: 'PRESENCIAL',
      status: 'CONFIRMADO',
      valor: 200.00,
      observacoes: 'Primeira consulta de avaliação',
    },
  })

  const agendamento2 = await prisma.agendamento.create({
    data: {
      profissionalId: psicologo1.id,
      clienteId: cliente2.id,
      dataHora: new Date('2026-01-18T14:00:00'),
      duracao: 50,
      tipo: 'ONLINE',
      status: 'CONFIRMADO',
      linkOnline: 'https://meet.google.com/abc-defg-hij',
      valor: 180.00,
    },
  })

  const agendamento3 = await prisma.agendamento.create({
    data: {
      profissionalId: nutricionista1.id,
      clienteId: cliente3.id,
      dataHora: new Date('2026-01-15T09:00:00'),
      duracao: 60,
      tipo: 'PRESENCIAL',
      status: 'CONCLUIDO',
      valor: 200.00,
    },
  })

  const agendamento4 = await prisma.agendamento.create({
    data: {
      profissionalId: psicologo1.id,
      clienteId: cliente4.id,
      dataHora: new Date('2026-01-22T16:00:00'),
      duracao: 50,
      tipo: 'ONLINE',
      status: 'PENDENTE',
      linkOnline:  'https://meet.google.com/xyz-abcd-efg',
      valor: 180.00,
    },
  })

  const agendamento5 = await prisma.agendamento.create({
    data: {
      profissionalId: nutricionista2.id,
      clienteId: cliente2.id,
      dataHora: new Date('2026-01-19T15:00:00'),
      duracao: 60,
      tipo: 'PRESENCIAL',
      status: 'CANCELADO',
      valor: 200.00,
      motivoCancelamento: 'Cliente solicitou reagendamento',
    },
  })

  console.log('✅ Agendamentos criados')

  // Criar Prontuários
  const prontuario1 = await prisma.prontuario.create({
    data: {
      agendamentoId: agendamento3.id,
      profissionalId: nutricionista1.id,
      clienteId: cliente3.id,
      anotacoes: 'Cliente apresenta boa disposição para mudanças alimentares.',
      diagnostico: 'Sobrepeso grau I, IMC 27.5',
      prescricao: 'Plano alimentar de 2000 kcal/dia, com 6 refeições',
      orientacoes: 'Aumentar consumo de água, reduzir alimentos processados',
      anexos: [
        { tipo: 'exame', url: '/uploads/exames/hemograma-cliente3.pdf', data: '2026-01-15' },
      ],
    },
  })

  console.log('✅ Prontuários criados')

  // Criar Evoluções
  await prisma.evolucao.create({
    data: {
      prontuarioId: prontuario1.id,
      data: new Date('2026-01-15T09:00:00'),
      titulo: 'Consulta Inicial',
      observacoes: 'Paciente motivado, aceitou bem as orientações.',
      medicoes: {
        peso: 82.5,
        altura: 1.75,
        imc: 27.5,
        circunferencia_cintura: 95,
        circunferencia_quadril: 102,
        percentual_gordura: 28,
      },
    },
  })

  await prisma.evolucao.create({
    data: {
      prontuarioId: prontuario1.id,
      data: new Date('2026-01-15T09:45:00'),
      titulo: 'Medidas Antropométricas',
      observacoes: 'Medidas coletadas conforme protocolo',
      medicoes: {
        peso: 82.5,
        altura: 1.75,
        imc: 27.5,
        circunferencia_braco: 32,
        circunferencia_coxa: 58,
        dobra_tricipital: 18,
        dobra_subescapular: 22,
      },
    },
  })

  console.log('✅ Evoluções criadas')

  console.log('🎉 Seed concluído com sucesso!')
  console.log('\n📊 Resumo: ')
  console.log(`   - ${await prisma.profissional.count()} profissionais`)
  console.log(`   - ${await prisma.cliente.count()} clientes`)
  console.log(`   - ${await prisma.disponibilidade.count()} disponibilidades`)
  console.log(`   - ${await prisma.formulario.count()} formulários`)
  console.log(`   - ${await prisma.respostaFormulario.count()} respostas de formulários`)
  console.log(`   - ${await prisma.agendamento.count()} agendamentos`)
  console.log(`   - ${await prisma.prontuario.count()} prontuários`)
  console.log(`   - ${await prisma.evolucao.count()} evoluções`)
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    //process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })