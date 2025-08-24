import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Table } from 'react-bootstrap';
import { FaArrowLeft, FaUser, FaMapMarkerAlt, FaPhone, FaCalendarAlt, FaFileAlt } from 'react-icons/fa';
import { assistidasService } from '../services/assistidasService';
import { formatCPF, formatRG, formatTelefone } from '@casa-mais/shared';
import { BsCapsule, BsDropletHalf, BsHospital } from 'react-icons/bs';
import '../components/assistidas/Assistidas.css'

const DetalhesAssistida = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [assistida, setAssistida] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        carregarAssistida();
    }, [id]);

    const carregarAssistida = async () => {
        try {
            setLoading(true);
            const assistidaData = await assistidasService.obterPorId(id);
            if (assistidaData) {
                setAssistida(assistidaData);
            } else {
                setError('Assistida não encontrada');
            }
        } catch (error) {
            setError('Erro ao carregar dados da assistida');
            console.error('Erro:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatarData = (data) => {
        if (!data) return '-';
        return new Date(data).toLocaleDateString('pt-BR');
    };

    const calcularIdade = (dataNascimento) => {
        if (!dataNascimento) return '-';
        const hoje = new Date();
        const nascimento = new Date(dataNascimento);
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const mesAtual = hoje.getMonth();
        const mesNascimento = nascimento.getMonth();
        if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
            idade--;
        }
        return idade;
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Carregando...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">
                    {error}
                    <div className="mt-3">
                        <Button variant="outline-danger" onClick={() => navigate('/assistidas')}>
                            <FaArrowLeft className="me-2" /> Voltar para Lista
                        </Button>
                    </div>
                </Alert>
            </Container>
        );
    }
    if (!assistida) {
        return (
            <Container className="mt-4">
                <Alert variant="warning">
                    Assistida não encontrada
                    <div className="mt-3">
                        <Button variant="outline-warning" onClick={() => navigate('/assistidas')}>
                            <FaArrowLeft className="me-2" /> Voltar para Lista
                        </Button>
                    </div>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="text-primary d-flex align-items-center gap-1">
                                <FaUser className="me-2" /> <span>{assistida.nome}</span>
                            </h2>
                            <p className="text-muted mt-3">Dados completos e descrição detalhada da assistida</p>
                        </div>
                        <Button variant="outline-primary" onClick={() => navigate('/assistidas')} className='voltar'>
                            <FaArrowLeft className="me-2" /> Voltar
                        </Button>
                    </div>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0"><FaUser className="me-2" /> Dados Pessoais</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <p><strong>Nome:</strong> {assistida.nome || '-'}</p>
                                    <p><strong>CPF:</strong> {formatCPF(assistida.cpf) || '-'}</p>
                                    <p><strong>RG:</strong> {assistida.rg || '-'}</p>
                                    <p><strong>Data de Nascimento:</strong> {formatarData(assistida.data_nascimento)}</p>
                                    <p><strong>Idade:</strong> {calcularIdade(assistida.data_nascimento)} anos</p>
                                </Col>
                                <Col md={6}>
                                    <p><strong>Nacionalidade:</strong> {assistida.nacionalidade || '-'}</p>
                                    <p><strong>Estado Civil:</strong> {assistida.estado_civil || '-'}</p>
                                    <p><strong>Profissão:</strong> {assistida.profissao || '-'}</p>
                                    <p><strong>Escolaridade:</strong> Ensino {assistida.escolaridade || '-'}</p>
                                    <p><strong>Status:</strong>
                                        <span className={`ms-2 badge status ${assistida.status?.toLowerCase()}`}>
                                            {assistida.status || '-'}
                                        </span>
                                    </p>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col md={6}>
                    <Card>
                        <Card.Header><FaMapMarkerAlt className="me-2" /> Endereço</Card.Header>
                        <Card.Body>
                            <p><strong>Logradouro:</strong> {assistida.logradouro || '-'}</p>
                            <p><strong>Número:</strong> {assistida.numero || '-'}</p>
                            <p><strong>Bairro:</strong> {assistida.bairro || '-'}</p>
                            <p><strong>CEP:</strong> {assistida.cep || '-'}</p>
                            <p><strong>Cidade:</strong> {assistida.cidade || '-'}</p>
                            <p><strong>Estado:</strong> {assistida.estado || '-'}</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card>
                        <Card.Header><FaPhone className="me-2" /> Contato</Card.Header>
                        <Card.Body>
                            <p><strong>Telefone:</strong> {formatTelefone(assistida.telefone)}</p>
                            {assistida.telefone_contato && (
                                <p><strong>Telefone de Contato:</strong> {formatTelefone(assistida.telefone_contato)}</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {assistida.data_atendimento && (
                <Row className="mb-4">
                    <Col md={6}>
                        <Card>
                            <Card.Header><FaCalendarAlt className="me-2" /> Informações de Atendimento</Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col>
                                        <p><strong>Data do Último Atendimento:</strong> {formatarData(assistida.data_atendimento)}</p>
                                        <p><strong>Hora:</strong> {assistida.hora || '-'}</p>
                                        {assistida.tempo_sem_uso && (
                                            <p><strong>Tempo sem Uso:</strong> {assistida.tempo_sem_uso}</p>
                                        )}

                                        {assistida.motivacao_internacoes && (
                                            <p><strong>Motivação das Internações:</strong> {assistida.motivacao_internacoes}</p>
                                        )}

                                    </Col>

                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                    {/* Internações */}
                    <Col>
                        <Card>
                            <Card.Header><BsHospital className="me-2" /> Internações</Card.Header>
                            <Card.Body>
                                {assistida.internacoes && assistida.internacoes.length > 0 ? (
                                    <Table striped bordered size="sm">
                                        <thead>
                                            <tr>
                                                <th>Local</th>
                                                <th>Duração</th>
                                                <th>Data</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {assistida.internacoes.map((i, idx) => (
                                                <tr key={idx}>
                                                    <td>{i.local}</td>
                                                    <td>{i.duracao}</td>
                                                    <td>{formatarData(i.data)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                ) : (
                                    <p className="text-muted mb-0">Sem internações registradas.</p>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                </Row>
            )}

            {assistida.drogas && assistida.drogas.length > 0 && (
                <Row className='mb-4'>
                    <Col>
                        <Card>
                            <Card.Header>< BsDropletHalf className="me-2" /> Substâncias Utilizadas</Card.Header>
                            <Card.Body>
                                {assistida.drogas && assistida.drogas.length > 0 ? (
                                    <Table striped bordered size="sm">
                                        <thead>
                                            <tr>
                                                <th>Substância</th>
                                                <th>Idade de Início</th>
                                                <th>Tempo de Uso</th>
                                                <th>Intensidade</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {assistida.drogas.map((d, idx) => (
                                                <tr key={idx}>
                                                    <td>{d.tipo}</td>
                                                    <td>{d.idade_inicio}</td>
                                                    <td>{d.tempo_uso}</td>
                                                    <td>{d.intensidade}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                ) : (
                                    <p className="text-muted mb-0">Sem uso de substâncias declarado.</p>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={5}>
                        <Card>
                            <Card.Header><BsCapsule className="me-2" /> Medicamentos Utilizados</Card.Header>
                            <Card.Body>
                                {assistida.medicamentos && assistida.medicamentos.length > 0 ? (
                                    <Table striped bordered size="sm">
                                        <thead>
                                            <tr>
                                                <th>Nome</th>
                                                <th>Dosagem</th>
                                                <th>Frequência</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {assistida.medicamentos.map((med, idx) => (
                                                <tr key={idx}>
                                                    <td>{med.nome}</td>
                                                    <td>{med.dosagem || '-'}</td>
                                                    <td>{med.frequencia || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                ) : (
                                    <p className="text-muted mb-0">Sem medicamentos registrados.</p>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>


                </Row>
            )}

            {assistida.historia_patologica && (
                <Row className="mb-4">
                    <Col>
                        <Card>
                            <Card.Header><FaFileAlt className="me-2" /> História Patológica e Observações</Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={12}>
                                        <div className="mb-3">
                                            <strong>História Patológica Regressa:</strong>
                                            <p className="mt-2 p-3 bg-light rounded">{assistida.historia_patologica || 'Não informado'}</p>
                                        </div>
                                    </Col>
                                    {assistida.fatos_marcantes && (
                                        <Col md={4}>
                                            <strong>Fatos Marcantes:</strong>
                                            <p className="mt-2 p-3 bg-light rounded">{assistida.fatos_marcantes}</p>
                                        </Col>
                                    )}
                                    {assistida.infancia && (
                                        <Col md={4}>
                                            <strong>Infância:</strong>
                                            <p className="mt-2 p-3 bg-light rounded">{assistida.infancia}</p>
                                        </Col>
                                    )}
                                    {assistida.adolescencia && (
                                        <Col md={4}>
                                            <strong>Adolescência:</strong>
                                            <p className="mt-2 p-3 bg-light rounded">{assistida.adolescencia}</p>
                                        </Col>
                                    )}
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

        </Container>
    );
};

export default DetalhesAssistida;