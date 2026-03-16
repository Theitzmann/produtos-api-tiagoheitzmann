import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const servicos = await prisma.servico.findMany({
    orderBy: { dataInicio: 'desc' },
    include: {
      veiculo: true,
      funcionario: true,
      criadoPor: { select: { id: true, nome: true } },
    },
  });
  return NextResponse.json(servicos);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  try {
    const data = await request.json();

    // Backend validation
    const errors: string[] = [];
    if (!data.cliente || typeof data.cliente !== 'string' || !data.cliente.trim()) errors.push('Nome do cliente é obrigatório e não pode ser vazio');
    if (!data.localidade || typeof data.localidade !== 'string' || !data.localidade.trim()) errors.push('Localidade é obrigatória e não pode ser vazia');
    if (!data.dataInicio) errors.push('Data de início é obrigatória e não pode ser vazia');
    if (!data.veiculoId && (!data.tipoVeiculoSolicitado || typeof data.tipoVeiculoSolicitado !== 'string' || !data.tipoVeiculoSolicitado.trim())) {
      errors.push('Especifique um veículo ou um tipo de veículo');
    }

    if (data.contatoPagamento && typeof data.contatoPagamento === 'string' && data.contatoPagamento.trim()) {
      const digits = data.contatoPagamento.replace(/\D/g, '');
      if (digits.length !== 10 && digits.length !== 11) {
        errors.push('Telefone de contato deve ter 10 ou 11 dígitos (formato brasileiro)');
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join('; ') }, { status: 400 });
    }

    const servico = await prisma.servico.create({
      data: {
        cliente: data.cliente.trim(),
        localidade: data.localidade.trim(),
        descricao: data.descricao?.trim() || null,
        solicitante: data.solicitante?.trim() || null,
        contatoPagamento: data.contatoPagamento?.trim() || null,
        dataInicio: new Date(data.dataInicio),
        dataFim: data.dataFim ? new Date(data.dataFim) : null,
        status: data.status || 'AGENDADO',
        tipoVeiculoSolicitado: data.tipoVeiculoSolicitado || null,
        qtdVeiculos: data.qtdVeiculos ? parseInt(data.qtdVeiculos) : 1,
        veiculoId: data.veiculoId ? parseInt(data.veiculoId) : null,
        funcionarioId: data.funcionarioId ? parseInt(data.funcionarioId) : null,
        tipoServico: data.tipoServico || null,
        valores: data.valores?.trim() || null,
        formaPagamento: data.formaPagamento?.trim() || null,
        criadoPorId: session.id,
      },
      include: { veiculo: true, funcionario: true },
    });

    if (data.veiculoId) {
      await prisma.veiculo.update({
        where: { id: parseInt(data.veiculoId) },
        data: { status: 'EM_USO' },
      });
    }
    if (data.funcionarioId) {
      await prisma.funcionario.update({
        where: { id: parseInt(data.funcionarioId) },
        data: { status: 'TRABALHANDO' },
      });
    }

    return NextResponse.json(servico, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao criar serviço';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
