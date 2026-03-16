import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { id } = await params;
  const servico = await prisma.servico.findUnique({
    where: { id: parseInt(id) },
    include: { veiculo: true, funcionario: true, criadoPor: { select: { id: true, nome: true } } },
  });
  if (!servico) return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 });
  return NextResponse.json(servico);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  try {
    const { id } = await params;
    const data = await request.json();

    // Backend validation on edit
    if (data.cliente !== undefined) {
      if (!data.cliente || typeof data.cliente !== 'string' || !data.cliente.trim()) {
        return NextResponse.json({ error: 'Nome do cliente não pode ser vazio' }, { status: 400 });
      }
    }
    if (data.localidade !== undefined) {
      if (!data.localidade || typeof data.localidade !== 'string' || !data.localidade.trim()) {
        return NextResponse.json({ error: 'Localidade não pode ser vazia' }, { status: 400 });
      }
    }
    if (data.dataInicio !== undefined) {
      if (!data.dataInicio) {
        return NextResponse.json({ error: 'Data de início não pode ser vazia' }, { status: 400 });
      }
    }
    if (data.tipoVeiculoSolicitado !== undefined) {
      if (!data.tipoVeiculoSolicitado || typeof data.tipoVeiculoSolicitado !== 'string' || !data.tipoVeiculoSolicitado.trim()) {
        return NextResponse.json({ error: 'Tipo de veículo solicitado não pode ser vazio' }, { status: 400 });
      }
    }

    if (data.contatoPagamento && typeof data.contatoPagamento === 'string' && data.contatoPagamento.trim()) {
      const digits = data.contatoPagamento.replace(/\D/g, '');
      if (digits.length !== 10 && digits.length !== 11) {
        return NextResponse.json({ error: 'Telefone de contato deve ter 10 ou 11 dígitos (formato brasileiro)' }, { status: 400 });
      }
    }

    const servico = await prisma.servico.update({
      where: { id: parseInt(id) },
      data: {
        ...(data.cliente && { cliente: data.cliente.trim() }),
        ...(data.localidade && { localidade: data.localidade.trim() }),
        ...(data.descricao !== undefined && { descricao: data.descricao?.trim() || null }),
        ...(data.solicitante !== undefined && { solicitante: data.solicitante?.trim() || null }),
        ...(data.contatoPagamento !== undefined && { contatoPagamento: data.contatoPagamento?.trim() || null }),
        ...(data.dataInicio && { dataInicio: new Date(data.dataInicio) }),
        ...(data.dataFim !== undefined && { dataFim: data.dataFim ? new Date(data.dataFim) : null }),
        ...(data.status && { status: data.status }),
        ...(data.tipoVeiculoSolicitado && { tipoVeiculoSolicitado: data.tipoVeiculoSolicitado }),
        ...(data.qtdVeiculos && { qtdVeiculos: parseInt(data.qtdVeiculos) }),
        ...(data.veiculoId !== undefined && { veiculoId: data.veiculoId ? parseInt(data.veiculoId) : null }),
        ...(data.funcionarioId !== undefined && { funcionarioId: data.funcionarioId ? parseInt(data.funcionarioId) : null }),
        ...(data.tipoServico !== undefined && { tipoServico: data.tipoServico }),
        ...(data.valores !== undefined && { valores: data.valores?.trim() || null }),
        ...(data.formaPagamento !== undefined && { formaPagamento: data.formaPagamento?.trim() || null }),
      },
      include: { veiculo: true, funcionario: true },
    });

    // If assigning a vehicle that wasn't assigned before, update vehicle status
    if (data.veiculoId && data.veiculoId !== 'null') {
      await prisma.veiculo.update({
        where: { id: parseInt(data.veiculoId) },
        data: { status: 'EM_USO' },
      });
    }
    if (data.funcionarioId && data.funcionarioId !== 'null') {
      await prisma.funcionario.update({
        where: { id: parseInt(data.funcionarioId) },
        data: { status: 'TRABALHANDO' },
      });
    }

    // If service is completed or cancelled, free up resources
    if (data.status === 'CONCLUIDO' || data.status === 'CANCELADO') {
      if (servico.veiculoId) {
        await prisma.veiculo.update({
          where: { id: servico.veiculoId },
          data: { status: 'DISPONIVEL' },
        });
      }
      if (servico.funcionarioId) {
        await prisma.funcionario.update({
          where: { id: servico.funcionarioId },
          data: { status: 'FOLGA' },
        });
      }
    }

    return NextResponse.json(servico);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar serviço';
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
    const servico = await prisma.servico.findUnique({ where: { id: parseInt(id) } });

    if (servico) {
      if (servico.veiculoId) {
        await prisma.veiculo.update({ where: { id: servico.veiculoId }, data: { status: 'DISPONIVEL' } });
      }
      if (servico.funcionarioId) {
        await prisma.funcionario.update({ where: { id: servico.funcionarioId }, data: { status: 'FOLGA' } });
      }
    }

    await prisma.servico.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao excluir serviço';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
