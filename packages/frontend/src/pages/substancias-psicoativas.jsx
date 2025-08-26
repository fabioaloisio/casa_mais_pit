import { useEffect, useState } from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap';
import Toast from '../components/common/Toast';
import '../components/assistidas/Assistidas.css';
import '../pages/Doacoes.css';
import { FaPlus } from 'react-icons/fa';
import ListaSubstancias from '../components/substancias-psicoativas/listaSubstancias';
import FormularioSubstancia from '../components/substancias-psicoativas/formularioSubstancia';
import ConfirmDeleteModal from '../components/substancias-psicoativas/confirmDeleteModalSubstancia';
import substanciasService from '../services/substanciasService'; // 🔹 certifique-se que esse service existe

const Substancias = () => {
    const [substancias, setSubstancias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Filtros
    const [filtroNome, setFiltroNome] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroDescricao, setFiltroDescricao] = useState('');

    // Estados para edição
    const [substanciaParaEditar, setSubstanciaParaEditar] = useState(null);
    const [modoEdicao, setModoEdicao] = useState(false);

    // Estados para exclusão
    const [substanciaToDelete, setSubstanciaToDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Estado para Toast
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    const carregarSubstancias = async () => {
        try {
            setLoading(true);
            const dados = await substanciasService.obterTodos();
            setSubstancias(dados);
            console.log(dados)
            setError(null);
        } catch (err) {
            console.error('Erro ao carregar substâncias:', err);
            setError('Erro ao carregar substâncias. Verifique se o servidor está rodando.');
            showToast('Erro ao carregar substâncias', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarSubstancias();
    }, []);

    const adicionarSubstancia = async (novaSubstancia) => {
        try {
            let response;

            if (modoEdicao && substanciaParaEditar) {
                // Modo edição
                response = await substanciasService.update(substanciaParaEditar.id, novaSubstancia);
                if (response.success) {
                    await carregarSubstancias();
                    fecharModal();
                    showToast('Substância atualizada com sucesso!');
                } else {
                    showToast('Erro ao atualizar substância: ' + response.message, 'error');
                }
            } else {
                // Modo criação
                response = await substanciasService.create(novaSubstancia);
                if (response.success) {
                    await carregarSubstancias();
                    fecharModal();
                    showToast('Substância cadastrada com sucesso!');
                } else {
                    showToast('Erro ao cadastrar substância: ' + response.message, 'error');
                }
            }
        } catch (error) {
            showToast('Erro ao processar substância: ' + error.message, 'error');
        }
    };

    const handleEdit = (substancia) => {
        setSubstanciaParaEditar(substancia);
        setModoEdicao(true);
        setShowModal(true);
    };

    const fecharModal = () => {
        setShowModal(false);
        setModoEdicao(false);
        setSubstanciaParaEditar(null);
    };

    const handleDelete = (substancia) => {
        setSubstanciaToDelete(substancia);
        setShowDeleteModal(true);
    };

    const confirmarExclusao = async () => {
        try {
            setDeleting(true);
            const response = await substanciasService.delete(substanciaToDelete.id);
            if (response.success) {
                await carregarSubstancias();
                setShowDeleteModal(false);
                setSubstanciaToDelete(null);
                showToast('Substância excluída com sucesso!');
            } else {
                showToast('Erro ao excluir substância: ' + response.message, 'error');
            }
        } catch (error) {
            showToast('Erro ao excluir substância: ' + error.message, 'error');
        } finally {
            setDeleting(false);
        }
    };

    // Filtrar Substâncias
    const substanciasFiltradas = substancias.filter((substancia) => {
        const filtroNomeMatch =
            filtroNome === '' || substancia.nome.toLowerCase().includes(filtroNome.toLowerCase());

        const filtroCategoriaMatch =
            filtroCategoria === '' || substancia.categoria === filtroCategoria;

        const filtroDescricaoMatch =
            filtroDescricao === '' ||
            (substancia.descricao && substancia.descricao.toLowerCase().includes(filtroDescricao.toLowerCase()));

        return filtroNomeMatch && filtroCategoriaMatch && filtroDescricaoMatch;
    });

    if (loading) {
        return (
            <div className="conteudo">
                <div className="topo">
                    <h1>Gerenciar Tipos de Substâncias Psicoativas</h1>
                </div>
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <p>Carregando substâncias...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="conteudo">
                <div className="topo">
                    <h1>Gerenciar Tipos de Substâncias Psicoativas</h1>
                </div>
                <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
                    <p>{error}</p>
                    <Button onClick={carregarSubstancias} style={{ marginTop: '10px' }}>
                        Tentar Novamente
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="conteudo">
            <div className="topo">
                <h1>Gerenciar Tipos de Substâncias Psicoativas</h1>
                <p>Gerencie os tipos de substâncias psicoativas cadastradas no sistema.</p>
            </div>

            {/* Controles de Filtro e Ações */}
            <Row className="mb-4">
                <Col md={12}>
                    <div className="pai_filtros">
                        <Button
                            variant="primary"
                            className="btn-cadastrar"
                            onClick={() => setShowModal(true)}
                        >
                            <FaPlus /> Cadastrar Substância
                        </Button>

                        <div className="d-flex gap-3 align-items-center filtros">
                            {/* Filtro por Nome */}
                            <Form.Group controlId="filtro-nome" className="nome">
                                <Form.Label>Nome:</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Digite o nome da substância..."
                                    value={filtroNome}
                                    onChange={(e) => setFiltroNome(e.target.value)}
                                    style={{ minWidth: "200px" }}
                                />
                            </Form.Group>

                            {/* Filtro por Categoria */}
                            <Form.Group controlId="filtro-categoria" className="categoria">
                                <Form.Label>Categoria:</Form.Label>
                                <Form.Select
                                    value={filtroCategoria}
                                    onChange={(e) => setFiltroCategoria(e.target.value)}
                                    style={{ minWidth: "180px" }}
                                >
                                    <option value="">Todas</option>
                                    <option value="Depressor">Depressor</option>
                                    <option value="Estimulante">Estimulante</option>
                                    <option value="Perturbador">Perturbador</option>
                                    <option value="Outros">Outros</option>
                                </Form.Select>
                            </Form.Group>

                            {/* Filtro por Descrição */}
                            <Form.Group controlId="filtro-descricao" className="descricao">
                                <Form.Label>Descrição:</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Palavra-chave..."
                                    value={filtroDescricao}
                                    onChange={(e) => setFiltroDescricao(e.target.value)}
                                    style={{ minWidth: "200px" }}
                                />
                            </Form.Group>

                            {/* Botão para limpar filtros */}
                            {(filtroNome || filtroCategoria || filtroDescricao) && (
                                <Form.Group className="limpFiltro">
                                    <Form.Label>&nbsp;</Form.Label>
                                    <div>
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={() => {
                                                setFiltroNome("");
                                                setFiltroCategoria("");
                                                setFiltroDescricao("");
                                            }}
                                        >
                                            Limpar Filtros
                                        </Button>
                                    </div>
                                </Form.Group>
                            )}
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Lista de Substâncias */}
            <div>
                {substanciasFiltradas.length === 0 && substancias.length > 0 && (
                    <div className="alert alert-info text-center">
                        <strong>Nenhuma substância encontrada com os filtros aplicados.</strong>
                        <br />
                        <small>Tente ajustar os filtros ou limpe-os para ver todas as substâncias.</small>
                    </div>
                )}

                <ListaSubstancias
                    substancias={substanciasFiltradas}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                />
            </div>

            {/* Modal de Cadastro */}
            <FormularioSubstancia
                showModal={showModal}
                setShowModal={fecharModal}
                onSubmit={adicionarSubstancia}
                substanciaParaEditar={substanciaParaEditar}
                modoEdicao={modoEdicao}
            />

            {/* Modal de Confirmação de Exclusão */}
            <ConfirmDeleteModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                onConfirm={confirmarExclusao}
                substancia={substanciaToDelete}
                loading={deleting}
            />

            {/* Toast para notificações */}
            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, show: false })}
            />
        </div>
    );
};

export default Substancias;
