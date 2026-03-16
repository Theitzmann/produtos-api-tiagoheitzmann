const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  await prisma.servico.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.veiculo.deleteMany();
  await prisma.funcionario.deleteMany();

  const senhaHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.usuario.create({
    data: { nome: 'Administrador', email: 'admin@guindaste.com', senha: senhaHash, cargo: 'DONO' },
  });
  const secretaria = await prisma.usuario.create({
    data: { nome: 'Maria Silva', email: 'maria@guindaste.com', senha: await bcrypt.hash('maria123', 10), cargo: 'SECRETARIA' },
  });

  const veiculos = await Promise.all([
    prisma.veiculo.create({ data: { nome: 'Guindaste Liebherr LTM 1100', tipo: 'GUINDASTE', placa: 'ABC-1234', capacidade: 100, status: 'DISPONIVEL' } }),
    prisma.veiculo.create({ data: { nome: 'Guindaste Xcmg QY25K', tipo: 'GUINDASTE', placa: 'DEF-5678', capacidade: 25, status: 'EM_USO' } }),
    prisma.veiculo.create({ data: { nome: 'Caminhao Munck Madal 12000', tipo: 'MUNCK', placa: 'GHI-9012', capacidade: 12, status: 'DISPONIVEL' } }),
    prisma.veiculo.create({ data: { nome: 'Guindaste Tadano GR-1000XL', tipo: 'GUINDASTE', placa: 'JKL-3456', capacidade: 100, status: 'MANUTENCAO' } }),
    prisma.veiculo.create({ data: { nome: 'Caminhao Scania R450', tipo: 'CAMINHAO', placa: 'MNO-7890', capacidade: 30, status: 'DISPONIVEL' } }),
  ]);

  const funcionarios = await Promise.all([
    prisma.funcionario.create({ data: { nome: 'Joao Souza', funcao: 'OPERADOR', telefone: '(11) 99999-0001', status: 'TRABALHANDO' } }),
    prisma.funcionario.create({ data: { nome: 'Carlos Oliveira', funcao: 'OPERADOR', telefone: '(11) 99999-0002', status: 'FOLGA' } }),
    prisma.funcionario.create({ data: { nome: 'Pedro Santos', funcao: 'MOTORISTA', telefone: '(11) 99999-0003', status: 'TRABALHANDO' } }),
    prisma.funcionario.create({ data: { nome: 'Lucas Ferreira', funcao: 'AUXILIAR', telefone: '(11) 99999-0004', status: 'FOLGA' } }),
    prisma.funcionario.create({ data: { nome: 'Andre Lima', funcao: 'OPERADOR', telefone: '(11) 99999-0005', status: 'TRABALHANDO' } }),
  ]);

  await Promise.all([
    prisma.servico.create({ data: { cliente: 'Construtora ABC', localidade: 'Sao Paulo, SP - Av. Paulista, 1000', descricao: 'Icamento de estrutura metalica', dataInicio: new Date('2026-03-10T08:00:00'), dataFim: new Date('2026-03-12T18:00:00'), status: 'EM_ANDAMENTO', veiculoId: veiculos[1].id, funcionarioId: funcionarios[0].id, criadoPorId: admin.id } }),
    prisma.servico.create({ data: { cliente: 'Industria MetalSul', localidade: 'Guarulhos, SP - Rod. Presidente Dutra', descricao: 'Montagem de silo industrial', dataInicio: new Date('2026-03-15T07:00:00'), status: 'AGENDADO', veiculoId: veiculos[0].id, funcionarioId: funcionarios[2].id, criadoPorId: secretaria.id } }),
    prisma.servico.create({ data: { cliente: 'Porto de Santos', localidade: 'Santos, SP - Terminal Portuario', descricao: 'Descarregamento de container', dataInicio: new Date('2026-03-08T06:00:00'), dataFim: new Date('2026-03-09T16:00:00'), status: 'CONCLUIDO', veiculoId: veiculos[2].id, funcionarioId: funcionarios[4].id, criadoPorId: admin.id } }),
  ]);

  console.log('Seed concluido com sucesso!');
  console.log('Login: admin@guindaste.com / Senha: admin123');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
