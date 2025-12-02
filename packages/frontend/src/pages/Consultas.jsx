import { useState, useEffect } from 'react';
import { Button, Table, Form, Card, Row, Col, Modal, Alert, Badge, Nav } from 'react-bootstrap';
import {
  FaPlus,
  FaSearch,
  FaCalendarAlt,
  FaStethoscope,
  FaUserMd,
  FaClipboardList,
  FaHistory,
  FaEye,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaPrescriptionBottleAlt,
  FaStickyNote,
  FaSort,
  FaSortUp,
  FaSortDown
} from 'react-icons/fa';
import consultasService from '../services/consultasService';
import assistidasService from '../services/assistidasService';
import Toast from '../components/common/Toast';
import InfoTooltip from '../utils/tooltip';
import './Doacoes.css';

const Consultas = () => {
  const [activeTab, setActiveTab] = useState('calendario');
  const [consultas, setConsultas] = useState([]);
  const [assistidas, setAssistidas] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todas');
  const [showModalAgendar, setShowModalAgendar] = useState(false);
  const [showModalRealizar, setShowModalRealizar] = useState(false);
  const [showModalPrescricao, setShowModalPrescricao] = useState(false);
  const [showModalHistoria, setShowModalHistoria] = useState(false);
  const [showModalDetalhes, setShowModalDetalhes] = useState(false);
  const [consultaSelecionada, setConsultaSelecionada] = useState(null);
  const [assistidaSelecionada, setAssistidaSelecionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [ordenacao, setOrdenacao] = useState({ campo: 'dataConsulta', direcao: 'desc' });

  const [stats, setStats] = useState({
    totalAgendadas: 0,
    totalRealizadas: 0,
    totalCanceladas: 0,
    proximasConsultas: 0
  });

  const [formAgendar, setFormAgendar] = useState({
    assistida_id: '',
    medico_id: '',
    especialidade: '',
    dataConsulta: '',
    horaConsulta: '',
    motivo: '',
    observacoes: ''
  });

  const [formRealizar, setFormRealizar] = useState({
    dataRealizacao: new Date().toISOString().split('T')[0],
    sintomas: '',
    diagnostico: '',
    tratamento: '',
    observacoes: '',
    retorno: '',
    dataRetorno: ''
  });

  const [formPrescricao, setFormPrescricao] = useState({
    medicamentos: [{ medicamento: '', dosagem: '', posologia: '', duracao: '' }]
  });

  const [historiaPatologica, setHistoriaPatologica] = useState({
    alergias: '',
    medicamentosUso: '',
    cirurgias: '',
    doencasCronicas: '',
    historicoFamiliar: '',
    observacoes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        consultasData,
        statsData,
        assistidasData,
        medicosData,
        especialidadesData
      ] = await Promise.all([
        consultasService.getAll(),
        consultasService.getEstatisticas(),
        assistidasService.getAll(),
        consultasService.getMedicos(),
        consultasService.getEspecialidades()
      ]);

      setConsultas(consultasData.data || []);
      setStats(statsData.data || {
        totalAgendadas: 0,
        totalRealizadas: 0,
        totalCanceladas: 0,
        proximasConsultas: 0
      });
      // assistidasService.getAll() já retorna os dados diretamente
      setAssistidas(assistidasData || []);
      setMedicos(medicosData.data || []);
      setEspecialidades(especialidadesData.data || []);
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

  const handleAgendar = async (e) => {
    e.preventDefault();
    try {
      await consultasService.agendar(formAgendar);
      setToast({
        show: true,
        message: 'Consulta agendada com sucesso!',
        type: 'success'
      });
      // Recarregar consultas e estatísticas
      const [consultasData, statsData] = await Promise.all([
        consultasService.getAll(),
        consultasService.getEstatisticas()
      ]);
      setConsultas(consultasData.data || []);

      // Processar estatísticas corretamente
      const estatisticas = statsData?.data || statsData || {};
      setStats({
        totalAgendadas: Number(estatisticas.totalAgendadas) || 0,
        totalRealizadas: Number(estatisticas.totalRealizadas) || 0,
        totalCanceladas: Number(estatisticas.totalCanceladas) || 0,
        proximasConsultas: Number(estatisticas.proximasConsultas) || 0
      });
      setShowModalAgendar(false);
      setFormAgendar({
        assistida_id: '',
        medico_id: '',
        especialidade: '',
        dataConsulta: '',
        horaConsulta: '',
        motivo: '',
        observacoes: ''
      });
    } catch (error) {
      setToast({
        show: true,
        message: error.message || 'Erro ao agendar consulta.',
        type: 'danger'
      });
    }
  };

  const handleRealizarConsulta = async (e) => {
    e.preventDefault();
    try {
      await consultasService.realizarConsulta(consultaSelecionada.id, formRealizar);
      setToast({
        show: true,
        message: 'Consulta realizada com sucesso!',
        type: 'success'
      });
      // Recarregar consultas e estatísticas
      const [consultasData, statsData] = await Promise.all([
        consultasService.getAll(),
        consultasService.getEstatisticas()
      ]);
      setConsultas(consultasData.data || []);

      // Processar estatísticas corretamente
      const estatisticas = statsData?.data || statsData || {};
      setStats({
        totalAgendadas: Number(estatisticas.totalAgendadas) || 0,
        totalRealizadas: Number(estatisticas.totalRealizadas) || 0,
        totalCanceladas: Number(estatisticas.totalCanceladas) || 0,
        proximasConsultas: Number(estatisticas.proximasConsultas) || 0
      });
      setShowModalRealizar(false);
    } catch (error) {
      setToast({
        show: true,
        message: error.message || 'Erro ao realizar consulta.',
        type: 'danger'
      });
    }
  };

  const handleCancelarConsulta = async (consulta) => {
    const motivo = prompt('Informe o motivo do cancelamento:');
    if (motivo) {
      try {
        const response = await consultasService.cancelar(consulta.id, motivo);
        console.log('Resposta do cancelamento:', response);

        // Atualizar estatísticas localmente imediatamente
        setStats(prevStats => ({
          ...prevStats,
          totalAgendadas: Math.max(0, (prevStats.totalAgendadas || 0) - 1),
          totalCanceladas: (prevStats.totalCanceladas || 0) + 1
        }));

        // Atualizar a consulta localmente
        setConsultas(prevConsultas =>
          prevConsultas.map(c =>
            c.id === consulta.id
              ? { ...c, status: 'cancelada', motivoCancelamento: motivo }
              : c
          )
        );

        setToast({
          show: true,
          message: 'Consulta cancelada com sucesso!',
          type: 'success'
        });

        // Recarregar dados do backend após um pequeno delay
        setTimeout(async () => {
          try {
            const [consultasData, statsData] = await Promise.all([
              consultasService.getAll(),
              consultasService.getEstatisticas()
            ]);

            setConsultas(consultasData.data || []);
            const estatisticas = statsData?.data || statsData || {};
            setStats({
              totalAgendadas: Number(estatisticas.totalAgendadas) || 0,
              totalRealizadas: Number(estatisticas.totalRealizadas) || 0,
              totalCanceladas: Number(estatisticas.totalCanceladas) || 0,
              proximasConsultas: Number(estatisticas.proximasConsultas) || 0
            });
          } catch (error) {
            console.error('Erro ao recarregar dados:', error);
          }
        }, 1000);
      } catch (error) {
        console.error('Erro ao cancelar consulta:', error);
        setToast({
          show: true,
          message: error.message || 'Erro ao cancelar consulta.',
          type: 'danger'
        });
      }
    }
  };

  const handleSalvarPrescricao = async (e) => {
    e.preventDefault();
    try {
      await consultasService.criarPrescricao(consultaSelecionada.id, formPrescricao);
      setToast({
        show: true,
        message: 'Prescrição criada com sucesso!',
        type: 'success'
      });
      setShowModalPrescricao(false);
    } catch (error) {
      setToast({
        show: true,
        message: error.message || 'Erro ao criar prescrição.',
        type: 'danger'
      });
    }
  };

  const handleCarregarHistoria = async (assistida) => {
    try {
      const historia = await consultasService.getHistoriaPatologica(assistida.id);
      setHistoriaPatologica(historia);
      setAssistidaSelecionada(assistida);
      setShowModalHistoria(true);
    } catch (error) {
      setToast({
        show: true,
        message: 'Erro ao carregar história patológica.',
        type: 'danger'
      });
    }
  };

  const handleSalvarHistoria = async (e) => {
    e.preventDefault();
    try {
      await consultasService.atualizarHistoriaPatologica(
        assistidaSelecionada.id,
        historiaPatologica
      );
      setToast({
        show: true,
        message: 'História patológica atualizada com sucesso!',
        type: 'success'
      });
      setShowModalHistoria(false);
    } catch (error) {
      setToast({
        show: true,
        message: error.message || 'Erro ao salvar história patológica.',
        type: 'danger'
      });
    }
  };

  const addMedicamentoPrescricao = () => {
    setFormPrescricao({
      ...formPrescricao,
      medicamentos: [...formPrescricao.medicamentos, { medicamento: '', dosagem: '', posologia: '', duracao: '' }]
    });
  };

  const removeMedicamentoPrescricao = (index) => {
    const novosMedicamentos = formPrescricao.medicamentos.filter((_, i) => i !== index);
    setFormPrescricao({ ...formPrescricao, medicamentos: novosMedicamentos });
  };

  const updateMedicamentoPrescricao = (index, campo, valor) => {
    const novosMedicamentos = [...formPrescricao.medicamentos];
    novosMedicamentos[index][campo] = valor;
    setFormPrescricao({ ...formPrescricao, medicamentos: novosMedicamentos });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'agendada': return 'primary';
      case 'realizada': return 'success';
      case 'cancelada': return 'danger';
      case 'em_andamento': return 'warning';
      default: return 'secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'agendada': return 'Agendada';
      case 'realizada': return 'Realizada';
      case 'cancelada': return 'Cancelada';
      case 'em_andamento': return 'Em Andamento';
      default: return status;
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

  const consultasFiltradas = consultas
    .filter(consulta => {
      const searchTerm = filtro.toLowerCase();
      const matchesSearch = (
        (consulta.assistida?.nome || '').toLowerCase().includes(searchTerm) ||
        (consulta.medico?.nome || '').toLowerCase().includes(searchTerm) ||
        (consulta.especialidade || '').toLowerCase().includes(searchTerm)
      );

      const matchesStatus =
        filtroStatus === 'todas' ||
        consulta.status === filtroStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const { campo, direcao } = ordenacao;
      let valorA, valorB;

      switch (campo) {
        case 'dataConsulta':
          valorA = new Date(a.dataConsulta);
          valorB = new Date(b.dataConsulta);
          break;
        case 'assistida':
          valorA = (a.assistida?.nome || '').toLowerCase();
          valorB = (b.assistida?.nome || '').toLowerCase();
          break;
        case 'medico':
          valorA = (a.medico?.nome || '').toLowerCase();
          valorB = (b.medico?.nome || '').toLowerCase();
          break;
        case 'especialidade':
          valorA = a.especialidade || '';
          valorB = b.especialidade || '';
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
        <h1>Gestão de Consultas Médicas</h1>
        <p>
          Gerencie o atendimento médico das assistidas. Agende consultas, registre atendimentos,
          crie prescrições e acompanhe o histórico de saúde.
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaCalendarAlt size={30} className="text-primary" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Agendadas</h6>
                <h4 className="mb-0">{stats.totalAgendadas}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaCheck size={30} className="text-success" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Realizadas</h6>
                <h4 className="mb-0">{stats.totalRealizadas}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaTimes size={30} className="text-danger" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Canceladas</h6>
                <h4 className="mb-0">{stats.totalCanceladas}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaStethoscope size={30} className="text-info" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Próximas 7 dias</h6>
                <h4 className="mb-0">{stats.proximasConsultas}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Abas de Navegação */}
      <Nav variant="tabs" className="mb-4">
        <Nav.Item>
          <Nav.Link
            active={activeTab === 'calendario'}
            onClick={() => setActiveTab('calendario')}
          >
            <FaCalendarAlt className="me-2" />
            Calendário de Consultas
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            active={activeTab === 'historico'}
            onClick={() => setActiveTab('historico')}
          >
            <FaHistory className="me-2" />
            Histórico Completo
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            active={activeTab === 'historia-patologica'}
            onClick={() => setActiveTab('historia-patologica')}
          >
            <FaClipboardList className="me-2" />
            História Patológica
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Barra de ações */}
      <div className="filtros mb-4">
        <Button
          className="azul d-flex align-items-center gap-2"
          onClick={() => setShowModalAgendar(true)}
        >
          <FaPlus /> Agendar Consulta
          <InfoTooltip
            texto="Agende uma nova consulta médica para uma assistida. Informe a assistida, médico, especialidade, data, horário e motivo da consulta. Consultas ajudam no acompanhamento da saúde das assistidas."
          />
        </Button>

        <div className="d-flex align-items-center gap-2">
          <FaSearch className="text-muted" />
          <Form.Control
            type="text"
            placeholder="Filtrar por assistida, médico ou especialidade..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            id="filtroConsulta"
            style={{ width: '300px' }}
          />
          <Form.Select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="todas">Todas</option>
            <option value="agendada">Agendadas</option>
            <option value="realizada">Realizadas</option>
            <option value="cancelada">Canceladas</option>
          </Form.Select>
        </div>
      </div>

      {/* Conteúdo baseado na aba ativa */}
      {activeTab === 'calendario' && (
        <div className="tabela-container">
          <Table className="tabela-assistidas" hover responsive>
            <thead>
              <tr>
                <th
                  className="cursor-pointer user-select-none"
                  onClick={() => handleOrdenar('dataConsulta')}
                  title="Clique para ordenar por data"
                >
                  Data/Hora {getSortIcon('dataConsulta')}
                </th>
                <th
                  className="cursor-pointer user-select-none"
                  onClick={() => handleOrdenar('assistida')}
                  title="Clique para ordenar por assistida"
                >
                  Assistida {getSortIcon('assistida')}
                </th>
                <th
                  className="cursor-pointer user-select-none"
                  onClick={() => handleOrdenar('medico')}
                  title="Clique para ordenar por médico"
                >
                  Médico {getSortIcon('medico')}
                </th>
                <th
                  className="cursor-pointer user-select-none"
                  onClick={() => handleOrdenar('especialidade')}
                  title="Clique para ordenar por especialidade"
                >
                  Especialidade {getSortIcon('especialidade')}
                </th>
                <th>Motivo</th>
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
                      Carregando consultas...
                    </div>
                  </td>
                </tr>
              ) : consultasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="text-muted">
                      <p className="mb-0">Nenhuma consulta encontrada</p>
                      <small>Tente ajustar os filtros ou agende uma nova consulta</small>
                    </div>
                  </td>
                </tr>
              ) : (
                consultasFiltradas.map(consulta => (
                  <tr key={consulta.id}>
                    <td>
                      <div>
                        {new Date(consulta.dataConsulta).toLocaleDateString('pt-BR')}
                      </div>
                      <small className="text-muted">{consulta.horaConsulta}</small>
                    </td>
                    <td className="fw-medium">
                      {consulta.assistida?.nome || 'Assistida não encontrada'}
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FaUserMd className="text-primary me-2" />
                        {consulta.medico?.nome || 'Médico não definido'}
                      </div>
                    </td>
                    <td>{consulta.especialidade}</td>
                    <td>{consulta.motivo}</td>
                    <td>
                      <Badge bg={getStatusColor(consulta.status)}>
                        {getStatusText(consulta.status)}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        {consulta.status === 'agendada' && (
                          <>
                            <Button
                              size="sm"
                              className="btn-outline-custom"
                              onClick={() => {
                                setConsultaSelecionada(consulta);
                                setShowModalRealizar(true);
                              }}
                            >
                              <FaCheck /> Realizar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleCancelarConsulta(consulta)}
                            >
                              <FaTimes /> Cancelar
                            </Button>
                          </>
                        )}
                        {consulta.status === 'realizada' && (
                          <Button
                            size="sm"
                            variant="outline-info"
                            onClick={() => {
                              setConsultaSelecionada(consulta);
                              setShowModalPrescricao(true);
                            }}
                          >
                            <FaPrescriptionBottleAlt /> Prescrição
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => {
                            setConsultaSelecionada(consulta);
                            setShowModalDetalhes(true);
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
      )}

      {activeTab === 'historico' && (
        <div className="tabela-container">
          <Table className="tabela-assistidas" hover responsive>
            <thead>
              <tr>
                <th>Data</th>
                <th>Assistida</th>
                <th>Médico</th>
                <th>Especialidade</th>
                <th>Diagnóstico</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {consultasFiltradas
                .filter(consulta => consulta.status === 'realizada')
                .map(consulta => (
                  <tr key={consulta.id}>
                    <td>{new Date(consulta.dataConsulta).toLocaleDateString('pt-BR')}</td>
                    <td className="fw-medium">{consulta.assistida?.nome}</td>
                    <td>{consulta.medico?.nome}</td>
                    <td>{consulta.especialidade}</td>
                    <td>{consulta.diagnostico || 'Não informado'}</td>
                    <td>
                      <Badge bg="success">Realizada</Badge>
                    </td>
                    <td>
                      <Button size="sm" variant="outline-info">
                        <FaEye /> Ver Detalhes
                      </Button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </Table>
        </div>
      )}

      {activeTab === 'historia-patologica' && (
        <Row>
          <Col>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Selecione uma Assistida para Ver/Editar História Patológica</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  {assistidas.map(assistida => (
                    <Col md={4} key={assistida.id} className="mb-3">
                      <Card className="h-100">
                        <Card.Body className="text-center">
                          <h6>{assistida.nome}</h6>
                          <p className="text-muted small">CPF: {assistida.cpf}</p>
                          <Button
                            size="sm"
                            className="azul"
                            onClick={() => handleCarregarHistoria(assistida)}
                          >
                            <FaClipboardList /> Ver História
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Modal Agendar Consulta */}
      <Modal show={showModalAgendar} onHide={() => setShowModalAgendar(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Agendar Nova Consulta</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAgendar}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Assistida *</Form.Label>
                  <Form.Select
                    value={formAgendar.assistida_id}
                    onChange={(e) => setFormAgendar({...formAgendar, assistida_id: e.target.value})}
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
                  <Form.Label>Médico *</Form.Label>
                  <Form.Select
                    value={formAgendar.medico_id}
                    onChange={(e) => setFormAgendar({...formAgendar, medico_id: e.target.value})}
                    required
                  >
                    <option value="">Selecione o médico</option>
                    {medicos.map(medico => (
                      <option key={medico.id} value={medico.id}>
                        Dr(a). {medico.nome} - {medico.especialidade}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Especialidade *</Form.Label>
                  <Form.Select
                    value={formAgendar.especialidade}
                    onChange={(e) => setFormAgendar({...formAgendar, especialidade: e.target.value})}
                    required
                  >
                    <option value="">Selecione a especialidade</option>
                    {especialidades.map(esp => (
                      <option key={esp.id} value={esp.nome}>
                        {esp.nome}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Data *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formAgendar.dataConsulta}
                    onChange={(e) => setFormAgendar({...formAgendar, dataConsulta: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Horário *</Form.Label>
                  <Form.Control
                    type="time"
                    value={formAgendar.horaConsulta}
                    onChange={(e) => setFormAgendar({...formAgendar, horaConsulta: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Motivo da Consulta *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formAgendar.motivo}
                onChange={(e) => setFormAgendar({...formAgendar, motivo: e.target.value})}
                placeholder="Descreva o motivo da consulta..."
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Observações</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formAgendar.observacoes}
                onChange={(e) => setFormAgendar({...formAgendar, observacoes: e.target.value})}
                placeholder="Observações adicionais..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModalAgendar(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="azul">
              Agendar Consulta
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Realizar Consulta */}
      <Modal show={showModalRealizar} onHide={() => setShowModalRealizar(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Realizar Consulta</Modal.Title>
        </Modal.Header>
        {consultaSelecionada && (
          <Form onSubmit={handleRealizarConsulta}>
            <Modal.Body>
              <Alert variant="info">
                <strong>Paciente:</strong> {consultaSelecionada.assistida?.nome}<br/>
                <strong>Data/Hora:</strong> {new Date(consultaSelecionada.dataConsulta).toLocaleDateString('pt-BR')} às {consultaSelecionada.horaConsulta}<br/>
                <strong>Médico:</strong> {consultaSelecionada.medico?.nome}
              </Alert>

              <Form.Group className="mb-3">
                <Form.Label>Data de Realização *</Form.Label>
                <Form.Control
                  type="date"
                  value={formRealizar.dataRealizacao}
                  onChange={(e) => setFormRealizar({...formRealizar, dataRealizacao: e.target.value})}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Sintomas Apresentados</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formRealizar.sintomas}
                  onChange={(e) => setFormRealizar({...formRealizar, sintomas: e.target.value})}
                  placeholder="Descreva os sintomas apresentados..."
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Diagnóstico *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formRealizar.diagnostico}
                  onChange={(e) => setFormRealizar({...formRealizar, diagnostico: e.target.value})}
                  placeholder="Diagnóstico médico..."
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Tratamento Recomendado</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formRealizar.tratamento}
                  onChange={(e) => setFormRealizar({...formRealizar, tratamento: e.target.value})}
                  placeholder="Tratamento e orientações..."
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Necessário Retorno?</Form.Label>
                    <Form.Select
                      value={formRealizar.retorno}
                      onChange={(e) => setFormRealizar({...formRealizar, retorno: e.target.value})}
                    >
                      <option value="">Selecione</option>
                      <option value="sim">Sim</option>
                      <option value="nao">Não</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Data de Retorno</Form.Label>
                    <Form.Control
                      type="date"
                      value={formRealizar.dataRetorno}
                      onChange={(e) => setFormRealizar({...formRealizar, dataRetorno: e.target.value})}
                      disabled={formRealizar.retorno !== 'sim'}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Observações</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formRealizar.observacoes}
                  onChange={(e) => setFormRealizar({...formRealizar, observacoes: e.target.value})}
                  placeholder="Observações adicionais..."
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModalRealizar(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="success">
                Finalizar Consulta
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Modal>

      {/* Modal Prescrição Médica */}
      <Modal show={showModalPrescricao} onHide={() => setShowModalPrescricao(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Criar Prescrição Médica</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSalvarPrescricao}>
          <Modal.Body>
            {consultaSelecionada && (
              <Alert variant="info">
                <strong>Paciente:</strong> {consultaSelecionada.assistida?.nome}<br/>
                <strong>Consulta:</strong> {new Date(consultaSelecionada.dataConsulta).toLocaleDateString('pt-BR')}
              </Alert>
            )}

            <h6>Medicamentos Prescritos</h6>
            {formPrescricao.medicamentos.map((medicamento, index) => (
              <Card key={index} className="mb-3">
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Medicamento *</Form.Label>
                        <Form.Control
                          type="text"
                          value={medicamento.medicamento}
                          onChange={(e) => updateMedicamentoPrescricao(index, 'medicamento', e.target.value)}
                          placeholder="Nome do medicamento"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Dosagem *</Form.Label>
                        <Form.Control
                          type="text"
                          value={medicamento.dosagem}
                          onChange={(e) => updateMedicamentoPrescricao(index, 'dosagem', e.target.value)}
                          placeholder="Ex: 500mg"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Posologia *</Form.Label>
                        <Form.Control
                          type="text"
                          value={medicamento.posologia}
                          onChange={(e) => updateMedicamentoPrescricao(index, 'posologia', e.target.value)}
                          placeholder="Ex: 1 comprimido a cada 8 horas"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Duração</Form.Label>
                        <Form.Control
                          type="text"
                          value={medicamento.duracao}
                          onChange={(e) => updateMedicamentoPrescricao(index, 'duracao', e.target.value)}
                          placeholder="Ex: 7 dias"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group className="mb-3">
                        <Form.Label>&nbsp;</Form.Label>
                        <div>
                          {formPrescricao.medicamentos.length > 1 && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => removeMedicamentoPrescricao(index)}
                            >
                              <FaTimes />
                            </Button>
                          )}
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}

            <Button
              variant="outline-primary"
              onClick={addMedicamentoPrescricao}
              className="mb-3"
            >
              <FaPlus /> Adicionar Medicamento
            </Button>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModalPrescricao(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="success">
              Salvar Prescrição
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal História Patológica */}
      <Modal show={showModalHistoria} onHide={() => setShowModalHistoria(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            História Patológica - {assistidaSelecionada?.nome}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSalvarHistoria}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Alergias</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={historiaPatologica.alergias}
                onChange={(e) => setHistoriaPatologica({...historiaPatologica, alergias: e.target.value})}
                placeholder="Alergias conhecidas..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Medicamentos em Uso</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={historiaPatologica.medicamentosUso}
                onChange={(e) => setHistoriaPatologica({...historiaPatologica, medicamentosUso: e.target.value})}
                placeholder="Medicamentos em uso contínuo..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Cirurgias Anteriores</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={historiaPatologica.cirurgias}
                onChange={(e) => setHistoriaPatologica({...historiaPatologica, cirurgias: e.target.value})}
                placeholder="Histórico de cirurgias..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Doenças Crônicas</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={historiaPatologica.doencasCronicas}
                onChange={(e) => setHistoriaPatologica({...historiaPatologica, doencasCronicas: e.target.value})}
                placeholder="Doenças crônicas..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Histórico Familiar</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={historiaPatologica.historicoFamiliar}
                onChange={(e) => setHistoriaPatologica({...historiaPatologica, historicoFamiliar: e.target.value})}
                placeholder="Histórico familiar de doenças..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Observações</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={historiaPatologica.observacoes}
                onChange={(e) => setHistoriaPatologica({...historiaPatologica, observacoes: e.target.value})}
                placeholder="Observações adicionais..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModalHistoria(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="success">
              Salvar História
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Detalhes da Consulta */}
      <Modal show={showModalDetalhes} onHide={() => setShowModalDetalhes(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalhes da Consulta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {consultaSelecionada && (
            <div>
              <Row>
                <Col md={6}>
                  <h6><strong>Informações da Consulta</strong></h6>
                  <p><strong>Data:</strong> {new Date(consultaSelecionada.dataConsulta).toLocaleDateString('pt-BR')}</p>
                  <p><strong>Horário:</strong> {consultaSelecionada.horaConsulta}</p>
                  <p><strong>Especialidade:</strong> {consultaSelecionada.especialidade}</p>
                  <p><strong>Status:</strong> <Badge bg={getStatusColor(consultaSelecionada.status)}>{getStatusText(consultaSelecionada.status)}</Badge></p>
                </Col>
                <Col md={6}>
                  <h6><strong>Paciente e Médico</strong></h6>
                  <p><strong>Assistida:</strong> {consultaSelecionada.assistida?.nome}</p>
                  <p><strong>CPF:</strong> {consultaSelecionada.assistida?.cpf}</p>
                  <p><strong>Médico:</strong> {consultaSelecionada.medico?.nome}</p>
                </Col>
              </Row>
              <hr />
              {consultaSelecionada.motivo && (
                <>
                  <h6><strong>Motivo da Consulta</strong></h6>
                  <p>{consultaSelecionada.motivo}</p>
                </>
              )}
              {consultaSelecionada.observacoes && (
                <>
                  <h6><strong>Observações</strong></h6>
                  <p>{consultaSelecionada.observacoes}</p>
                </>
              )}
              {consultaSelecionada.status === 'realizada' && (
                <>
                  <hr />
                  <h6><strong>Informações da Realização</strong></h6>
                  {consultaSelecionada.sintomas && (
                    <p><strong>Sintomas:</strong> {consultaSelecionada.sintomas}</p>
                  )}
                  {consultaSelecionada.diagnostico && (
                    <p><strong>Diagnóstico:</strong> {consultaSelecionada.diagnostico}</p>
                  )}
                  {consultaSelecionada.tratamento && (
                    <p><strong>Tratamento:</strong> {consultaSelecionada.tratamento}</p>
                  )}
                </>
              )}
              {consultaSelecionada.status === 'cancelada' && consultaSelecionada.motivoCancelamento && (
                <>
                  <hr />
                  <h6><strong>Motivo do Cancelamento</strong></h6>
                  <p>{consultaSelecionada.motivoCancelamento}</p>
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

export default Consultas;
