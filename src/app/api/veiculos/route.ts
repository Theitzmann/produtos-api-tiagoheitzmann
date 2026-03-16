import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });

  const veiculos = await prisma.veiculo.findMany({
    orderBy: { nome: 'asc' },
    include: {
      servicos: {
        where: { status: { in: ['EM_ANDAMENTO', 'AGENDADO'] } },
        include: { funcionario: true },
      },
    },
  });
  return NextResponse.json(veiculos);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });

  try {
    const data = await request.json();
    const veiculo = await prisma.veiculo.create({
      data: {
        nome: data.nome,
        apelido: data.apelido || null,
        tipo: data.tipo,
        placa: data.placa,
        capacidade: data.capacidade ? parseFloat(data.capacidade) : null,
        status: data.status || 'DISPONIVEL',
        observacoes: data.observacoes || null,
      },
    });
    return NextResponse.json(veiculo, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao criar veiculo';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
