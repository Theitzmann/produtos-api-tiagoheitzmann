import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });

  try {
    const { id } = await params;
    const data = await request.json();
    const veiculo = await prisma.veiculo.update({
      where: { id: parseInt(id) },
      data: {
        ...(data.nome && { nome: data.nome }),
        ...(data.apelido !== undefined && { apelido: data.apelido || null }),
        ...(data.tipo && { tipo: data.tipo }),
        ...(data.placa && { placa: data.placa }),
        ...(data.capacidade !== undefined && { capacidade: data.capacidade ? parseFloat(data.capacidade) : null }),
        ...(data.status && { status: data.status }),
        ...(data.observacoes !== undefined && { observacoes: data.observacoes }),
      },
    });
    return NextResponse.json(veiculo);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar veiculo';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.veiculo.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao excluir veiculo';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
