'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, TrendingUp, FileText, CheckCircle, Clock, Phone, Calendar, Download } from 'lucide-react';
import { Sidebar, StatusBadge, tipoVeiculoLabels, tipoServicoLabels } from '@/components/shared';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function FinanceiroPage() {
  const [user, setUser] = useState<any>(null);
  const [servicos, setServicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filtro, setFiltro] = useState('TODOS');
  const [detailModal, setDetailModal] = useState<any>(null);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      const [userRes, servRes] = await Promise.all([fetch('/api/auth/me'), fetch('/api/servicos')]);
      if (!userRes.ok) { router.push('/'); return; }
      setUser(await userRes.json());
      setServicos(await servRes.json());
    } catch { router.push('/'); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="loading" style={{ minHeight: '100vh' }}><div className="loading-spinner" /></div>;

  // Financial stats
  const concluidos = servicos.filter((s: any) => s.status === 'CONCLUIDO');
  const emAndamento = servicos.filter((s: any) => s.status === 'EM_ANDAMENTO');
  const agendados = servicos.filter((s: any) => s.status === 'AGENDADO');
  const comValor = servicos.filter((s: any) => s.valores);
  const semPagamento = servicos.filter((s: any) => !s.formaPagamento && s.status !== 'CANCELADO');

  // Filters
  const filtros = ['TODOS', 'CONCLUIDO', 'EM_ANDAMENTO', 'AGENDADO'];
  const filtroLabels: Record<string, string> = { TODOS: 'Todos', CONCLUIDO: 'Concluídos', EM_ANDAMENTO: 'Em Andamento', AGENDADO: 'Agendados' };
  const filtered = filtro === 'TODOS' ? servicos.filter((s: any) => s.status !== 'CANCELADO') : servicos.filter((s: any) => s.status === filtro);

  const exportCSV = () => {
    const headers = ['OS', 'Cliente', 'Local', 'Veículo', 'Data', 'Tipo Serviço', 'Valores', 'Pagamento', 'Contato', 'Status'];
    const rows = filtered.map((s: any) => [
      `#${s.id.toString().padStart(4, '0')}`,
      s.cliente,
      s.localidade,
      s.veiculo ? (s.veiculo.apelido || s.veiculo.nome) : 'A definir',
      new Date(s.dataInicio).toLocaleDateString('pt-BR'),
      tipoServicoLabels[s.tipoServico] || '',
      s.valores || '',
      s.formaPagamento || '',
      s.contatoPagamento || '',
      s.status,
    ]);
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `financeiro_klm_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="app-layout">
      <Sidebar user={user} sidebarOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Assuntos Financeiros</h1>
            <p className="page-subtitle">Controle financeiro de serviços e faturamento</p>
          </div>
          <button className="btn btn-secondary" onClick={exportCSV}>
            <Download size={16} /> Exportar CSV
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card green hover-card" onClick={() => setFiltro('CONCLUIDO')} style={{ cursor: 'pointer' }}>
            <div className="stat-icon green"><CheckCircle size={24} /></div>
            <div className="stat-value">{concluidos.length}</div>
            <div className="stat-label">Serviços Concluídos</div>
          </div>
          <div className="stat-card blue hover-card" onClick={() => setFiltro('EM_ANDAMENTO')} style={{ cursor: 'pointer' }}>
            <div className="stat-icon blue"><Clock size={24} /></div>
            <div className="stat-value">{emAndamento.length}</div>
            <div className="stat-label">Em Andamento</div>
          </div>
          <div className="stat-card amber hover-card" onClick={() => setFiltro('AGENDADO')} style={{ cursor: 'pointer' }}>
            <div className="stat-icon amber"><FileText size={24} /></div>
            <div className="stat-value">{agendados.length}</div>
            <div className="stat-label">Agendados</div>
          </div>
          <div className="stat-card purple hover-card" onClick={() => setFiltro('TODOS')} style={{ cursor: 'pointer' }}>
            <div className="stat-icon purple"><DollarSign size={24} /></div>
            <div className="stat-value">{comValor.length}</div>
            <div className="stat-label">Com Valor Definido</div>
          </div>
          {semPagamento.length > 0 && (
            <div className="stat-card red hover-card" onClick={() => setFiltro('TODOS')} style={{ cursor: 'pointer' }}>
              <div className="stat-icon red"><TrendingUp size={24} /></div>
              <div className="stat-value">{semPagamento.length}</div>
              <div className="stat-label">Sem Forma de Pagamento</div>
            </div>
          )}
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {filtros.map((f) => (
            <button key={f} className={`btn ${filtro === f ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setFiltro(f)}>
              {filtroLabels[f]} ({f === 'TODOS' ? servicos.filter((s: any) => s.status !== 'CANCELADO').length : servicos.filter((s: any) => s.status === f).length})
            </button>
          ))}
        </div>

        <div className="content-section" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>OS #</th>
                <th>Cliente/Solicitante</th>
                <th>Veículo</th>
                <th>Data</th>
                <th>Detalhes Financeiros</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s: any) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 700, color: 'var(--amber-400)' }}>#{s.id.toString().padStart(4, '0')}</td>
                  <td>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.88rem' }}>{s.cliente}</div>
                    {s.solicitante && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.solicitante}</div>}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {s.veiculo ? (s.veiculo.apelido || s.veiculo.nome) : (
                      <span style={{ color: 'var(--amber-400)' }}>{s.qtdVeiculos}x {tipoVeiculoLabels[s.tipoVeiculoSolicitado] || '?'}</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                    <Calendar size={13} style={{ marginRight: 3, verticalAlign: 'middle', color: 'var(--text-muted)' }} />
                    {new Date(s.dataInicio).toLocaleDateString('pt-BR')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ fontSize: '0.85rem' }}>
                        {s.valores ? (
                          <span style={{ color: 'var(--green-400)', fontWeight: 600 }}><DollarSign size={12} style={{ verticalAlign: 'middle' }} /> {s.valores}</span>
                        ) : <span style={{ color: 'var(--red-400)' }}>Não definido</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.formaPagamento || 'Pendente'}</div>
                      {s.contatoPagamento && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}>
                          <Phone size={10} style={{ color: 'var(--green-400)' }} /> {s.contatoPagamento}
                        </div>
                      )}
                    </div>
                  </td>
                  <td><StatusBadge status={s.status} /></td>
                  <td>
                    <button className="btn-icon" title="Ver detalhes" onClick={() => setDetailModal(s)}>
                      <FileText size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Nenhum serviço encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Detail Modal */}
        {detailModal && (
          <div className="modal-overlay" onClick={() => setDetailModal(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
              <div className="modal-header">
                <h3 className="modal-title">Detalhes — OS #{detailModal.id.toString().padStart(4, '0')}</h3>
                <button className="modal-close" onClick={() => setDetailModal(null)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="os-card">
                  <div className="os-card-body">
                    <div className="os-field"><FileText size={14} /><div><strong>Cliente:</strong> {detailModal.cliente}</div></div>
                    {detailModal.solicitante && <div className="os-field"><FileText size={14} /><div><strong>Solicitante:</strong> {detailModal.solicitante}</div></div>}
                    <div className="os-field"><FileText size={14} /><div><strong>Local:</strong> {detailModal.localidade}</div></div>
                    <div className="os-field"><Calendar size={14} /><div><strong>Data:</strong> {new Date(detailModal.dataInicio).toLocaleDateString('pt-BR')}{detailModal.dataFim ? ` até ${new Date(detailModal.dataFim).toLocaleDateString('pt-BR')}` : ''}</div></div>
                    <div className="os-field"><FileText size={14} /><div><strong>Veículo:</strong> {detailModal.veiculo ? (detailModal.veiculo.apelido || detailModal.veiculo.nome) : 'A definir'}</div></div>
                    {detailModal.funcionario && <div className="os-field"><FileText size={14} /><div><strong>Operador:</strong> {detailModal.funcionario.nome}</div></div>}
                    {detailModal.descricao && <div className="os-field"><FileText size={14} /><div><strong>Descrição:</strong> {detailModal.descricao}</div></div>}
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12, marginTop: 8 }}>
                      <div className="os-field"><DollarSign size={14} /><div><strong>Tipo:</strong> {tipoServicoLabels[detailModal.tipoServico] || '—'}</div></div>
                      <div className="os-field"><DollarSign size={14} /><div><strong>Valores:</strong> {detailModal.valores || 'Não definido'}</div></div>
                      <div className="os-field"><DollarSign size={14} /><div><strong>Pagamento:</strong> {detailModal.formaPagamento || 'Pendente'}</div></div>
                      {detailModal.contatoPagamento && <div className="os-field"><Phone size={14} /><div><strong>Contato:</strong> {detailModal.contatoPagamento}</div></div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
