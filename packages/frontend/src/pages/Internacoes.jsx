import { useState, useEffect } from 'react';
import { Button, Table, Form, Card, Row, Col, Modal, Alert } from 'react-bootstrap';
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaBed,
  FaUsers,
  FaCalendarAlt,
  FaChartLine,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSignInAlt,
  FaSignOutAlt,
  FaHistory,
  FaEye
} from 'react-icons/fa';
import internacoesService from '../services/internacoesService';
import assistidasService from '../services/assistidasService';
import Toast from '../components/common/Toast';
import InfoTooltip from '../utils/tooltip';
import './Doacoes.css';

const Internacoes = () => {
  const [internacoes, setInternacoes] = useState([]);
  const [internacoesAtivas, setInternacoesAtivas] = useState([]);
  const [assistidas, setAssistidas] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todas');
  const [showModalEntrada, setShowModalEntrada] = useState(false);
  const [showModalSaida, setShowModalSaida] = useState(false);
  const [showModalHistorico, setShowModalHistorico] = useState(false);
  const [internacaoSelecionada, setInternacaoSelecionada] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(false);
  const [ordenacao, setOrdenacao] = useState({ campo: 'dataEntrada', direcao: 'desc' });

  const [formEntrada, setFormEntrada] = useState({
    assistida_id: '',
    motivo: '',
    observacoes: '',
    dataEntrada: new Date().toISOString().split('T')[0]
  });

  const [formSaida, setFormSaida] = useState({
    dataSaida: new Date().toISOString().split('T')[0],
    motivoSaida: '',
    observacoesSaida: ''
  });

  const [stats, setStats] = useState({
    totalAtivas: 0,
    totalHistorico: 0,
    mediaPermanencia: 0,
    totalMesAtual: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [internacoesData, statsData, assistidasData, ativasData] = await Promise.all([
        internacoesService.getAll(),
        internacoesService.getStats(),
        assistidasService.getAll(),
        internacoesService.getAtivas()
      ]);

      setInternacoes(internacoesData.data || []);
      setStats(statsData.data || {
        totalAtivas: 0,
        totalHistorico: 0,
        mediaPermanencia: 0,
        totalMesAtual: 0
      });
      // FIX: assistidasService.getAll() já retorna os dados diretamente (response.data)
      // então não precisamos acessar .data novamente
      setAssistidas(assistidasData || []);
      setInternacoesAtivas(ativasData.data || []);
    } catch (error) {
      setToast({
        show: true,
        message: 'Erro ao carregar dados. Verifique sua conexão.',
        type: 'danger'
      });
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModalEntrada = () => {
    setFormEntrada({
      assistida_id: '',
      motivo: '',
      observacoes: '',
      dataEntrada: new Date().toISOString().split('T')[0]
    });
    setShowModalEntrada(true);
  };

  const handleShowModalSaida = (internacao) => {
    setInternacaoSelecionada(internacao);
    setFormSaida({
      dataSaida: new Date().toISOString().split('T')[0],
      motivoSaida: '',
      observacoesSaida: ''
    });
    setShowModalSaida(true);
  };

  const handleEfetuarEntrada = async (e) => {
    e.preventDefault();
    try {
      const result = await internacoesService.efetuarEntrada(formEntrada);
      setToast({
        show: true,
        message: result.message || 'Entrada registrada com sucesso!',
        type: 'success'
      });
      await loadData();
      setShowModalEntrada(false);
    } catch (error) {
      setToast({
        show: true,
        message: error.message || 'Erro ao registrar entrada.',
        type: 'danger'
      });
    }
  };

  const handleEfetuarSaida = async (e) => {
    e.preventDefault();
    try {
      // O backend espera assistida_id que está diretamente na internação
      const result = await internacoesService.efetuarSaida(internacaoSelecionada.assistida_id, formSaida);
      setToast({
        show: true,
        message: result.message || 'Saída registrada com sucesso!',
        type: 'success'
      });
      await loadData();
      setShowModalSaida(false);
    } catch (error) {
      setToast({
        show: true,
        message: error.message || 'Erro ao registrar saída.',
        type: 'danger'
      });
    }
  };

  const handleOrdenar = (campo) => {
    setOrdenacao(prev => ({
      campo,
      direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (campo) => {
    if (ordenacao.campo !== campo) {
      return <FaSort className="text-white ms-1" />;
    }
    return ordenacao.direcao === 'asc' ?
      <FaSortUp className="text-warning ms-1" /> :
      <FaSortDown className="text-warning ms-1" />;
  };

  const calcularDiasInternacao = (dataEntrada, dataSaida = null) => {
    const entrada = new Date(dataEntrada);
    const saida = dataSaida ? new Date(dataSaida) : new Date();
    const diffTime = saida - entrada;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const internacoesFiltradas = internacoes
    .filter(internacao => {
      const searchTerm = filtro.toLowerCase();
      const matchesSearch = (
        (internacao.assistida?.nome || '').toLowerCase().includes(searchTerm) ||
        (internacao.motivo || '').toLowerCase().includes(searchTerm)
      );

      const matchesStatus =
        filtroStatus === 'todas' ||
        (filtroStatus === 'ativas' && !internacao.dataSaida) ||
        (filtroStatus === 'encerradas' && internacao.dataSaida);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const { campo, direcao } = ordenacao;
      let valorA, valorB;

      switch (campo) {
        case 'dataEntrada':
          valorA = new Date(a.dataEntrada);
          valorB = new Date(b.dataEntrada);
          break;
        case 'assistida':
          valorA = (a.assistida?.nome || '').toLowerCase();
          valorB = (b.assistida?.nome || '').toLowerCase();
          break;
        case 'motivo':
          valorA = a.motivo || '';
          valorB = b.motivo || '';
          break;
        case 'dias':
          valorA = calcularDiasInternacao(a.dataEntrada, a.dataSaida);
          valorB = calcularDiasInternacao(b.dataEntrada, b.dataSaida);
          break;
        default:
          return 0;
      }

      if (valorA < valorB) {
        return direcao === 'asc' ? -1 : 1;
      }
      if (valorA > valorB) {
        return direcao === 'asc' ? 1 : -1;
      }
      return 0;
    });

  return (
    <div className="conteudo">
      <div className="topo">
        <h1>Gestão de Internações</h1>
        <p>
          Gerencie as internações das assistidas. Registre entradas e saídas,
          acompanhe o histórico e monitore estatísticas de permanência.
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaBed size={30} className="text-primary" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Internações Ativas</h6>
                <h4 className="mb-0">{stats.totalAtivas}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaHistory size={30} className="text-success" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Total Histórico</h6>
                <h4 className="mb-0">{stats.totalHistorico}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaCalendarAlt size={30} className="text-info" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Média de Permanência</h6>
                <h4 className="mb-0">{stats.mediaPermanencia} dias</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaChartLine size={30} className="text-warning" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Este Mês</h6>
                <h4 className="mb-0">{stats.totalMesAtual}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Barra de ações */}
      <div className="filtros mb-4">
        <Button
          className="azul d-flex align-items-center gap-2"
          onClick={handleShowModalEntrada}
        >
          <FaSignInAlt /> Registrar Entrada
          <InfoTooltip
            texto="Registre a entrada de uma assistida na internação. Informe a assistida, data de entrada, motivo da internação e observações relevantes."
          />
        </Button>

        <div className="d-flex align-items-center gap-2">
          <FaSearch className="text-muted" />
          <Form.Control
            type="text"
            placeholder="Filtrar por assistida ou motivo..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            id="filtroInternacao"
            style={{ width: '300px' }}
          />
          <Form.Select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="todas">Todas</option>
            <option value="ativas">Ativas</option>
            <option value="encerradas">Encerradas</option>
          </Form.Select>
        </div>
      </div>

      {/* Tabela de internações */}
      <div className="tabela-container">
        <Table className="tabela-assistidas" hover responsive>
          <thead>
            <tr>
              <th
                className="cursor-pointer user-select-none"
                onClick={() => handleOrdenar('assistida')}
                title="Clique para ordenar por assistida"
              >
                Assistida {getSortIcon('assistida')}
              </th>
              <th
                className="cursor-pointer user-select-none"
                onClick={() => handleOrdenar('motivo')}
                title="Clique para ordenar por motivo"
              >
                Motivo {getSortIcon('motivo')}
              </th>
              <th
                className="cursor-pointer user-select-none"
                onClick={() => handleOrdenar('dataEntrada')}
                title="Clique para ordenar por data de entrada"
              >
                Data de Entrada {getSortIcon('dataEntrada')}
              </th>
              <th>Data de Saída</th>
              <th
                className="cursor-pointer user-select-none"
                onClick={() => handleOrdenar('dias')}
                title="Clique para ordenar por dias"
              >
                Dias de Internação {getSortIcon('dias')}
              </th>
              <th>Status</th>
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
                    Carregando internações...
                  </div>
                </td>
              </tr>
            ) : internacoesFiltradas.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  <div className="text-muted">
                    <p className="mb-0">Nenhuma internação encontrada</p>
                    <small>Tente ajustar os filtros ou registre uma nova entrada</small>
                  </div>
                </td>
              </tr>
            ) : (
              internacoesFiltradas.map(internacao => (
                <tr key={internacao.id}>
                  <td className="fw-medium">
                    {internacao.assistida?.nome || 'Assistida não encontrada'}
                  </td>
                  <td>{internacao.motivo}</td>
                  <td>
                    {new Date(internacao.dataEntrada).toLocaleDateString('pt-BR')}
                  </td>
                  <td>
                    {internacao.dataSaida ?
                      new Date(internacao.dataSaida).toLocaleDateString('pt-BR') :
                      '-'
                    }
                  </td>
                  <td>
                    <span className="fw-bold">
                      {calcularDiasInternacao(internacao.dataEntrada, internacao.dataSaida)} dias
                    </span>
                  </td>
                  <td>
                    <span className={`status ${internacao.dataSaida ? 'inativa' : 'ativa'}`}>
                      {internacao.dataSaida ? 'Encerrada' : 'Ativa'}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      {!internacao.dataSaida && (
                        <Button
                          className="d-flex align-items-center gap-1 btn-outline-custom btn-sm fs-7"
                          onClick={() => handleShowModalSaida(internacao)}
                        >
                          <FaSignOutAlt /> Registrar Saída
                          <InfoTooltip
                            texto="Registre a saída de uma assistida da internação. Informe a data de saída, motivo da saída e observações relevantes sobre o encerramento da internação."
                          />
                        </Button>
                      )}
                      <Button
                        className="d-flex align-items-center gap-1 btn-sm fs-7"
                        variant="outline-info"
                        onClick={() => {
                          setInternacaoSelecionada(internacao);
                          setShowModalHistorico(true);
                        }}
                      >
                        <FaEye /> Detalhes
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Modal de Entrada */}
      <Modal show={showModalEntrada} onHide={() => setShowModalEntrada(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Registrar Entrada de Internação</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEfetuarEntrada}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Assistida *</Form.Label>
                  <Form.Select
                    value={formEntrada.assistida_id}
                    onChange={(e) => setFormEntrada({...formEntrada, assistida_id: e.target.value})}
                    required
                  >
                    <option value="">Selecione a assistida</option>
                    {assistidas.map(assistida => (
                      <option key={assistida.id} value={assistida.id}>
                        {assistida.nome}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data de Entrada *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formEntrada.dataEntrada}
                    onChange={(e) => setFormEntrada({...formEntrada, dataEntrada: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Motivo da Internação *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formEntrada.motivo}
                onChange={(e) => setFormEntrada({...formEntrada, motivo: e.target.value})}
                placeholder="Descreva o motivo da internação..."
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Observações</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formEntrada.observacoes}
                onChange={(e) => setFormEntrada({...formEntrada, observacoes: e.target.value})}
                placeholder="Observações adicionais..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModalEntrada(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="azul">
              Registrar Entrada
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de Saída */}
      <Modal show={showModalSaida} onHide={() => setShowModalSaida(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Registrar Saída de Internação</Modal.Title>
        </Modal.Header>
        {internacaoSelecionada && (
          <Form onSubmit={handleEfetuarSaida}>
            <Modal.Body>
              <Alert variant="info">
                <strong>Assistida:</strong> {internacaoSelecionada.assistida?.nome}<br/>
                <strong>Data de Entrada:</strong> {new Date(internacaoSelecionada.dataEntrada).toLocaleDateString('pt-BR')}<br/>
                <strong>Dias de Internação:</strong> {calcularDiasInternacao(internacaoSelecionada.dataEntrada)} dias
              </Alert>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Data de Saída *</Form.Label>
                    <Form.Control
                      type="date"
                      value={formSaida.dataSaida}
                      onChange={(e) => setFormSaida({...formSaida, dataSaida: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Motivo da Saída *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formSaida.motivoSaida}
                  onChange={(e) => setFormSaida({...formSaida, motivoSaida: e.target.value})}
                  placeholder="Descreva o motivo da saída..."
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Observações da Saída</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formSaida.observacoesSaida}
                  onChange={(e) => setFormSaida({...formSaida, observacoesSaida: e.target.value})}
                  placeholder="Observações adicionais sobre a saída..."
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModalSaida(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="success">
                Registrar Saída
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Modal>

      {/* Modal de Detalhes/Histórico */}
      <Modal show={showModalHistorico} onHide={() => setShowModalHistorico(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalhes da Internação</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {internacaoSelecionada && (
            <div>
              <Row>
                <Col md={6}>
                  <h6><strong>Informações da Assistida</strong></h6>
                  <p><strong>Nome:</strong> {internacaoSelecionada.assistida?.nome}</p>
                  <p><strong>CPF:</strong> {internacaoSelecionada.assistida?.cpf}</p>
                </Col>
                <Col md={6}>
                  <h6><strong>Informações da Internação</strong></h6>
                  <p><strong>Data de Entrada:</strong> {new Date(internacaoSelecionada.dataEntrada).toLocaleDateString('pt-BR')}</p>
                  <p><strong>Data de Saída:</strong> {internacaoSelecionada.dataSaida ? new Date(internacaoSelecionada.dataSaida).toLocaleDateString('pt-BR') : 'Em andamento'}</p>
                  <p><strong>Dias de Internação:</strong> {calcularDiasInternacao(internacaoSelecionada.dataEntrada, internacaoSelecionada.dataSaida)} dias</p>
                </Col>
              </Row>
              <hr />
              <h6><strong>Motivo da Internação</strong></h6>
              <p>{internacaoSelecionada.motivo}</p>

              {internacaoSelecionada.observacoes && (
                <>
                  <h6><strong>Observações da Entrada</strong></h6>
                  <p>{internacaoSelecionada.observacoes}</p>
                </>
              )}

              {internacaoSelecionada.motivoSaida && (
                <>
                  <h6><strong>Motivo da Saída</strong></h6>
                  <p>{internacaoSelecionada.motivoSaida}</p>
                </>
              )}

              {internacaoSelecionada.observacoesSaida && (
                <>
                  <h6><strong>Observações da Saída</strong></h6>
                  <p>{internacaoSelecionada.observacoesSaida}</p>
                </>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalHistorico(false)}>
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

export default Internacoes;
