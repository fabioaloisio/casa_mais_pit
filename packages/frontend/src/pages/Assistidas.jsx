import { useEffect, useState } from 'react';
import { Button, Form, Row, Col, Card } from 'react-bootstrap';
import Formulario from '../components/assistidas/Formulario';
import ListaAssistidas from '../components/assistidas/ListaAssistidas';
import { assistidasService } from '../services/assistidasService';
import { HprService } from '../services/hprService';
import Toast from '../components/common/Toast';
import ConfirmDeleteModal from '../components/assistidas/ConfirmDeleteModal';
import '../components/assistidas/style/Assistidas.css';
import '../pages/Doacoes.css';
import { FaBan, FaBirthdayCake, FaCalendarPlus, FaCheckCircle, FaClipboardCheck, FaClock, FaPlus, FaUserCheck, FaUsers, FaUserTimes } from 'react-icons/fa';

const Assistidas = () => {
  const [assistidas, setAssistidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroCPF, setFiltroCPF] = useState('');
  const [filtroIdade, setFiltroIdade] = useState('');
  const [stats, setStats] = useState(null);

  // Estados para edição
  const [assistidaParaEditar, setAssistidaParaEditar] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  // Estados para exclusão
  const [assistidaToDelete, setAssistidaToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Estado para Toast
  const [toast, setToast] = useState({ show: false, message: '', ty: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };


  const carregarAssistidas = async () => {
    try {
      setLoading(true);
      const dados = await assistidasService.obterTodos();
      setAssistidas(dados);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar assistidas:', err);
      setError('Erro ao carregar assistidas. Verifique se o servidor está rodando.');
      showToast('Erro ao carregar assistidas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const carregarEstatisticas = async () => {
    try {
      const estatisticas = await assistidasService.obterEstatisticas();
      setStats(estatisticas);
    } catch (err) {
      console.error('Erro ao carregar estatística:', err);
    }
  };

  useEffect(() => {
    carregarAssistidas();
    carregarEstatisticas();
  }, []);

  const adicionarAssistida = async (novaAssistida) => {
    try {
      let response;

      if (modoEdicao && assistidaParaEditar) {
        // Modo edição
        response = await assistidasService.update(assistidaParaEditar.id, novaAssistida);
        if (response.success) {
          await carregarAssistidas();
          await carregarEstatisticas();
          fecharModal();
          showToast('Assistida atualizada com sucesso!');
        } else {
          showToast('Erro ao atualizar assistida: ' + response.message, 'error');
        }
      } else {
        // Modo criação
        response = await assistidasService.create(novaAssistida);
        if (response.success) {
          await carregarAssistidas();
          await carregarEstatisticas();
          fecharModal();
          showToast('Assistida cadastrada com sucesso!');
        } else {
          showToast('Erro ao cadastrar assistida: ' + response.message, 'error');
        }
      }
    } catch (error) {
      showToast('Erro ao processar assistida: ' + error.message, 'error');
    }
  };

  const handleEdit = (assistida) => {
    setAssistidaParaEditar(assistida);
    setModoEdicao(true);
    setShowModal(true);
  };

  const fecharModal = () => {
    setShowModal(false);
    setModoEdicao(false);
    setAssistidaParaEditar(null);
  };

  const handleDelete = (assistida) => {
    setAssistidaToDelete(assistida);
    setShowDeleteModal(true);
  };

  const confirmarExclusao = async () => {
    try {
      setDeleting(true);
      const response = await assistidasService.delete(assistidaToDelete.id);
      if (response.success) {
        await carregarAssistidas();
        await carregarEstatisticas();
        setShowDeleteModal(false);
        setAssistidaToDelete(null);
        showToast('Assistida excluída com sucesso!');
      } else {
        showToast('Erro ao excluir assistida: ' + response.message, 'error');
      }
    } catch (error) {
      showToast('Erro ao excluir assistida: ' + error.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Filtrar assistidas
  const assistidasFiltradas = assistidas.filter((assistida) => {
    const filtroStatusMatch = filtroStatus === '' || assistida.status === filtroStatus;
    const filtroNomeMatch = filtroNome === '' || assistida.nome.toLowerCase().includes(filtroNome.toLowerCase());
    const filtroCPFMatch = filtroCPF === '' || assistida.cpf.replace(/\D/g, '').includes(filtroCPF.replace(/\D/g, ''));
    const filtroIdadeMatch = filtroIdade === '' || assistida.idade.toString().includes(filtroIdade);

    return filtroStatusMatch && filtroNomeMatch && filtroCPFMatch && filtroIdadeMatch;
  });

  console.log(assistidasFiltradas.filter(a => a.status === 'Hpr Cadastrada').length)

  if (loading) {
    return (
      <div className="conteudo">
        <div className="topo">
          <h1>Gestão de Assistidas</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Carregando assistidas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="conteudo">
        <div className="topo">
          <h1>Gestão de Assistidas</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          <p>{error}</p>
          <Button onClick={carregarAssistidas} style={{ marginTop: '10px' }}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="conteudo">
      <div className="topo">
        <h1>Gestão de Assistidas</h1>
        <p>Gerencie os dados completos das assistidas, incluindo dados pessoais, endereço e contatos emergenciais.</p>
      </div>

      {/* Cards de Estatísticas */}
      {stats && (
        <Row className="mb-4">

          <Col md={3}>
            <Card className="stats-card h-100">
              <Card.Body className="d-flex align-items-center">
                <div className="me-3">
                  <FaUsers size={30} className="text-primary" />
                </div>
                <div>
                  <h6 className="mb-0 text-muted">Total</h6>
                  <h4 className="mb-0">{stats.total}</h4>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="stats-card h-100">
              <Card.Body className="d-flex align-items-center">
                <div className="me-3">
                  <FaUserCheck size={30} className="text-success" />
                </div>
                <div>
                  <h6 className="mb-0 text-muted">Ativas</h6>
                  <h4 className="mb-0">{stats.ativas}</h4>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="stats-card h-100">
              <Card.Body className="d-flex align-items-center">
                <div className="me-3">
                  <FaUserTimes size={30} className="text-danger" />
                </div>
                <div>
                  <h6 className="mb-0 text-muted">Inativas</h6>
                  <h4 className="mb-0">{stats.inativas}</h4>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="stats-card h-100">
              <Card.Body className="d-flex align-items-center">
                <div className="me-3">
                  <FaClipboardCheck size={30} className="text-info" />
                </div>
                <div>
                  <h6 className="mb-0 text-muted">HPR Cadastrada</h6>
                  <h4 className="mb-0">{stats.HprCadastrada}</h4>
                </div>
              </Card.Body>
            </Card>
          </Col>

        </Row>
      )}



      {/* Controles de Filtro e Ações */}
      <Row className="mb-4">
        <Col md={12}>
          <div className="pai_filtros">
            <Button
              variant="primary"
              className="btn-cadastrar"
              onClick={() => setShowModal(true)}
            >
              <FaPlus />Cadastrar Assistida
            </Button>

            <div className="d-flex gap-3 align-items-center filtros">
              <Form.Group controlId="filtro-nome" className='nome'>
                <Form.Label>Nome:</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Digite o nome..."
                  value={filtroNome}
                  onChange={(e) => setFiltroNome(e.target.value)}
                  style={{ minWidth: '100px' }}
                />
              </Form.Group>

              <Form.Group controlId="filtro-cpf">
                <Form.Label>CPF:</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="000.000.000-00"
                  value={filtroCPF}
                  onChange={(e) => setFiltroCPF(e.target.value)}
                  style={{ minWidth: '150px' }}
                />
              </Form.Group>

              <Form.Group controlId="filtro-idade" className='idade'>
                <Form.Label>Idade:</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Ex: 25"
                  value={filtroIdade}
                  onChange={(e) => setFiltroIdade(e.target.value)}
                  style={{ minWidth: '100px' }}

                />
              </Form.Group>

              <Form.Group controlId="filtro-status" className='statusF'>
                <Form.Label>Status:</Form.Label>
                <Form.Select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  style={{ minWidth: '100px' }}
                >
                  <option value="">Todos</option>
                  <option value="Ativa">Ativa</option>
                  <option value="Inativa">Inativa</option>
                  <option value="Hpr Cadastrada">Hpr Cadastrada</option>
                </Form.Select>
              </Form.Group>

              {/* Botão para limpar filtros */}
              {(filtroNome || filtroCPF || filtroIdade || filtroStatus) && (
                <Form.Group className='limpFiltro'>
                  <Form.Label>&nbsp;</Form.Label>
                  <div>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => {
                        setFiltroNome('');
                        setFiltroCPF('');
                        setFiltroIdade('');
                        setFiltroStatus('');
                      }}
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                </Form.Group>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Lista de Assistidas */}
      <div>
        {assistidasFiltradas.length === 0 && assistidas.length > 0 && (
          <div className="alert alert-info text-center">
            <strong>Nenhuma assistida encontrada com os filtros aplicados.</strong>
            <br />
            <small>Tente ajustar os filtros ou limpe-os para ver todas as assistidas.</small>
          </div>
        )}

        <ListaAssistidas
          assistidas={assistidasFiltradas}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </div>

      {/* Modal de Cadastro */}
      <Formulario
        showModal={showModal}
        setShowModal={fecharModal}
        onSubmit={adicionarAssistida}
        assistidaParaEditar={assistidaParaEditar}
        modoEdicao={modoEdicao}
        listaAssistidas={assistidas}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmarExclusao}
        assistida={assistidaToDelete}
        loading={deleting}
      />

      {/* Toast para notificações */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default Assistidas;
