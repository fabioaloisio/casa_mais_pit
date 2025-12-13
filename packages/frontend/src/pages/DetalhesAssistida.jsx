import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Table, Modal, Form } from 'react-bootstrap';
import { FaArrowLeft, FaUser, FaMapMarkerAlt, FaPhone, FaFileAlt, FaBan, FaTrash, FaSignOutAlt, FaTimesCircle, FaArrowCircleRight, FaRedoAlt, FaSignInAlt, FaDoorOpen } from 'react-icons/fa';
import { assistidasService } from '../services/assistidasService';
import { HprService } from '../services/hprService.js';
import { formatCPF, formatTelefone } from '@casa-mais/shared';
import FormularioHPR from '../components/assistidas/FormularioHPR.jsx';
import Toast from '../components/common/Toast';
import '../components/assistidas/style/Assistidas.css';
import LinhaDoTempo from './linhaTempo.jsx';


import { BsJournalMedical } from 'react-icons/bs';
import internacoesService from '../services/internacoesService.js';
import InfoTooltip from '../utils/tooltip.jsx';


const DetalhesAssistida = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assistida, setAssistida] = useState(null);
  const [hprList, setHpr] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [HPRParaEditar, setHPRParaEditar] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [assistidas, setAssistidas] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [hprParaDeletar, setHprParaDeletar] = useState(null);

  const [showModalSaida, setShowModalSaida] = useState(false);
  const [assistidaInativa, setAssistidaInativa] = useState(false);
  const [saida, setSaida] = useState(false);
  const [saidaData, setSaidaData] = useState([]);
  const [entradaData, setEntradaData] = useState([]);

  const [internacoes, setInternacoes] = useState([]);
  const internacoesFiltradas = entradaData.filter((internacao) => internacao.assistidaId === parseInt(id));
  const dataEntrada = internacoesFiltradas.length > 0 ? internacoesFiltradas[0].dataEntrada : ' '


  const hoje = new Date().toISOString().split("T")[0]; // AAAA-MM-DD

  const [formSaida, setFormSaida] = useState({
    dataSaida: "", // inicial vazio
  });


  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    const hash = window.location.hash;
    console.log(hash)
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);


  useEffect(() => {
    carregarAssistida();
    carregarHpr()
    loadData()
  }, [id]);


  const carregarAssistida = async () => {
    try {
      setLoading(true);
      const assistidaData = await assistidasService.obterPorId(id);
      if (assistidaData) setAssistida(assistidaData);
      else setError('Assistida não encontrada');
    } catch (error) {
      setError('Erro ao carregar dados da assistida');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const carregarHpr = async () => {
    try {
      setLoading(true);
      const hprData = await HprService.obterPorId(id);

      setHpr(hprData)
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // Busca as internações da assistida
      const response = await internacoesService.getAll();

      if (response && response.data) {
        const internacoesData = response.data;


        // formatar Entradas do estado
        const formatarEntrada = internacoesData.map(item => ({
          id: item.id,
          assistidaId: item.assistida_id,
          dataEntrada: item.dataEntrada,
          motivo: item.motivo,
          observacoes: item.observacoes,
          modoRetorno: item.modo_retorno
        }));


        // formatar saídas do estado
        const formatarSaida = internacoesData.map(item => ({
          id: item.id,
          assistidaId: item.assistida_id,
          dataSaida: item.dataSaida,
          diasInternacao: item.dias_internada,
          motivoSaida: item.motivoSaida,
          observacoesSaida: item.observacoesSaida
        }));


        setEntradaData(formatarEntrada);
        setSaidaData(formatarSaida);
        setInternacoes(internacoesData);
      }

    } catch (error) {
      console.error('Erro ao carregar internações:', error);
      showToast('Erro ao carregar internações. Verifique sua conexão.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data) => {
    if (!data) return '-';

    const soData = data.split('T')[0]; // "2025-09-30"
    const [ano, mes, dia] = soData.split('-'); // separa

    return `${dia}/${mes}/${ano}`; // inverte
  };


  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return '-';
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();
    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) idade--;
    return idade;
  };

  const adicionarHPR = async (HPR) => {
    try {
      let response;
      if (modoEdicao && HPRParaEditar) {
        response = await HprService.update(HPRParaEditar.id, HPR);
        if (response && response.id) {
          await carregarHpr();
          await carregarAssistida();
          fecharModal();
          showToast('Edição da História Patológica Regressa realizada com sucesso!');
        } else showToast('Erro ao atualizar HPR: ' + response.message, 'error');
      } else {
        response = await HprService.create(HPR);
        if (response && response.id) {
          await carregarHpr();
          await carregarAssistida();
          fecharModal();
          if (hprList.length > 0) {
            showToast('Atualização da História Patológica Regressa realizada com sucesso!');
          } else {
            showToast('História Patológica Regresa cadastrada com sucesso!');
          }
        } else showToast('Erro ao cadastrar HPR: ' + response.message, 'error');
      }
    } catch (error) {
      showToast('Erro ao processar HPR: ' + error.message, 'error');
    }
  };



  const handleEdit = (dado) => {
    setHPRParaEditar(dado);
    setModoEdicao(true);
    setShowModal(true);
  };

  const handleDelete = (hpr) => {

    setHprParaDeletar(hpr);
    setShowConfirmDelete(true);
  };


  const fecharModal = () => {
    setShowModal(false);
    setModoEdicao(false);
    setHPRParaEditar(null);
  };

  const handleDeleteHPR = async (hprId) => {
    if (!hprId) return;
    try {
      const response = await HprService.delete(hprId);
      if (response) {
        showToast('HPR deletada com sucesso');
        carregarHpr()
      }
    } catch (error) {
      showToast('Erro ao deletar HPR: ' + error.message, 'error');
    }
  };

  const obterFluxo = () => {
    // 1) Se NÃO existe HPR → primeira ação sempre será "Registrar HPR"
    if (!hprList || hprList.length === 0) {
      return { texto: "Registrar História Patológica Regressa", Icone: BsJournalMedical, tooltipText: "Registre o histórico clínico da assistida, incluindo sua admissão (entrada), saída após o tratamento e possíveis retornos por recaídas. Cada etapa fica registrada na linha do tempo, permitindo acompanhar todo o processo de internação e evolução da assistida." };
    }

    // 2) Ordenar entradas e saídas por data
    const entrada = entradaData
      .filter(e => e.assistidaId === parseInt(id) && e.dataEntrada)
      .sort((a, b) => new Date(b.dataEntrada) - new Date(a.dataEntrada))[0];

    const saida = saidaData
      .filter(s => s.assistidaId === parseInt(id) && s.dataSaida)
      .sort((a, b) => new Date(b.dataSaida) - new Date(a.dataSaida))[0];

    // 3) Pegar último evento entre Entrada e Saída
    let ultimoEvento = null;
    if (entrada && !saida) ultimoEvento = "entrada";
    else if (!entrada && saida) ultimoEvento = "saida";
    else if (entrada && saida) {
      ultimoEvento = new Date(entrada.dataEntrada) > new Date(saida.dataSaida)
        ? "entrada"
        : "saida";
    }

    // 4) Fluxo baseado no último evento
    switch (ultimoEvento) {

      case "entrada":
        return { texto: "Efetuar Saída da Instituição", Icone: FaSignOutAlt, tooltipText: "Registre a saída da assistida da instituição, indicando a data de encerramento. Esse registro finaliza o período de internação, mantendo o histórico completo para consultas futuras." };

      case "saida":
        return { texto: "Registrar Retorno para a Instituição", Icone: FaRedoAlt, tooltipText: "Registre o retorno da assistida à instituição após uma saída. Esse registro permite acompanhar novos períodos de permanência, mantendo o histórico completo de internações e retornos." };

      default:
        // Se por algum erro não achar nada → próxima é entrada
        return { texto: "Registrar Entrada de Internação", Icone: FaDoorOpen, tooltipText: "Registre a entrada da assistida na instituição. Esta etapa marca o início do acompanhamento, permitindo o controle do período de permanência, histórico clínico e evolução do tratamento." };
    }
  };

  const { texto, Icone, tooltipText } = obterFluxo();

  const executarAcao = () => {
    if (texto.includes("História Patológica Regressa")) {
      // Abrir modal de HPR
      setModoEdicao(false);
      setHPRParaEditar(null);
      setShowModal(true);
    }
    else if (texto.includes("Retorno")) {
      // Navegar para Internações com modoRetorno
      navigate(`/internacoes`, {
        state: {
          assistidaId: id,
          modoRetorno: true
        }
      });
    } else if (texto.includes("Saída")) {
      navigate('/internacoes', {
        state: {
          openModalSaida: true,
          saida: {
            assistidaId: id,
            dataEntrada: dataEntrada
          }
        }
      });
    } else {
      navigate('/internacoes', {
        state: { openModalEntrada: true, assistidaId: id }
      });
    }
  };



  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          {error}
          <div className="mt-3">
            <Button variant="outline-danger" onClick={() => navigate('/assistidas')}>
              <FaArrowLeft className="me-2" /> Voltar para Lista
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!assistida) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">
          Assistida não encontrada
          <div className="mt-3">
            <Button variant="outline-warning" onClick={() => navigate('/assistidas')}>
              <FaArrowLeft className="me-2" /> Voltar para Lista
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }


  return (
    <Container className="mt-4">

      {/* Dados da Assistida */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-primary d-flex align-items-center gap-1">
                <FaUser /> {assistida.nome}
              </h2>
              <p className="text-muted mt-2">Dados completos e descrição detalhada da assistida</p>
            </div>
            <Button variant="primary" onClick={() => navigate('/assistidas')}>
              <FaArrowLeft className="me-2" /> Voltar para Assistidas
            </Button>
          </div>
        </Col>
      </Row>

      {/* Card de Dados Pessoais */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5><FaUser className="me-2" /> Dados Pessoais</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Nome:</strong> {assistida.nome || '-'}</p>
                  <p><strong>CPF:</strong> {formatCPF(assistida.cpf) || '-'}</p>
                  <p><strong>RG:</strong> {assistida.rg || '-'}</p>
                  <p><strong>Data de Nascimento:</strong> {formatarData(assistida.data_nascimento)}</p>
                  <p><strong>Idade:</strong> {calcularIdade(assistida.data_nascimento)} anos</p>
                </Col>
                <Col md={6}>
                  <p><strong>Nacionalidade:</strong> {assistida.nacionalidade || '-'}</p>
                  <p><strong>Estado Civil:</strong> {assistida.estado_civil || '-'}</p>
                  <p><strong>Profissão:</strong> {assistida.profissao || '-'}</p>
                  <p><strong>Escolaridade:</strong> Ensino {assistida.escolaridade || '-'}</p>
                  <p><strong>Status:</strong> <span className={`ms-2 badge status ${assistida.status?.toLowerCase().replaceAll(" ", "")}`}>{assistida.status || "-"}</span></p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Endereço e Contato */}
      <Row className="mb-4" >
        <Col md={6}>
          <Card>
            <Card.Header><FaMapMarkerAlt className="me-2" /> Endereço</Card.Header>
            <Card.Body id="titulo-hpr">
              <p><strong>Logradouro:</strong> {assistida.logradouro || '-'}</p>
              <p><strong>Número:</strong> {assistida.numero || '-'}</p>
              <p><strong>Bairro:</strong> {assistida.bairro || '-'}</p>
              <p><strong>CEP:</strong> {assistida.cep || '-'}</p>
              <p><strong>Cidade:</strong> {assistida.cidade || '-'}</p>
              <p><strong>Estado:</strong> {assistida.estado || '-'}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header><FaPhone className="me-2" /> Contato</Card.Header>
            <Card.Body>
              <p><strong>Telefone:</strong> {formatTelefone(assistida.telefone)}</p>
              {assistida.telefone_contato && <p><strong>Telefone de Contato:</strong> {formatTelefone(assistida.telefone_contato)}</p>}
            </Card.Body>
          </Card>


        </Col>
      </Row>
      <div className="d-flex justify-content-between align-items-center" style={{ marginTop: '5rem' }}>
        <div>
          <h2 id='hpr' className="text-primary d-flex align-items-center gap-1">
            <FaFileAlt />História Patológica Regressa
          </h2>
          <p className="text-muted mt-2">Evolução e progresso da assistida dentro da instituição</p>
        </div>
        <div className='add_history'>
          <Button
            variant="primary"
            onClick={executarAcao}
          >
            <Icone /> {texto}

            <InfoTooltip
              texto={tooltipText}
            />
          </Button>
        </div>

      </div>

      {
        hprList.length > 0 && (
          <>
            <LinhaDoTempo
              hprList={hprList}
              saidaList={saidaData}
              onEditHPR={handleEdit}
              onDeleteHPR={handleDelete}
              internacoesList={entradaData}

            />

            {/* <div className="d-flex justify-content-between align-items-center saida p-2">
              <div>
                <h4 className="d-flex align-items-center gap-2">
                  <FaArrowCircleRight />Saída da Assistida da instituição
                </h4>
                <p className="mt-3" >
                  Ao registrar a saída da assistida, todos os seus dados e históricos permanecem  armazenados, garantindo a possibilidade de seu retorno e continuidade do acompanhamento a qualquer momento.
                </p>

              </div>

              <div className='add_history'>

                <Button
                  variant="danger"
                  onClick={handleShowModalSaida}
                  disabled={assistida.status === 'Inativa'}

                >
                  <FaSignOutAlt /> Efetuar Saída da instituição
                </Button>

              </div>
            </div> */}
          </>
        )
      }

      {/* Formulário HPR */}
      <FormularioHPR
        showModal={showModal}
        setShowModal={fecharModal}
        onSubmit={adicionarHPR}
        HPRParaEditar={HPRParaEditar}
        modoEdicao={modoEdicao}
        listaAssistidas={assistidas}
      />

      {/* Toast */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />


      <Modal show={showConfirmDelete} onHide={() => setShowConfirmDelete(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Você tem certeza que deseja excluir essa HPR? Essa operação não poderá ser desfeita.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmDelete(false)}>
            <FaBan /> Cancelar
          </Button>

          <Button
            variant="danger"
            onClick={async () => {
              if (hprParaDeletar) {
                try {
                  await handleDeleteHPR(hprParaDeletar);
                  showToast('HPR deletada com sucesso');
                  setHprParaDeletar(null);
                } catch (error) {
                  showToast('Erro ao deletar HPR: ' + error.message, 'error');
                } finally {
                  setShowConfirmDelete(false);
                }
              }
            }}
          >
            <FaTrash /> Sim, excluir
          </Button>

        </Modal.Footer>
      </Modal>


    </Container >
  );
};

export default DetalhesAssistida;
