import { useState, useEffect } from "react";
import { Button, Col, Form, Modal, Row, Table, Nav } from "react-bootstrap";
import { IMaskInput } from "react-imask";
import PropTypes from 'prop-types';
import { formatDataForInput, calcularIdadePorDataNascimento } from "../../utils/masks";

const FormularioSimples = ({ showModal, setShowModal, onSubmit, assistidaParaEditar, modoEdicao }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ status: 'Ativa' });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Função para normalizar dados do formulário
    const normalizeFormData = (data) => {
        const formFields = [
            'nome', 'cpf', 'rg', 'idade', 'data_nascimento', 'nacionalidade', 
            'estado_civil', 'profissao', 'escolaridade', 'status',
            'logradouro', 'bairro', 'numero', 'cep', 'estado', 'cidade', 
            'telefone', 'telefone_contato',
            'data_atendimento', 'hora', 'historia_patologica', 'usuaria_drogas',
            'quantidade_drogas', 'tempo_sem_uso', 'uso_medicamentos', 'quais_medicamentos',
            'internado', 'quantidade_internacoes', 'motivacao_internacoes',
            'fatos_marcantes', 'infancia', 'adolescencia'
        ];
        
        const normalized = {};
        formFields.forEach(field => {
            normalized[field] = data[field] || '';
        });
        
        // Adicionar campos dinâmicos de drogas
        if (data.quantidade_drogas) {
            const qtd = parseInt(data.quantidade_drogas) || 0;
            for (let i = 1; i <= qtd; i++) {
                ['tipo', 'idade', 'tempo', 'intensidade'].forEach(campo => {
                    const fieldName = `droga${i}_${campo}`;
                    normalized[fieldName] = data[fieldName] || '';
                });
            }
        }
        
        return normalized;
    };
    
    const handleClose = () => {
        setShowModal(false);
    };

    // Efeito para carregar dados da assistida quando está editando
    useEffect(() => {
        if (showModal) {
            if (modoEdicao && assistidaParaEditar) {
                const dadosFormatados = {
                    ...assistidaParaEditar,
                    data_nascimento: formatDataForInput(assistidaParaEditar.data_nascimento),
                    data_atendimento: formatDataForInput(assistidaParaEditar.data_atendimento)
                };
                const dadosNormalizados = normalizeFormData(dadosFormatados);
                setFormData(dadosNormalizados);
            } else {
                const dadosIniciais = normalizeFormData({ status: 'Ativa' });
                setFormData(dadosIniciais);
            }
        }
    }, [modoEdicao, assistidaParaEditar, showModal]);

    // Limpar formulário quando fechar o modal
    useEffect(() => {
        if (!showModal) {
            setStep(1);
            setFormErrors({});
            if (!modoEdicao) {
                setFormData({ status: 'Ativa' });
            }
        }
    }, [showModal, modoEdicao]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const newData = { ...prev, [name]: value };
            
            // Auto-calcular idade quando data de nascimento mudar
            if (name === 'data_nascimento' && value) {
                const idade = calcularIdadePorDataNascimento(value);
                if (idade) {
                    newData.idade = idade.toString();
                }
            }
            
            // Limpar erro do campo quando ele for preenchido
            if (formErrors[name]) {
                setFormErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[name];
                    return newErrors;
                });
            }
            
            return newData;
        });
    };

    const handleMaskChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateStep = () => {
        const errors = {};

        if (step === 1) {
            ["nome", "cpf", "rg", "idade", "data_nascimento", "nacionalidade", "estado_civil", "profissao", "escolaridade"].forEach((field) => {
                if (!formData[field]) errors[field] = "Campo obrigatório";
            });
        }

        if (step === 2) {
            ["logradouro", "bairro", "numero", "cep", "estado", "cidade", "telefone"].forEach((field) => {
                if (!formData[field]) errors[field] = "Campo obrigatório";
            });
        }

        if (step === 3) {
            const camposObrigatorios = ["data_atendimento", "hora", "historia_patologica"];
            camposObrigatorios.forEach((field) => {
                if (!formData[field]) errors[field] = "Campo obrigatório";
            });
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
        if (validateStep()) {
            setStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        setStep(prev => prev - 1);
    };

    const validateAllSteps = () => {
        const errors = {};
        const steps = {
            1: ["nome", "cpf", "rg", "idade", "data_nascimento", "nacionalidade", "estado_civil", "profissao", "escolaridade"],
            2: ["logradouro", "bairro", "numero", "cep", "estado", "cidade", "telefone"],
            3: ["data_atendimento", "hora", "historia_patologica"],
        };

        let firstErrorStep = null;

        for (const [stepNumber, fields] of Object.entries(steps)) {
            for (const field of fields) {
                if (!formData[field]) {
                    errors[field] = "Campo obrigatório";
                    if (!firstErrorStep) firstErrorStep = parseInt(stepNumber);
                }
            }
        }

        setFormErrors(errors);
        if (firstErrorStep) setStep(firstErrorStep);

        return Object.keys(errors).length === 0;
    };

    const campos = [
        ...(formData.internado === "sim" ? ["motivacao_internacoes"] : []),
        "fatos_marcantes",
        "infancia",
        "adolescencia"
    ];

    return (
        <Modal
            show={showModal}
            onHide={handleClose}
            backdrop={true}
            keyboard={true}
            size="xl"
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    {modoEdicao ? 'Editar Assistida' : 'Cadastro de Assistida'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Navegação em Tabs simplificada */}
                <Nav variant="pills" className="mb-4 d-flex justify-content-center">
                    <Nav.Item>
                        <Nav.Link 
                            active={step === 1} 
                            onClick={() => setStep(1)}
                            style={{ cursor: 'pointer' }}
                        >
                            1. Dados Pessoais
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link 
                            active={step === 2} 
                            onClick={() => step > 1 && setStep(2)}
                            disabled={step < 2}
                            style={{ cursor: step >= 2 ? 'pointer' : 'not-allowed' }}
                        >
                            2. Endereço
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link 
                            active={step === 3} 
                            onClick={() => step > 2 && setStep(3)}
                            disabled={step < 3}
                            style={{ cursor: step >= 3 ? 'pointer' : 'not-allowed' }}
                        >
                            3. Saúde
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link 
                            active={step === 4} 
                            onClick={() => step > 3 && setStep(4)}
                            disabled={step < 4}
                            style={{ cursor: step >= 4 ? 'pointer' : 'not-allowed' }}
                        >
                            4. Histórico
                        </Nav.Link>
                    </Nav.Item>
                </Nav>

                <Form noValidate>
                    {step === 1 && (
                        <>
                            <h5 className="mb-3">Dados Pessoais</h5>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nome Completo *</Form.Label>
                                        <Form.Control
                                            name="nome"
                                            type="text"
                                            value={formData.nome || ''}
                                            onChange={handleChange}
                                            isInvalid={!!formErrors.nome}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.nome}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>CPF *</Form.Label>
                                        <IMaskInput
                                            mask="000.000.000-00"
                                            name="cpf"
                                            value={formData.cpf || ''}
                                            unmask={true}
                                            onAccept={(value) => handleMaskChange('cpf', value)}
                                            className={`form-control ${formErrors.cpf ? 'is-invalid' : ''}`}
                                            placeholder="000.000.000-00"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.cpf}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>RG *</Form.Label>
                                        <IMaskInput
                                            mask="00.000.000-0"
                                            name="rg"
                                            value={formData.rg || ''}
                                            unmask={true}
                                            onAccept={(value) => handleMaskChange('rg', value)}
                                            className={`form-control ${formErrors.rg ? 'is-invalid' : ''}`}
                                            placeholder="00.000.000-0"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.rg}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Data de Nascimento *</Form.Label>
                                        <Form.Control
                                            name="data_nascimento"
                                            type="date"
                                            value={formData.data_nascimento || ''}
                                            onChange={handleChange}
                                            isInvalid={!!formErrors.data_nascimento}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.data_nascimento}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Idade</Form.Label>
                                        <Form.Control
                                            name="idade"
                                            type="number"
                                            value={formData.idade || ''}
                                            onChange={handleChange}
                                            readOnly
                                            style={{ backgroundColor: '#f8f9fa' }}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nacionalidade *</Form.Label>
                                        <Form.Control
                                            name="nacionalidade"
                                            type="text"
                                            value={formData.nacionalidade || 'Brasileira'}
                                            onChange={handleChange}
                                            isInvalid={!!formErrors.nacionalidade}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.nacionalidade}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Estado Civil *</Form.Label>
                                        <Form.Select
                                            name="estado_civil"
                                            value={formData.estado_civil || ''}
                                            onChange={handleChange}
                                            isInvalid={!!formErrors.estado_civil}
                                        >
                                            <option value="">Selecione</option>
                                            <option value="Solteira">Solteira</option>
                                            <option value="Casada">Casada</option>
                                            <option value="Divorciada">Divorciada</option>
                                            <option value="Viúva">Viúva</option>
                                            <option value="União Estável">União Estável</option>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.estado_civil}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Profissão *</Form.Label>
                                        <Form.Control
                                            name="profissao"
                                            type="text"
                                            value={formData.profissao || ''}
                                            onChange={handleChange}
                                            isInvalid={!!formErrors.profissao}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.profissao}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Escolaridade *</Form.Label>
                                        <Form.Select
                                            name="escolaridade"
                                            value={formData.escolaridade || ''}
                                            onChange={handleChange}
                                            isInvalid={!!formErrors.escolaridade}
                                        >
                                            <option value="">Selecione</option>
                                            <option value="Fundamental Incompleto">Fundamental Incompleto</option>
                                            <option value="Fundamental Completo">Fundamental Completo</option>
                                            <option value="Médio Incompleto">Médio Incompleto</option>
                                            <option value="Médio Completo">Médio Completo</option>
                                            <option value="Superior Incompleto">Superior Incompleto</option>
                                            <option value="Superior Completo">Superior Completo</option>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.escolaridade}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Status</Form.Label>
                                        <Form.Select
                                            name="status"
                                            value={formData.status || 'Ativa'}
                                            onChange={handleChange}
                                            disabled
                                        >
                                            <option value="Ativa">Ativa</option>
                                            <option value="Inativa">Inativa</option>
                                            <option value="Em Tratamento">Em Tratamento</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <h5 className="mb-3">Informações de Endereço e Contato</h5>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Logradouro *</Form.Label>
                                        <Form.Control
                                            name="logradouro"
                                            type="text"
                                            value={formData.logradouro || ''}
                                            onChange={handleChange}
                                            isInvalid={!!formErrors.logradouro}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.logradouro}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Número *</Form.Label>
                                        <Form.Control
                                            name="numero"
                                            type="text"
                                            value={formData.numero || ''}
                                            onChange={handleChange}
                                            isInvalid={!!formErrors.numero}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.numero}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Bairro *</Form.Label>
                                        <Form.Control
                                            name="bairro"
                                            type="text"
                                            value={formData.bairro || ''}
                                            onChange={handleChange}
                                            isInvalid={!!formErrors.bairro}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.bairro}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>CEP *</Form.Label>
                                        <IMaskInput
                                            mask="00000-000"
                                            name="cep"
                                            value={formData.cep || ''}
                                            unmask={true}
                                            onAccept={(value) => handleMaskChange('cep', value)}
                                            className={`form-control ${formErrors.cep ? 'is-invalid' : ''}`}
                                            placeholder="00000-000"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.cep}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Cidade *</Form.Label>
                                        <Form.Control
                                            name="cidade"
                                            type="text"
                                            value={formData.cidade || ''}
                                            onChange={handleChange}
                                            isInvalid={!!formErrors.cidade}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.cidade}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Estado *</Form.Label>
                                        <Form.Select
                                            name="estado"
                                            value={formData.estado || ''}
                                            onChange={handleChange}
                                            isInvalid={!!formErrors.estado}
                                        >
                                            <option value="">Selecione...</option>
                                            {["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", 
                                              "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", 
                                              "RS", "RO", "RR", "SC", "SP", "SE", "TO"].map(uf => (
                                                <option key={uf} value={uf}>{uf}</option>
                                            ))}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.estado}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Telefone *</Form.Label>
                                        <IMaskInput
                                            mask="(00) 00000-0000"
                                            name="telefone"
                                            value={formData.telefone || ''}
                                            unmask={true}
                                            onAccept={(value) => handleMaskChange('telefone', value)}
                                            className={`form-control ${formErrors.telefone ? 'is-invalid' : ''}`}
                                            placeholder="(00) 00000-0000"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.telefone}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Telefone de Contato</Form.Label>
                                        <IMaskInput
                                            mask="(00) 00000-0000"
                                            name="telefone_contato"
                                            value={formData.telefone_contato || ''}
                                            unmask={true}
                                            onAccept={(value) => handleMaskChange('telefone_contato', value)}
                                            className="form-control"
                                            placeholder="(00) 00000-0000"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <h5 className="mb-3">Informações de Saúde</h5>
                            <Row>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Data do Último Atendimento *</Form.Label>
                                        <Form.Control
                                            name="data_atendimento"
                                            type="date"
                                            value={formData.data_atendimento || ''}
                                            onChange={handleChange}
                                            isInvalid={!!formErrors.data_atendimento}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.data_atendimento}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Hora *</Form.Label>
                                        <Form.Control
                                            name="hora"
                                            type="time"
                                            value={formData.hora || ''}
                                            onChange={handleChange}
                                            isInvalid={!!formErrors.hora}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.hora}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>História Patológica *</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            name="historia_patologica"
                                            value={formData.historia_patologica || ''}
                                            onChange={handleChange}
                                            isInvalid={!!formErrors.historia_patologica}
                                            placeholder="Descreva o histórico médico..."
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.historia_patologica}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Usuária de drogas?</Form.Label>
                                        <Form.Select
                                            name="usuaria_drogas"
                                            value={formData.usuaria_drogas || ''}
                                            onChange={handleChange}
                                        >
                                            <option value="">Selecione...</option>
                                            <option value="nao">Não</option>
                                            <option value="sim">Sim</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                {formData.usuaria_drogas === "sim" && (
                                    <>
                                        <Col md={3}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Quantas Substâncias?</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    name="quantidade_drogas"
                                                    value={formData.quantidade_drogas || ''}
                                                    onChange={handleChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Tempo sem uso</Form.Label>
                                                <Form.Control
                                                    name="tempo_sem_uso"
                                                    value={formData.tempo_sem_uso || ''}
                                                    onChange={handleChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </>
                                )}
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Usa medicamentos?</Form.Label>
                                        <Form.Select
                                            name="uso_medicamentos"
                                            value={formData.uso_medicamentos || ''}
                                            onChange={handleChange}
                                        >
                                            <option value="">Selecione...</option>
                                            <option value="nao">Não</option>
                                            <option value="sim">Sim</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                {formData.uso_medicamentos === "sim" && (
                                    <Col md={9}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Quais medicamentos?</Form.Label>
                                            <Form.Control
                                                name="quais_medicamentos"
                                                value={formData.quais_medicamentos || ''}
                                                onChange={handleChange}
                                                placeholder="Liste os medicamentos em uso..."
                                            />
                                        </Form.Group>
                                    </Col>
                                )}
                            </Row>
                        </>
                    )}

                    {step === 4 && (
                        <>
                            <h5 className="mb-3">Histórico de Vida</h5>
                            <Row>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Já esteve internado?</Form.Label>
                                        <Form.Select
                                            name="internado"
                                            value={formData.internado || ''}
                                            onChange={handleChange}
                                        >
                                            <option value="">Selecione...</option>
                                            <option value="nao">Não</option>
                                            <option value="sim">Sim</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                {formData.internado === "sim" && (
                                    <>
                                        <Col md={3}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Quantas vezes?</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="quantidade_internacoes"
                                                    value={formData.quantidade_internacoes || ''}
                                                    onChange={handleChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={12}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Motivação das Internações</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    name="motivacao_internacoes"
                                                    value={formData.motivacao_internacoes || ''}
                                                    onChange={handleChange}
                                                    placeholder="Descreva os motivos..."
                                                />
                                            </Form.Group>
                                        </Col>
                                    </>
                                )}
                                {campos.map((campo, idx) => (
                                    <Col md={6} key={idx}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>{campo.replace(/_/g, " ").charAt(0).toUpperCase() + campo.replace(/_/g, " ").slice(1)}</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                name={campo}
                                                value={formData[campo] || ''}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                ))}
                            </Row>
                        </>
                    )}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                {step > 1 && (
                    <Button variant="secondary" onClick={handlePrev}>
                        Voltar
                    </Button>
                )}
                <Button variant="secondary" onClick={handleClose}>
                    Cancelar
                </Button>
                {step < 4 ? (
                    <Button variant="primary" onClick={handleNext}>
                        Próximo
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        disabled={isSubmitting}
                        onClick={async () => {
                            setIsSubmitting(true);
                            try {
                                if (validateAllSteps()) {
                                    await onSubmit(formData);
                                    setShowModal(false);
                                    if (!modoEdicao) {
                                        setFormData({ status: 'Ativa' });
                                    }
                                    setStep(1);
                                    setFormErrors({});
                                }
                            } catch (error) {
                                console.error('Erro ao salvar:', error);
                            } finally {
                                setIsSubmitting(false);
                            }
                        }}
                    >
                        {isSubmitting ? 'Salvando...' : (modoEdicao ? 'Atualizar' : 'Salvar')}
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};

FormularioSimples.propTypes = {
    showModal: PropTypes.bool.isRequired,
    setShowModal: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    assistidaParaEditar: PropTypes.object,
    modoEdicao: PropTypes.bool
};

FormularioSimples.defaultProps = {
    assistidaParaEditar: null,
    modoEdicao: false
};

export default FormularioSimples;