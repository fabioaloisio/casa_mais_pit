import React, { useState, useEffect, useMemo } from 'react';
import { MateriaPrimaService } from '../services/materiaPrimaService';
import Toast from '../components/common/Toast';
import FormModal from '../components/common/FormModal';
import ConfirmModal from '../components/common/ConfirmModal';
import InfoTooltip from '../utils/tooltip';
import { Form } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { formatCurrency } from '@casa-mais/shared';
import './Doacoes.css';

const GerenciarMateriaPrima = () => {
  const [materiasPrimas, setMateriasPrimas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    unidade_medida: '',
    preco_por_unidade: '',
    descricao: ''
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Estado de ordenação - começa ordenado por nome A-Z
  const [ordenacao, setOrdenacao] = useState({ campo: 'nome', direcao: 'asc' });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const dados = await MateriaPrimaService.obterTodos();
      setMateriasPrimas(dados);
    } catch (error) {
      mostrarToast('Erro ao carregar matérias-primas: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Função para alternar ordenação
  const toggleOrdenacao = (campo) => {
    setOrdenacao(prev => ({
      campo,
      direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Ícone de ordenação
  const IconeOrdenacao = ({ campo }) => {
    if (ordenacao.campo !== campo) {
      return <FaSort className="ms-1" style={{ opacity: 0.3 }} />;
    }
    return ordenacao.direcao === 'asc'
      ? <FaSortUp className="ms-1" />
      : <FaSortDown className="ms-1" />;
  };

  // Matérias-primas ordenadas (useMemo para performance)
  const materiasPrimasOrdenadas = useMemo(() => {
    const resultado = [...materiasPrimas];

    resultado.sort((a, b) => {
      let valorA, valorB;

      switch (ordenacao.campo) {
        case 'nome':
        case 'unidade_medida':
        case 'descricao':
          valorA = (a[ordenacao.campo] || '').toLowerCase();
          valorB = (b[ordenacao.campo] || '').toLowerCase();
          break;

        case 'preco_por_unidade':
          valorA = parseFloat(a.preco_por_unidade) || 0;
          valorB = parseFloat(b.preco_por_unidade) || 0;
          break;

        default:
          return 0;
      }

      // Comparação
      if (valorA < valorB) return ordenacao.direcao === 'asc' ? -1 : 1;
      if (valorA > valorB) return ordenacao.direcao === 'asc' ? 1 : -1;
      return 0;
    });

    return resultado;
  }, [materiasPrimas, ordenacao]);

  const mostrarToast = (mensagem, tipo = 'success') => {
    setToast({ show: true, message: mensagem, type: tipo });
  };

  const abrirModal = (item = null) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        nome: item.nome,
        unidade_medida: item.unidade_medida,
        preco_por_unidade: item.preco_por_unidade,
        descricao: item.descricao || ''
      });
    } else {
      setSelectedItem(null);
      setFormData({
        nome: '',
        unidade_medida: '',
        preco_por_unidade: '',
        descricao: ''
      });
    }
    setShowModal(true);
  };

  const fecharModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setFormData({
      nome: '',
      unidade_medida: '',
      preco_por_unidade: '',
      descricao: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        preco_por_unidade: parseFloat(formData.preco_por_unidade) || 0
      };

      if (selectedItem) {
        await MateriaPrimaService.atualizar(selectedItem.id, data);
        mostrarToast('Matéria-prima atualizada com sucesso!', 'success');
      } else {
        await MateriaPrimaService.criar(data);
        mostrarToast('Matéria-prima cadastrada com sucesso!', 'success');
      }
      fecharModal();
      await carregarDados();
    } catch (error) {
      mostrarToast('Erro ao salvar: ' + error.message, 'error');
    }
  };

  const abrirModalExcluir = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmarExclusao = async () => {
    try {
      await MateriaPrimaService.excluir(selectedItem.id);
      mostrarToast('Matéria-prima excluída com sucesso!', 'success');
      setShowDeleteModal(false);
      setSelectedItem(null);
      await carregarDados();
    } catch (error) {
      mostrarToast('Erro ao excluir: ' + error.message, 'error');
    }
  };

  return (
    <div className="conteudo">
      <div className="topo">
        <h1>Gerenciar Matérias-Primas</h1>
        <p>Cadastre e gerencie as matérias-primas utilizadas nas receitas</p>
      </div>

      <div className="top-bar">
        <button className="btn-cadastrar d-flex align-items-center gap-2" onClick={() => abrirModal()}>
          <FaPlus /> Cadastrar Matéria-Prima
          <InfoTooltip
            texto="Cadastre uma nova matéria-prima utilizada na produção de produtos. Informe nome, descrição, unidade de medida, quantidade inicial em estoque e preço de compra. Matérias-primas são consumidas ao produzir produtos conforme as receitas."
          />
        </button>

        <div style={{ fontSize: '14px', color: '#6c757d' }}>
          {materiasPrimasOrdenadas.length} {materiasPrimasOrdenadas.length === 1 ? 'item' : 'itens'}
        </div>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="tabela-container">
          <table className="tabela">
            <thead>
              <tr>
                <th
                  onClick={() => toggleOrdenacao('nome')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  Nome <IconeOrdenacao campo="nome" />
                </th>
                <th
                  onClick={() => toggleOrdenacao('unidade_medida')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  Unidade <IconeOrdenacao campo="unidade_medida" />
                </th>
                <th
                  onClick={() => toggleOrdenacao('preco_por_unidade')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  Preço/Unidade <IconeOrdenacao campo="preco_por_unidade" />
                </th>
                <th
                  onClick={() => toggleOrdenacao('descricao')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  Descrição <IconeOrdenacao campo="descricao" />
                </th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {materiasPrimasOrdenadas.length > 0 ? (
                materiasPrimasOrdenadas.map((item) => (
                  <tr key={item.id}>
                    <td>{item.nome}</td>
                    <td>{item.unidade_medida}</td>
                    <td>{formatCurrency(item.preco_por_unidade)}</td>
                    <td>{item.descricao || '-'}</td>
                    <td>
                      <button className="btn-editar" onClick={() => abrirModal(item)}>
                        <FaEdit /> Editar
                      </button>
                      <button className="btn-excluir" onClick={() => abrirModalExcluir(item)}>
                        <FaTrash /> Excluir
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="nenhum-registro">
                    Nenhuma matéria-prima cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <FormModal
        show={showModal}
        onHide={fecharModal}
        onSubmit={handleSubmit}
        title={selectedItem ? 'Editar Matéria-Prima' : 'Cadastrar Matéria-Prima'}
      >
        <Form.Group className="mb-3">
          <Form.Label>Nome *</Form.Label>
          <Form.Control
            type="text"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Unidade de Medida *</Form.Label>
          <Form.Control
            type="text"
            value={formData.unidade_medida}
            onChange={(e) => setFormData({ ...formData, unidade_medida: e.target.value })}
            placeholder="Ex: kg, L, g"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Preço por Unidade *</Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            value={formData.preco_por_unidade}
            onChange={(e) => setFormData({ ...formData, preco_por_unidade: e.target.value })}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Descrição</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          />
        </Form.Group>
      </FormModal>

      <ConfirmModal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setSelectedItem(null);
        }}
        onConfirm={confirmarExclusao}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir a matéria-prima "${selectedItem?.nome}"?`}
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

export default GerenciarMateriaPrima;
