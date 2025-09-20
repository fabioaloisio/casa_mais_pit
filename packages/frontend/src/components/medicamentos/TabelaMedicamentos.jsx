import { FaEdit, FaTrash } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { UnidadeMedidaService } from '../../services/unidadesMedidaService';

const TabelaMedicamentos = ({ medicamentos, onEditar, onExcluir }) => {
  const [unidadesMedida, setUnidadesMedida] = useState([]);

  useEffect(() => {
    const carregarUnidadesMedida = async () => {
      try {
        const dados = await UnidadeMedidaService.obterTodas();
        setUnidadesMedida(dados);
      } catch (error) {
        console.error('Erro ao carregar unidades de medida:', error);
      }
    };

    carregarUnidadesMedida();
  }, []);

  return (
    <div className="tabela-container">
      <table className="tabela">
        <thead>
          <tr>
            <th>Id</th>
            <th>Nome</th>
            <th>Forma Farmacêutica</th>
            <th>Descrição</th>
            <th>Unidade de Medida</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {medicamentos.length > 0 ? (
            medicamentos.map((med) => (
              <tr key={med.id}>
                <td>{med.id}</td>
                <td>{med.nome}</td>
                <td>{med.forma_farmaceutica}</td>
                <td>{med.descricao || 'Sem descrição'}</td>
                <td>
                  {unidadesMedida.find((unidade) => unidade.id === med.unidade_medida_id)?.nome}
                  ({unidadesMedida.find((unidade) => unidade.id === med.unidade_medida_id)?.sigla})
                </td>
                <td>
                  <div>
                    <button className="btn-editar" onClick={() => onEditar(med)}>
                      <FaEdit /> Editar
                    </button>
                    <button className="btn-excluir" onClick={() => onExcluir(med)}>
                      <FaTrash /> Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="nenhum-registro">
                Nenhum medicamento encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TabelaMedicamentos;
