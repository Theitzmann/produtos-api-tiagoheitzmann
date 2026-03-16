import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.servico.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.veiculo.deleteMany();
  await prisma.funcionario.deleteMany();

  // --- USERS (new roles) ---
  const comercial = await prisma.usuario.create({
    data: { nome: 'Dono KLM', email: 'comercial@klm.com', senha: await bcrypt.hash('klm2026', 10), cargo: 'COMERCIAL' },
  });
  const operacional = await prisma.usuario.create({
    data: { nome: 'Gerente Operacional', email: 'operacional@klm.com', senha: await bcrypt.hash('klm2026', 10), cargo: 'OPERACIONAL' },
  });
  await prisma.usuario.create({
    data: { nome: 'Financeiro KLM', email: 'financeiro@klm.com', senha: await bcrypt.hash('klm2026', 10), cargo: 'FINANCEIRO' },
  });

  // --- VEHICLES: 8 Muncks, 2 Guindastes, 2 Empilhadeiras ---
  const veiculos = await Promise.all([
    // 8 Muncks
    prisma.veiculo.create({ data: { nome: 'Munck Madal MD 12000', apelido: 'Munck 01', tipo: 'MUNCK', placa: 'KLM-1001', capacidade: 12, status: 'DISPONIVEL' } }),
    prisma.veiculo.create({ data: { nome: 'Munck Madal MD 15000', apelido: 'Munck 02', tipo: 'MUNCK', placa: 'KLM-1002', capacidade: 15, status: 'DISPONIVEL' } }),
    prisma.veiculo.create({ data: { nome: 'Munck Argos 20000', apelido: 'Munck 03', tipo: 'MUNCK', placa: 'KLM-1003', capacidade: 20, status: 'EM_USO' } }),
    prisma.veiculo.create({ data: { nome: 'Munck Argos 25000', apelido: 'Munck 04', tipo: 'MUNCK', placa: 'KLM-1004', capacidade: 25, status: 'DISPONIVEL' } }),
    prisma.veiculo.create({ data: { nome: 'Munck Madal MD 33000', apelido: 'Munck 05', tipo: 'MUNCK', placa: 'KLM-1005', capacidade: 33, status: 'MANUTENCAO' } }),
    prisma.veiculo.create({ data: { nome: 'Munck Madal MD 12000', apelido: 'Munck 06', tipo: 'MUNCK', placa: 'KLM-1006', capacidade: 12, status: 'DISPONIVEL' } }),
    prisma.veiculo.create({ data: { nome: 'Munck Argos 15000', apelido: 'Munck 07', tipo: 'MUNCK', placa: 'KLM-1007', capacidade: 15, status: 'DISPONIVEL' } }),
    prisma.veiculo.create({ data: { nome: 'Munck Madal MD 20000', apelido: 'Munck 08', tipo: 'MUNCK', placa: 'KLM-1008', capacidade: 20, status: 'DISPONIVEL' } }),
    // 2 Guindastes
    prisma.veiculo.create({ data: { nome: 'Guindaste Xcmg QY25K', apelido: 'Guindaste 25', tipo: 'GUINDASTE', placa: 'KLM-2001', capacidade: 25, status: 'DISPONIVEL' } }),
    prisma.veiculo.create({ data: { nome: 'Guindaste Tadano GR-400', apelido: 'Guindaste 40', tipo: 'GUINDASTE', placa: 'KLM-2002', capacidade: 40, status: 'EM_USO' } }),
    // 2 Empilhadeiras
    prisma.veiculo.create({ data: { nome: 'Empilhadeira Clark C25', apelido: 'Empilhadeira 01', tipo: 'EMPILHADEIRA', placa: 'KLM-3001', capacidade: 2.5, status: 'DISPONIVEL' } }),
    prisma.veiculo.create({ data: { nome: 'Empilhadeira Toyota 8FG25', apelido: 'Empilhadeira 02', tipo: 'EMPILHADEIRA', placa: 'KLM-3002', capacidade: 2.5, status: 'DISPONIVEL' } }),
  ]);

  // --- EMPLOYEES ---
  const funcionarios = await Promise.all([
    prisma.funcionario.create({ data: { nome: 'Joao Souza', funcao: 'OPERADOR', telefone: '(11) 99999-0001', status: 'TRABALHANDO' } }),
    prisma.funcionario.create({ data: { nome: 'Carlos Oliveira', funcao: 'OPERADOR', telefone: '(11) 99999-0002', status: 'FOLGA' } }),
    prisma.funcionario.create({ data: { nome: 'Pedro Santos', funcao: 'MOTORISTA', telefone: '(11) 99999-0003', status: 'TRABALHANDO' } }),
    prisma.funcionario.create({ data: { nome: 'Lucas Ferreira', funcao: 'AUXILIAR', telefone: '(11) 99999-0004', status: 'FOLGA' } }),
    prisma.funcionario.create({ data: { nome: 'Andre Lima', funcao: 'OPERADOR', telefone: '(11) 99999-0005', status: 'TRABALHANDO' } }),
    prisma.funcionario.create({ data: { nome: 'Ricardo Mendes', funcao: 'MOTORISTA', telefone: '(11) 99999-0006', status: 'FOLGA' } }),
  ]);

  // --- SAMPLE JOBS ---
  // Job 1: Specific vehicle assigned
  await prisma.servico.create({
    data: {
      cliente: 'Construtora ABC',
      localidade: 'Sao Paulo, SP - Av. Paulista, 1000',
      descricao: 'Icamento de estrutura metalica - andar 15',
      solicitante: 'Eng. Marcos Silva',
      contatoPagamento: '(11) 98765-4321',
      dataInicio: new Date('2026-03-10T08:00:00'),
      dataFim: new Date('2026-03-12T18:00:00'),
      status: 'EM_ANDAMENTO',
      tipoVeiculoSolicitado: 'GUINDASTE',
      veiculoId: veiculos[9].id, // Guindaste 40
      funcionarioId: funcionarios[0].id,
      tipoServico: 'POR_HORA',
      valores: 'R$ 450/hora',
      formaPagamento: 'Boleto 30 dias',
      criadoPorId: comercial.id,
    },
  });

  // Job 2: Only vehicle TYPE specified (two-step, no vehicle assigned yet)
  await prisma.servico.create({
    data: {
      cliente: 'Industria MetalSul',
      localidade: 'Guarulhos, SP - Rod. Presidente Dutra, Km 220',
      descricao: 'Montagem de silo industrial - precisa 2 Muncks',
      solicitante: 'Roberto Almeida',
      contatoPagamento: '(11) 91234-5678',
      dataInicio: new Date('2026-03-15T07:00:00'),
      status: 'AGENDADO',
      tipoVeiculoSolicitado: 'MUNCK',
      qtdVeiculos: 2,
      // veiculoId: NULL - to be assigned by operational manager
      tipoServico: 'POR_HORA_KM',
      valores: 'R$ 280/hora + R$ 3,50/km',
      formaPagamento: 'Transferencia',
      criadoPorId: comercial.id,
    },
  });

  // Job 3: Completed job
  await prisma.servico.create({
    data: {
      cliente: 'Porto de Santos',
      localidade: 'Santos, SP - Terminal Portuario',
      descricao: 'Descarregamento de container especial',
      solicitante: 'Ana Costa',
      contatoPagamento: '(13) 99876-5432',
      dataInicio: new Date('2026-03-08T06:00:00'),
      dataFim: new Date('2026-03-09T16:00:00'),
      status: 'CONCLUIDO',
      tipoVeiculoSolicitado: 'MUNCK',
      veiculoId: veiculos[2].id, // Munck 03
      funcionarioId: funcionarios[4].id,
      tipoServico: 'POR_HORA',
      valores: 'R$ 320/hora - Total: R$ 3.200',
      formaPagamento: 'Boleto 15 dias',
      criadoPorId: operacional.id,
    },
  });

  console.log('Seed KLM Guindastes concluido!');
  console.log('Logins: comercial@klm.com | operacional@klm.com | financeiro@klm.com');
  console.log('Senha padrao: klm2026');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
