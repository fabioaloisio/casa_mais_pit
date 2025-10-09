import { useState, useEffect } from 'react';
import { Button, Table, Form, Card, Row, Col } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaDollarSign, FaUsers, FaBuilding, FaChartLine, FaSort, FaSortUp, FaSortDown, FaHistory } from 'react-icons/fa';
import doacoesService from '../services/doacoesService';
import { formatCPF, formatCNPJ, formatCurrency } from '@casa-mais/shared';
import DoacaoModal from '../components/doacoes/DoacaoModal';
import ConfirmDeleteModal from '../components/doacoes/ConfirmDeleteModal';
import HistoricoUnificado from '../components/doacoes/HistoricoUnificado';
import Toast from '../components/common/Toast';
import DoacoesNavegacao from '../components/common/DoacoesNavegacao';
import './Doacoes.css';

const Doacoes = () => {
  const [doacoes, setDoacoes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [doacaoEdit, setDoacaoEdit] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [doacaoToDelete, setDoacaoToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [ordenacao, setOrdenacao] = useState({ campo: 'dataDoacao', direcao: 'desc' });
  const [showHistoricoUnificado, setShowHistoricoUnificado] = useState(false);
  const [doadorSelecionado, setDoadorSelecionado] = useState(null);
  
  const [stats, setStats] = useState({
    totalDoacoes: 0,
    valorTotal: 0,
    totalPessoaFisica: 0,
    totalPessoaJuridica: 0
  });

  // Carregar doações ao montar o componente
  useEffect(() => {
    loadDoacoes();
  }, []);

  const loadDoacoes = async () => {
    try {
      setLoading(true);
      const allDoacoes = await doacoesService.getAll();
      const statsData = await doacoesService.getStats();
      setDoacoes(allDoacoes);
      setStats(statsData);
    } catch (error) {
      setToast({
        show: true,
        message: 'Erro ao carregar doações. Verifique sua conexão.',
        type: 'danger'
      });
      console.error('Erro ao carregar doações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (doacao = null) => {
    setDoacaoEdit(doacao);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setDoacaoEdit(null);
  };

  const handleSaveDoacao = async (doacaoData) => {
    try {
      if (doacaoEdit) {
        await doacoesService.update(doacaoEdit.id, doacaoData);
        setToast({
          show: true,
          message: 'Doação atualizada com sucesso!',
          type: 'success'
        });
      } else {
        await doacoesService.create(doacaoData);
        setToast({
          show: true,
          message: 'Nova doação cadastrada com sucesso!',
          type: 'success'
        });
      }
      await loadDoacoes();
      handleCloseModal();
    } catch (error) {
      setToast({
        show: true,
        message: error.message || 'Erro ao salvar doação. Tente novamente.',
        type: 'danger'
      });
      console.error('Erro ao salvar doação:', error);
      // Não fechar o modal em caso de erro para permitir correção
    }
  };

  const handleShowDeleteModal = (doacao) => {
    setDoacaoToDelete(doacao);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDoacaoToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (doacaoToDelete) {
      try {
        setDeleting(true);
        await doacoesService.delete(doacaoToDelete.id);
        setToast({
          show: true,
          message: 'Doação excluída com sucesso!',
          type: 'success'
        });
        await loadDoacoes();
        handleCloseDeleteModal();
      } catch (error) {
        setToast({
          show: true,
          message: error.message || 'Erro ao excluir doação. Tente novamente.',
          type: 'danger'
        });
        console.error('Erro ao excluir doação:', error);
        handleCloseDeleteModal();
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleShowHistoricoUnificado = (doacao) => {
    setDoadorSelecionado({
      id: doacao.doador?.id,
      nome: doacao.doador?.nome
    });
    setShowHistoricoUnificado(true);
  };

  const handleCloseHistoricoUnificado = () => {
    setShowHistoricoUnificado(false);
    setDoadorSelecionado(null);
  };

  const formatDocumento = (documento, tipo) => {
    if (!documento) return '';
    return tipo === 'PF' ? formatCPF(documento) : formatCNPJ(documento);
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

  const doacoesFiltradas = doacoes
    .filter(doacao => {
      const searchTerm = filtro.toLowerCase();
      return (
        (doacao.doador?.nome || '').toLowerCase().includes(searchTerm) ||
        (doacao.doador?.documento || '').includes(searchTerm) ||
        (doacao.doador?.email || '').toLowerCase().includes(searchTerm)
      );
    })
    .sort((a, b) => {
      const { campo, direcao } = ordenacao;
      let valorA, valorB;

      switch (campo) {
        case 'dataDoacao':
          valorA = new Date(a.dataDoacao);
          valorB = new Date(b.dataDoacao);
          break;
        case 'doador':
          valorA = (a.doador?.nome || '').toLowerCase();
          valorB = (b.doador?.nome || '').toLowerCase();
          break;
        case 'tipo':
          valorA = a.doador?.tipo_doador || '';
          valorB = b.doador?.tipo_doador || '';
          break;
        case 'documento':
          valorA = a.doador?.documento || '';
          valorB = b.doador?.documento || '';
          break;
        case 'valor':
          valorA = parseFloat(a.valor) || 0;
          valorB = parseFloat(b.valor) || 0;
          break;
        case 'ativo':
          valorA = a.doador?.ativo ? 1 : 0;
          valorB = b.doador?.ativo ? 1 : 0;
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
        <h1>Gestão de Doações</h1>
        <p>
          Gerencie as doações recebidas pela instituição. Aqui você pode cadastrar novos doadores,
          registrar doações monetárias e acompanhar o histórico de contribuições.
        </p>
      </div>

      {/* Navegação entre tipos de doações */}
      <DoacoesNavegacao />

      {/* Cards de Estatísticas */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaChartLine size={30} className="text-primary" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Total de Doações</h6>
                <h4 className="mb-0">{stats.totalDoacoes}</h4>
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
                <h6 className="mb-0 text-muted">Valor Total</h6>
                <h4 className="mb-0">{formatCurrency(stats.valorTotal)}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaUsers size={30} className="text-info" />
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
          <FaPlus /> Cadastrar Doação
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

      {/* Tabela de doações */}
      <div className="tabela-container">
        <Table className="tabela-assistidas" hover responsive>
          <thead>
            <tr>
              <th 
                className="cursor-pointer user-select-none"
                onClick={() => handleOrdenar('doador')}
                title="Clique para ordenar por doador"
              >
                Doador {getSortIcon('doador')}
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
              <th>Contato</th>
              <th 
                className="cursor-pointer user-select-none"
                onClick={() => handleOrdenar('valor')}
                title="Clique para ordenar por valor"
              >
                Valor {getSortIcon('valor')}
              </th>
              <th 
                className="cursor-pointer user-select-none"
                onClick={() => handleOrdenar('dataDoacao')}
                title="Clique para ordenar por data"
              >
                Data {getSortIcon('dataDoacao')}
              </th>
              <th 
                className="cursor-pointer user-select-none"
                onClick={() => handleOrdenar('ativo')}
                title="Clique para ordenar por status do doador"
              >
                Status Doador {getSortIcon('ativo')}
              </th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  <div className="d-flex justify-content-center align-items-center">
                    <div className="spinner-border text-primary me-2" role="status">
                      <span className="visually-hidden">Carregando...</span>
                    </div>
                    Carregando doações...
                  </div>
                </td>
              </tr>
            ) : doacoesFiltradas.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  <div className="text-muted">
                    <p className="mb-0">Nenhuma doação encontrada</p>
                    <small>Tente ajustar os filtros ou clique em "Nova Doação"</small>
                  </div>
                </td>
              </tr>
            ) : (
              doacoesFiltradas.map(doacao => (
                <tr key={doacao.id}>
                  <td className="fw-medium">{doacao.doador?.nome || 'Doador não encontrado'}</td>
                  <td>
                    <span className={`status ${doacao.doador?.tipo_doador === 'PF' ? 'tratamento' : 'ativa'}`}>
                      {doacao.doador?.tipo_doador === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                    </span>
                  </td>
                  <td className="text-muted">{formatDocumento(doacao.doador?.documento, doacao.doador?.tipo_doador)}</td>
                  <td>
                    <div>{doacao.doador?.telefone}</div>
                    {doacao.doador?.email && (
                      <small className="text-muted">{doacao.doador.email}</small>
                    )}
                  </td>
                  <td className="text-end fw-bold text-success">
                    {formatCurrency(doacao.valor)}
                  </td>
                  <td>
                    {new Date(doacao.dataDoacao).toLocaleDateString('pt-BR')}
                  </td>
                  <td>
                    <span className={`status ${doacao.doador?.ativo ? 'ativa' : 'inativa'}`}>
                      {doacao.doador?.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-1 flex-wrap">
                      <Button 
                        className="d-flex align-items-center gap-1 btn-outline-custom btn-sm fs-7"
                        onClick={() => handleShowModal(doacao)}
                      >
                        <FaEdit /> Editar
                      </Button>
                      <Button 
                        className="d-flex align-items-center gap-1 btn-sm fs-7"
                        variant="outline-info"
                        onClick={() => handleShowHistoricoUnificado(doacao)}
                        title="Ver histórico completo do doador (itens + monetário)"
                      >
                        <FaHistory /> Histórico
                      </Button>
                      <Button 
                        className="d-flex align-items-center gap-1 btn-sm fs-7"
                        variant="outline-danger"
                        onClick={() => handleShowDeleteModal(doacao)}
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
      <DoacaoModal
        show={showModal}
        onHide={handleCloseModal}
        onSave={handleSaveDoacao}
        doacao={doacaoEdit}
      />

      {/* Modal de confirmação de exclusão */}
      <ConfirmDeleteModal
        show={showDeleteModal}
        onHide={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        doacao={doacaoToDelete}
      />

      {/* Modal de histórico unificado */}
      <HistoricoUnificado
        show={showHistoricoUnificado}
        onHide={handleCloseHistoricoUnificado}
        doadorId={doadorSelecionado?.id}
        doadorNome={doadorSelecionado?.nome}
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

export default Doacoes;