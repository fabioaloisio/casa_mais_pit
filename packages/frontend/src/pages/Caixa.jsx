import { useState, useEffect } from 'react';
import { Button, Table, Form, Card, Row, Col, Modal, Alert, Badge } from 'react-bootstrap';
import {
  FaPlus,
  FaSearch,
  FaDollarSign,
  FaArrowUp,
  FaArrowDown,
  FaChartLine,
  FaCalendarAlt,
  FaMoneyBillWave as FaCash,
  FaExchangeAlt,
  FaCheck,
  FaTimes,
  FaEye,
  FaMoneyBillWave,
  FaGift,
  FaReceipt
} from 'react-icons/fa';
import caixaService from '../services/caixaService';
import { formatCurrency } from '@casa-mais/shared';
import Toast from '../components/common/Toast';
import DoacoesNavegacao from '../components/common/DoacoesNavegacao';
import InfoTooltip from '../utils/tooltip';
import './Doacoes.css';

const Caixa = () => {
  const [saldo, setSaldo] = useState(0);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [movimentacoesRecentes, setMovimentacoesRecentes] = useState([]);
  const [estatisticas, setEstatisticas] = useState({
    totalEntradas: 0,
    totalSaidas: 0,
    saldoMesAtual: 0,
    totalDoacoes: 0
  });

  const [filtroData, setFiltroData] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [showModalDoacao, setShowModalDoacao] = useState(false);
  const [showModalFechamento, setShowModalFechamento] = useState(false);
  const [showModalDetalhes, setShowModalDetalhes] = useState(false);
  const [movimentacaoSelecionada, setMovimentacaoSelecionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [formDoacao, setFormDoacao] = useState({
    valor: '',
    doador_nome: '',
    doador_documento: '',
    descricao: '',
    forma_pagamento: 'dinheiro',
    data_movimentacao: new Date().toISOString().split('T')[0]
  });

  const [formFechamento, setFormFechamento] = useState({
    data_fechamento: new Date().toISOString().split('T')[0],
    saldo_inicial: '',
    total_entradas: '',
    total_saidas: '',
    saldo_final: '',
    observacoes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [saldoData, movimentacoesData, recentesData, estatisticasData] = await Promise.all([
        caixaService.getSaldo(),
        caixaService.getMovimentacoes(),
        caixaService.getMovimentacoesRecentes(),
        caixaService.getEstatisticas()
      ]);

      setSaldo(saldoData.data?.saldo_atual || 0);
      setMovimentacoes(movimentacoesData.data || []);
      setMovimentacoesRecentes(recentesData.data || []);
      setEstatisticas(estatisticasData.data || {});
    } catch (error) {
      setToast({
        show: true,
        message: 'Erro ao carregar dados do caixa. Verifique sua conexão.',
        type: 'danger'
      });
      console.error('Erro ao carregar dados do caixa:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLancarDoacao = async (e) => {
    e.preventDefault();
    try {
      const dadosDoacao = {
        ...formDoacao,
        valor: parseFloat(formDoacao.valor.replace(/[^\d,.-]/g, '').replace(',', '.'))
      };

      await caixaService.lancarDoacao(dadosDoacao);
      setToast({
        show: true,
        message: 'Doação lançada com sucesso!',
        type: 'success'
      });
      await loadData();
      setShowModalDoacao(false);
      setFormDoacao({
        valor: '',
        doador_nome: '',
        doador_documento: '',
        descricao: '',
        forma_pagamento: 'dinheiro',
        data_movimentacao: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      setToast({
        show: true,
        message: error.message || 'Erro ao lançar doação.',
        type: 'danger'
      });
    }
  };

  const handleFechamentoDiario = async (e) => {
    e.preventDefault();
    try {
      await caixaService.fechamentoDiario(formFechamento);
      setToast({
        show: true,
        message: 'Fechamento diário realizado com sucesso!',
        type: 'success'
      });
      await loadData();
      setShowModalFechamento(false);
    } catch (error) {
      setToast({
        show: true,
        message: error.message || 'Erro ao realizar fechamento.',
        type: 'danger'
      });
    }
  };

  const prepararFechamento = () => {
    const hoje = new Date().toISOString().split('T')[0];
    const movimentacoesHoje = movimentacoes.filter(mov =>
      mov.data_movimentacao === hoje
    );

    const totalEntradas = movimentacoesHoje
      .filter(mov => mov.tipo === 'entrada')
      .reduce((acc, mov) => acc + parseFloat(mov.valor), 0);

    const totalSaidas = movimentacoesHoje
      .filter(mov => mov.tipo === 'saida')
      .reduce((acc, mov) => acc + parseFloat(mov.valor), 0);

    setFormFechamento({
      data_fechamento: hoje,
      saldo_inicial: (saldo - totalEntradas + totalSaidas).toFixed(2),
      total_entradas: totalEntradas.toFixed(2),
      total_saidas: totalSaidas.toFixed(2),
      saldo_final: saldo.toFixed(2),
      observacoes: ''
    });

    setShowModalFechamento(true);
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'entrada':
        return <FaArrowUp className="text-success" />;
      case 'saida':
        return <FaArrowDown className="text-danger" />;
      default:
        return <FaExchangeAlt className="text-muted" />;
    }
  };

  const getCategoriaIcon = (categoria) => {
    switch (categoria) {
      case 'doacao':
        return <FaGift className="text-primary me-1" />;
      case 'despesa':
        return <FaReceipt className="text-warning me-1" />;
      case 'receita':
        return <FaMoneyBillWave className="text-success me-1" />;
      default:
        return <FaCash className="text-muted me-1" />;
    }
  };

  const movimentacoesFiltradas = movimentacoes.filter(mov => {
    const matchesData = !filtroData || mov.data_movimentacao.includes(filtroData);
    const matchesTipo = filtroTipo === 'todos' || mov.tipo === filtroTipo;
    return matchesData && matchesTipo;
  });

  const formatarFormaPagamento = (forma) => {
    switch (forma) {
      case 'dinheiro': return 'Dinheiro';
      case 'cartao_credito': return 'Cartão de Crédito';
      case 'cartao_debito': return 'Cartão de Débito';
      case 'pix': return 'PIX';
      case 'transferencia': return 'Transferência';
      case 'cheque': return 'Cheque';
      default: return forma;
    }
  };

  return (
    <div className="conteudo">
      <div className="topo">
        <h1>Caixa Financeiro</h1>
        <p>
          Controle financeiro da instituição. Gerencie doações, receitas, despesas
          e realize o fechamento diário do caixa.
        </p>
      </div>

      {/* Navegação entre tipos de doações */}
      <DoacoesNavegacao />

      {/* Saldo Atual em Destaque */}
      <Row className="mb-4">
        <Col md={12}>
          <Card className="text-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Card.Body className="py-4">
              <h2 className="mb-1">Saldo Atual</h2>
              <h1 className="display-4 fw-bold">{formatCurrency(saldo)}</h1>
              <p className="mb-0 opacity-75">Atualizado em tempo real</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Cards de Estatísticas */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaArrowUp size={30} className="text-success" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Entradas do Mês</h6>
                <h4 className="mb-0">{formatCurrency(estatisticas.totalEntradas)}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaArrowDown size={30} className="text-danger" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Saídas do Mês</h6>
                <h4 className="mb-0">{formatCurrency(estatisticas.totalSaidas)}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaGift size={30} className="text-primary" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Doações do Mês</h6>
                <h4 className="mb-0">{formatCurrency(estatisticas.totalDoacoes)}</h4>
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
                <h6 className="mb-0 text-muted">Resultado Mensal</h6>
                <h4 className="mb-0">{formatCurrency(estatisticas.saldoMesAtual)}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Ações Principais */}
      <Row className="mb-4">
        <Col md={6}>
          <div className="d-flex gap-2">
            <Button
              className="azul d-flex align-items-center gap-2"
              onClick={() => setShowModalDoacao(true)}
            >
              <FaPlus /> Lançar Doação
              <InfoTooltip
                texto="Registre uma doação monetária recebida pela instituição. Informe o valor, dados do doador, forma de pagamento (dinheiro, PIX, transferência) e data. Isso aumenta o saldo do caixa e registra a entrada de recursos."
              />
            </Button>
            <Button
              variant="success"
              className="d-flex align-items-center gap-2"
              onClick={prepararFechamento}
            >
              <FaCalendarAlt /> Fechamento Diário
            </Button>
          </div>
        </Col>
        <Col md={6}>
          <div className="d-flex align-items-center gap-2 justify-content-end">
            <Form.Control
              type="date"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
              style={{ width: '200px' }}
            />
            <Form.Select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              style={{ width: '150px' }}
            >
              <option value="todos">Todos</option>
              <option value="entrada">Entradas</option>
              <option value="saida">Saídas</option>
            </Form.Select>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Movimentações Recentes */}
        <Col md={6}>
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Movimentações Recentes</h5>
              <Badge bg="secondary">{movimentacoesRecentes.length}</Badge>
            </Card.Header>
            <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {loading ? (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                  </div>
                </div>
              ) : movimentacoesRecentes.length === 0 ? (
                <div className="text-center text-muted py-3">
                  <p>Nenhuma movimentação recente</p>
                </div>
              ) : (
                movimentacoesRecentes.map(mov => (
                  <div key={mov.id} className="border-bottom pb-2 mb-2">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="d-flex align-items-center">
                        {getTipoIcon(mov.tipo)}
                        <div className="ms-2">
                          <div className="fw-semibold">{mov.descricao}</div>
                          <small className="text-muted">
                            {getCategoriaIcon(mov.categoria)}
                            {mov.categoria} • {formatarFormaPagamento(mov.forma_pagamento)}
                          </small>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className={`fw-bold ${mov.tipo === 'entrada' ? 'text-success' : 'text-danger'}`}>
                          {mov.tipo === 'entrada' ? '+' : '-'}{formatCurrency(mov.valor)}
                        </div>
                        <small className="text-muted">
                          {new Date(mov.data_movimentacao).toLocaleDateString('pt-BR')}
                        </small>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Gráfico Simples de Entradas vs Saídas */}
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Visão Geral - Este Mês</h5>
            </Card.Header>
            <Card.Body className="d-flex flex-column justify-content-center">
              <Row className="text-center">
                <Col>
                  <div className="mb-3">
                    <FaArrowUp size={40} className="text-success mb-2" />
                    <h6>Entradas</h6>
                    <h4 className="text-success">{formatCurrency(estatisticas.totalEntradas)}</h4>
                  </div>
                </Col>
                <Col>
                  <div className="mb-3">
                    <FaArrowDown size={40} className="text-danger mb-2" />
                    <h6>Saídas</h6>
                    <h4 className="text-danger">{formatCurrency(estatisticas.totalSaidas)}</h4>
                  </div>
                </Col>
              </Row>
              <hr />
              <div className="text-center">
                <h6>Resultado</h6>
                <h3 className={estatisticas.saldoMesAtual >= 0 ? 'text-success' : 'text-danger'}>
                  {formatCurrency(estatisticas.saldoMesAtual)}
                </h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabela Completa de Movimentações */}
      <div className="mt-4">
        <h5>Histórico de Movimentações</h5>
        <div className="tabela-container">
          <Table className="tabela-assistidas" hover responsive>
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Categoria</th>
                <th>Descrição</th>
                <th>Forma de Pagamento</th>
                <th>Valor</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="d-flex justify-content-center align-items-center">
                      <div className="spinner-border text-primary me-2" role="status">
                        <span className="visually-hidden">Carregando...</span>
                      </div>
                      Carregando movimentações...
                    </div>
                  </td>
                </tr>
              ) : movimentacoesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="text-muted">
                      <p className="mb-0">Nenhuma movimentação encontrada</p>
                      <small>Tente ajustar os filtros</small>
                    </div>
                  </td>
                </tr>
              ) : (
                movimentacoesFiltradas.map(mov => (
                  <tr key={mov.id}>
                    <td>{new Date(mov.data_movimentacao).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        {getTipoIcon(mov.tipo)}
                        <span className="ms-2">
                          <Badge bg={mov.tipo === 'entrada' ? 'success' : 'danger'}>
                            {mov.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                          </Badge>
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        {getCategoriaIcon(mov.categoria)}
                        <span className="text-capitalize">{mov.categoria}</span>
                      </div>
                    </td>
                    <td>{mov.descricao}</td>
                    <td>{formatarFormaPagamento(mov.forma_pagamento)}</td>
                    <td>
                      <span className={`fw-bold ${mov.tipo === 'entrada' ? 'text-success' : 'text-danger'}`}>
                        {mov.tipo === 'entrada' ? '+' : '-'}{formatCurrency(mov.valor)}
                      </span>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-info"
                        onClick={() => {
                          setMovimentacaoSelecionada(mov);
                          setShowModalDetalhes(true);
                        }}
                      >
                        <FaEye /> Detalhes
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Modal para Lançar Doação */}
      <Modal show={showModalDoacao} onHide={() => setShowModalDoacao(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Lançar Doação Monetária</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleLancarDoacao}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Valor da Doação *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formDoacao.valor}
                    onChange={(e) => setFormDoacao({...formDoacao, valor: e.target.value})}
                    placeholder="R$ 0,00"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data da Doação *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formDoacao.data_movimentacao}
                    onChange={(e) => setFormDoacao({...formDoacao, data_movimentacao: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nome do Doador</Form.Label>
                  <Form.Control
                    type="text"
                    value={formDoacao.doador_nome}
                    onChange={(e) => setFormDoacao({...formDoacao, doador_nome: e.target.value})}
                    placeholder="Nome do doador (opcional)"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>CPF/CNPJ do Doador</Form.Label>
                  <Form.Control
                    type="text"
                    value={formDoacao.doador_documento}
                    onChange={(e) => setFormDoacao({...formDoacao, doador_documento: e.target.value})}
                    placeholder="000.000.000-00"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Forma de Pagamento *</Form.Label>
              <Form.Select
                value={formDoacao.forma_pagamento}
                onChange={(e) => setFormDoacao({...formDoacao, forma_pagamento: e.target.value})}
                required
              >
                <option value="dinheiro">Dinheiro</option>
                <option value="pix">PIX</option>
                <option value="transferencia">Transferência Bancária</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="cheque">Cheque</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descrição/Observações</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formDoacao.descricao}
                onChange={(e) => setFormDoacao({...formDoacao, descricao: e.target.value})}
                placeholder="Observações sobre a doação..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModalDoacao(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="azul">
              Lançar Doação
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de Fechamento Diário */}
      <Modal show={showModalFechamento} onHide={() => setShowModalFechamento(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Fechamento Diário do Caixa</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFechamentoDiario}>
          <Modal.Body>
            <Alert variant="info">
              <FaCalendarAlt className="me-2" />
              Realizando fechamento do caixa para o dia {new Date(formFechamento.data_fechamento).toLocaleDateString('pt-BR')}
            </Alert>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Saldo Inicial</Form.Label>
                  <Form.Control
                    type="text"
                    value={formatCurrency(parseFloat(formFechamento.saldo_inicial || 0))}
                    readOnly
                    className="bg-light"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Total de Entradas</Form.Label>
                  <Form.Control
                    type="text"
                    value={formatCurrency(parseFloat(formFechamento.total_entradas || 0))}
                    readOnly
                    className="bg-light"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Total de Saídas</Form.Label>
                  <Form.Control
                    type="text"
                    value={formatCurrency(parseFloat(formFechamento.total_saidas || 0))}
                    readOnly
                    className="bg-light"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Saldo Final</Form.Label>
                  <Form.Control
                    type="text"
                    value={formatCurrency(parseFloat(formFechamento.saldo_final || 0))}
                    readOnly
                    className="bg-light fw-bold"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Observações do Fechamento</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formFechamento.observacoes}
                onChange={(e) => setFormFechamento({...formFechamento, observacoes: e.target.value})}
                placeholder="Observações sobre o fechamento do caixa..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModalFechamento(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="success">
              Confirmar Fechamento
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de Detalhes da Movimentação */}
      <Modal show={showModalDetalhes} onHide={() => setShowModalDetalhes(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Detalhes da Movimentação</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {movimentacaoSelecionada && (
            <div>
              <Row>
                <Col sm={6}><strong>Data:</strong></Col>
                <Col sm={6}>{new Date(movimentacaoSelecionada.data_movimentacao).toLocaleDateString('pt-BR')}</Col>
              </Row>
              <hr />
              <Row>
                <Col sm={6}><strong>Tipo:</strong></Col>
                <Col sm={6}>
                  <Badge bg={movimentacaoSelecionada.tipo === 'entrada' ? 'success' : 'danger'}>
                    {movimentacaoSelecionada.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                  </Badge>
                </Col>
              </Row>
              <hr />
              <Row>
                <Col sm={6}><strong>Categoria:</strong></Col>
                <Col sm={6} className="text-capitalize">{movimentacaoSelecionada.categoria}</Col>
              </Row>
              <hr />
              <Row>
                <Col sm={6}><strong>Valor:</strong></Col>
                <Col sm={6}>
                  <span className={`fw-bold ${movimentacaoSelecionada.tipo === 'entrada' ? 'text-success' : 'text-danger'}`}>
                    {movimentacaoSelecionada.tipo === 'entrada' ? '+' : '-'}{formatCurrency(movimentacaoSelecionada.valor)}
                  </span>
                </Col>
              </Row>
              <hr />
              <Row>
                <Col sm={6}><strong>Forma de Pagamento:</strong></Col>
                <Col sm={6}>{formatarFormaPagamento(movimentacaoSelecionada.forma_pagamento)}</Col>
              </Row>
              <hr />
              <Row>
                <Col sm={12}><strong>Descrição:</strong></Col>
                <Col sm={12}>{movimentacaoSelecionada.descricao || 'Sem descrição'}</Col>
              </Row>
              {movimentacaoSelecionada.doador_nome && (
                <>
                  <hr />
                  <Row>
                    <Col sm={6}><strong>Doador:</strong></Col>
                    <Col sm={6}>{movimentacaoSelecionada.doador_nome}</Col>
                  </Row>
                </>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalDetalhes(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default Caixa;
