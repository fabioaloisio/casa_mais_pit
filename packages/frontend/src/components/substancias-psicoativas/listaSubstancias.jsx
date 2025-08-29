import { Button, Table } from "react-bootstrap";
import { FaEdit, FaTrash, FaFlask } from "react-icons/fa";
import PropTypes from 'prop-types';

const ListaSubstancias = ({ substancias, onDelete, onEdit }) => {
    return (
        <div className="tabela-container mt-3">
            <Table className="tabela-assistidas">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Categoria</th>
                        <th>Descrição</th>
                        <th className="text-center">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {substancias.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="text-center nenhum-registro">
                                Nenhuma substância cadastrada.
                            </td>
                        </tr>
                    ) : (
                        substancias.map((substancia) => (
                            <tr key={substancia.id}>
                                <td className="fw-medium">{substancia.nome}</td>
                                <td>{substancia.categoria}</td>
                                <td>{substancia.descricao}</td>
                                <td className="text-center">
                                    <div className="d-flex gap-2 justify-content-center">
                                        <button
                                            className="btn-editar"
                                            onClick={() => onEdit(substancia)}
                                        >
                                            <FaEdit /> Editar
                                        </button>

                                        <button
                                            className="btn-excluir"
                                            onClick={() => onDelete(substancia)}
                                        >
                                            <FaTrash /> Excluir
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>
        </div>
    );
};

ListaSubstancias.propTypes = {
    substancias: PropTypes.array.isRequired,
    onDelete: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
};

export default ListaSubstancias;
