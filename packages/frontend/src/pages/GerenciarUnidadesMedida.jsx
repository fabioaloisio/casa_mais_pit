// Aldruin Bonfim de Lima Souza - RA 10482416915
import React, { useState, useEffect } from 'react';
import TabelaUnidadesMedida from '../components/unidadesMedida/TabelaUnidadesMedida';
import ModalCadastroUnidadeMedida from '../components/unidadesMedida/ModalCadastroUnidadeMedida';
import ModalEditarUnidadeMedida from '../components/unidadesMedida/ModalEditarUnidadeMedida';
import ModalExclusaoUnidadeMedida from '../components/unidadesMedida/ModalExclusaoUnidadeMedida';
import { UnidadeMedidaService } from '../services/unidadesMedidaService.js';
import Toast from '../components/common/Toast';
import './GerenciarUnidadesMedida.css';
import { FaPlus } from 'react-icons/fa';

const GerenciarUnidadesMedida = () => {
  const [nomeFiltro, setNomeFiltro] = useState('');
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalCadastroOpen, setIsModalCadastroOpen] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

  const [unidadeSelecionada, setUnidadeSelecionada] = useState(null);

  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });

  const mostrarToast = (mensagem, tipo = 'success') => {
    setToast({ show: true, message: mensagem, type: tipo });
  };

  useEffect(() => {
    carregarUnidadesMedida();
  }, []);

  const carregarUnidadesMedida = async () => {
    try {
      setLoading(true);
      const dados = await UnidadeMedidaService.obterTodas();
      setUnidadesMedida(dados);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar unidades de medida:', err);
      setError('Erro ao carregar unidades de medida. Verifique se o servidor está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalEditar = (unidade) => {
    setUnidadeSelecionada(unidade);
    setModalEditarAberto(true);
  };

  const abrirModalExcluir = (unidade) => {
    setUnidadeSelecionada(unidade);
    setModalExcluirAberto(true);
  };

  const fecharModais = () => {
    setIsModalCadastroOpen(false);
    setModalEditarAberto(false);
    setModalExcluirAberto(false);
    setUnidadeSelecionada(null);
  };

  const handleCadastrar = async (novaUnidadeMedida) => {
    try {
      const response = await UnidadeMedidaService.criar(novaUnidadeMedida);
      if (response.success) {
        await carregarUnidadesMedida();
        mostrarToast('Unidade de medida cadastrada com sucesso!', 'success');
        fecharModais();
      } else {
        mostrarToast('Erro ao cadastrar unidade de medida: ' + response.message, 'error');
      }
    } catch (error) {
      mostrarToast('Erro ao cadastrar unidade de medida: ' + error.message, 'error');
    }
  };

  const salvarEdicao = async (unidadeAtualizada) => {
    try {
      const response = await UnidadeMedidaService.atualizar(unidadeAtualizada.id, unidadeAtualizada);
      if (response.success) {
        await carregarUnidadesMedida();
        mostrarToast('Unidade de medida atualizada com sucesso!', 'success');
        fecharModais();
      } else {
        mostrarToast('Erro ao atualizar unidade de medida: ' + response.message, 'error');
      }
    } catch (error) {
      mostrarToast('Erro ao atualizar unidade de medida: ' + error.message, 'error');
    }
  };

  const confirmarExclusao = async () => {
    try {
      const response = await UnidadeMedidaService.excluir(unidadeSelecionada.id);
      if (response.success) {
        fecharModais();
        await carregarUnidadesMedida();
        mostrarToast('Unidade de medida excluída com sucesso!', 'success');
      } else {
        mostrarToast('Erro ao excluir unidade de medida: ' + response.message, 'error');
      }
    } catch (error) {
      mostrarToast('Erro ao excluir unidade de medida: ' + error.message, 'error');
    }
  };

  const unidadesFiltradas = unidadesMedida.filter((unidade) =>
    unidade.nome.toLowerCase().includes(nomeFiltro.toLowerCase())
  );

  if (loading) {
    return (
      <div className="conteudo">
        <div className="topo">
          <h1>Gerenciar Unidades de Medida</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Carregando unidades de medida...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="conteudo">
        <div className="topo">
          <h1>Gerenciar Unidades de Medida</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          <p>{error}</p>
          <button onClick={carregarUnidadesMedida} style={{ marginTop: '10px' }}>
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="conteudo">
      <div className="topo">
        <h1>Gerenciar Unidades de Medida</h1>
        <p>Gerencie as unidades de medida utilizadas</p>
      </div>

      <div className="top-bar">
        <button
          className="btn-cadastrar"
          onClick={() => setIsModalCadastroOpen(true)}
        >
          <FaPlus /> Cadastrar Unidade de Medida
        </button>

        <input
          type="text"
          placeholder="Filtrar por nome..."
          value={nomeFiltro}
          onChange={(e) => setNomeFiltro(e.target.value)}
          className="input-filtro"
        />
      </div>

      <TabelaUnidadesMedida
        unidadesMedida={unidadesFiltradas}
        onEditar={abrirModalEditar}
        onExcluir={abrirModalExcluir}
      />

      {isModalCadastroOpen && (
        <ModalCadastroUnidadeMedida
          isOpen={isModalCadastroOpen}
          onClose={fecharModais}
          onCadastrar={handleCadastrar}
        />
      )}

      {modalEditarAberto && unidadeSelecionada && (
        <ModalEditarUnidadeMedida
          unidadeMedida={unidadeSelecionada}
          onClose={fecharModais}
          onSave={salvarEdicao}
        />
      )}

      {modalExcluirAberto && unidadeSelecionada && (
        <ModalExclusaoUnidadeMedida
          unidadeMedida={unidadeSelecionada}
          onClose={fecharModais}
          onConfirm={confirmarExclusao}
        />
      )}

      <Toast
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        message={toast.message}
        type={toast.type}
      />
    </div>
  );
};

export default GerenciarUnidadesMedida;