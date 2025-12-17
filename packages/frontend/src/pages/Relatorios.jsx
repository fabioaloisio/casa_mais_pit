import { useState, useEffect } from 'react';
import { Button, Card, Row, Col, Form, Modal, Alert, Badge, Nav } from 'react-bootstrap';
import {
  FaFileAlt,
  FaDownload,
  FaFilePdf,
  FaFileExcel,
  FaChartBar,
  FaChartPie,
  FaChartLine,
  FaUsers,
  FaDollarSign,
  FaPills,
  FaBed,
  FaStethoscope,
  FaMoneyBillWave as FaCash,
  FaGift,
  FaFilter,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaEquals
} from 'react-icons/fa';
import relatoriosService from '../services/relatoriosService';
import { formatCurrency } from '@casa-mais/shared';
import Toast from '../components/common/Toast';
import './Doacoes.css';
import './Relatorios.css';

const Relatorios = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState({});
  const [relatorioPeriodo, setRelatorioPeriodo] = useState({
    dataInicio: '',
    dataFim: '',
    tipo: 'assistidas'
  });
  const [showModalFiltros, setShowModalFiltros] = useState(false);
  const [showModalGraficos, setShowModalGraficos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [relatorioAtual, setRelatorioAtual] = useState(null);
  const [graficos, setGraficos] = useState({});

  const tiposRelatorio = [
    {
      key: 'assistidas',
      nome: 'Relatório de Assistidas',
      icone: FaUsers,
      cor: 'primary',
      descricao: 'Dados completos das assistidas, internações e histórico'
    },
    {
      key: 'medicamentos',
      nome: 'Relatório de Medicamentos',
      icone: FaPills,
      cor: 'success',
      descricao: 'Controle de medicamentos, estoque e prescrições'
    },
    {
      key: 'doacoes',
      nome: 'Relatório de Doações',
      icone: FaGift,
      cor: 'info',
      descricao: 'Doações recebidas, doadores e valores arrecadados'
    },
    {
      key: 'despesas',
      nome: 'Relatório de Despesas',
      icone: FaDollarSign,
      cor: 'warning',
      descricao: 'Gastos da instituição por categoria e período'
    },
    {
      key: 'internacoes',
      nome: 'Relatório de Internações',
      icone: FaBed,
      cor: 'secondary',
      descricao: 'Histórico de internações, permanência e estatísticas'
    },
    {
      key: 'consultas',
      nome: 'Relatório de Consultas',
      icone: FaStethoscope,
      cor: 'primary',
      descricao: 'Atendimentos médicos realizados e agendados'
    },
    {
      key: 'caixa',
      nome: 'Relatório de Caixa',
      icone: FaCash,
      cor: 'dark',
      descricao: 'Movimentação financeira e fechamentos de caixa'
    },
    {
      key: 'vendas',
      nome: 'Relatório de Vendas',
      icone: FaDollarSign,
      cor: 'success',
      descricao: 'Vendas de produtos, lucros estimados e análise financeira'
    }
  ];

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await relatoriosService.getDashboard();
      console.log('Dashboard response:', response); // Debug

      // Extrair os dados do objeto de resposta
      if (response && response.data) {
        setDashboardData(response.data);
        console.log('Dashboard data set:', response.data); // Debug
      } else {
        setDashboardData(response || {});
      }
    } catch (error) {
      setToast({
        show: true,
        message: 'Erro ao carregar dashboard. Verifique sua conexão.',
        type: 'danger'
      });
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGerarRelatorio = async (tipo) => {
    setRelatorioPeriodo({ ...relatorioPeriodo, tipo });

    // Para vendas, carregar dados diretamente se houver período
    if (tipo === 'vendas') {
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      setRelatorioPeriodo({
        ...relatorioPeriodo,
        tipo: 'vendas',
        dataInicio: inicioMes.toISOString().split('T')[0],
        dataFim: hoje.toISOString().split('T')[0]
      });
    }

    setShowModalFiltros(true);
  };

  const handleExportarRelatorio = async (formato) => {
    try {
      setLoading(true);

      let response;
      if (formato === 'pdf') {
        response = await relatoriosService.exportarPDF(relatorioPeriodo.tipo, {
          dataInicio: relatorioPeriodo.dataInicio,
          dataFim: relatorioPeriodo.dataFim
        });
      } else {
        response = await relatoriosService.exportarExcel(relatorioPeriodo.tipo, {
          dataInicio: relatorioPeriodo.dataInicio,
          dataFim: relatorioPeriodo.dataFim
        });
      }

      // O serviço já faz o download automaticamente
      // Não precisa fazer download aqui novamente

      setToast({
        show: true,
        message: `Relatório ${formato.toUpperCase()} exportado com sucesso!`,
        type: 'success'
      });
      setShowModalFiltros(false);
    } catch (error) {
      setToast({
        show: true,
        message: error.message || `Erro ao exportar relatório ${formato.toUpperCase()}.`,
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVisualizarGraficos = async (tipo) => {
    try {
      setLoading(true);
      const dadosGraficos = await relatoriosService.getGraficos(tipo);
      setGraficos(dadosGraficos);
      setRelatorioAtual(tipo);
      setShowModalGraficos(true);
    } catch (error) {
      setToast({
        show: true,
        message: 'Erro ao carregar gráficos.',
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const getTendenciaIcon = (tendencia) => {
    if (tendencia > 0) return <FaArrowUp className="text-success" />;
    if (tendencia < 0) return <FaArrowDown className="text-danger" />;
    return <FaEquals className="text-muted" />;
  };

  const formatTendencia = (valor) => {
    if (valor > 0) return `+${valor}%`;
    return `${valor}%`;
  };

  return (
    <div className="conteudo">
      <div className="topo">
        <h1>Relatórios e Estatísticas</h1>
        <p>
          Visualize relatórios detalhados e estatísticas da instituição.
          Exporte dados em PDF ou Excel e acompanhe indicadores importantes.
        </p>
      </div>

      {/* Abas de Navegação */}
      <Nav variant="tabs" className="mb-4">
        <Nav.Item>
          <Nav.Link
            as="button"
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
          >
            <FaChartBar className="me-2" />
            Dashboard
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            as="button"
            active={activeTab === 'relatorios'}
            onClick={() => setActiveTab('relatorios')}
          >
            <FaFileAlt className="me-2" />
            Gerar Relatórios
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            as="button"
            active={activeTab === 'graficos'}
            onClick={() => setActiveTab('graficos')}
          >
            <FaChartPie className="me-2" />
            Análise Gráfica
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Dashboard - Visão Geral */}
      {activeTab === 'dashboard' && (
        <>
          {/* Cards de Estatísticas Gerais */}
          <Row className="mb-4">
            <Col xs={12} sm={6} lg={3} className="mb-3 mb-lg-0">
              <Card className="stats-card h-100">
                <Card.Body className="d-flex align-items-center">
                  <div className="me-3 stats-icon">
                    <FaUsers size={30} className="text-primary" />
                  </div>
                  <div className="stats-content">
                    <h6 className="mb-0 text-muted">Total Assistidas</h6>
                    <h4 className="mb-0">{dashboardData.totalAssistidas || 0}</h4>
                    <small className={`d-flex align-items-center ${dashboardData.tendenciaAssistidas >= 0 ? 'text-success' : 'text-danger'}`}>
                      {getTendenciaIcon(dashboardData.tendenciaAssistidas)}
                      <span className="ms-1">{formatTendencia(dashboardData.tendenciaAssistidas || 0)}</span>
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} lg={3} className="mb-3 mb-lg-0">
              <Card className="stats-card h-100">
                <Card.Body className="d-flex align-items-center">
                  <div className="me-3 stats-icon">
                    <FaDollarSign size={30} className="text-success" />
                  </div>
                  <div className="stats-content">
                    <h6 className="mb-0 text-muted">Arrecadação Mensal</h6>
                    <h4 className="mb-0">{formatCurrency(dashboardData.arrecadacaoMensal || 0)}</h4>
                    <small className={`d-flex align-items-center ${dashboardData.tendenciaArrecadacao >= 0 ? 'text-success' : 'text-danger'}`}>
                      {getTendenciaIcon(dashboardData.tendenciaArrecadacao)}
                      <span className="ms-1">{formatTendencia(dashboardData.tendenciaArrecadacao || 0)}</span>
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} lg={3} className="mb-3 mb-lg-0">
              <Card className="stats-card h-100">
                <Card.Body className="d-flex align-items-center">
                  <div className="me-3 stats-icon">
                    <FaBed size={30} className="text-info" />
                  </div>
                  <div className="stats-content">
                    <h6 className="mb-0 text-muted">Internações Ativas</h6>
                    <h4 className="mb-0">{dashboardData.internacoesAtivas || 0}</h4>
                    <small className="text-muted">
                      {dashboardData.mediaPermanencia || 0} dias (média)
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <Card className="stats-card h-100">
                <Card.Body className="d-flex align-items-center">
                  <div className="me-3 stats-icon">
                    <FaStethoscope size={30} className="text-warning" />
                  </div>
                  <div className="stats-content">
                    <h6 className="mb-0 text-muted">Consultas do Mês</h6>
                    <h4 className="mb-0">{dashboardData.consultasMes || 0}</h4>
                    <small className={`d-flex align-items-center ${dashboardData.tendenciaConsultas >= 0 ? 'text-success' : 'text-danger'}`}>
                      {getTendenciaIcon(dashboardData.tendenciaConsultas)}
                      <span className="ms-1">{formatTendencia(dashboardData.tendenciaConsultas || 0)}</span>
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Resumo Financeiro */}
          <Row className="mb-4">
            <Col xs={12} md={6} className="mb-3 mb-md-0">
              <Card className="h-100">
                <Card.Header>
                  <h5 className="mb-0">Resumo Financeiro - Este Mês</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col xs={6}>
                      <div className="text-center mb-3">
                        <FaGift size={30} className="text-success mb-2" />
                        <h6>Doações Recebidas</h6>
                        <h4 className="text-success">{formatCurrency(dashboardData.doacoesMes || 0)}</h4>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="text-center mb-3">
                        <FaDollarSign size={30} className="text-danger mb-2" />
                        <h6>Despesas</h6>
                        <h4 className="text-danger">{formatCurrency(dashboardData.despesasMes || 0)}</h4>
                      </div>
                    </Col>
                  </Row>
                  <hr />
                  <div className="text-center">
                    <h6>Saldo do Período</h6>
                    <h3 className={`${(dashboardData.doacoesMes - dashboardData.despesasMes) >= 0 ? 'text-success' : 'text-danger'}`}>
                      {formatCurrency((dashboardData.doacoesMes || 0) - (dashboardData.despesasMes || 0))}
                    </h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card className="h-100">
                <Card.Header>
                  <h5 className="mb-0">Medicamentos - Situação</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col xs={4}>
                      <div className="text-center">
                        <h4 className="text-primary">{dashboardData.medicamentosDisponiveis || 0}</h4>
                        <p className="text-muted mb-0">Disponíveis</p>
                      </div>
                    </Col>
                    <Col xs={4}>
                      <div className="text-center">
                        <h4 className="text-warning">{dashboardData.medicamentosEstoqueBaixo || 0}</h4>
                        <p className="text-muted mb-0">Estoque Baixo</p>
                      </div>
                    </Col>
                    <Col xs={4}>
                      <div className="text-center">
                        <h4 className="text-danger">{dashboardData.medicamentosVencidos || 0}</h4>
                        <p className="text-muted mb-0">Vencidos</p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Atividades Recentes */}
          <Row>
            <Col xs={12}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Resumo de Atividades - Últimos 30 Dias</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col xs={6} sm={4} md={2} className="text-center mb-3">
                      <div className="mb-2">
                        <FaUsers size={24} className="text-primary" />
                      </div>
                      <h6 className="atividade-label">Novas Assistidas</h6>
                      <h5 className="text-primary">{dashboardData.novasAssistidas || 0}</h5>
                    </Col>
                    <Col xs={6} sm={4} md={2} className="text-center mb-3">
                      <div className="mb-2">
                        <FaBed size={24} className="text-info" />
                      </div>
                      <h6 className="atividade-label">Internações</h6>
                      <h5 className="text-info">{dashboardData.totalInternacoes || 0}</h5>
                    </Col>
                    <Col xs={6} sm={4} md={2} className="text-center mb-3">
                      <div className="mb-2">
                        <FaStethoscope size={24} className="text-success" />
                      </div>
                      <h6 className="atividade-label">Consultas</h6>
                      <h5 className="text-success">{dashboardData.totalConsultas || 0}</h5>
                    </Col>
                    <Col xs={6} sm={4} md={2} className="text-center mb-3">
                      <div className="mb-2">
                        <FaGift size={24} className="text-warning" />
                      </div>
                      <h6 className="atividade-label">Doações</h6>
                      <h5 className="text-warning">{dashboardData.totalDoacoes || 0}</h5>
                    </Col>
                    <Col xs={6} sm={4} md={2} className="text-center mb-3">
                      <div className="mb-2">
                        <FaPills size={24} className="text-secondary" />
                      </div>
                      <h6 className="atividade-label">Prescrições</h6>
                      <h5 className="text-secondary">{dashboardData.totalPrescricoes || 0}</h5>
                    </Col>
                    <Col xs={6} sm={4} md={2} className="text-center mb-3">
                      <div className="mb-2">
                        <FaCash size={24} className="text-dark" />
                      </div>
                      <h6 className="atividade-label">Fechamentos</h6>
                      <h5 className="text-dark">{dashboardData.totalFechamentos || 0}</h5>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* Gerar Relatórios */}
      {activeTab === 'relatorios' && (
        <Row>
          {tiposRelatorio.map(tipo => {
            const IconeComponente = tipo.icone;
            return (
              <Col md={6} lg={4} key={tipo.key} className="mb-4">
                <Card className="h-100 relatorio-card">
                  <Card.Body className="text-center">
                    <div className="mb-3">
                      <IconeComponente size={40} className={`text-${tipo.cor}`} />
                    </div>
                    <h5 className="card-title">{tipo.nome}</h5>
                    <p className="text-muted">{tipo.descricao}</p>
                    <div className="d-grid gap-2">
                      <Button
                        className="azul"
                        onClick={() => handleGerarRelatorio(tipo.key)}
                      >
                        <FaFileAlt className="me-2" />
                        Gerar Relatório
                      </Button>
                      <Button
                        variant="outline-primary"
                        onClick={() => handleVisualizarGraficos(tipo.key)}
                      >
                        <FaChartBar className="me-2" />
                        Ver Gráficos
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Análise Gráfica */}
      {activeTab === 'graficos' && (
        <Row>
          <Col md={12}>
            <Alert variant="info">
              <FaChartLine className="me-2" />
              <strong>Análise Gráfica</strong> - Selecione um tipo de relatório na aba "Gerar Relatórios"
              e clique em "Ver Gráficos" para visualizar os dados em formato gráfico.
            </Alert>

            <Card>
              <Card.Header>
                <h5 className="mb-0">Gráficos Disponíveis</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  {tiposRelatorio.map(tipo => {
                    const IconeComponente = tipo.icone;
                    return (
                      <Col md={4} key={tipo.key} className="mb-3">
                        <Button
                          variant="outline-secondary"
                          className="w-100 p-3"
                          onClick={() => handleVisualizarGraficos(tipo.key)}
                        >
                          <div className="d-flex flex-column align-items-center">
                            <IconeComponente size={24} className={`text-${tipo.cor} mb-2`} />
                            <span className="fw-semibold">{tipo.nome}</span>
                            <small className="text-muted">{tipo.descricao}</small>
                          </div>
                        </Button>
                      </Col>
                    );
                  })}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Modal de Filtros para Relatórios */}
      <Modal show={showModalFiltros} onHide={() => setShowModalFiltros(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaFilter className="me-2" />
            Filtros para Relatório - {tiposRelatorio.find(t => t.key === relatorioPeriodo.tipo)?.nome}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data de Início</Form.Label>
                  <Form.Control
                    type="date"
                    value={relatorioPeriodo.dataInicio}
                    onChange={(e) => setRelatorioPeriodo({...relatorioPeriodo, dataInicio: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data de Fim</Form.Label>
                  <Form.Control
                    type="date"
                    value={relatorioPeriodo.dataFim}
                    onChange={(e) => setRelatorioPeriodo({...relatorioPeriodo, dataFim: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Atalhos de Período */}
            <div className="mb-3">
              <Form.Label>Períodos Predefinidos</Form.Label>
              <div className="d-flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => {
                    const hoje = new Date();
                    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
                    setRelatorioPeriodo({
                      ...relatorioPeriodo,
                      dataInicio: inicioMes.toISOString().split('T')[0],
                      dataFim: hoje.toISOString().split('T')[0]
                    });
                  }}
                >
                  Este Mês
                </Button>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => {
                    const hoje = new Date();
                    const mesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
                    const fimMesPassado = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
                    setRelatorioPeriodo({
                      ...relatorioPeriodo,
                      dataInicio: mesPassado.toISOString().split('T')[0],
                      dataFim: fimMesPassado.toISOString().split('T')[0]
                    });
                  }}
                >
                  Mês Passado
                </Button>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => {
                    const hoje = new Date();
                    const trintaDiasAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
                    setRelatorioPeriodo({
                      ...relatorioPeriodo,
                      dataInicio: trintaDiasAtras.toISOString().split('T')[0],
                      dataFim: hoje.toISOString().split('T')[0]
                    });
                  }}
                >
                  Últimos 30 Dias
                </Button>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => {
                    const hoje = new Date();
                    const inicioAno = new Date(hoje.getFullYear(), 0, 1);
                    setRelatorioPeriodo({
                      ...relatorioPeriodo,
                      dataInicio: inicioAno.toISOString().split('T')[0],
                      dataFim: hoje.toISOString().split('T')[0]
                    });
                  }}
                >
                  Este Ano
                </Button>
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalFiltros(false)}>
            Cancelar
          </Button>
          <div className="d-flex gap-2">
            <Button
              variant="danger"
              onClick={() => handleExportarRelatorio('pdf')}
              disabled={loading}
            >
              <FaFilePdf className="me-2" />
              Exportar PDF
            </Button>
            <Button
              variant="success"
              onClick={() => handleExportarRelatorio('excel')}
              disabled={loading}
            >
              <FaFileExcel className="me-2" />
              Exportar Excel
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Modal de Gráficos */}
      <Modal show={showModalGraficos} onHide={() => setShowModalGraficos(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaChartPie className="me-2" />
            Análise Gráfica - {tiposRelatorio.find(t => t.key === relatorioAtual)?.nome}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {relatorioAtual && (
            <div className="text-center py-4">
              <FaChartBar size={80} className="text-muted mb-3" />
              <h5>Funcionalidade de Gráficos</h5>
              <p className="text-muted">
                Aqui serão exibidos gráficos interativos para análise dos dados de <strong>{tiposRelatorio.find(t => t.key === relatorioAtual)?.nome}</strong>.
                <br />
                Para implementar, você pode usar bibliotecas como Chart.js ou Recharts.
              </p>
              <Alert variant="info">
                <strong>Gráficos que podem ser implementados:</strong>
                <ul className="text-start mt-2 mb-0">
                  <li>Gráfico de barras para comparação temporal</li>
                  <li>Gráfico de pizza para distribuição por categorias</li>
                  <li>Gráfico de linhas para tendências</li>
                  <li>Gráficos de área para volumes acumulados</li>
                </ul>
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalGraficos(false)}>
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

export default Relatorios;
