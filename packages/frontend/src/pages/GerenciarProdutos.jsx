/* eslint-disable no-case-declarations */
import React, { useState, useEffect, useMemo } from 'react';
import { ProdutoService } from '../services/produtoService';
import { ReceitaService } from '../services/receitaService';
import Toast from '../components/common/Toast';
import FormModal from '../components/common/FormModal';
import ConfirmModal from '../components/common/ConfirmModal';
import { Form } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { formatCurrency } from '@casa-mais/shared';
import './Doacoes.css';

const GerenciarProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [receitas, setReceitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco_venda: '',
    receita_id: ''
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [ordenacao, setOrdenacao] = useState({ campo: 'nome', direcao: 'asc' });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [produtosData, receitasData] = await Promise.all([
        ProdutoService.obterTodos(),
        ReceitaService.obterTodos()
      ]);
      setProdutos(produtosData);
      setReceitas(receitasData);
    } catch (error) {
      mostrarToast('Erro ao carregar dados: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleOrdenacao = (campo) => {
    setOrdenacao(prev => ({
      campo,
      direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc'
    }));
  };

  const IconeOrdenacao = ({ campo }) => {
    if (ordenacao.campo !== campo) {
      return <FaSort className="ms-1" style={{ opacity: 0.3 }} />;
    }
    return ordenacao.direcao === 'asc'
      ? <FaSortUp className="ms-1" />
      : <FaSortDown className="ms-1" />;
  };

  const produtosOrdenados = useMemo(() => {
    const resultado = [...produtos];

    resultado.sort((a, b) => {
      let valorA, valorB;

      switch (ordenacao.campo) {
        case 'nome':
          valorA = (a.nome || '').toLowerCase();
          valorB = (b.nome || '').toLowerCase();
          break;

        case 'preco_venda':
        case 'custo_estimado':
        case 'margem_bruta':
        case 'margem_percentual':
          valorA = parseFloat(a[ordenacao.campo]) || 0;
          valorB = parseFloat(b[ordenacao.campo]) || 0;
          break;

        case 'receita':
          const receitaA = receitas.find(r => r.id === a.receita_id);
          const receitaB = receitas.find(r => r.id === b.receita_id);
          valorA = (receitaA?.nome || '').toLowerCase();
          valorB = (receitaB?.nome || '').toLowerCase();
          break;

        default:
          return 0;
      }

      if (valorA < valorB) return ordenacao.direcao === 'asc' ? -1 : 1;
      if (valorA > valorB) return ordenacao.direcao === 'asc' ? 1 : -1;
      return 0;
    });

    return resultado;
  }, [produtos, receitas, ordenacao]);

  const mostrarToast = (mensagem, tipo = 'success') => {
    setToast({ show: true, message: mensagem, type: tipo });
  };

  const abrirModal = (item = null) => {
    if (item) {
      setSelectedItem(item);
      const precoVenda = typeof item.preco_venda === 'number'
        ? item.preco_venda
        : parseFloat(item.preco_venda) || 0;

      setFormData({
        nome: item.nome,
        descricao: item.descricao || '',
        preco_venda: precoVenda.toString().replace('.', ','),
        receita_id: item.receita_id || ''
      });
    } else {
      setSelectedItem(null);
      setFormData({
        nome: '',
        descricao: '',
        preco_venda: '',
        receita_id: ''
      });
    }
    setShowModal(true);
  };

  const fecharModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let precoVenda = formData.preco_venda;
      if (typeof precoVenda === 'string') {
        precoVenda = precoVenda.replace(/[^\d.,]/g, '').replace(',', '.');
      }
      precoVenda = parseFloat(precoVenda);

      if (isNaN(precoVenda) || precoVenda < 0) {
        mostrarToast('Preço de venda deve ser um número válido', 'error');
        return;
      }

      const data = {
        ...formData,
        preco_venda: precoVenda,
        receita_id: formData.receita_id ? parseInt(formData.receita_id) : null
      };

      if (selectedItem) {
        await ProdutoService.atualizar(selectedItem.id, data);
        mostrarToast('Produto atualizado com sucesso!', 'success');
      } else {
        await ProdutoService.criar(data);
        mostrarToast('Produto cadastrado com sucesso!', 'success');
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
      await ProdutoService.excluir(selectedItem.id);
      mostrarToast('Produto excluído com sucesso!', 'success');
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
        <h1>Gerenciar Produtos</h1>
        <p>Cadastre e gerencie os produtos para venda</p>
      </div>

      <div className="top-bar">
        <button className="btn-cadastrar" onClick={() => abrirModal()}>
          <FaPlus /> Cadastrar Produto
        </button>

        <div style={{ fontSize: '14px', color: '#6c757d' }}>
          {produtosOrdenados.length} {produtosOrdenados.length === 1 ? 'produto' : 'produtos'}
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
                  onClick={() => toggleOrdenacao('preco_venda')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  Preço de Venda <IconeOrdenacao campo="preco_venda" />
                </th>
                <th
                  onClick={() => toggleOrdenacao('custo_estimado')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  Custo Estimado <IconeOrdenacao campo="custo_estimado" />
                </th>
                <th
                  onClick={() => toggleOrdenacao('margem_bruta')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  Margem Bruta <IconeOrdenacao campo="margem_bruta" />
                </th>
                <th
                  onClick={() => toggleOrdenacao('margem_percentual')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  Margem % <IconeOrdenacao campo="margem_percentual" />
                </th>
                <th
                  onClick={() => toggleOrdenacao('receita')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  Receita <IconeOrdenacao campo="receita" />
                </th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtosOrdenados.length > 0 ? (
                produtosOrdenados.map((item) => {
                  const precoVenda = parseFloat(item.preco_venda) || 0;
                  const custoEstimado = parseFloat(item.custo_estimado) || 0;
                  const margemBruta = parseFloat(item.margem_bruta) || 0;
                  const margemPercentual = parseFloat(item.margem_percentual) || 0;

                  return (
                    <tr key={item.id}>
                      <td>{item.nome}</td>
                      <td>{formatCurrency(precoVenda)}</td>
                      <td>{formatCurrency(custoEstimado)}</td>
                      <td>{formatCurrency(margemBruta)}</td>
                      <td>{margemPercentual.toFixed(2)}%</td>
                      <td>
                        {receitas.find(r => r.id === item.receita_id)?.nome || '-'}
                      </td>
                      <td>
                        <button className="btn-editar" onClick={() => abrirModal(item)}>
                          <FaEdit /> Editar
                        </button>
                        <button className="btn-excluir" onClick={() => abrirModalExcluir(item)}>
                          <FaTrash /> Excluir
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="nenhum-registro">
                    Nenhum produto cadastrado.
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
        title={selectedItem ? 'Editar Produto' : 'Cadastrar Produto'}
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
          <Form.Label>Descrição</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Preço de Venda *</Form.Label>
          <Form.Control
            type="text"
            inputMode="decimal"
            placeholder="Ex: 13.00 ou 13,00"
            value={formData.preco_venda}
            onChange={(e) => {
              let value = e.target.value;
              value = value.replace(/[^\d.,]/g, '');
              setFormData({ ...formData, preco_venda: value });
            }}
            required
          />
          <Form.Text className="text-muted">
            Use ponto (.) ou vírgula (,) como separador decimal
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Receita (Opcional)</Form.Label>
          <Form.Select
            value={formData.receita_id}
            onChange={(e) => setFormData({ ...formData, receita_id: e.target.value })}
          >
            <option value="">Selecione uma receita</option>
            {receitas.map((receita) => (
              <option key={receita.id} value={receita.id}>
                {receita.nome}
              </option>
            ))}
          </Form.Select>
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
        message={`Tem certeza que deseja excluir o produto "${selectedItem?.nome}"?`}
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

export default GerenciarProdutos;
