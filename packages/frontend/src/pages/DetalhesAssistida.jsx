import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Table } from 'react-bootstrap';
import { FaArrowLeft, FaUser, FaMapMarkerAlt, FaPhone, FaCalendarAlt, FaFileAlt, FaEdit, FaAcquisitionsIncorporated, FaDoorOpen } from 'react-icons/fa';
import { assistidasService } from '../services/assistidasService';
import { HprService } from '../services/hprService.js';
import { formatCPF, formatTelefone } from '@casa-mais/shared';
import FormularioHPR from '../components/assistidas/FormularioHPR.jsx';
import Toast from '../components/common/Toast';
import '../components/assistidas/style/Assistidas.css';
import LinhaDoTempo from './linhaTempo.jsx';

// const hprList = [
//   {
//     data_atendimento: "2025-09-25",
//     hora: "09:30",
//     internacoes: [],
//     motivacao_internacoes: "",
//     drogas: [],
//     tempo_sem_uso: "",
//     medicamentos: [],
//     historia_patologica: "Paciente sem histórico relevante.",
//     fatos_marcantes: "",
//     infancia: "Leve asma.",
//     adolescencia: "Participava de esportes escolares."
//   },
//   {
//     data_atendimento: "2025-08-10",
//     hora: "14:00",
//     internacoes: [
//       { local: "Hospital São João", duracao: "3 dias", data: "2023-05-10" },
//       { local: "Hospital Santa Maria", duracao: "1 semana", data: "2024-02-18" },
//     ],
//     motivacao_internacoes: "Cirurgia e recuperação",
//     drogas: [
//       { tipo: "Álcool", idade_inicio: 18, tempo_uso: "5 anos", intensidade: "Moderada" },
//       { tipo: "Cigarro", idade_inicio: 20, tempo_uso: "2 anos", intensidade: "Leve" },
//     ],
//     tempo_sem_uso: "6 meses",
//     medicamentos: [
//       { nome: "Paracetamol", dosagem: "500mg", frequencia: "3x/dia" },
//       { nome: "Ibuprofeno", dosagem: "400mg", frequencia: "2x/dia" },
//     ],
//     historia_patologica: "Paciente apresenta histórico de hipertensão.",
//     fatos_marcantes: "Queda de bicicleta aos 15 anos.",
//     infancia: "Sem complicações significativas.",
//     adolescencia: "Atividade física regular."
//   },
// ];

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

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    carregarAssistida();
    carregarHpr()
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

  const formatarData = (data) => {
    if (!data) return '-';
    return data.split('T')[0]; // pega só '2025-09-30'
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
      if (modoEdicao && HPRParaEditar && HPR.data_atendimento == formatarData(HPRParaEditar.data_atendimento)) {
          response = await HprService.update(HPRParaEditar.id, HPR);
        if (response && response.id) {
          await carregarHpr();
          fecharModal();
          showToast('História Patológica Regressa atualizada com sucesso!');
        } else showToast('Erro ao atualizar HPR: ' + response.message, 'error');
      } else {

        response = await HprService.create(HPR);
        if (response && response.id) {
          await carregarHpr();
          fecharModal();
          showToast('História Patológica Regressa cadastrada com sucesso!');
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

  const fecharModal = () => {
    setShowModal(false);
    setModoEdicao(false);
    setHPRParaEditar(null);
  };

  const handleDeleteHPR = async () => {
    if (!hpr?.id) return;
    try {
      const response = await HprService.excluir(hpr.id);
      if (response.success) {
        setHpr({});
        showToast('HPR deletada com sucesso');
      }
    } catch (error) {
      showToast('Erro ao deletar HPR: ' + error.message, 'error');
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
            <Button variant="outline-primary" onClick={() => navigate('/assistidas')}>
              <FaArrowLeft className="me-2" /> Voltar
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
                  <p><strong>Status:</strong> <span className={`ms-2 badge status ${assistida.status?.toLowerCase()}`}>{assistida.status || '-'}</span></p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Endereço e Contato */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header><FaMapMarkerAlt className="me-2" /> Endereço</Card.Header>
            <Card.Body>
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

          {/* Botão de Registrar/Editar HPR */}

        </Col>
      </Row>
      <div className="d-flex justify-content-between align-items-center" style={{ marginTop: '5rem' }}>
        <div>
          <h2 className="text-primary d-flex align-items-center gap-1">
            <FaFileAlt />História Patológica Regressa
          </h2>
          <p className="text-muted mt-2">Evolução e progresso da assistida dentro da instituição</p>
        </div>

        <div className='add_history'>
          <Button
            variant="primary"
            onClick={() => {
              if (hprList.length > 0) handleEdit(hprList[hprList.length - 1]);
              else {
                setHPRParaEditar(null);
                setModoEdicao(false);
              }
              setShowModal(true);
            }}
          >
            {hprList.length > 0 ? <FaEdit /> : < FaDoorOpen />}{" "}
            {hprList.length > 0 ? "Editar História Patológica Regressa" : "Registrar Entrada da Assistida"}
          </Button>
          {/* Botão de Excluir HPR */}
          {/* {hpr.data_atendimento && (
                <Button variant="danger" onClick={handleDeleteHPR} className="mb-3">
                  Excluir HPR
                </Button>
              )} */}
        </div>
      </div>

      {/* Detalhes de HPR */}

      {hprList.length > 0 && (
        <>
          <LinhaDoTempo hprList={hprList} />
        </>
      )}

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
    </Container>
  );
};

export default DetalhesAssistida;
