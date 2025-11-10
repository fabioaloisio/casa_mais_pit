/* eslint-disable no-case-declarations */
import React, { useState, useEffect, useMemo } from 'react';
import { VendaService } from '../services/vendaService';
import { ProdutoService } from '../services/produtoService';
import Toast from '../components/common/Toast';
import FormModal from '../components/common/FormModal';
import ConfirmModal from '../components/common/ConfirmModal';
import { Form, Card, Row, Col } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaDollarSign, FaChartLine, FaShoppingCart, FaSort, FaSortUp, FaSortDown, FaTimes } from 'react-icons/fa';
import { formatCurrency } from '@casa-mais/shared';
import './Doacoes.css';

const GerenciarVendas = () => {
  const [vendas, setVendas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    produto_id: '',
    quantidade: 1,
    desconto: 0,
    forma_pagamento: 'Dinheiro',
    observacoes: '',
    data_venda: new Date().toISOString().split('T')[0]
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [filtroNome, setFiltroNome] = useState('');

  const [ordenacao, setOrdenacao] = useState({ campo: 'data_venda', direcao: 'desc' });

  const [stats, setStats] = useState({
    totalVendas: 0,
    totalValorVendido: 0,
    totalLucroEstimado: 0,
    totalCustoEstimado: 0,
    mediaPorVenda: 0,
    vendasHoje: 0
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [vendasData, produtosData] = await Promise.all([
        VendaService.obterTodos(),
        ProdutoService.obterTodos()
      ]);
      setVendas(vendasData);
      setProdutos(produtosData);
      calcularEstatisticas(vendasData);
    } catch (error) {
      mostrarToast('Erro ao carregar dados: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const calcularEstatisticas = (vendasData) => {
    const hoje = new Date().toISOString().split('T')[0];
    const vendasHoje = vendasData.filter(v => v.data_venda === hoje);

    const totalVendas = vendasData.length;
    const totalValorVendido = vendasData.reduce((sum, v) => sum + parseFloat(v.valor_final || 0), 0);
    const totalLucroEstimado = vendasData.reduce((sum, v) => sum + parseFloat(v.lucro_estimado || 0), 0);
    const totalCustoEstimado = vendasData.reduce((sum, v) => sum + parseFloat(v.custo_estimado_total || 0), 0);
    const mediaPorVenda = totalVendas > 0 ? totalValorVendido / totalVendas : 0;

    setStats({
      totalVendas,
      totalValorVendido,
      totalLucroEstimado,
      totalCustoEstimado,
      mediaPorVenda,
      vendasHoje: vendasHoje.length
    });
  };

  const carregarVendasFiltradas = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filtroDataInicio) filters.data_inicio = filtroDataInicio;
      if (filtroDataFim) filters.data_fim = filtroDataFim;
      const vendasData = await VendaService.obterTodos(filters);
      setVendas(vendasData);
      calcularEstatisticas(vendasData);
    } catch (error) {
      mostrarToast('Erro ao carregar vendas: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filtroDataInicio || filtroDataFim) {
      carregarVendasFiltradas();
    } else {
      carregarDados();
    }
  }, [filtroDataInicio, filtroDataFim]);

  const limparFiltros = () => {
    setFiltroDataInicio('');
    setFiltroDataFim('');
    setFiltroNome('');
    setOrdenacao({ campo: 'data_venda', direcao: 'desc' });
  };

  const toggleOrdenacao = (campo) => {
    setOrdenacao(prev => ({
      campo,
      direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc'
    }));
  };

  const IconeOrdenacao = ({ campo }) => {
    if (ordenacao.campo !== campo) {
      return <FaSort className="ms-1" style={{ opacity: 0.3 }} />;
    }
    return ordenacao.direcao === 'asc'
      ? <FaSortUp className="ms-1" />
      : <FaSortDown className="ms-1" />;
  };

  const vendasFiltradas = useMemo(() => {
    let resultado = [...vendas];

    if (filtroNome) {
      const nomeLower = filtroNome.toLowerCase();
      resultado = resultado.filter(venda => {
        const produto = produtos.find(p => p.id === venda.produto_id);
        return produto?.nome?.toLowerCase().includes(nomeLower);
      });
    }

    resultado.sort((a, b) => {
      let valorA, valorB;

      switch (ordenacao.campo) {
        case 'produto':
          const produtoA = produtos.find(p => p.id === a.produto_id);
          const produtoB = produtos.find(p => p.id === b.produto_id);
          valorA = produtoA?.nome || '';
          valorB = produtoB?.nome || '';
          break;

        case 'data_venda':
          valorA = new Date(a.data_venda);
          valorB = new Date(b.data_venda);
          break;

        case 'quantidade':
          valorA = a.quantidade;
          valorB = b.quantidade;
          break;

        case 'valor_bruto':
        case 'desconto':
        case 'valor_final':
        case 'custo_estimado_total':
        case 'lucro_estimado':
          valorA = parseFloat(a[ordenacao.campo]) || 0;
          valorB = parseFloat(b[ordenacao.campo]) || 0;
          break;

        case 'forma_pagamento':
          valorA = a.forma_pagamento || '';
          valorB = b.forma_pagamento || '';
          break;

        default:
          return 0;
      }

      if (valorA < valorB) return ordenacao.direcao === 'asc' ? -1 : 1;
      if (valorA > valorB) return ordenacao.direcao === 'asc' ? 1 : -1;
      return 0;
    });

    return resultado;
  }, [vendas, produtos, filtroNome, ordenacao]);

  useEffect(() => {
    calcularEstatisticas(vendasFiltradas);
  }, [vendasFiltradas]);

  const mostrarToast = (mensagem, tipo = 'success') => {
    setToast({ show: true, message: mensagem, type: tipo });
  };

  const abrirModal = (item = null) => {
    if (item) {
      setSelectedItem(item);

      let dataFormatada = item.data_venda;
      if (dataFormatada) {
        dataFormatada = dataFormatada.split('T')[0];
      }

      setFormData({
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        desconto: item.desconto,
        forma_pagamento: item.forma_pagamento,
        observacoes: item.observacoes || '',
        data_venda: dataFormatada || new Date().toISOString().split('T')[0]
      });
    } else {
      setSelectedItem(null);
      setFormData({
        produto_id: '',
        quantidade: 1,
        desconto: 0,
        forma_pagamento: 'Dinheiro',
        observacoes: '',
        data_venda: new Date().toISOString().split('T')[0]
      });
    }
    setShowModal(true);
  };

  const fecharModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.produto_id) {
        mostrarToast('Selecione um produto', 'error');
        return;
      }

      if (!formData.data_venda) {
        mostrarToast('Selecione uma data para a venda', 'error');
        return;
      }

      const data = {
        ...formData,
        produto_id: parseInt(formData.produto_id),
        quantidade: parseInt(formData.quantidade),
        desconto: parseFloat(formData.desconto) || 0,
        data_venda: formData.data_venda
      };

      if (selectedItem) {
        await VendaService.atualizar(selectedItem.id, data);
        mostrarToast('Venda atualizada com sucesso!', 'success');
      } else {
        await VendaService.criar(data);
        mostrarToast('Venda cadastrada com sucesso!', 'success');
      }
      fecharModal();
      await carregarDados();
    } catch (error) {
      mostrarToast('Erro ao salvar: ' + error.message, 'error');
    }
  };

  const abrirModalExcluir = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmarExclusao = async () => {
    try {
      await VendaService.excluir(selectedItem.id);
      mostrarToast('Venda excluída com sucesso!', 'success');
      setShowDeleteModal(false);
      setSelectedItem(null);
      await carregarDados();
    } catch (error) {
      mostrarToast('Erro ao excluir: ' + error.message, 'error');
    }
  };

  const produtoSelecionado = produtos.find(p => p.id === parseInt(formData.produto_id));
  const valorBruto = produtoSelecionado ? produtoSelecionado.preco_venda * formData.quantidade : 0;
  const valorFinal = valorBruto - (parseFloat(formData.desconto) || 0);

  const temFiltrosAtivos = filtroDataInicio || filtroDataFim || filtroNome;

  return (
    <div className="conteudo">
      <div className="topo">
        <h1>Gerenciar Vendas</h1>
        <p>Registre e gerencie as vendas de produtos</p>
      </div>

      {/* Dashboard de Estatísticas */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaShoppingCart size={30} className="text-primary" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Total de Vendas</h6>
                <h4 className="mb-0">{stats.totalVendas}</h4>
                <small className="text-muted">Vendas hoje: {stats.vendasHoje}</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaDollarSign size={30} className="text-success" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Valor Vendido</h6>
                <h4 className="mb-0">{formatCurrency(stats.totalValorVendido)}</h4>
                <small className="text-muted">Média: {formatCurrency(stats.mediaPorVenda)}</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaChartLine size={30} className="text-info" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Lucro Estimado</h6>
                <h4 className="mb-0">{formatCurrency(stats.totalLucroEstimado)}</h4>
                <small className="text-muted">
                  {stats.totalValorVendido > 0
                    ? `${((stats.totalLucroEstimado / stats.totalValorVendido) * 100).toFixed(2)}% de margem`
                    : '0% de margem'
                  }
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaDollarSign size={30} className="text-warning" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Custo Estimado</h6>
                <h4 className="mb-0">{formatCurrency(stats.totalCustoEstimado)}</h4>
                <small className="text-muted">
                  {stats.totalValorVendido > 0
                    ? `${((stats.totalCustoEstimado / stats.totalValorVendido) * 100).toFixed(2)}% do valor vendido`
                    : '0% do valor vendido'
                  }
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="top-bar">
        <button className="btn-cadastrar" onClick={() => abrirModal()}>
          <FaPlus /> Registrar Venda
        </button>

        <div className="filtros" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Buscar por produto..."
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            className="input-filtro"
            style={{ minWidth: '200px' }}
          />
          <input
            type="date"
            placeholder="Data início"
            value={filtroDataInicio}
            onChange={(e) => setFiltroDataInicio(e.target.value)}
            className="input-filtro"
          />
          <input
            type="date"
            placeholder="Data fim"
            value={filtroDataFim}
            onChange={(e) => setFiltroDataFim(e.target.value)}
            className="input-filtro"
          />
          {temFiltrosAtivos && (
            <button
              onClick={limparFiltros}
              className="btn-excluir"
              style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
              title="Limpar filtros"
            >
              <FaTimes /> Limpar
            </button>
          )}
        </div>
      </div>

      {temFiltrosAtivos && (
        <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px', fontSize: '14px' }}>
          <strong>Filtros ativos:</strong>
          {filtroNome && <span style={{ marginLeft: '10px' }}>Produto: "{filtroNome}"</span>}
          {filtroDataInicio && <span style={{ marginLeft: '10px' }}>De: {new Date(filtroDataInicio + 'T00:00:00').toLocaleDateString('pt-BR')}</span>}
          {filtroDataFim && <span style={{ marginLeft: '10px' }}>Até: {new Date(filtroDataFim + 'T00:00:00').toLocaleDateString('pt-BR')}</span>}
          <span style={{ marginLeft: '10px', color: '#6c757d' }}>({vendasFiltradas.length} resultado{vendasFiltradas.length !== 1 ? 's' : ''})</span>
        </div>
      )}

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="tabela-container">
          <table className="tabela">
            <thead>
              <tr>
                <th onClick={() => toggleOrdenacao('data_venda')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Data <IconeOrdenacao campo="data_venda" />
                </th>
                <th onClick={() => toggleOrdenacao('produto')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Produto <IconeOrdenacao campo="produto" />
                </th>
                <th onClick={() => toggleOrdenacao('quantidade')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Quantidade <IconeOrdenacao campo="quantidade" />
                </th>
                <th onClick={() => toggleOrdenacao('valor_bruto')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Valor Bruto <IconeOrdenacao campo="valor_bruto" />
                </th>
                <th onClick={() => toggleOrdenacao('desconto')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Desconto <IconeOrdenacao campo="desconto" />
                </th>
                <th onClick={() => toggleOrdenacao('valor_final')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Valor Final <IconeOrdenacao campo="valor_final" />
                </th>
                <th onClick={() => toggleOrdenacao('custo_estimado_total')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Custo Estimado <IconeOrdenacao campo="custo_estimado_total" />
                </th>
                <th onClick={() => toggleOrdenacao('lucro_estimado')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Lucro Estimado <IconeOrdenacao campo="lucro_estimado" />
                </th>
                <th onClick={() => toggleOrdenacao('forma_pagamento')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Forma Pagamento <IconeOrdenacao campo="forma_pagamento" />
                </th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {vendasFiltradas.length > 0 ? (
                vendasFiltradas.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.data_venda).toLocaleDateString('pt-BR')}</td>
                    <td>
                      {produtos.find(p => p.id === item.produto_id)?.nome || '-'}
                    </td>
                    <td>{item.quantidade}</td>
                    <td>{formatCurrency(item.valor_bruto)}</td>
                    <td>{formatCurrency(item.desconto)}</td>
                    <td>{formatCurrency(item.valor_final)}</td>
                    <td>{formatCurrency(item.custo_estimado_total)}</td>
                    <td>{formatCurrency(item.lucro_estimado)}</td>
                    <td>{item.forma_pagamento}</td>
                    <td>
                      <button className="btn-editar" onClick={() => abrirModal(item)}>
                        <FaEdit /> Editar
                      </button>
                      <button className="btn-excluir" onClick={() => abrirModalExcluir(item)}>
                        <FaTrash /> Excluir
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="nenhum-registro">
                    {temFiltrosAtivos
                      ? 'Nenhuma venda encontrada com os filtros aplicados.'
                      : 'Nenhuma venda encontrada.'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <FormModal
        show={showModal}
        onHide={fecharModal}
        onSubmit={handleSubmit}
        title={selectedItem ? 'Editar Venda' : 'Registrar Venda'}
      >
        <Form.Group className="mb-3">
          <Form.Label>Produto *</Form.Label>
          <Form.Select
            value={formData.produto_id}
            onChange={(e) => setFormData({ ...formData, produto_id: e.target.value })}
            required
          >
            <option value="">Selecione um produto</option>
            {produtos.map((produto) => (
              <option key={produto.id} value={produto.id}>
                {produto.nome} - {formatCurrency(produto.preco_venda)}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Data da Venda *</Form.Label>
          <Form.Control
            type="date"
            value={formData.data_venda}
            onChange={(e) => setFormData({ ...formData, data_venda: e.target.value })}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Quantidade *</Form.Label>
          <Form.Control
            type="number"
            min="1"
            value={formData.quantidade}
            onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
            required
          />
        </Form.Group>

        {produtoSelecionado && (
          <div className="mb-3 p-3 bg-light rounded">
            <strong>Valor Bruto:</strong> {formatCurrency(valorBruto)}<br />
            <strong>Valor Final (após desconto):</strong> {formatCurrency(valorFinal)}
          </div>
        )}

        <Form.Group className="mb-3">
          <Form.Label>Desconto</Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            min="0"
            value={formData.desconto}
            onChange={(e) => setFormData({ ...formData, desconto: e.target.value })}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Forma de Pagamento *</Form.Label>
          <Form.Select
            value={formData.forma_pagamento}
            onChange={(e) => setFormData({ ...formData, forma_pagamento: e.target.value })}
            required
          >
            <option value="Pix">Pix</option>
            <option value="Dinheiro">Dinheiro</option>
            <option value="Débito">Débito</option>
            <option value="Crédito">Crédito</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Observações</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
          />
        </Form.Group>
      </FormModal>

      <ConfirmModal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setSelectedItem(null);
        }}
        onConfirm={confirmarExclusao}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir esta venda?`}
      />

      <Toast
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        message={toast.message}
        type={toast.type}
      />
    </div>
  );
};

export default GerenciarVendas;
