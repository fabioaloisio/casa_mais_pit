import { useState, useEffect, useMemo } from "react";
import { Button, Col, Form, Modal, Row, Table, Alert, ProgressBar } from "react-bootstrap";
import { IMaskInput } from "react-imask";
import PropTypes from 'prop-types';
import { formatDataForInput, calcularIdadePorDataNascimento } from "@casa-mais/shared";
import { FaUser, FaHome, FaMedkit, FaHeartbeat, FaCheck, FaExclamationTriangle, FaTrash, FaBan } from 'react-icons/fa';

import './style/Assistidas.css'

const Formulario = ({ showModal, setShowModal, onSubmit, assistidaParaEditar, modoEdicao, listaAssistidas = [] }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ status: 'Ativa' });
  const [formErrors, setFormErrors] = useState({});
  const [initialData, setInitialData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Função para normalizar dados do formulário (apenas campos relevantes)

  const normalizeFormData = (data) => {
    const formFields = [
      'nome', 'cpf', 'rg', 'data_nascimento', 'nacionalidade',
      'estado_civil', 'profissao', 'escolaridade', 'status',
      'logradouro', 'bairro', 'numero', 'cep', 'estado', 'cidade',
      'telefone', 'telefone_contato'
    ];

    const normalized = {};
    formFields.forEach(field => {
      if (field === 'nacionalidade' && !data[field]) {
        normalized[field] = 'Brasileira';
      } else {
        normalized[field] = data[field] || '';
      }
    });

    return normalized;
  };

  // Estado para garantir que só detecte mudanças após carregar dados iniciais
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);

  const handleClose = () => {
    setShowModal(false);
    setStep(1);
    setFormData({ status: 'Ativa' });
    setInitialData({});
    setFormErrors({});
    setCompletedSteps([]);
    setHasLoadedInitialData(false);
  };

  // Efeito para carregar dados da assistida quando está editando
  useEffect(() => {
    if (showModal) {
      // Sempre resetar o estado de submissão quando o modal abre
      setIsSubmitting(false);
      setFormErrors({});
      setStep(1);
      setCompletedSteps([]);

      if (modoEdicao && assistidaParaEditar) {
        const dadosFormatados = {
          ...assistidaParaEditar,
          data_nascimento: formatDataForInput(assistidaParaEditar.data_nascimento),
          // data_atendimento: formatDataForInput(assistidaParaEditar.data_atendimento),
        };

        setFormData(dadosFormatados);
        // Normalizar dados iniciais para comparação
        const dadosNormalizados = normalizeFormData(dadosFormatados);
        setInitialData(dadosNormalizados);
        // Usar setTimeout para garantir que setState seja processado
        setTimeout(() => setHasLoadedInitialData(true), 100);
      } else {
        // Modo de criação - inicializar com dados vazios
        const inicial = {
          status: "Ativa",
          nacionalidade: "Brasileira",
        };
        setFormData(inicial);
        const inicialNormalizado = normalizeFormData(inicial);
        setInitialData(inicialNormalizado);
        setTimeout(() => setHasLoadedInitialData(true), 100);
      }
    } else {
      // Quando o modal fecha, resetar estados
      setIsSubmitting(false);
      setFormErrors({});
      setStep(1);
      setCompletedSteps([]);
    }
  }, [modoEdicao, assistidaParaEditar, showModal]);

  const handleChange = async (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value || (name === 'nacionalidade' ? 'Brasileira' : '')
      };

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

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const validateStep = () => {
    const errors = {};

    if (step === 1) {
      const camposObrigatorios = ["nome", "cpf", "rg", "data_nascimento", 'nacionalidade', "estado_civil", "profissao", "escolaridade"];
      camposObrigatorios.forEach((field) => {
        if (!formData[field]) errors[field] = "Campo obrigatório";
      });

      // Verificação de CPF já existente
      const cpfNormalizado = formData.cpf?.replace(/\D/g, '');
      const cpfJaExiste = listaAssistidas.some(assistida =>
        assistida.cpf.replace(/\D/g, '') === cpfNormalizado &&
        (!modoEdicao || assistida.id !== assistidaParaEditar?.id)
      );

      if (cpfJaExiste) {
        errors.cpf = "Este CPF já está cadastrado.";
      }

      // Verificação da idade mínima (18 anos)
      if (formData.data_nascimento) {
        const nascimento = new Date(formData.data_nascimento);
        const hoje = new Date();
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const m = hoje.getMonth() - nascimento.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
          idade--;
        }
        if (idade < 18) {
          errors.data_nascimento = "A assistida deve ter no mínimo 18 anos.";
        }
      }
    }

    if (step === 2) {
      ["logradouro", "bairro", "numero", "cep", "estado", "cidade", "telefone"].forEach((field) => {
        if (!formData[field]) errors[field] = "Campo obrigatório";
      });
    }



    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBlur = (field) => () => {
    const valor = formData[field];

    // Lógica específica para o CPF
    if (field === 'cpf') {
      const cpf = valor?.replace(/\D/g, '');

      const cpfDuplicado = listaAssistidas.some(assistida =>
        assistida.cpf.replace(/\D/g, '') === cpf &&
        (!modoEdicao || assistida.id !== assistidaParaEditar?.id)
      );

      if (!cpf || cpf.trim() === '') {
        setFormErrors(prev => ({
          ...prev,
          cpf: 'Campo obrigatório'
        }));
      } else if (cpfDuplicado) {
        setFormErrors(prev => ({
          ...prev,
          cpf: 'Este CPF já está cadastrado.'
        }));
      } else {
        // Remove erro se CPF está válido
        if (formErrors.cpf) {
          setFormErrors(prev => {
            const novo = { ...prev };
            delete novo.cpf;
            return novo;
          });
        }
      }

      return;
    }

    // Verificação genérica para campos obrigatórios
    if (!valor || valor.trim() === '') {
      setFormErrors(prev => ({
        ...prev,
        [field]: 'Campo obrigatório'
      }));
    } else if (formErrors[field]) {
      // Remove o erro se já estava presente e foi corrigido
      setFormErrors(prev => {
        const novo = { ...prev };
        delete novo[field];
        return novo;
      });
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setCompletedSteps(prev => [...new Set([...prev, step])]);
      nextStep();
    }
  };

  const handleStepClick = (targetStep) => {
    if (targetStep > step) { // Tentando mover para uma etapa futura
      if (validateStep()) { // Valida a etapa atual antes de prosseguir
        // Adiciona a etapa atual (que acabou de ser validada) a completedSteps
        setCompletedSteps(prev => {
          const newCompleted = new Set(prev);
          newCompleted.add(step);
          return Array.from(newCompleted);
        });
        setStep(targetStep); // Move para a etapa de destino
      }
      // Se validateStep() for falso, formErrors será definido e o usuário permanecerá na etapa atual.
    } else { // Movendo para uma etapa anterior, atual ou clicando na mesma etapa
      setStep(targetStep);
      // Nenhuma alteração em completedSteps aqui. Se o usuário clicar em uma etapa já concluída, ela permanece concluída.
      // Se o usuário clicar em uma etapa anterior não concluída, ela permanece não concluída até que ele passe por ela.
    }
  };

  const validateAllSteps = () => {
    const errors = {};
    const steps = {
      1: ["nome", "cpf", "rg", "data_nascimento", "nacionalidade", "estado_civil", "profissao", "escolaridade"],
      2: ["logradouro", "bairro", "numero", "cep", "estado", "cidade", "telefone"],
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

  return (
    <>
      <Modal
        show={showModal}
        onHide={handleClose}
        size="xl"
        centered
        backdrop={true}
        keyboard={true}
      >

        <Modal.Header closeButton>
          <Modal.Title>
            {modoEdicao ? 'Editar Assistida' : 'Cadastro de Assistida'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>

          <div className="step-indicator mb-4 d-flex justify-content-center">
            {!modoEdicao && (
              <ProgressBar className="mb-3" style={{ height: '6px' }}>
                <ProgressBar
                  variant="success"
                  now={(completedSteps.length / 4) * 100}
                  animated
                />
              </ProgressBar>
            )}
            <div className="d-flex justify-content-around  w-50">
              {[
                { label: "Dados Pessoais", icon: FaUser },
                { label: "Contato e Endereço", icon: FaHome },
              ].map((stepData, index) => (
                <div
                  key={index}
                  className={`step ${step === index + 1 ? 'active' : ''} ${completedSteps.includes(index + 1) && !modoEdicao ? 'completed' : ''}`}
                  onClick={() => handleStepClick(index + 1)}
                  style={{ cursor: "pointer", textAlign: 'center' }}
                >
                  <div className="circle">
                    {completedSteps.includes(index + 1) && !modoEdicao ? (
                      <FaCheck />
                    ) : (
                      <stepData.icon />
                    )}
                  </div>

                  <span className="step-label">{stepData.label}</span>
                </div>
              ))}
            </div>
          </div>

          <Form noValidate>
            {step === 1 && (
              <div className="w-100">
                {/* Header do Step 1 */}
                <div className="bg-primary p-3 rounded-top">
                  <h4 className="mb-0 text-center" style={{ color: 'white' }}>Dados Pessoais</h4>
                </div>

                <fieldset className='d-flex justify-content-center field rounded-bottom border-top-0'>
                  <Row className="d-flex flex-wrap justify-content-center">
                    {[
                      { name: "nome", label: "Nome Completo", col: 6 },
                      { name: "cpf", label: "CPF", mask: "000.000.000-00" },
                      { name: "rg", label: "RG" },
                      { name: "data_nascimento", label: "Data de Nascimento", type: "date" },
                      { name: "nacionalidade", label: "Nacionalidade", defaultValue: "Brasileira" },
                      { name: "estado_civil", label: "Estado Civil", type: "select", options: ["Solteira", "Casada", "Divorciada", "Viúva", "União Estável"] },
                      { name: "profissao", label: "Profissão" },
                      { name: "escolaridade", label: "Escolaridade", type: "select", options: ["Fundamental Incompleto", "Fundamental Completo", "Médio Incompleto", "Médio Completo", "Superior Incompleto", "Superior Completo"] },
                      { name: "status", label: "Status", type: "select", options: ["Ativa", "Inativa", "Em Tratamento"] }
                    ].map(({ name, label, type = "text", options, mask, col = 3, defaultValue, readonly }, idx) => (
                      <Col md={col} key={idx} className="mb-3">
                        <Form.Group>
                          <Form.Label>
                            {label}
                            {["nome", "cpf", "rg", "data_nascimento", "nacionalidade", "estado_civil", "profissao", "escolaridade"].includes(name) && (
                              <span className="text-danger ms-1">*</span>
                            )}
                          </Form.Label>
                          {mask ? (
                            <IMaskInput
                              mask={mask}
                              name={name}
                              value={formData[name] || defaultValue || ''}
                              unmask={true}
                              onAccept={(value) => handleMaskChange(name, value)}
                              onInput={handleBlur(name)}
                              onBlur={handleBlur(name)}
                              onChange={handleChange}
                              className={`form-control ${formErrors[name] ? 'is-invalid' : ''}`}
                              placeholder={mask.replace(/0/g, "_")}
                            />
                          ) : type === "select" ? (
                            <Form.Select
                              name={name}
                              value={formData[name] || 'Ativa'}
                              onChange={handleChange}
                              isInvalid={!!formErrors[name]}
                              disabled={name === "status"}
                            >
                              <option value="">Selecione</option>
                              {options.map((option, i) => (
                                <option key={i} value={option}>{option}</option>
                              ))}
                            </Form.Select>
                          ) : (
                            <Form.Control
                              name={name}
                              type={type}
                              value={name === 'nacionalidade' && !formData[name] ? 'Brasileira' : (formData[name] || defaultValue || '')}
                              onChange={handleChange}
                              isInvalid={!!formErrors[name]}
                              readOnly={readonly}
                            />
                          )}
                          <Form.Control.Feedback type="invalid">
                            {formErrors[name]}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    ))}
                  </Row>
                </fieldset>
              </div>
            )}

            {step === 2 && (
              <div className="w-100">
                {/* Header do Step 2 */}
                <div className="bg-primary p-3 rounded-top">
                  <h4 className="mb-0 text-center" style={{ color: 'white' }}>Contato e Endereço</h4>
                </div>

                <fieldset className="field rounded-bottom border-top-0 p-4">
                  <Row className="w-100">
                    <Col md={12}>
                      <Row>
                        {[
                          { field: "logradouro", label: "Logradouro", col: 7 },
                          { field: "numero", label: "Número", type: "text", col: 2 },
                          { field: "cep", label: "CEP", mask: "00000-000", col: 3 },
                          { field: "bairro", label: "Bairro", col: 4 },
                          { field: "cidade", label: "Cidade", col: 6 },
                          {
                            field: "estado", label: "Estado", type: "select", col: 2, options: [
                              "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
                              "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
                              "RS", "RO", "RR", "SC", "SP", "SE", "TO"
                            ]
                          }
                        ].map(({ field, label, type = "text", mask, col, options }, idx) => (
                          <Col md={col} key={idx} className="mb-3">
                            <Form.Group>
                              <Form.Label>
                                {label}
                                {["logradouro", "bairro", "numero", "cep", "estado", "cidade", "telefone"].includes(field) && (
                                  <span className="text-danger ms-1">*</span>
                                )}
                              </Form.Label>
                              {mask ? (
                                <IMaskInput
                                  mask={mask}
                                  name={field}
                                  value={formData[field] || ''}
                                  unmask={true}
                                  onAccept={(value) => handleMaskChange(field, value)}
                                  onInput={handleBlur(field)}
                                  onBlur={handleBlur(field)}
                                  className={`form-control ${formErrors[field] ? 'is-invalid' : ''}`}
                                  placeholder={mask.replace(/0/g, "_")}
                                />
                              ) : type === "select" ? (
                                <Form.Select
                                  name={field}
                                  value={formData[field] || ''}
                                  onChange={handleChange}
                                  isInvalid={!!formErrors[field]}
                                >
                                  <option value="">Selecione...</option>
                                  {options.map((option, i) => (
                                    <option key={i} value={option}>{option}</option>
                                  ))}
                                </Form.Select>
                              ) : (
                                <Form.Control
                                  name={field}
                                  type={type}
                                  value={formData[field] || ''}
                                  onChange={handleChange}
                                  isInvalid={!!formErrors[field]}
                                />
                              )}
                              <Form.Control.Feedback type="invalid">
                                {formErrors[field]}
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                        ))}
                      </Row>
                      <Row>
                        {[
                          { field: "telefone", label: "Telefone", mask: "(00) 00000-0000", col: 4 },
                          { field: "telefone_contato", label: "Telefone de Contato", mask: "(00) 00000-0000", col: 4 }
                        ].map(({ field, label, mask, col }, idx) => (
                          <Col md={col} key={`contact-${idx}`} className="mb-3">
                            <Form.Group>
                              <Form.Label>
                                {label}
                                {field === "telefone" && (
                                  <span className="text-danger ms-1">*</span>
                                )}
                              </Form.Label>
                              <IMaskInput
                                mask={mask}
                                name={field}
                                value={formData[field] || ''}
                                unmask={true}
                                onAccept={(value) => handleMaskChange(field, value)}
                                onInput={handleBlur(field)}
                                onBlur={handleBlur(field)}
                                className={`form-control ${formErrors[field] ? 'is-invalid' : ''}`}
                                placeholder={mask.replace(/0/g, "_")}
                              />
                              <Form.Control.Feedback type="invalid">
                                {formErrors[field]}
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                        ))}
                      </Row>
                    </Col>
                  </Row>
                </fieldset>
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <div>
            {step > 1 && (
              <Button variant="outline-secondary" onClick={prevStep}>
                ← Voltar
              </Button>
            )}
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-danger" onClick={handleClose}>
              Cancelar
            </Button>

            {!modoEdicao && step < 2 ? (
              <Button variant="primary" onClick={handleNext}>
                Próximo →
              </Button>
            ) : (
              <Button
                variant="success"
                disabled={isSubmitting}
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    if (validateAllSteps()) {
                      await onSubmit(formData);
                      handleClose();
                    }
                  } catch (error) {
                    console.error('Erro ao salvar:', error);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                {isSubmitting
                  ? 'Salvando...'
                  : modoEdicao
                    ? 'Atualizar Assistida'
                    : 'Finalizar Cadastro'}
              </Button>
            )}
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

Formulario.propTypes = {
  showModal: PropTypes.bool.isRequired,
  setShowModal: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  assistidaParaEditar: PropTypes.object,
  modoEdicao: PropTypes.bool
};

Formulario.defaultProps = {
  assistidaParaEditar: null,
  modoEdicao: false
};

export default Formulario;

