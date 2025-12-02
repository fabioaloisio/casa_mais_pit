import React, { useState, useEffect, useMemo } from 'react';
import { ReceitaService } from '../services/receitaService';
import { MateriaPrimaService } from '../services/materiaPrimaService';
import Toast from '../components/common/Toast';
import FormModal from '../components/common/FormModal';
import ConfirmModal from '../components/common/ConfirmModal';
import InfoTooltip from '../utils/tooltip';
import { Form, Button, Table } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { formatCurrency } from '@casa-mais/shared';
import './Doacoes.css';

const GerenciarReceitas = () => {
  const [receitas, setReceitas] = useState([]);
  const [materiasPrimas, setMateriasPrimas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    rendimento: 1,
    materias_primas: []
  });
  const [materiaPrimaForm, setMateriaPrimaForm] = useState({
    materia_prima_id: '',
    quantidade: ''
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [ordenacao, setOrdenacao] = useState({ campo: 'nome', direcao: 'asc' });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [receitasData, materiasPrimasData] = await Promise.all([
        ReceitaService.obterTodos(),
        MateriaPrimaService.obterTodos()
      ]);
      setReceitas(receitasData);
      setMateriasPrimas(materiasPrimasData);
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

  const receitasOrdenadas = useMemo(() => {
    const resultado = [...receitas];

    resultado.sort((a, b) => {
      let valorA, valorB;

      switch (ordenacao.campo) {
        case 'nome':
          valorA = (a.nome || '').toLowerCase();
          valorB = (b.nome || '').toLowerCase();
          break;

        case 'rendimento':
          valorA = parseInt(a.rendimento) || 0;
          valorB = parseInt(b.rendimento) || 0;
          break;

        case 'custo_estimado':
          valorA = parseFloat(a.custo_estimado) || 0;
          valorB = parseFloat(b.custo_estimado) || 0;
          break;

        case 'materias_primas':
          valorA = a.materias_primas?.length || 0;
          valorB = b.materias_primas?.length || 0;
          break;

        default:
          return 0;
      }

      if (valorA < valorB) return ordenacao.direcao === 'asc' ? -1 : 1;
      if (valorA > valorB) return ordenacao.direcao === 'asc' ? 1 : -1;
      return 0;
    });

    return resultado;
  }, [receitas, ordenacao]);

  const mostrarToast = (mensagem, tipo = 'success') => {
    setToast({ show: true, message: mensagem, type: tipo });
  };

  const abrirModal = (item = null) => {
    if (item) {
      setSelectedItem(item);
      const materiasPrimasNormalizadas = (item.materias_primas || []).map(mp => ({
        ...mp,
        quantidade: typeof mp.quantidade === 'number'
          ? mp.quantidade
          : parseFloat(String(mp.quantidade).replace(',', '.')) || 0,
        custo_parcial: typeof mp.custo_parcial === 'number'
          ? mp.custo_parcial
          : parseFloat(String(mp.custo_parcial)) || 0
      }));

      setFormData({
        nome: item.nome,
        descricao: item.descricao || '',
        rendimento: item.rendimento || 1,
        materias_primas: materiasPrimasNormalizadas
      });
    } else {
      setSelectedItem(null);
      setFormData({
        nome: '',
        descricao: '',
        rendimento: 1,
        materias_primas: []
      });
    }
    setMateriaPrimaForm({ materia_prima_id: '', quantidade: '' });
    setShowModal(true);
  };

  const fecharModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setFormData({
      nome: '',
      descricao: '',
      rendimento: 1,
      materias_primas: []
    });
    setMateriaPrimaForm({ materia_prima_id: '', quantidade: '' });
  };

  const adicionarMateriaPrima = () => {
    if (!materiaPrimaForm.materia_prima_id || !materiaPrimaForm.quantidade) {
      mostrarToast('Preencha todos os campos da matéria-prima', 'error');
      return;
    }

    const materiaPrima = materiasPrimas.find(mp => mp.id === parseInt(materiaPrimaForm.materia_prima_id));
    if (!materiaPrima) return;

    let quantidadeStr = String(materiaPrimaForm.quantidade).replace(/[^\d.,]/g, '');
    quantidadeStr = quantidadeStr.replace(',', '.');
    const quantidade = parseFloat(quantidadeStr);

    if (isNaN(quantidade) || quantidade <= 0) {
      mostrarToast('Quantidade deve ser um número maior que zero', 'error');
      return;
    }

    const precoPorUnidade = parseFloat(materiaPrima.preco_por_unidade) || 0;
    const custoParcial = quantidade * precoPorUnidade;

    const jaExiste = formData.materias_primas.some(
      mp => mp.materia_prima_id === parseInt(materiaPrimaForm.materia_prima_id)
    );

    if (jaExiste) {
      mostrarToast('Esta matéria-prima já foi adicionada. Remova antes de adicionar novamente.', 'error');
      return;
    }

    setFormData({
      ...formData,
      materias_primas: [
        ...formData.materias_primas,
        {
          materia_prima_id: parseInt(materiaPrimaForm.materia_prima_id),
          quantidade: quantidade,
          custo_parcial: parseFloat(custoParcial.toFixed(2)),
          materia_prima_nome: materiaPrima.nome,
          unidade_medida: materiaPrima.unidade_medida
        }
      ]
    });

    setMateriaPrimaForm({ materia_prima_id: '', quantidade: '' });
  };

  const removerMateriaPrima = (index) => {
    setFormData({
      ...formData,
      materias_primas: formData.materias_primas.filter((_, i) => i !== index)
    });
  };

  const calcularCustoTotal = () => {
    return formData.materias_primas.reduce((total, mp) => {
      const custo = parseFloat(mp.custo_parcial) || 0;
      return parseFloat(total) + custo;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const materiasPrimasNormalizadas = formData.materias_primas.map(mp => {
        let quantidade = mp.quantidade;

        if (typeof quantidade === 'string') {
          quantidade = quantidade.replace(/[^\d.,]/g, '').replace(',', '.');
          quantidade = parseFloat(quantidade);
        }

        if (isNaN(quantidade) || quantidade <= 0) {
          throw new Error(`Quantidade inválida para ${mp.materia_prima_nome}`);
        }

        return {
          materia_prima_id: parseInt(mp.materia_prima_id),
          quantidade: quantidade
        };
      });

      const data = {
        ...formData,
        rendimento: parseInt(formData.rendimento) || 1,
        materias_primas: materiasPrimasNormalizadas
      };

      if (selectedItem) {
        await ReceitaService.atualizar(selectedItem.id, data);
        mostrarToast('Receita atualizada com sucesso!', 'success');
      } else {
        await ReceitaService.criar(data);
        mostrarToast('Receita cadastrada com sucesso!', 'success');
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
      await ReceitaService.excluir(selectedItem.id);
      mostrarToast('Receita excluída com sucesso!', 'success');
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
        <h1>Gerenciar Receitas</h1>
        <p>Cadastre e gerencie receitas com suas matérias-primas</p>
      </div>

      <div className="top-bar">
        <button className="btn-cadastrar d-flex align-items-center gap-2" onClick={() => abrirModal()}>
          <FaPlus /> Cadastrar Receita
          <InfoTooltip
            texto="Cadastre uma nova receita para produção de produtos. Informe nome, descrição e adicione as matérias-primas necessárias com suas quantidades. Receitas definem como os produtos são produzidos na instituição."
          />
        </button>

        <div style={{ fontSize: '14px', color: '#6c757d' }}>
          {receitasOrdenadas.length} {receitasOrdenadas.length === 1 ? 'receita' : 'receitas'}
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
                  onClick={() => toggleOrdenacao('rendimento')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  Rendimento <IconeOrdenacao campo="rendimento" />
                </th>
                <th
                  onClick={() => toggleOrdenacao('custo_estimado')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  Custo Estimado <IconeOrdenacao campo="custo_estimado" />
                </th>
                <th
                  onClick={() => toggleOrdenacao('materias_primas')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  Matérias-Primas <IconeOrdenacao campo="materias_primas" />
                </th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {receitasOrdenadas.length > 0 ? (
                receitasOrdenadas.map((item) => (
                  <tr key={item.id}>
                    <td>{item.nome}</td>
                    <td>{item.rendimento} un.</td>
                    <td>{formatCurrency(item.custo_estimado)}</td>
                    <td>{item.materias_primas?.length || 0}</td>
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
                    Nenhuma receita cadastrada.
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
        title={selectedItem ? 'Editar Receita' : 'Cadastrar Receita'}
        size="lg"
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
          <Form.Label>Rendimento (Quantidade de unidades) *</Form.Label>
          <Form.Control
            type="number"
            min="1"
            value={formData.rendimento}
            onChange={(e) => setFormData({ ...formData, rendimento: e.target.value })}
            required
          />
        </Form.Group>

        <hr />
        <h5>Matérias-Primas</h5>

        <div className="mb-3">
          <Form.Select
            value={materiaPrimaForm.materia_prima_id}
            onChange={(e) => setMateriaPrimaForm({ ...materiaPrimaForm, materia_prima_id: e.target.value })}
            className="mb-2"
          >
            <option value="">Selecione uma matéria-prima</option>
            {materiasPrimas.map((mp) => (
              <option key={mp.id} value={mp.id}>
                {mp.nome} ({mp.unidade_medida}) - {formatCurrency(mp.preco_por_unidade)}/{mp.unidade_medida}
              </option>
            ))}
          </Form.Select>
          <Form.Control
            type="text"
            inputMode="decimal"
            placeholder="Quantidade (ex: 0.300 ou 0,300)"
            value={materiaPrimaForm.quantidade}
            onChange={(e) => {
              let value = e.target.value;
              value = value.replace(/[^\d.,]/g, '');
              setMateriaPrimaForm({ ...materiaPrimaForm, quantidade: value });
            }}
            className="mb-2"
          />
          <Form.Text className="text-muted">
            Use ponto (.) ou vírgula (,) como separador decimal. Ex: 0.300 ou 0,300 para 300g
          </Form.Text>
          <Button onClick={adicionarMateriaPrima} variant="secondary" size="sm">
            <FaPlus /> Adicionar
          </Button>
        </div>

        {formData.materias_primas.length > 0 && (
          <Table striped bordered size="sm" className="mb-3">
            <thead>
              <tr>
                <th>Matéria-Prima</th>
                <th>Quantidade</th>
                <th>Custo Parcial</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {formData.materias_primas.map((mp, index) => {
                const quantidade = typeof mp.quantidade === 'number'
                  ? mp.quantidade
                  : parseFloat(String(mp.quantidade).replace(',', '.')) || 0;
                const custoParcial = typeof mp.custo_parcial === 'number'
                  ? mp.custo_parcial
                  : parseFloat(String(mp.custo_parcial).replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

                return (
                  <tr key={index}>
                    <td>{mp.materia_prima_nome} ({mp.unidade_medida})</td>
                    <td>{quantidade.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</td>
                    <td>{formatCurrency(custoParcial)}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removerMateriaPrima(index)}
                      >
                        <FaTimes />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="2" className="text-end"><strong>Total:</strong></td>
                <td><strong>{formatCurrency(parseFloat(calcularCustoTotal().toFixed(2)))}</strong></td>
                <td></td>
              </tr>
            </tfoot>
          </Table>
        )}
      </FormModal>

      <ConfirmModal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setSelectedItem(null);
        }}
        onConfirm={confirmarExclusao}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir a receita "${selectedItem?.nome}"?`}
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

export default GerenciarReceitas;
