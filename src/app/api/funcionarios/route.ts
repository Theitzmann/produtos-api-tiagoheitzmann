import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const funcionarios = await prisma.funcionario.findMany({
    orderBy: { nome: 'asc' },
    include: {
      servicos: {
        where: {
          status: { in: ['EM_ANDAMENTO', 'AGENDADO'] },
        },
        include: { veiculo: true },
      },
    },
  });
  return NextResponse.json(funcionarios);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  try {
    const data = await request.json();
    const funcionario = await prisma.funcionario.create({
      data: {
        nome: data.nome,
        funcao: data.funcao,
        telefone: data.telefone || null,
        status: data.status || 'FOLGA',
        observacoes: data.observacoes || null,
      },
    });
    return NextResponse.json(funcionario, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao criar funcionário';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
