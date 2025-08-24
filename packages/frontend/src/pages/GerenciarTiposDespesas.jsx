import { useState, useEffect } from 'react';
import { Button, Table, Form, Card, Row, Col } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaTags, FaCheckCircle, FaTimesCircle, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import TipoDespesaFormModal from '../components/despesas/TipoDespesaFormModal';
import ConfirmDeleteModal from '../components/despesas/ConfirmDeleteTipoDespesaModal';
import Toast from '../components/common/Toast';
import './Doacoes.css';

const GerenciarTiposDespesas = () => {
  const [tiposDespesas, setTiposDespesas] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [tipoDespesaEdit, setTipoDespesaEdit] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tipoDespesaToDelete, setTipoDespesaToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [ordenacao, setOrdenacao] = useState({ campo: 'nome', direcao: 'asc' });
  
  const [stats, setStats] = useState({
    totalTipos: 0,
    tiposAtivos: 0,
    tiposInativos: 0
  });

  // Carregar tipos de despesas ao montar o componente
  useEffect(() => {
    loadTiposDespesas();
  }, []);

  const loadTiposDespesas = async () => {
    console.log('loadTiposDespesas chamado');
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3003/api/tipos-despesas');
      const data = await response.json();
      console.log('loadTiposDespesas - dados recebidos:', data);
      
      if (data.success) {
        setTiposDespesas(data.data);
        console.log('Lista atualizada com:', data.data.length, 'itens');
        
        // Calcular estatísticas
        const statsData = {
          totalTipos: data.data.length,
          tiposAtivos: data.data.filter(t => t.ativo).length,
          tiposInativos: data.data.filter(t => !t.ativo).length
        };
        setStats(statsData);
      } else {
        throw new Error(data.message || 'Erro ao carregar tipos de despesas');
      }
    } catch (error) {
      setToast({
        show: true,
        message: 'Erro ao carregar lista de tipos de despesas',
        type: 'danger'
      });
      console.error('Erro ao carregar tipos de despesas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (tipoDespesa = null) => {
    setTipoDespesaEdit(tipoDespesa);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTipoDespesaEdit(null);
  };

  const handleSaveTipoDespesa = async (tipoDespesaData) => {
    console.log('GerenciarTiposDespesas - handleSaveTipoDespesa chamado');
    console.log('tipoDespesaEdit:', tipoDespesaEdit);
    console.log('tipoDespesaData:', tipoDespesaData);
    
    try {
      const url = tipoDespesaEdit 
        ? `http://localhost:3003/api/tipos-despesas/${tipoDespesaEdit.id}`
        : 'http://localhost:3003/api/tipos-despesas';
      
      const method = tipoDespesaEdit ? 'PUT' : 'POST';
      
      console.log('URL:', url);
      console.log('Method:', method);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tipoDespesaData),
      });

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setToast({
          show: true,
          message: tipoDespesaEdit ? 'Tipo de despesa atualizado com sucesso' : 'Tipo de despesa cadastrado com sucesso',
          type: 'success'
        });
        await loadTiposDespesas();
        handleCloseModal();
      } else {
        throw new Error(data.message || 'Erro ao salvar tipo de despesa');
      }
    } catch (error) {
      console.error('Erro ao salvar tipo de despesa:', error);
      setToast({
        show: true,
        message: error.message || 'Erro ao salvar tipo de despesa',
        type: 'danger'
      });
      throw error; // Re-throw para que o modal possa capturar o erro
    }
  };

  const handleDeleteClick = (tipoDespesa) => {
    setTipoDespesaToDelete(tipoDespesa);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tipoDespesaToDelete) return;
    
    try {
      setDeleting(true);
      const response = await fetch(`http://localhost:3003/api/tipos-despesas/${tipoDespesaToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setToast({
          show: true,
          message: 'Tipo de despesa excluído com sucesso',
          type: 'success'
        });
        await loadTiposDespesas();
      } else {
        throw new Error(data.message || 'Erro ao excluir tipo de despesa');
      }
    } catch (error) {
      setToast({
        show: true,
        message: error.message || 'Erro ao excluir tipo de despesa',
        type: 'danger'
      });
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setTipoDespesaToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setTipoDespesaToDelete(null);
  };

  const handleSort = (campo) => {
    const novaDirecao = ordenacao.campo === campo && ordenacao.direcao === 'asc' ? 'desc' : 'asc';
    setOrdenacao({ campo, direcao: novaDirecao });
  };

  const getSortIcon = (campo) => {
    if (ordenacao.campo !== campo) return <FaSort className="ms-1" />;
    return ordenacao.direcao === 'asc' ? <FaSortUp className="ms-1" /> : <FaSortDown className="ms-1" />;
  };

  const getStatusBadge = (ativo) => {
    return ativo ? 'status ativa' : 'status inativa';
  };

  // Filtrar e ordenar tipos de despesas
  const tiposDespesasFiltrados = tiposDespesas
    .filter(tipo => {
      const matchFiltro = !filtro || 
        tipo.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
        tipo.descricao?.toLowerCase().includes(filtro.toLowerCase());
      
      const matchStatus = !filtroStatus || 
        (filtroStatus === 'ativo' && tipo.ativo) ||
        (filtroStatus === 'inativo' && !tipo.ativo);
      
      return matchFiltro && matchStatus;
    })
    .sort((a, b) => {
      const aValue = a[ordenacao.campo];
      const bValue = b[ordenacao.campo];
      
      if (ordenacao.campo === 'ativo') {
        return ordenacao.direcao === 'asc' 
          ? (aValue === bValue ? 0 : aValue ? -1 : 1)
          : (aValue === bValue ? 0 : aValue ? 1 : -1);
      }
      
      const aStr = String(aValue || '').toLowerCase();
      const bStr = String(bValue || '').toLowerCase();
      
      return ordenacao.direcao === 'asc' 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

  return (
    <div className="conteudo">
      <div className="topo">
        <h1>Cadastro de Despesas</h1>
        <p>Gerencie os tipos e categorias de despesas da organização</p>
      </div>

      {/* Cards de Estatísticas */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaTags size={30} className="text-primary" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Total de Tipos</h6>
                <h4 className="mb-0">{stats.totalTipos}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaCheckCircle size={30} className="text-success" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Tipos Ativos</h6>
                <h4 className="mb-0">{stats.tiposAtivos}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaTimesCircle size={30} className="text-danger" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Tipos Inativos</h6>
                <h4 className="mb-0">{stats.tiposInativos}</h4>
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
          <FaPlus /> Cadastrar Tipo de Despesa
        </Button>

        <div className="d-flex align-items-center gap-2">
          <FaSearch className="text-muted" />
          <Form.Control
            type="text"
            placeholder="Filtrar por nome ou descrição..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{ minWidth: '300px' }}
          />
        </div>
      </div>

      {/* Filtros avançados */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setFiltroStatus('');
                  setFiltro('');
                }}
                title="Limpar Filtros"
              >
                Limpar Filtros
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabela de Tipos de Despesas */}
      <div className="tabela-container">
        <Table className="tabela-assistidas" hover responsive>
          <thead>
            <tr>
              <th 
                className="cursor-pointer user-select-none"
                onClick={() => handleSort('nome')}
                title="Clique para ordenar por nome"
              >
                Nome {getSortIcon('nome')}
              </th>
              <th 
                className="cursor-pointer user-select-none"
                onClick={() => handleSort('descricao')}
                title="Clique para ordenar por descrição"
              >
                Descrição {getSortIcon('descricao')}
              </th>
              <th 
                className="cursor-pointer user-select-none"
                onClick={() => handleSort('ativo')}
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
                <td colSpan="4" className="text-center py-4">
                  <div className="d-flex align-items-center justify-content-center">
                    <div className="spinner-border text-primary me-2" role="status">
                      <span className="visually-hidden">Carregando...</span>
                    </div>
                    Carregando tipos de despesas...
                  </div>
                </td>
              </tr>
            ) : tiposDespesasFiltrados.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  <div className="text-muted">
                    <p className="mb-0">Nenhum tipo de despesa encontrado</p>
                    <small>Tente ajustar os filtros ou clique em "Cadastrar Tipo de Despesa"</small>
                  </div>
                </td>
              </tr>
            ) : (
              tiposDespesasFiltrados.map((tipoDespesa) => (
                <tr key={tipoDespesa.id}>
                  <td className="fw-medium">{tipoDespesa.nome}</td>
                  <td className="text-muted">{tipoDespesa.descricao || '-'}</td>
                  <td>
                    <span className={getStatusBadge(tipoDespesa.ativo)}>
                      {tipoDespesa.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button 
                        className="d-flex align-items-center gap-1 btn-outline-custom btn-sm fs-7"
                        onClick={() => handleShowModal(tipoDespesa)}
                      >
                        <FaEdit /> Editar
                      </Button>
                      <Button 
                        className="d-flex align-items-center gap-1 btn-sm fs-7"
                        variant="outline-danger"
                        onClick={() => handleDeleteClick(tipoDespesa)}
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

      {/* Modais */}
      <TipoDespesaFormModal
        show={showModal}
        onHide={handleCloseModal}
        onSave={handleSaveTipoDespesa}
        tipoDespesa={tipoDespesaEdit}
      />

      <ConfirmDeleteModal
        show={showDeleteModal}
        onHide={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        tipoDespesa={tipoDespesaToDelete}
        loading={deleting}
      />

      <Toast
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        message={toast.message}
        type={toast.type}
      />
    </div>
  );
};

export default GerenciarTiposDespesas;