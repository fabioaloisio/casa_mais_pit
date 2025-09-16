import { Button, Table } from "react-bootstrap";
import { FaBold, FaEdit, FaTrash, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { formatCPF } from "@casa-mais/shared";
import PropTypes from 'prop-types';

const ListaAssistidas = ({ assistidas, onDelete, onEdit }) => {
    return (
        <div className="tabela-container mt-3">
            <Table className='tabela-assistidas'>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>CPF</th>
                        <th>Idade</th>
                        <th >Status</th>
                        <th className="text-center">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        assistidas.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center nenhum-registro">Nenhuma assistida cadastrada.</td>
                            </tr>
                        ) : (
                            assistidas.map((assistida) => (
                                <tr key={assistida.id}>
                                    <td className="fw-medium">{assistida.nome}</td>
                                    <td>{formatCPF(assistida.cpf)}</td>
                                    <td >{assistida.idade}</td>
                                    <td >
                                        <span className={`status ${assistida.status?.toLowerCase()?.replace(' ', '')}`}>
                                            {assistida.status}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <div className="d-flex gap-2 justify-content-center">
                                            <button
                                                className="btn-editar"
                                                onClick={() => onEdit(assistida)}
                                            >
                                                <FaEdit /> Editar
                                            </button>

                                            <button
                                                className="btn-excluir"
                                                onClick={() => onDelete(assistida)}
                                            >
                                                <FaTrash /> Excluir
                                            </button>

                                            <Link
                                                className="btn btn-outline-info btn-sm d-flex align-items-center gap-1"
                                                to={`/assistidas/${assistida.id}/detalhes`}
                                            >
                                                <FaUser /> Perfil
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )
                    }
                </tbody>
            </Table>
        </div>
    );
};

ListaAssistidas.propTypes = {
    assistidas: PropTypes.array.isRequired,
    onDelete: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired
};

export default ListaAssistidas;
