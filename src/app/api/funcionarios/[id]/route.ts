import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  try {
    const { id } = await params;
    const data = await request.json();
    const funcionario = await prisma.funcionario.update({
      where: { id: parseInt(id) },
      data: {
        ...(data.nome && { nome: data.nome }),
        ...(data.funcao && { funcao: data.funcao }),
        ...(data.telefone !== undefined && { telefone: data.telefone }),
        ...(data.status && { status: data.status }),
        ...(data.observacoes !== undefined && { observacoes: data.observacoes }),
      },
    });
    return NextResponse.json(funcionario);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar funcionário';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.funcionario.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao excluir funcionário';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
