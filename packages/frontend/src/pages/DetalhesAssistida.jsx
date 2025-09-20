import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Table } from 'react-bootstrap';
import { FaArrowLeft, FaUser, FaMapMarkerAlt, FaPhone, FaCalendarAlt, FaFileAlt, FaEdit } from 'react-icons/fa';
import { BsCapsule, BsDropletHalf, BsHospital, BsJournalMedical } from 'react-icons/bs';
import { assistidasService } from '../services/assistidasService';
import { HprService } from '../services/hprService.js';
import { formatCPF, formatTelefone } from '@casa-mais/shared';
import FormularioHPR from '../components/assistidas/FormularioHPR.jsx';
import Toast from '../components/common/Toast';
import '../components/assistidas/style/Assistidas.css';

const DetalhesAssistida = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assistida, setAssistida] = useState(null);
  const [hpr, setHpr] = useState({});
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

  const formatarData = (data) => (!data ? '-' : new Date(data).toLocaleDateString('pt-BR'));

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
        response = await HprService.update(HPRParaEditar.assistida_id, HPR);
        if (response.success) {
          await carregarHpr();
          fecharModal();
          showToast('História Patológica Regressa atualizada com sucesso!');
        } else showToast('Erro ao atualizar HPR: ' + response.message, 'error');
      } else {
        response = await HprService.create(HPR);
        if (response.success) {
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
      {/* Botão de Excluir HPR */}
      {hpr?.id && (
        <Button variant="danger" onClick={handleDeleteHPR} className="mb-3">
          Excluir HPR
        </Button>
      )}

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
          <div className='add_history mt-2'>
            <Button
              variant="primary"
              onClick={() => {
                if (hpr.data_atendimento) handleEdit(hpr);
                else {
                  setHPRParaEditar(null);
                  setModoEdicao(false);
                }
                setShowModal(true);
              }}
            >
              {hpr.data_atendimento ? <FaEdit /> : <BsJournalMedical />}{" "}
              {hpr.data_atendimento ? "Editar História Patológica Regressa" : "Registrar História Patológica Regressa"}
            </Button>
          </div>
        </Col>
      </Row>

      {/* Detalhes de HPR */}
      {hpr.data_atendimento && (
        <Container>
          {/* Informações de Atendimento */}
          <Row className="mb-4">
            <Col md={6}>
              <Card>
                <Card.Header><FaCalendarAlt className="me-2" /> Informações de Atendimento</Card.Header>
                <Card.Body>
                  <p><strong>Data do Último Atendimento:</strong> {formatarData(hpr.data_atendimento)}</p>
                  <p><strong>Hora:</strong> {hpr.hora || '-'}</p>
                </Card.Body>
              </Card>
            </Col>

            {/* Internações */}
            <Col md={6}>
              <Card>
                <Card.Header><BsHospital className="me-2" /> Internações</Card.Header>
                <Card.Body>
                  {hpr.internacoes?.length > 0 ? (
                    <Table striped bordered size="sm">
                      <thead>
                        <tr>
                          <th>Local</th>
                          <th>Duração</th>
                          <th>Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hpr.internacoes.map((i, idx) => (
                          <tr key={idx}>
                            <td>{i.local}</td>
                            <td>{i.duracao}</td>
                            <td>{formatarData(i.data)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="3"><strong>Motivação:</strong> {hpr.motivacao_internacoes}</td>
                        </tr>
                      </tfoot>
                    </Table>
                  ) : (
                    <p className="text-muted mb-0">Sem internações registradas.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Drogas e Medicamentos */}
          <Row className='mb-4'>
            <Col>
              <Card>
                <Card.Header><BsDropletHalf className="me-2" /> Substâncias Utilizadas</Card.Header>
                <Card.Body>
                  {hpr.drogas?.length > 0 ? (
                    <Table striped bordered size="sm">
                      <thead>
                        <tr>
                          <th>Substância</th>
                          <th>Idade de Início</th>
                          <th>Tempo de Uso</th>
                          <th>Tempo sem Uso</th>
                          <th>Intensidade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hpr.drogas.map((d, idx) => (
                          <tr key={idx}>
                            <td>{d.tipo}</td>
                            <td>{d.idade_inicio} anos</td>
                            <td>{d.tempo_uso}</td>
                            <td>{hpr.tempo_sem_uso}</td>
                            <td>{d.intensidade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <p className="text-muted mb-0">Sem uso de substâncias declarado.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col md={5}>
              <Card>
                <Card.Header><BsCapsule className="me-2" /> Medicamentos Utilizados</Card.Header>
                <Card.Body>
                  {hpr.medicamentos?.length > 0 ? (
                    <Table striped bordered size="sm">
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>Dosagem</th>
                          <th>Frequência</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hpr.medicamentos.map((med, idx) => (
                          <tr key={idx}>
                            <td>{med.nome}</td>
                            <td>{med.dosagem || '-'}</td>
                            <td>{med.frequencia || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <p className="text-muted mb-0">Sem medicamentos registrados.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* História Patológica */}
          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Header><FaFileAlt className="me-2" /> História Patológica e Observações</Card.Header>
                <Card.Body>
                  <p><strong>História Patológica Regressa:</strong></p>
                  <p className="p-3 bg-light rounded">{hpr.historia_patologica || 'Não informado'}</p>

                  {hpr.fatos_marcantes && <p><strong>Fatos Marcantes:</strong> {hpr.fatos_marcantes}</p>}
                  {hpr.infancia && <p><strong>Infância:</strong> {hpr.infancia}</p>}
                  {hpr.adolescencia && <p><strong>Adolescência:</strong> {hpr.adolescencia}</p>}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
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
