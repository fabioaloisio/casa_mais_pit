import { useNavigate, useLocation } from "react-router-dom";
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
  FaEye,
  FaDoorOpen
} from 'react-icons/fa';
import internacoesService from '../services/internacoesService';
import assistidasService from '../services/assistidasService';
import Toast from '../components/common/Toast';
import './Doacoes.css';
import HprService from '../services/hprService';
import { BsJournalMedical } from 'react-icons/bs';
import { calcularDiasInternacao } from "../utils/calcularDiasDeInternacao";
import InfoTooltip from "../utils/tooltip";


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
  const [hprList, setHpr] = useState([]);
  const [assistidaSelecionada, setAssistidaSelecionada] = useState(null);

  const [modoRetorno, setModoRetorno] = useState(false);

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
    carregarHpr()
  }, []);
  const navigate = useNavigate();
  const location = useLocation();

  {
    assistidas.map(assistida => (
      <option key={assistida.id} value={String(assistida.id)}>
        {assistida.nome}
      </option>
    ))
  }

  // useEffect de entrada e saida
  useEffect(() => {
    const state = location?.state || {};

    // Se não houver nada vindo da navegação, não faz nada
    if (!state.openModalEntrada && !state.openModalSaida) return;

    // Função genérica para limpar o state de navegação (previne reabertura)
    const limparState = () =>
      navigate(location.pathname, { replace: true, state: {} });

    // -----------------------------------------------------
    // 🟦 MODO EDIÇÃO DE ENTRADA
    // -----------------------------------------------------
    if (state.editMode && state.internacao) {
      const dados = state.internacao;

      setInternacaoSelecionada(dados);

      setFormEntrada({
        assistida_id: String(dados.assistida_id),
        motivo: dados.motivo || '',
        observacoes: dados.observacoes || '',
        dataEntrada: dados.dataEntrada?.split('T')[0] || ''
      });

      setShowModalEntrada(true);
      limparState();
      return;
    }

    // -----------------------------------------------------
    // 🟥 MODO EDIÇÃO DE SAÍDA
    // -----------------------------------------------------
    if (state.openModalSaida && state.editMode && state.saida) {
      const s = state.saida;

      setInternacaoSelecionada(s); // ← salva o que veio da TL

      setFormSaida({
        dataSaida: s.dataSaida?.split('T')[0] || '',
        motivoSaida: s.motivoSaida || '',
        observacoesSaida: s.observacoes || '',
      });

      setShowModalSaida(true);
      limparState();
      return;
    }

    // -----------------------------------------------------
    // 🟩 MODO INTERNAR (novo registro de entrada)
    // -----------------------------------------------------
    if (state.openModalEntrada) {
      if (state.assistidaId) {
        setFormEntrada(prev => ({
          ...prev,
          assistida_id: String(state.assistidaId)
        }));
      }
      setShowModalEntrada(true);
      limparState();
    }
    // -----------------------------------------------------
    // 🟧 MODO SAIR
    // -----------------------------------------------------
    if (state.openModalSaida) {

      const s = state.saida;

      setInternacaoSelecionada({
        id: s.id ?? null,
        assistida_id: s.assistidaId,
        dataEntrada: s.dataEntrada
      });

      setFormSaida({
        dataSaida: new Date().toISOString().split("T")[0],
        motivoSaida: "",
        observacoesSaida: ""
      });

      setShowModalSaida(true);
      limparState();
      return;
    }

  }, [location]);

  // useEffect para buscar o nome da assistida

  useEffect(() => {
    if (!internacaoSelecionada || !internacaoSelecionada.assistida_id) {
      setAssistidaSelecionada(null);
      return;
    }

    const encontrada = assistidas.find(
      a => Number(a.id) === Number(internacaoSelecionada.assistida_id)
    );

    setAssistidaSelecionada(encontrada || null);
  }, [internacaoSelecionada, assistidas]);

  // useEffect para retorno
  useEffect(() => {
    if (location.state?.modoRetorno) {
      setModoRetorno(true);
      setShowModalEntrada(true);

      // Pré-preencher assistida_id
      setFormEntrada(prev => ({
        ...prev,
        assistida_id: location.state.assistidaId
      }));
    }
  }, [location.state]);


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


  const formataDataComparacao = (dataStr) => {
    const [ano, mes, dia] = dataStr.split("T")[0].split("-");
    return Number(`${ano}${mes}${dia}`);
  };

  const limparData = (dataStr) => {
    if (!dataStr) return null;
    const date = new Date(dataStr);
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const dia = String(date.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`; // sem horário, sem fuso
  };

  const handleEfetuarEntrada = async (e) => {
    e.preventDefault();
    try {
      // ==========================================================
      // 0) LIMPAR A DATA (REMOVER HORÁRIO E TIMEZONE)
      // ==========================================================
      const dataEntradaLimpa = formataDataComparacao(formEntrada.dataEntrada);

      // ==========================================================
      // 1) Impedir internação sem HPR
      // ==========================================================
      const hprExistente = hprList.find(
        hpr => hpr.assistida_id === Number(formEntrada.assistida_id)
      );

      if (!hprExistente) {
        setToast({
          show: true,
          message: 'Esta assistida ainda não possui uma HPR cadastrada. Cadastre uma HPR antes de internar.',
          type: 'warning'
        });

        setTimeout(() => {
          window.location.href = `/assistidas/${formEntrada.assistida_id}/detalhes`;
        }, 3400);
        return;
      }

      let result;

      // ==========================================================
      // 2) EDIÇÃO de Entrada ou Retorno
      // ==========================================================
      if (internacaoSelecionada?.dataEntrada) {

        // Edição de retorno
        if (internacaoSelecionada.modo_retorno) {
          result = await internacoesService.atualizarEntrada(
            internacaoSelecionada.id,
            { ...formEntrada, dataEntrada: dataEntradaLimpa, modo_retorno: true }
          );

          setToast({ show: true, message: "Retorno atualizado com sucesso!", type: "success" });
          setTimeout(() => {
            navigate(`/assistidas/${internacaoSelecionada.assistida_id}/detalhes/#retorno`);
          }, 1400);

        } else {
          // Edição de entrada normal
          result = await internacoesService.atualizarEntrada(
            internacaoSelecionada.id,
            { ...formEntrada, dataEntrada: dataEntradaLimpa }
          );

          setToast({ show: true, message: "Entrada atualizada com sucesso!", type: "success" });
          setTimeout(() => {
            navigate(`/assistidas/${internacaoSelecionada.assistida_id}/detalhes/#entrada`);
          }, 1400);
        }

      }

      // ==========================================================
      // 3) REGISTRO DE RETORNO
      // ==========================================================
      else if (modoRetorno) {

        const ultimaSaida = internacoes
          .filter(i => Number(i.assistida_id) === Number(formEntrada.assistida_id) && i.dataSaida)
          .sort((a, b) => new Date(b.dataSaida) - new Date(a.dataSaida))[0];

        if (!ultimaSaida) {
          return setToast({
            show: true,
            message: "Não é possível registrar retorno, pois não existe saída anterior.",
            type: "danger"
          });
        }

        const dataRetorno = new Date(dataEntradaLimpa);
        const dataUltimaSaida = new Date(ultimaSaida.dataSaida);

        // if (dataRetorno < dataUltimaSaida) {
        //   return setToast({
        //     show: true,
        //     message: "A data de retorno não pode ser anterior à última saída.",
        //     type: "danger"
        //   });
        // }

        result = await internacoesService.efetuarEntrada({
          ...formEntrada,
          dataEntrada: dataEntradaLimpa,
          modo_retorno: true
        });

        setToast({ show: true, message: "Retorno registrado com sucesso!", type: "success" });
        setTimeout(() => {
          navigate(`/assistidas/${formEntrada.assistida_id}/detalhes/#retorno`);
        }, 1400);

      }

      // ==========================================================
      // 4) REGISTRO DE ENTRADA NORMAL
      // ==========================================================
      else {

        result = await internacoesService.efetuarEntrada({
          ...formEntrada,
          dataEntrada: dataEntradaLimpa
        });

        setToast({ show: true, message: "Entrada registrada com sucesso!", type: "success" });
      }

      await loadData();
      setShowModalEntrada(false);

    } catch (error) {
      setToast({ show: true, message: error.message || 'Erro ao registrar entrada.', type: 'danger' });
    }
  };

  const handleEfetuarSaida = async (e) => {
    e.preventDefault();

    // ============================
    // 1) PEGAR A DATA DE ENTRADA REAL DA INTERNAÇÃO
    // ============================
    const dataEntrada = formataDataComparacao(internacaoSelecionada.dataEntrada);
    const dataSaida = formataDataComparacao(formSaida.dataSaida);


    // ============================
    // 2) VALIDAÇÃO
    // ============================
    if (isNaN(dataSaida)) {
      return setToast({
        show: true,
        message: "Selecione uma data de saída válida.",
        type: "danger",
      });
    }


    if (dataSaida < dataEntrada) {
      return setToast({
        show: true,
        message: "A data de saída não pode ser menor que a data de entrada.",
        type: "danger",
      });
    }



    // ============================
    // 3) CONTINUA O PROCESSO NORMAL
    // ============================
    try {
      let result;

      // ➤ MODO EDIÇÃO
      if (internacaoSelecionada.motivoSaida) {
        result = await internacoesService.atualizarSaida(
          internacaoSelecionada.id,
          formSaida
        );

        setTimeout(() => {
          navigate(`/assistidas/${internacaoSelecionada.assistida_id}/detalhes/#saida`);
        }, 1400);

      } else {
        // ➤ MODO CRIAÇÃO
        result = await internacoesService.efetuarSaida(
          internacaoSelecionada.assistida_id,
          formSaida
        );
      }

      setToast({
        show: true,
        message: result.message || "Saída registrada/atualizada com sucesso!",
        type: "success",
      });

      await loadData();
      setShowModalSaida(false);

    } catch (error) {
      setToast({
        show: true,
        message: error.message || "Erro ao registrar/atualizar saída.",
        type: "danger",
      });
    }
    setInternacaoSelecionada(null);   // limpa modo edição
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

  const verificarModoRetorno = (assistidaId) => {
    if (!assistidaId) return;

    // FILTRA histórico real da assistida
    const historicoInternacoes = internacoes.filter(
      item => Number(item.assistida_id) === Number(assistidaId)
    );

    const historicoSaidas = internacoes
      .filter(item => Number(item.assistida_id) === Number(assistidaId))
      .filter(item => item.dataSaida);

    // Nunca internou → primeira ação é ENTRADA
    if (historicoInternacoes.length === 0) {
      setModoRetorno(false);
      setInternacaoSelecionada(null);
      return;
    }

    // lista de eventos da linha do tempo

    const eventos = [

      // ENTRADAS e RETORNOS
      ...historicoInternacoes.map(i => ({
        id: i.id,
        assistida_id: i.assistida_id,
        tipo: i.modoRetorno ? "retorno" : "entrada",
        data: new Date(i.dataEntrada),
        original: i
      })),

      // SAÍDAS
      ...historicoSaidas.map(s => ({
        id: s.id,
        assistida_id: s.assistida_id,
        tipo: "saida",
        data: new Date(s.dataSaida),
        original: s
      }))
    ];

    // Ordena cronologicamente → último evento primeiro

    const eventosOrdenados = eventos.sort((a, b) => b.data - a.data);

    const ultimo = eventosOrdenados[0];

    //  Decisão do fluxo

    if (ultimo.tipo === "entrada") {
      setModoRetorno(false);
    } else if (ultimo.tipo === "saida") {
      setModoRetorno(true);
    } else {
      setModoRetorno(false);
    }
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

  const carregarHpr = async () => {
    try {
      setLoading(true);
      const hprData = await HprService.obterTodos();
      setHpr(hprData)
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // resetar campos de edição
  const formSaidaVazio = {
    motivoSaida: "",
    observacoes: "",
    dataSaida: ""
  };

  const formEntradaVazio = {
    assistida_id: "",
    motivo: "",
    observacoes: "",
    dataEntrada: ""
  };

  const handleCloseModalSaida = () => {
    setShowModalSaida(false);
    setInternacaoSelecionada(null);   // limpa modo edição
    setFormSaida(formSaidaVazio);     // reseta formulário
    setAssistidaSelecionada(null);
  };

  const handleCloseModalEntrada = () => {
    setShowModalEntrada(false);
    setShowModalHistorico(false)
    setInternacaoSelecionada(null);
    setFormEntrada(formEntradaVazio);

    setModoRetorno(false);
    setInternacaoSelecionada(null);
  };


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
          <FaDoorOpen /> Registrar Entrada
          <InfoTooltip
            texto="Registre a entrada da assistida na instituição. Esta etapa marca o início do acompanhamento, permitindo o controle do período de permanência, histórico clínico e evolução do tratamento."

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
      <Modal show={showModalEntrada} onHide={handleCloseModalEntrada} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {internacaoSelecionada?.motivo
              ? internacaoSelecionada?.modo_retorno || modoRetorno
                ? "Edição de Retorno"
                : "Edição de Entrada"
              : internacaoSelecionada?.modo_retorno || modoRetorno
                ? "Registrar Retorno da Assistida"
                : "Registrar Entrada de Internação"}
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleEfetuarEntrada}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Assistida *</Form.Label>
                  <Form.Select
                    value={formEntrada.assistida_id}
                    onChange={(e) => {
                      setFormEntrada({ ...formEntrada, assistida_id: e.target.value });
                      verificarModoRetorno(e.target.value);
                    }}
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
                  <Form.Label>
                    {internacaoSelecionada?.dataEntrada
                      ? (
                        internacaoSelecionada?.modo_retorno
                          ? "Data de Retorno"
                          : "Data de Entrada"
                      )
                      : (
                        modoRetorno
                          ? "Data de Retorno"
                          : "Data de Entrada"
                      )
                    } *
                  </Form.Label>

                  <Form.Control
                    type="date"
                    value={formEntrada.dataEntrada}
                    onChange={(e) => setFormEntrada({ ...formEntrada, dataEntrada: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>
                {internacaoSelecionada?.dataEntrada
                  ? (
                    internacaoSelecionada?.modo_retorno
                      ? "Motivo do Retorno"
                      : "Motivo da Internação"
                  )
                  : (
                    modoRetorno
                      ? "Motivo do Retorno"
                      : "Motivo da Internação"
                  )
                } *
              </Form.Label>

              <Form.Control
                as="textarea"
                rows={3}
                value={formEntrada.motivo}
                onChange={(e) => setFormEntrada({ ...formEntrada, motivo: e.target.value })}
                placeholder={internacaoSelecionada?.modo_retorno
                  ? "Descreva o motivo do retorno..."
                  : "Descreva o motivo da internação..."}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Observações</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formEntrada.observacoes}
                onChange={(e) => setFormEntrada({ ...formEntrada, observacoes: e.target.value })}
                placeholder="Observações adicionais..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModalEntrada(false)}>
              Cancelar
            </Button>

            <Button type="submit" className="azul">
              {internacaoSelecionada?.dataEntrada
                ? (
                  internacaoSelecionada?.modo_retorno
                    ? "Editar Retorno"
                    : "Editar Entrada"
                )
                : (
                  modoRetorno
                    ? "Registrar Retorno"
                    : "Registrar Entrada"
                )
              }
            </Button>

          </Modal.Footer>
        </Form>
      </Modal>



      {/* Modal de Saída */}
      <Modal show={showModalSaida} onHide={handleCloseModalSaida} size="lg" >
        <Modal.Header closeButton>
          <Modal.Title>
            {internacaoSelecionada && internacaoSelecionada.motivoSaida
              ? "Edição de Saída"
              : "Registrar Saída de Internação"}
          </Modal.Title>

        </Modal.Header>
        {internacaoSelecionada && (
          <Form onSubmit={handleEfetuarSaida}>
            <Modal.Body>
              {assistidaSelecionada && (
                <Alert variant="info">
                  <strong>Assistida:</strong> {assistidaSelecionada.nome}<br />

                  <strong>Data de Entrada: </strong>
                  {new Date(internacaoSelecionada.dataEntrada)
                    .toLocaleDateString('pt-BR')}<br />

                  <strong>Dias de Internação: </strong>
                  {calcularDiasInternacao(internacaoSelecionada.dataEntrada)} dias
                </Alert>
              )}

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Data de Saída *</Form.Label>
                    <Form.Control
                      type="date"
                      value={formSaida.dataSaida}
                      onChange={(e) => setFormSaida({ ...formSaida, dataSaida: e.target.value })}
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
                  onChange={(e) => setFormSaida({ ...formSaida, motivoSaida: e.target.value })}
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
                  onChange={(e) => setFormSaida({ ...formSaida, observacoesSaida: e.target.value })}
                  placeholder="Observações adicionais sobre a saída..."
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModalSaida(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="success">
                {internacaoSelecionada.motivoSaida ? "Editar Saída" : "Registrar Saída"}
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Modal>

      {/* Modal de Detalhes/Histórico */}
      <Modal show={showModalHistorico} onHide={handleCloseModalEntrada} size="lg">
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
              <Row>
                <Col md={6}>
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
                </Col>
                <Col md={6} className='d-flex align-items-center justify-content-center'>

                  <Button
                    variant="primary"
                    onClick={() => navigate(`/assistidas/${internacaoSelecionada.assistida_id}/detalhes/#hpr`)}
                  >
                    <BsJournalMedical /> Visualizar HPR da Assistida
                  </Button>

                </Col>
              </Row>
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
