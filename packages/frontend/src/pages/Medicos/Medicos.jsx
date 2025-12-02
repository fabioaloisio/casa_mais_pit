import { useState, useEffect, useCallback } from 'react';
import { Button, Table, Modal, Spinner, Form, Row, Col, Badge } from 'react-bootstrap';
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaSearch,
    FaSort,
    FaSortUp,
    FaSortDown
} from 'react-icons/fa';
import { getAllMedicos, createMedico, updateMedico, deleteMedico } from '../../services/medicoService';
import MedicoForm from './MedicoForm';
import Toast from '../../components/common/Toast';
import InfoTooltip from '../../utils/tooltip';
import TitleHandler from '../../components/TitleHandler';
import './Medico.css';
import '../Doacoes.css'; 

function Medicos() {
    const [medicos, setMedicos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [showModal, setShowModal] = useState(false);
    const [selectedMedico, setSelectedMedico] = useState(null);
    const [filtro, setFiltro] = useState('');
    const [ordenacao, setOrdenacao] = useState({ campo: 'nome', direcao: 'asc' });

    const [formData, setFormData] = useState({ nome: '', crm: '', especialidade: '' });
    const [formErrors, setFormErrors] = useState({});

    const isEditMode = !!selectedMedico;

    const fetchMedicos = useCallback(async () => {
        try {
            setLoading(true);
            const medicosData = await getAllMedicos();
            setMedicos(medicosData || []);
        } catch (error) {
            setToast({
                show: true,
                message: 'Erro ao buscar médicos. Tente novamente mais tarde.',
                type: 'danger'
            });
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMedicos();
    }, [fetchMedicos]);

    useEffect(() => {
        if (showModal) {
            if (isEditMode) {
                setFormData({
                    nome: selectedMedico.nome || '',
                    crm: selectedMedico.crm || '',
                    especialidade: selectedMedico.especialidade || ''
                });
            } else {
                setFormData({ nome: '', crm: '', especialidade: '' });
            }
            setFormErrors({});
        }
    }, [showModal, isEditMode, selectedMedico]);

    const handleShowModal = (medico = null) => {
        setSelectedMedico(medico);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedMedico(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este médico? Esta ação não pode ser desfeita.')) {
            try {
                await deleteMedico(id);
                fetchMedicos();
                setToast({ show: true, message: 'Médico excluído com sucesso!', type: 'success' });
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Erro ao excluir médico.';
                setToast({ show: true, message: errorMessage, type: 'danger' });
                console.error('Erro ao excluir médico:', error);
            }
        }
    };
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.nome.trim()) errors.nome = 'O nome é obrigatório';
        if (!formData.crm.trim()) errors.crm = 'O CRM é obrigatório';
        if (!formData.especialidade.trim()) errors.especialidade = 'A especialidade é obrigatória';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        setActionLoading(true);

        try {
            let response;
            if (isEditMode) {
                response = await updateMedico(selectedMedico.id, formData);
            } else {
                response = await createMedico(formData);
            }
            handleCloseModal();
            fetchMedicos();
            setToast({ 
                show: true, 
                message: `Médico ${isEditMode ? 'atualizado' : 'criado'} com sucesso!`, 
                type: 'success' 
            });
        } catch (err) {
            const message = err.response?.data?.message || `Erro ao ${isEditMode ? 'atualizar' : 'criar'} o médico.`;
            setToast({ show: true, message, type: 'danger' });
            console.error(err);
        } finally {
            setActionLoading(false);
        }
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
    
    const medicosFiltrados = medicos
        .filter(medico => {
            const searchTerm = filtro.toLowerCase();
            return (
                (medico.nome || '').toLowerCase().includes(searchTerm) ||
                (medico.crm || '').toLowerCase().includes(searchTerm) ||
                (medico.especialidade || '').toLowerCase().includes(searchTerm)
            );
        })
        .sort((a, b) => {
            const { campo, direcao } = ordenacao;
            
            if (campo === 'id') {
                return direcao === 'asc' ? a.id - b.id : b.id - a.id;
            }

            const valorA = a[campo] ? a[campo].toString().toLowerCase() : '';
            const valorB = b[campo] ? b[campo].toString().toLowerCase() : '';

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
            <TitleHandler title="Gerenciar Médicos" />
            <div className="topo">
                <h1>Gestão de Médicos</h1>
                <p>Adicione, edite e gerencie os médicos disponíveis para consultas.</p>
            </div>

            <div className="filtros mb-4">
                <Button
                    className="azul d-flex align-items-center gap-2"
                    onClick={() => handleShowModal()}
                >
                    <FaPlus /> Novo Médico
                    <InfoTooltip
                        texto="Adicione um novo médico ao sistema para que ele possa ser associado a consultas."
                    />
                </Button>

                <div className="d-flex align-items-center gap-2">
                    <FaSearch className="text-muted" />
                    <Form.Control
                        type="text"
                        placeholder="Filtrar por nome, CRM ou especialidade..."
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                        style={{ width: '300px' }}
                    />
                </div>
            </div>

            <div className="tabela-container">
                <Table className="tabela-assistidas" hover responsive>
                    <thead>
                        <tr>
                            <th className="cursor-pointer user-select-none" onClick={() => handleOrdenar('id')}>
                                ID {getSortIcon('id')}
                            </th>
                            <th className="cursor-pointer user-select-none" onClick={() => handleOrdenar('nome')}>
                                Nome {getSortIcon('nome')}
                            </th>
                            <th className="cursor-pointer user-select-none" onClick={() => handleOrdenar('crm')}>
                                CRM {getSortIcon('crm')}
                            </th>
                            <th className="cursor-pointer user-select-none" onClick={() => handleOrdenar('especialidade')}>
                                Especialidade {getSortIcon('especialidade')}
                            </th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="text-center py-4">
                                    <div className="d-flex justify-content-center align-items-center">
                                        <Spinner animation="border" className="me-2" />
                                        Carregando médicos...
                                    </div>
                                </td>
                            </tr>
                        ) : medicosFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-4">
                                    <p className="mb-0">Nenhum médico encontrado.</p>
                                    <small>Tente ajustar o filtro ou adicione um novo médico.</small>
                                </td>
                            </tr>
                        ) : (
                            medicosFiltrados.map(medico => (
                                <tr key={medico.id}>
                                    <td>{medico.id}</td>
                                    <td className="fw-medium">{medico.nome}</td>
                                    <td><Badge bg="secondary">{medico.crm}</Badge></td>
                                    <td>{medico.especialidade}</td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            <Button variant="outline-primary" size="sm" onClick={() => handleShowModal(medico)}>
                                                <FaEdit /> Editar
                                            </Button>
                                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(medico.id)}>
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

            <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>{isEditMode ? 'Editar Médico' : 'Novo Médico'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <MedicoForm
                            formData={formData}
                            formErrors={formErrors}
                            handleChange={handleChange}
                            isEditMode={isEditMode}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal} disabled={actionLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="azul" disabled={actionLoading}>
                            {actionLoading ? <Spinner as="span" animation="border" size="sm" /> : (isEditMode ? 'Salvar Alterações' : 'Criar Médico')}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, show: false })}
            />
        </div>
    );
}

export default Medicos;
