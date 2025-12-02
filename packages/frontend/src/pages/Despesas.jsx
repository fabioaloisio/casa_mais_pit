import { useState, useEffect } from 'react';
import { Button, Table, Form, Card, Row, Col } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaDollarSign, FaFileInvoice, FaExclamationTriangle, FaCheckCircle, FaChartLine, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import despesasService from '../services/despesasService';
import { formatMoney } from '@casa-mais/shared';
import DespesaFormModal from '../components/despesas/DespesaFormModal';
import ConfirmDeleteModal from '../components/despesas/ConfirmDeleteModal';
import Toast from '../components/common/Toast';
import InfoTooltip from '../utils/tooltip';
import './Doacoes.css';

const Despesas = () => {
  const [despesas, setDespesas] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState({ inicio: '', fim: '' });
  const [showModal, setShowModal] = useState(false);
  const [despesaEdit, setDespesaEdit] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [despesaToDelete, setDespesaToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [ordenacao, setOrdenacao] = useState({ campo: 'data_despesa', direcao: 'desc' });
  const [tiposDespesas, setTiposDespesas] = useState([]);

  const [stats, setStats] = useState({
    totalDespesas: 0,
    valorTotalMes: 0,
    despesasPendentes: 0,
    despesasPagas: 0
  });

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadDespesas();
    loadTiposDespesas();
  }, []);

  const loadDespesas = async () => {
    try {
      setLoading(true);
      const allDespesas = await despesasService.getAll();
      setDespesas(allDespesas);

      // Calcular estatísticas
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const statsData = {
        totalDespesas: allDespesas.length,
        valorTotalMes: allDespesas
          .filter(d => {
            const dataDespesa = new Date(d.data_despesa);
            return dataDespesa.getMonth() === currentMonth && dataDespesa.getFullYear() === currentYear;
          })
          .reduce((sum, d) => sum + parseFloat(d.valor || 0), 0),
        despesasPendentes: allDespesas.filter(d => d.status === 'pendente').length,
        despesasPagas: allDespesas.filter(d => d.status === 'paga').length
      };
      setStats(statsData);
    } catch (error) {
      setToast({
        show: true,
        message: 'Erro ao carregar lista de despesas',
        type: 'danger'
      });
      console.error('Erro ao carregar despesas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTiposDespesas = async () => {
    try {
      const tipos = await despesasService.getTiposDespesas();
      setTiposDespesas(tipos);
    } catch (error) {
      console.error('Erro ao carregar tipos de despesas:', error);
    }
  };

  const handleShowModal = (despesa = null) => {
    setDespesaEdit(despesa);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setDespesaEdit(null);
  };

  const handleSaveDespesa = async (despesaData) => {
    try {
      if (despesaEdit) {
        await despesasService.update(despesaEdit.id, despesaData);
        setToast({
          show: true,
          message: 'Despesa atualizada com sucesso',
          type: 'success'
        });
      } else {
        await despesasService.create(despesaData);
        setToast({
          show: true,
          message: 'Despesa cadastrada com sucesso',
          type: 'success'
        });
      }
      await loadDespesas();
      handleCloseModal();
    } catch (error) {
      setToast({
        show: true,
        message: error.message || 'Erro ao salvar despesa',
        type: 'danger'
      });
      console.error('Erro ao salvar despesa:', error);
    }
  };

  const handleDeleteClick = (despesa) => {
    setDespesaToDelete(despesa);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!despesaToDelete) return;

    try {
      setDeleting(true);
      await despesasService.delete(despesaToDelete.id);
      setToast({
        show: true,
        message: 'Despesa excluída com sucesso',
        type: 'success'
      });
      await loadDespesas();
    } catch (error) {
      setToast({
        show: true,
        message: error.message || 'Erro ao excluir despesa',
        type: 'danger'
      });
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDespesaToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDespesaToDelete(null);
  };

  const handleSort = (campo) => {
    const novaDirecao = ordenacao.campo === campo && ordenacao.direcao === 'asc' ? 'desc' : 'asc';
    setOrdenacao({ campo, direcao: novaDirecao });
  };

  const getSortIcon = (campo) => {
    if (ordenacao.campo !== campo) return <FaSort className="ms-1" />;
    return ordenacao.direcao === 'asc' ? <FaSortUp className="ms-1" /> : <FaSortDown className="ms-1" />;
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pendente': 'badge bg-warning text-dark',
      'paga': 'badge bg-success',
      'cancelada': 'badge bg-danger'
    };
    return badges[status] || 'badge bg-secondary';
  };

  const getCategoriaBadge = (categoria) => {
    const colors = [
      'bg-primary', 'bg-secondary', 'bg-success', 'bg-danger',
      'bg-warning', 'bg-info', 'bg-dark', 'bg-light text-dark'
    ];
    const index = categoria ? categoria.length % colors.length : 0;
    return `badge ${colors[index]}`;
  };

  // Filtrar e ordenar despesas
  const despesasFiltradas = despesas
    .filter(despesa => {
      const matchFiltro = !filtro ||
        despesa.descricao?.toLowerCase().includes(filtro.toLowerCase()) ||
        despesa.fornecedor?.toLowerCase().includes(filtro.toLowerCase());

      const matchCategoria = !filtroCategoria || despesa.categoria === filtroCategoria;
      const matchStatus = !filtroStatus || despesa.status === filtroStatus;

      let matchPeriodo = true;
      if (filtroPeriodo.inicio || filtroPeriodo.fim) {
        const dataDespesa = new Date(despesa.data_despesa);
        if (filtroPeriodo.inicio) {
          matchPeriodo = matchPeriodo && dataDespesa >= new Date(filtroPeriodo.inicio);
        }
        if (filtroPeriodo.fim) {
          matchPeriodo = matchPeriodo && dataDespesa <= new Date(filtroPeriodo.fim);
        }
      }

      return matchFiltro && matchCategoria && matchStatus && matchPeriodo;
    })
    .sort((a, b) => {
      const aValue = a[ordenacao.campo];
      const bValue = b[ordenacao.campo];

      if (ordenacao.campo === 'valor') {
        return ordenacao.direcao === 'asc'
          ? parseFloat(aValue) - parseFloat(bValue)
          : parseFloat(bValue) - parseFloat(aValue);
      }

      if (ordenacao.campo === 'data_despesa') {
        return ordenacao.direcao === 'asc'
          ? new Date(aValue) - new Date(bValue)
          : new Date(bValue) - new Date(aValue);
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
        <h1>Gestão de Despesas</h1>
        <p>Controle e gerencie as despesas da organização</p>
      </div>

      {/* Cards de Estatísticas */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaFileInvoice size={30} className="text-primary" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Total de Despesas</h6>
                <h4 className="mb-0">{stats.totalDespesas}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaDollarSign size={30} className="text-success" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Valor Total (Mês)</h6>
                <h4 className="mb-0">{formatMoney(stats.valorTotalMes)}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaExclamationTriangle size={30} className="text-warning" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Pendentes</h6>
                <h4 className="mb-0">{stats.despesasPendentes}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaCheckCircle size={30} className="text-success" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Pagas</h6>
                <h4 className="mb-0">{stats.despesasPagas}</h4>
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
          <FaPlus /> Cadastrar Despesa
          <InfoTooltip
            texto="Registre uma nova despesa no sistema. Informe a descrição, valor, data, categoria (tipo de despesa), fornecedor e status de pagamento. Isso ajuda no controle financeiro da instituição."
          />
        </Button>

        <div className="d-flex align-items-center gap-2">
          <FaSearch className="text-muted" />
          <Form.Control
            type="text"
            placeholder="Filtrar por descrição ou fornecedor..."
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
            <Col md={2}>
              <Form.Group>
                <Form.Label>Categoria</Form.Label>
                <Form.Select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                >
                  <option value="">Todas</option>
                  {tiposDespesas.map(tipo => (
                    <option key={tipo.id} value={tipo.nome}>{tipo.nome}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="pendente">Pendente</option>
                  <option value="paga">Paga</option>
                  <option value="cancelada">Cancelada</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Data Início</Form.Label>
                <Form.Control
                  type="date"
                  value={filtroPeriodo.inicio}
                  onChange={(e) => setFiltroPeriodo(prev => ({ ...prev, inicio: e.target.value }))}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Data Fim</Form.Label>
                <Form.Control
                  type="date"
                  value={filtroPeriodo.fim}
                  onChange={(e) => setFiltroPeriodo(prev => ({ ...prev, fim: e.target.value }))}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setFiltroCategoria('');
                  setFiltroStatus('');
                  setFiltroPeriodo({ inicio: '', fim: '' });
                  setFiltro('');
                }}
                className="w-100"
                title="Limpar Filtros"
              >
                Limpar
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabela de Despesas */}
      <div className="tabela-container">
        <Table className="tabela-assistidas" hover responsive>
          <thead>
            <tr>
              <th
                className="cursor-pointer user-select-none"
                onClick={() => handleSort('data_despesa')}
                title="Clique para ordenar por data"
              >
                Data {getSortIcon('data_despesa')}
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
                onClick={() => handleSort('categoria')}
                title="Clique para ordenar por categoria"
              >
                Categoria {getSortIcon('categoria')}
              </th>
              <th
                className="cursor-pointer user-select-none"
                onClick={() => handleSort('valor')}
                title="Clique para ordenar por valor"
              >
                Valor {getSortIcon('valor')}
              </th>
              <th
                className="cursor-pointer user-select-none"
                onClick={() => handleSort('status')}
                title="Clique para ordenar por status"
              >
                Status {getSortIcon('status')}
              </th>
              <th
                className="cursor-pointer user-select-none"
                onClick={() => handleSort('fornecedor')}
                title="Clique para ordenar por fornecedor"
              >
                Fornecedor {getSortIcon('fornecedor')}
              </th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  <div className="d-flex align-items-center justify-content-center">
                    <div className="spinner-border text-primary me-2" role="status">
                      <span className="visually-hidden">Carregando...</span>
                    </div>
                    Carregando despesas...
                  </div>
                </td>
              </tr>
            ) : despesasFiltradas.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  <div className="text-muted">
                    <p className="mb-0">Nenhuma despesa encontrada</p>
                    <small>Tente ajustar os filtros ou clique em "Cadastrar Despesa"</small>
                  </div>
                </td>
              </tr>
            ) : (
              despesasFiltradas.map((despesa) => (
                <tr key={despesa.id}>
                  <td>{new Date(despesa.data_despesa).toLocaleDateString('pt-BR')}</td>
                  <td className="fw-medium">{despesa.descricao}</td>
                  <td>
                    <span className={getCategoriaBadge(despesa.categoria)}>
                      {despesa.categoria}
                    </span>
                  </td>
                  <td className="fw-bold text-success">{formatMoney(despesa.valor)}</td>
                  <td>
                    <span className={getStatusBadge(despesa.status)}>
                      {despesa.status}
                    </span>
                  </td>
                  <td className="text-muted">{despesa.fornecedor || '-'}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button
                        className="d-flex align-items-center gap-1 btn-outline-custom btn-sm fs-7"
                        onClick={() => handleShowModal(despesa)}
                      >
                        <FaEdit /> Editar
                      </Button>
                      <Button
                        className="d-flex align-items-center gap-1 btn-sm fs-7"
                        variant="outline-danger"
                        onClick={() => handleDeleteClick(despesa)}
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
      <DespesaFormModal
        show={showModal}
        onHide={handleCloseModal}
        onSave={handleSaveDespesa}
        despesa={despesaEdit}
        tiposDespesas={tiposDespesas}
      />

      <ConfirmDeleteModal
        show={showDeleteModal}
        onHide={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        despesa={despesaToDelete}
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

export default Despesas;
