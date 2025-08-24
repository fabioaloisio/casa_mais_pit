import { useState, useEffect } from 'react';
import { Button, Table, Form, Card, Row, Col } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaUsers, FaBuilding, FaChartLine, FaUserTie, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import doadoresService from '../services/doadoresService';
import { formatCPF, formatCNPJ } from '@casa-mais/shared';
import DoadorFormModal from '../components/doacoes/DoadorFormModal';
import ConfirmDeleteModal from '../components/doacoes/ConfirmDeleteModal';
import Toast from '../components/common/Toast';
import './Doacoes.css';

const Doadores = () => {
  const [doadores, setDoadores] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [doadorEdit, setDoadorEdit] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [doadorToDelete, setDoadorToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(false);
  const [ordenacao, setOrdenacao] = useState({ campo: 'nome', direcao: 'asc' });
  
  const [stats, setStats] = useState({
    totalDoadores: 0,
    totalAtivos: 0,
    totalPessoaFisica: 0,
    totalPessoaJuridica: 0
  });

  // Carregar doadores ao montar o componente
  useEffect(() => {
    loadDoadores();
  }, []);

  const loadDoadores = async () => {
    try {
      setLoading(true);
      const allDoadores = await doadoresService.getAll();
      setDoadores(allDoadores);
      
      // Calcular estatísticas
      const statsData = {
        totalDoadores: allDoadores.length,
        totalAtivos: allDoadores.filter(d => d.ativo).length,
        totalPessoaFisica: allDoadores.filter(d => d.tipo_doador === 'PF').length,
        totalPessoaJuridica: allDoadores.filter(d => d.tipo_doador === 'PJ').length
      };
      setStats(statsData);
    } catch (error) {
      setToast({
        show: true,
        message: 'Erro ao carregar lista de doadores',
        type: 'danger'
      });
      console.error('Erro ao carregar doadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (doador = null) => {
    setDoadorEdit(doador);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setDoadorEdit(null);
  };

  const handleSaveDoador = async (doadorData) => {
    try {
      if (doadorEdit) {
        await doadoresService.update(doadorEdit.id, doadorData);
        setToast({
          show: true,
          message: 'Doador atualizado com sucesso',
          type: 'success'
        });
      } else {
        await doadoresService.create(doadorData);
        setToast({
          show: true,
          message: 'Doador cadastrado com sucesso',
          type: 'success'
        });
      }
      await loadDoadores();
      handleCloseModal();
    } catch (error) {
      setToast({
        show: true,
        message: error.message || 'Erro ao salvar doador',
        type: 'danger'
      });
      console.error('Erro ao salvar doador:', error);
      // Não fechar o modal em caso de erro para permitir correção
    }
  };

  const handleShowDeleteModal = (doador) => {
    setDoadorToDelete(doador);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDoadorToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (doadorToDelete) {
      try {
        await doadoresService.delete(doadorToDelete.id);
        setToast({
          show: true,
          message: 'Doador excluído com sucesso',
          type: 'success'
        });
        await loadDoadores();
        handleCloseDeleteModal();
      } catch (error) {
        setToast({
          show: true,
          message: error.message || 'Erro ao excluir doador',
          type: 'danger'
        });
        console.error('Erro ao excluir doador:', error);
        handleCloseDeleteModal();
      }
    }
  };

  const formatDocumento = (documento, tipo) => {
    if (!documento) return '';
    return tipo === 'PF' ? formatCPF(documento) : formatCNPJ(documento);
  };

  const formatTelefone = (telefone) => {
    if (!telefone) return '';
    if (telefone.length === 11) {
      return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (telefone.length === 10) {
      return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return telefone;
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

  const doadoresFiltrados = doadores
    .filter(doador => {
      const searchTerm = filtro.toLowerCase();
      return (
        doador.nome.toLowerCase().includes(searchTerm) ||
        doador.documento.includes(searchTerm) ||
        (doador.email && doador.email.toLowerCase().includes(searchTerm))
      );
    })
    .sort((a, b) => {
      const { campo, direcao } = ordenacao;
      let valorA, valorB;

      switch (campo) {
        case 'nome':
          valorA = a.nome.toLowerCase();
          valorB = b.nome.toLowerCase();
          break;
        case 'tipo':
          valorA = a.tipo_doador;
          valorB = b.tipo_doador;
          break;
        case 'documento':
          valorA = a.documento;
          valorB = b.documento;
          break;
        case 'telefone':
          valorA = a.telefone || '';
          valorB = b.telefone || '';
          break;
        case 'email':
          valorA = a.email || '';
          valorB = b.email || '';
          break;
        case 'endereco':
          valorA = a.endereco || '';
          valorB = b.endereco || '';
          break;
        case 'data_cadastro':
          valorA = new Date(a.data_cadastro || 0);
          valorB = new Date(b.data_cadastro || 0);
          break;
        case 'ativo':
          valorA = a.ativo ? 1 : 0;
          valorB = b.ativo ? 1 : 0;
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
        <h1>Gestão de Doadores</h1>
        <p>
          Gerencie os doadores cadastrados na instituição. Aqui você pode cadastrar novos doadores,
          editar informações e acompanhar o histórico de cada contribuinte.
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaUsers size={30} className="text-primary" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Total de Doadores</h6>
                <h4 className="mb-0">{stats.totalDoadores}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaChartLine size={30} className="text-success" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Doadores Ativos</h6>
                <h4 className="mb-0">{stats.totalAtivos}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaUserTie size={30} className="text-info" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Pessoa Física</h6>
                <h4 className="mb-0">{stats.totalPessoaFisica}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaBuilding size={30} className="text-warning" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Pessoa Jurídica</h6>
                <h4 className="mb-0">{stats.totalPessoaJuridica}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Barra de ações */}
      <div className="filtros mb-4">
        <Button 
          className="azul d-flex align-items-center gap-2"
          onClick={() => handleShowModal()}
        >
          <FaPlus /> Cadastrar Doador
        </Button>

        <div className="d-flex align-items-center gap-2">
          <FaSearch className="text-muted" />
          <Form.Control
            type="text"
            placeholder="Filtrar por nome, documento ou email..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            id="filtroUsuario"
          />
        </div>
      </div>

      {/* Tabela de doadores */}
      <div className="tabela-container">
        <Table className="tabela-assistidas" hover responsive>
          <thead>
            <tr>
              <th 
                className="cursor-pointer user-select-none"
                onClick={() => handleOrdenar('nome')}
                title="Clique para ordenar por nome"
              >
                Nome {getSortIcon('nome')}
              </th>
              <th 
                className="cursor-pointer user-select-none"
                onClick={() => handleOrdenar('tipo')}
                title="Clique para ordenar por tipo"
              >
                Tipo {getSortIcon('tipo')}
              </th>
              <th 
                className="cursor-pointer user-select-none"
                onClick={() => handleOrdenar('documento')}
                title="Clique para ordenar por documento"
              >
                Documento {getSortIcon('documento')}
              </th>
              <th 
                className="cursor-pointer user-select-none"
                onClick={() => handleOrdenar('telefone')}
                title="Clique para ordenar por telefone"
              >
                Contato {getSortIcon('telefone')}
              </th>
              <th 
                className="cursor-pointer user-select-none"
                onClick={() => handleOrdenar('endereco')}
                title="Clique para ordenar por endereço"
              >
                Endereço {getSortIcon('endereco')}
              </th>
              <th 
                className="cursor-pointer user-select-none"
                onClick={() => handleOrdenar('ativo')}
                title="Clique para ordenar por status"
              >
                Status {getSortIcon('ativo')}
              </th>
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
                    Carregando doadores...
                  </div>
                </td>
              </tr>
            ) : doadoresFiltrados.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  <div className="text-muted">
                    <p className="mb-0">Nenhum doador encontrado</p>
                    <small>Tente ajustar os filtros ou clique em "Novo Doador"</small>
                  </div>
                </td>
              </tr>
            ) : (
              doadoresFiltrados.map(doador => (
                <tr key={doador.id}>
                  <td className="fw-medium">{doador.nome}</td>
                  <td>
                    <span className={`status ${doador.tipo_doador === 'PF' ? 'tratamento' : 'ativa'}`}>
                      {doador.tipo_doador === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                    </span>
                  </td>
                  <td className="text-muted">{formatDocumento(doador.documento, doador.tipo_doador)}</td>
                  <td>
                    <div>{formatTelefone(doador.telefone)}</div>
                    {doador.email && (
                      <small className="text-muted">{doador.email}</small>
                    )}
                  </td>
                  <td>
                    {doador.endereco ? (
                      <div>
                        <div>{doador.endereco}</div>
                        {(doador.cidade || doador.estado) && (
                          <small className="text-muted">
                            {doador.cidade}{doador.cidade && doador.estado && '/'}{doador.estado}
                          </small>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    <span className={`status ${doador.ativo ? 'ativa' : 'inativa'}`}>
                      {doador.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button 
                        className="d-flex align-items-center gap-1 btn-outline-custom btn-sm fs-7"
                        onClick={() => handleShowModal(doador)}
                      >
                        <FaEdit /> Editar
                      </Button>
                      <Button 
                        className="d-flex align-items-center gap-1 btn-sm fs-7"
                        variant="outline-danger"
                        onClick={() => handleShowDeleteModal(doador)}
                      >
                        <FaTrash /> Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Modal de cadastro/edição */}
      <DoadorFormModal
        show={showModal}
        onHide={handleCloseModal}
        onSave={handleSaveDoador}
        doador={doadorEdit}
        tipoDoador={doadorEdit?.tipo_doador || 'PF'}
      />

      {/* Modal de confirmação de exclusão */}
      <ConfirmDeleteModal
        show={showDeleteModal}
        onHide={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        doacao={doadorToDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o doador "${doadorToDelete?.nome}"? Esta ação não pode ser desfeita.`}
      />

      {/* Toast de notificação */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default Doadores;