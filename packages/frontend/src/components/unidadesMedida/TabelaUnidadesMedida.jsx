import { FaEdit, FaTrash } from 'react-icons/fa';

const TabelaUnidadesMedida = ({ unidadesMedida, onEditar, onExcluir }) => {
  return (
    <div className="tabela-container">
      <table className="tabela">
        <thead>
          <tr>
            <th>Id</th>
            <th>Nome</th>
            <th>Sigla</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {unidadesMedida.length > 0 ? (
            unidadesMedida.map((um) => (
              <tr key={um.id}>
                <td>{um.id}</td>
                <td>{um.nome}</td>
                <td>{um.sigla}</td>
                <td>
                  <div>
                    <button className="btn-editar" onClick={() => onEditar(um)}>
                      <FaEdit /> Editar
                    </button>
                    <button className="btn-excluir" onClick={() => onExcluir(um)}>
                      <FaTrash /> Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="nenhum-registro">
                Nenhuma unidade de medida encontrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TabelaUnidadesMedida;
