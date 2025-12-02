import { useState, useEffect, useMemo } from "react";
import { Button, Col, Form, Modal, Row, Table, Alert, ProgressBar } from "react-bootstrap";
import { IMaskInput } from "react-imask";
import PropTypes from 'prop-types';
import { FaUser, FaHome, FaMedkit, FaHeartbeat, FaCheck, FaExclamationTriangle, FaTrash, FaBan } from 'react-icons/fa';
import { data, useParams } from "react-router-dom";
import { formatDataForInput } from "@casa-mais/shared";


const FormularioHRP = ({ showModal, setShowModal, onSubmit, HPRParaEditar, modoEdicao, listaAssistidas = [] }) => {
  const { id } = useParams();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 'assistida_id': parseInt(id) });
  const [formErrors, setFormErrors] = useState({});
  const [initialData, setInitialData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [substancias, setSubstancias] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);


  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);


  // Função para normalizar dados do formulário (apenas campos relevantes)
  const normalizeFormData = (data) => {
    const formFields = [
      'data_atendimento', 'hora', 'historia_patologica', 'usuaria_drogas',
      'quantidade_drogas', 'tempo_sem_uso', 'uso_medicamentos', 'quantidade_medicamentos',
      'internada', 'quantidade_internacoes', 'motivacao_internacoes',
      'fatos_marcantes', 'infancia', 'adolescencia'
    ];

    const normalized = {};


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
    // Adicionar campos dinâmicos de internações
    if (data.quantidade_internacoes) {
      const qtd = parseInt(data.quantidade_internacoes) || 0;
      for (let i = 1; i <= qtd; i++) {
        ['local', 'duracao', 'data'].forEach(campo => {
          const fieldName = `${campo}${i}`;
          normalized[fieldName] = data[fieldName] || '';
        });
      }
    }

    // Adicionar campos dinâmicos de medicamentos
    if (data.quantidade_medicamentos) {
      const qtd = parseInt(data.quantidade_medicamentos) || 0;
      for (let i = 1; i <= qtd; i++) {
        ['nome', 'dosagem', 'frequencia'].forEach(campo => {
          const fieldName = `medicamento${i}_${campo}`;
          normalized[fieldName] = data[fieldName] || '';
        });
      }
    }

    return normalized;
  };

  const handleClose = () => {
    setShowModal(false);
  };


  useEffect(() => {
    if (showModal) {
      setIsSubmitting(false);
      setFormErrors({});
      setStep(1);
      setCompletedSteps([]);

      if (modoEdicao && HPRParaEditar) {
        const dadosFormatados = {
          ...HPRParaEditar,
          id: HPRParaEditar.id,
          data_atendimento: formatDataForInput(HPRParaEditar.data_atendimento),
        };

        // DROGAS
        const drogas = HPRParaEditar.drogas || [];

        // console.log(drogas[0])

        if (drogas.length > 0) {
          dadosFormatados.usuaria_drogas = "sim";
          dadosFormatados.quantidade_drogas = drogas.length;
          drogas.forEach((droga, i) => {
            const idx = i + 1;
            dadosFormatados[`droga${idx}_tipo`] = droga.tipo;
            dadosFormatados[`droga${idx}_idade`] = droga.idade_inicio?.toString() || '';
            dadosFormatados[`droga${idx}_tempo`] = droga.tempo_uso;
            dadosFormatados[`droga${idx}_intensidade`] = droga.intensidade;
          });
        } else {
          dadosFormatados.usuaria_drogas = "nao";
          dadosFormatados.quantidade_drogas = 0;
        }

        // MEDICAMENTOS
        const medicamentos = HPRParaEditar.medicamentos || [];
        if (medicamentos.length > 0) {
          dadosFormatados.uso_medicamentos = "sim";
          dadosFormatados.quantidade_medicamentos = medicamentos.length;
          medicamentos.forEach((med, i) => {
            const idx = i + 1;
            dadosFormatados[`medicamento${idx}_nome`] = med.nome;
            dadosFormatados[`medicamento${idx}_dosagem`] = med.dosagem;
            dadosFormatados[`medicamento${idx}_frequencia`] = med.frequencia;
          });
        } else {
          dadosFormatados.uso_medicamentos = "nao";
          dadosFormatados.quantidade_medicamentos = 0;
        }

        // INTERNAÇÕES
        const internacoes = HPRParaEditar.internacoes || [];
        if (internacoes.length > 0) {
          dadosFormatados.internada = "sim";
          dadosFormatados.quantidade_internacoes = internacoes.length;
          internacoes.forEach((internacao, i) => {
            const idx = i + 1;
            dadosFormatados[`local${idx}`] = internacao.local;
            dadosFormatados[`duracao${idx}`] = internacao.duracao;
            dadosFormatados[`data${idx}`] = formatDataForInput(internacao.data);
          });
        } else {
          dadosFormatados.internada = "nao";
          dadosFormatados.quantidade_internacoes = 0;
        }

        // Agora sim: setar tudo junto
        setFormData(dadosFormatados);

        const dadosNormalizados = normalizeFormData(dadosFormatados);
        setInitialData(dadosNormalizados);

        setTimeout(() => setHasLoadedInitialData(true), 100);
      }

    } else {
      setIsSubmitting(false);
      setFormErrors({});
      setStep(1);
      setCompletedSteps([]);
    }
  }, [modoEdicao, HPRParaEditar, showModal]);

  // Limpar formulário quando fechar o modal
  useEffect(() => {
    if (!showModal) {
      setStep(1);
      setFormErrors({});
      setCompletedSteps([]);
    }
  }, [showModal, modoEdicao]);

  //Busca as substâncias do backend
  useEffect(() => {
    if (showModal) {
      fetch('http://localhost:3003/api/substancias')
        .then(res => res.json())
        .then(data => setSubstancias(data)

        )
        .catch(err => console.error('Erro ao buscar substâncias:', err));
    }
  }, [showModal]);

  //Busca medicamentos do backend
  useEffect(() => {
    if (showModal) {
      fetch('http://localhost:3003/api/medicamentos')
        .then(res => res.json())
        .then(data => setMedicamentos(data))
        .catch(err => console.error('Erro ao buscar medicamentos:', err));
    }
  }, [showModal]);


  const handleChange = (e) => {
    const { name, value } = e.target;

    // Atualiza o valor do form
    setFormData(prev => ({ ...prev, [name]: value }));

    // Limpa o erro do campo
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };


  const handleMaskChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const validateStep = () => {
    const errors = {};
    if (step === 1) {
      // Step 1 - Histórico Médico
      const camposObrigatorios = ["data_atendimento", "hora", "historia_patologica", "usuaria_drogas", "uso_medicamentos"];
      camposObrigatorios.forEach(field => {
        if (!formData[field] || formData[field].trim() === '') {
          errors[field] = "Campo obrigatório";
        }
      });

      // Se usuária de drogas
      if (formData.usuaria_drogas === "sim") {
        if (!formData.quantidade_drogas || parseInt(formData.quantidade_drogas) < 1) {
          errors["quantidade_drogas"] = "Informe a quantidade";
        } else {
          const qtd = parseInt(formData.quantidade_drogas);
          for (let i = 1; i <= qtd; i++) {
            ["tipo", "idade", "tempo", "intensidade"].forEach(campo => {
              const fieldName = `droga${i}_${campo}`;
              if (!formData[fieldName] || formData[fieldName].toString().trim() === '') {
                errors[fieldName] = "Campo obrigatório";
              }
            });
          }
        }
        if (!formData.tempo_sem_uso || formData.tempo_sem_uso.trim() === '') {
          errors["tempo_sem_uso"] = "Campo obrigatório";
        }
      }

      // Se usa medicamentos
      if (formData.uso_medicamentos === "sim") {
        if (!formData.quantidade_medicamentos || parseInt(formData.quantidade_medicamentos) < 1) {
          errors["quantidade_medicamentos"] = "Informe a quantidade de medicamentos";
        } else {
          const qtd = parseInt(formData.quantidade_medicamentos);
          for (let i = 1; i <= qtd; i++) {
            ["nome", "dosagem", "frequencia"].forEach(campo => {
              const fieldName = `medicamento${i}_${campo}`;
              if (!formData[fieldName] || formData[fieldName].toString().trim() === '') {
                errors[fieldName] = "Campo obrigatório";
              }
            });
          }
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0; // Retorna true se não houver erros
  };


  const handleBlur = (field) => () => {
    const valor = formData[field];

    // Lógica específica para o CPF
    if (field === 'cpf') {
      const cpf = valor?.replace(/\D/g, '');

      const cpfDuplicado = listaAssistidas.some(assistida =>
        assistida.cpf.replace(/\D/g, '') === cpf &&
        (!modoEdicao || assistida.id !== HPRParaEditar?.id)
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
    let firstErrorStep = null;

    // Step 1 - Histórico Médico
    const step1Fields = ["data_atendimento", "hora", "historia_patologica", "usuaria_drogas", "uso_medicamentos"];
    step1Fields.forEach((field) => {
      if (!formData[field] || formData[field].trim() === "") {
        errors[field] = "Campo obrigatório";
        if (!firstErrorStep) firstErrorStep = 1;
      }
    });

    // Step 1 - Validação de drogas
    if (formData.usuaria_drogas === "sim") {
      if (!formData.quantidade_drogas || parseInt(formData.quantidade_drogas) < 1) {
        errors["quantidade_drogas"] = "Informe a quantidade";
        if (!firstErrorStep) firstErrorStep = 1;
      } else {
        const qtd = parseInt(formData.quantidade_drogas, 10);
        for (let i = 1; i <= qtd; i++) {
          ["tipo", "idade", "tempo", "intensidade"].forEach((campo) => {
            const fieldName = `droga${i}_${campo}`;
            if (!formData[fieldName] || formData[fieldName].trim() === "") {
              errors[fieldName] = "Campo obrigatório";
              if (!firstErrorStep) firstErrorStep = 1;
            }
          });
        }
      }

      if (!formData.tempo_sem_uso || formData.tempo_sem_uso.trim() === "") {
        errors["tempo_sem_uso"] = "Campo obrigatório";
        if (!firstErrorStep) firstErrorStep = 1;
      }
    }

    // Step 1 - Validação de medicamentos
    if (formData.uso_medicamentos === "sim") {
      if (!formData.quantidade_medicamentos || parseInt(formData.quantidade_medicamentos) < 1) {
        errors["quantidade_medicamentos"] = "Informe a quantidade de medicamentos";
        if (!firstErrorStep) firstErrorStep = 1;
      } else {
        const qtd = parseInt(formData.quantidade_medicamentos, 10);
        for (let i = 1; i <= qtd; i++) {
          ["nome", "dosagem", "frequencia"].forEach((campo) => {
            const fieldName = `medicamento${i}_${campo}`;
            if (!formData[fieldName] || formData[fieldName].trim() === "") {
              errors[fieldName] = "Campo obrigatório";
              if (!firstErrorStep) firstErrorStep = 1;
            }
          });
        }
      } []
    }
    // Campos de História de Vida )
    const camposObrigatorios = ['internada'];
    camposObrigatorios.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        errors[field] = "Campo obrigatório";
      }
    });
    // Step 2 - Internações e Vida Pessoal
    if (!formData.internada || formData.internada.trim() === '') {
      errors["internada"] = "Campo obrigatório";
    }

    if (formData.internada === "sim") {
      if (!formData.quantidade_internacoes || parseInt(formData.quantidade_internacoes) < 1) {
        errors["quantidade_internacoes"] = "Informe a quantidade de internações";
      } else {
        const qtd = parseInt(formData.quantidade_internacoes);
        for (let i = 1; i <= qtd; i++) {
          ["local", "duracao", "data"].forEach(campo => {
            const fieldName = `${campo}${i}`;
            if (!formData[fieldName] || formData[fieldName].toString().trim() === '') {
              errors[fieldName] = "Campo obrigatório";
            }
          });
        }
      }
      if (!formData.motivacao_internacoes || formData.motivacao_internacoes.trim() === '') {
        errors["motivacao_internacoes"] = "Campo obrigatório";
      }

    }

    setFormErrors(errors);

    if (firstErrorStep) setStep(firstErrorStep);

    return Object.keys(errors).length === 0;

  };


  const campos = [
    "fatos_marcantes",
    "infancia",
    "adolescencia"
  ];

  const formatarFormDataParaEnvio = (data) => {
    const assistida = { ...data };

    assistida.motivacao_internacoes = data.motivacao_internacoes
    assistida.tempo_sem_uso = data.tempo_sem_uso


    // Transformar drogas
    if (data.usuaria_drogas === "sim" && parseInt(data.quantidade_drogas) > 0) {
      assistida.drogas = Array.from({ length: parseInt(data.quantidade_drogas) }, (_, i) => {
        const index = i + 1;
        return {
          assistida_id: parseInt(id),
          tipo: data[`droga${index}_tipo`] || '',
          idade_inicio: data[`droga${index}_idade`] || '',
          tempo_uso: data[`droga${index}_tempo`] || '',
          intensidade: data[`droga${index}_intensidade`] || '',
        };
      });
    } else {
      assistida.drogas = [];
    }

    // Transformar medicamentos
    if (data.uso_medicamentos === "sim" && parseInt(data.quantidade_medicamentos) > 0) {
      assistida.medicamentos = Array.from({ length: parseInt(data.quantidade_medicamentos) }, (_, i) => {
        const index = i + 1;
        return {
          nome: data[`medicamento${index}_nome`] || '',
          dosagem: data[`medicamento${index}_dosagem`] || '',
          frequencia: data[`medicamento${index}_frequencia`] || '',
        };
      });
    } else {
      assistida.medicamentos = [];
    }

    // Transformar internações
    if (data.internada === "sim" && parseInt(data.quantidade_internacoes) > 0) {
      assistida.internacoes = Array.from({ length: parseInt(data.quantidade_internacoes) }, (_, i) => {
        const index = i + 1;
        return {
          local: data[`local${index}`] || '',
          duracao: data[`duracao${index}`] || '',
          data: data[`data${index}`] || '',
        };
      });
    } else {
      assistida.internacoes = [];
    }

    // Remover campos temporários dinâmicos
    const camposDinamicos = Object.keys(assistida).filter(k =>
      k.match(/^droga\d+_/) ||
      k.match(/^medicamento\d+_/) ||
      k.match(/^(local|duracao|data)\d+$/)
    );
    for (const campo of camposDinamicos) {
      delete assistida[campo];
    }

    // Remover contadores auxiliares
    delete assistida.quantidade_drogas;
    delete assistida.quantidade_medicamentos;
    delete assistida.quantidade_internacoes;

    return assistida;
  };

  return (
    <>
      <Modal
        show={showModal}
        onHide={() => { setShowConfirmCancel(true); }}
        size="xl"
        centered
        backdrop={true}
        keyboard={true}
      >

        <Modal.Header closeButton>
          <Modal.Title>
            {modoEdicao ? 'Edição de História Patológica Regressa' : 'Registrar História Patológica Regressa'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>

          <div className="step-indicator mb-4">
            {!modoEdicao && (
              <ProgressBar className="mb-3" style={{ height: '6px' }}>
                <ProgressBar
                  variant="success"
                  now={(completedSteps.length / 2) * 100}
                  animated
                />
              </ProgressBar>
            )}
            <div className="d-flex justify-content-around">
              {[
                { label: "Histórico Médico", icon: FaMedkit },
                { label: "Internações e Vida Pessoal", icon: FaHeartbeat },
              ].map(({ label, icon: Icon }, index) => (
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
                      <Icon />
                    )}
                  </div>

                  <span className="step-label">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <Form noValidate>
            {step === 1 && (
              <div className="w-100">
                {/* Header do Step 1 */}
                <div className="bg-primary p-3 rounded-top">
                  <h4 className="mb-0 text-center" style={{ color: 'white' }}>Histórico Médico </h4>
                </div>

                <fieldset className="field d-flex justify-content-center rounded-bottom border-top-0">
                  <Row className="w-100">
                    <Col md={12} className="mb-3">
                      <Alert variant="info" className="d-flex align-items-center">
                        <FaExclamationTriangle className="me-2" />
                        <small>
                          {modoEdicao
                            ? 'Alterar a Data do Último Atentendimento registrará uma nova atualização na história patológica regressa, preservando os registros anteriores.'
                            : 'Preencha com atenção os dados médicos e histórico de uso de substâncias.'}
                        </small>

                      </Alert>
                    </Col>
                    {[{ name: "data_atendimento", label: "Data do Último Atendimento", type: "date" },
                    { name: "hora", label: "Hora", type: "time" },
                    { name: "historia_patologica", label: "História Patológica", as: "textarea", placeholder: "Descreva o histórico médico e condições de saúde..." }
                    ].map(({ name, label, type = "text", as, placeholder }, idx) => (
                      <Col md={name === "historia_patologica" ? 6 : 3} key={idx} className="mb-3">
                        <Form.Group>
                          <Form.Label>
                            {label}
                            <span className="text-danger ms-1">*</span>
                          </Form.Label>
                          <Form.Control
                            name={name}
                            type={type}
                            as={as}
                            rows={as ? 4 : undefined}
                            placeholder={placeholder}
                            value={formData[name] || ''}
                            onChange={handleChange}
                            isInvalid={!!formErrors[name]}
                          />
                          <Form.Control.Feedback type="invalid">
                            {formErrors[name]}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    ))}

                    {/* Usuária de drogas */}
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>
                          Usuária de drogas?
                          <span className="text-danger ms-1">*</span>
                        </Form.Label>
                        <Form.Select
                          name="usuaria_drogas"
                          value={formData.usuaria_drogas || 'não'}
                          onChange={handleChange}
                          isInvalid={!!formErrors["usuaria_drogas"]}
                        >
                          <option value="">Selecione...</option>
                          <option value="nao">Não</option>
                          <option value="sim">Sim</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {formErrors["usuaria_drogas"]}
                        </Form.Control.Feedback>
                      </Form.Group>

                    </Col>

                    {/* Campos adicionais para usuária de drogas */}
                    {formData.usuaria_drogas === "sim" && (
                      <>
                        <Form.Group as={Col} md={3}>
                          <Form.Label>Quantas Substâncias?
                            <span className="text-danger ms-1">*</span>
                          </Form.Label>
                          <Form.Control
                            type="number"
                            min="1"
                            max="10"
                            name="quantidade_drogas"
                            value={formData.quantidade_drogas || ''}
                            onChange={handleChange}
                            isInvalid={!!formErrors["quantidade_drogas"]} // <- isso ativa o erro visual
                          />
                          <Form.Control.Feedback type="invalid">
                            {formErrors["quantidade_drogas"]}
                          </Form.Control.Feedback>
                        </Form.Group>

                        <Col md={3}>
                          <Form.Group>
                            <Form.Label>Quanto tempo sem uso <span className="text-danger ms-1">*</span></Form.Label>
                            <Form.Control
                              name="tempo_sem_uso"
                              value={formData.tempo_sem_uso || ''}
                              onChange={handleChange}
                              isInvalid={!!formErrors["tempo_sem_uso"]}
                            />
                            <Form.Control.Feedback type="invalid">
                              {formErrors["tempo_sem_uso"]}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>

                        <Col md={12}>
                          {formData.quantidade_drogas > 0 && (
                            <div className="mt-4">
                              <h5 className="mb-3">
                                Histórico de Uso de Substâncias <span className="text-danger ms-1">*</span>
                              </h5>
                              <Table bordered hover responsive>
                                <thead className="table-light">
                                  <tr>
                                    <th>Tipo</th>
                                    <th>Idade Início</th>
                                    <th>Tempo de Uso</th>
                                    <th>Intensidade</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Array.from({ length: parseInt(formData.quantidade_drogas) || 0 }, (_, i) => i + 1).map((i) => (
                                    <tr key={i}>
                                      {["tipo", "idade", "tempo", "intensidade"].map((campo) => {
                                        const fieldName = `droga${i}_${campo}`;
                                        const isNumberField = campo === "idade";

                                        return (
                                          <td key={campo}>
                                            {campo === "tipo" ? (
                                              <Form.Select
                                                name={fieldName}
                                                value={formData[fieldName] || ''}
                                                onChange={handleChange}
                                                isInvalid={!!formErrors[fieldName]}
                                              >
                                                <option value="">Selecione...</option>
                                                {(substancias?.data || []).map((s) => (
                                                  <option key={s.id} value={s.nome}>
                                                    {s.nome}
                                                  </option>
                                                ))}

                                              </Form.Select>
                                            ) : (
                                              <Form.Control
                                                name={fieldName}
                                                type={isNumberField ? "number" : "text"}
                                                value={formData[fieldName] || ''}
                                                onChange={handleChange}
                                                isInvalid={!!formErrors[fieldName]}
                                              />
                                            )}
                                            <Form.Control.Feedback type="invalid">
                                              {formErrors[fieldName]}
                                            </Form.Control.Feedback>
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </div>
                          )}
                        </Col>

                      </>
                    )}

                    {/* Usa medicamentos */}
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>
                          Usa medicamentos?
                          <span className="text-danger ms-1">*</span>
                        </Form.Label>
                        <Form.Select
                          name="uso_medicamentos"
                          value={formData.uso_medicamentos || 'não'}
                          isInvalid={!!formErrors["uso_medicamentos"]}
                          onChange={handleChange}
                        >
                          <option value="">Selecione...</option>
                          <option value="nao">Não</option>
                          <option value="sim">Sim</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {formErrors["uso_medicamentos"]}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    {formData.uso_medicamentos === "sim" && (
                      <>
                        <Col md={3}>
                          <Form.Group>
                            <Form.Label>Quantos medicamentos?<span className="text-danger ms-1">*</span></Form.Label>
                            <Form.Control
                              type="number"
                              min="1"
                              max="10"
                              name="quantidade_medicamentos"
                              value={formData.quantidade_medicamentos || ''}
                              onChange={handleChange}
                              isInvalid={!!formErrors["quantidade_medicamentos"]}
                            />
                            <Form.Control.Feedback type="invalid">
                              {formErrors["quantidade_medicamentos"]}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>

                        <Col md={12}>
                          {formData.quantidade_medicamentos > 0 && (
                            <div className="mt-4">
                              <h5 className="mb-3">Lista de Medicamentos em Uso <span className="text-danger ms-1">*</span></h5>
                              <Table bordered hover responsive>
                                <thead className="table-light">
                                  <tr>
                                    <th style={{ width: '50%' }}>Nome do Medicamento</th>
                                    <th style={{ width: '25%' }}>Dosagem</th>
                                    <th style={{ width: '25%' }}>Frequência</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Array.from({ length: parseInt(formData.quantidade_medicamentos) || 0 }, (_, i) => i + 1).map((i) => (
                                    <tr key={i}>
                                      {["nome", "dosagem", "frequencia"].map((campo) => {
                                        const fieldName = `medicamento${i}_${campo}`;

                                        return (
                                          <td key={campo}>
                                            {campo === "nome" ? (
                                              <Form.Select
                                                name={fieldName}
                                                value={formData[fieldName] || ''}
                                                onChange={handleChange}
                                                isInvalid={!!formErrors[fieldName]}
                                              >
                                                <option value="">Selecione...</option>
                                                {(medicamentos?.data || []).map((m) => (
                                                  <option key={m.id} value={m.nome}>
                                                    {m.nome}
                                                  </option>
                                                ))}

                                              </Form.Select>
                                            ) : (
                                              <Form.Control
                                                name={fieldName}
                                                value={formData[fieldName] || ''}
                                                onChange={handleChange}
                                                isInvalid={!!formErrors[fieldName]}
                                                placeholder={
                                                  campo === "dosagem" ? "Ex: 500mg" : "Ex: 2x ao dia"
                                                }
                                              />
                                            )}
                                            <Form.Control.Feedback type="invalid">
                                              {formErrors[fieldName]}
                                            </Form.Control.Feedback>
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  ))}
                                </tbody>

                              </Table>
                            </div>
                          )}
                        </Col>
                      </>
                    )}
                  </Row>
                </fieldset>
              </div>
            )}

            {step === 2 && (
              <div className="w-100">
                {/* Header do Step 2 */}
                <div className="bg-primary p-3 rounded-top">
                  <h4 className="mb-0 text-center" style={{ color: 'white' }}>Internações Anteriores e Vida Pessoal</h4>
                </div>

                <fieldset className="field rounded-bottom border-top-0 p-4">
                  <Row className="w-100">
                    <Col md={12}>
                      {/* Seção de Internações - Perguntas iniciais */}
                      <Row className="mb-3">
                        <Col md={3}>
                          <Form.Group>
                            <Form.Label>Já esteve internada?<span className="text-danger ms-1">*</span></Form.Label>
                            <Form.Select
                              name="internada"
                              value={formData.internada || 'não'}
                              onChange={handleChange}
                              isInvalid={!!formErrors['internada']}
                            >
                              <option value="">Selecione...</option>
                              <option value="nao">Não</option>
                              <option value="sim">Sim</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                              {formErrors['internada']}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        {formData.internada === "sim" && (
                          <Col md={3}>
                            <Form.Group>
                              <Form.Label>Quantas vezes?<span className="text-danger ms-1">*</span></Form.Label>
                              <Form.Control
                                type="number"
                                name="quantidade_internacoes"
                                value={formData.quantidade_internacoes || ''}
                                onChange={handleChange}

                                isInvalid={!!formErrors['quantidade_internacoes']}
                              />
                              <Form.Control.Feedback type="invalid">
                                {formErrors['quantidade_internacoes']}
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                        )}
                      </Row>

                      {/* Detalhes das Internações */}
                      {formData.internada === "sim" && formData.quantidade_internacoes > 0 && (
                        <div className="border rounded p-4 bg-light">
                          <h5 className="mb-3">Detalhes das Internações<span className="text-danger ms-1">*</span></h5>
                          <Table bordered hover responsive className="mb-4">
                            <thead className="table-light">
                              <tr>
                                <th style={{ width: '50%' }}>Local</th>
                                <th style={{ width: '25%' }}>Duração</th>
                                <th style={{ width: '25%' }}>Data</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Array.from({ length: parseInt(formData.quantidade_internacoes) || 0 }, (_, i) => i + 1).map((i) => (
                                <tr key={i}>
                                  {["local", "duracao", "data"].map((campo) => {
                                    const fieldName = `${campo}${i}`;
                                    return (
                                      <td key={campo}>
                                        <Form.Control
                                          name={fieldName}
                                          type={campo === "data" ? "date" : "text"}
                                          value={formData[fieldName] || ''}
                                          onChange={handleChange}
                                          isInvalid={!!formErrors[fieldName]}
                                          placeholder={
                                            campo === "local" ? "Nome do hospital/clínica" :
                                              campo === "duracao" ? "Ex: 3 meses" :
                                                ""
                                          }
                                        />
                                        <Form.Control.Feedback type="invalid">
                                          {formErrors[fieldName]}
                                        </Form.Control.Feedback>
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                          {formData.internada === "sim" && (
                            <Form.Group>
                              <Form.Label className="fw-bold">Motivação das Internações<span className="text-danger ms-1">*</span></Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={5}
                                name="motivacao_internacoes"
                                value={formData.motivacao_internacoes || ''}
                                onChange={handleChange}
                                placeholder="Descreva detalhadamente os motivos que levaram às internações..."
                                style={{ resize: 'vertical' }}
                                isInvalid={!!formErrors['motivacao_internacoes']}
                              />
                              <Form.Control.Feedback type="invalid">
                                {formErrors['motivacao_internacoes']}
                              </Form.Control.Feedback>
                            </Form.Group>
                          )}
                        </div>
                      )}
                    </Col>
                  </Row>

                  {/* Seção de Vida Pessoal */}
                  <Row className="w-100">
                    <Col md={12}>
                      <h5 className="mb-3">História de Vida</h5>
                    </Col>
                    {campos.map((campo, idx) => (
                      <Col md={6} key={idx}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">
                            {campo === 'fatos_marcantes' ? 'Fatos Marcantes' :
                              campo === 'infancia' ? 'Infância' :
                                campo === 'adolescencia' ? 'Adolescência' :
                                  campo.replace(/_/g, " ").toUpperCase()}
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={6}
                            name={campo}
                            value={formData[campo] || ''}
                            onChange={handleChange}
                            placeholder={campo === 'fatos_marcantes' ? 'Descreva eventos importantes e marcantes na vida da assistida...(opcional)' :
                              campo === 'infancia' ? 'Relate informações sobre a infância...(opcional)' :
                                campo === 'adolescencia' ? 'Descreva o período da adolescência...(opcional)' : ''}
                            style={{ minHeight: '120px', resize: 'vertical' }}
                          />
                        </Form.Group>
                      </Col>
                    ))}
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
            <Button variant="outline-danger" onClick={() => {

              setShowConfirmCancel(true);

            }}>
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
                      const dadosProntos = formatarFormDataParaEnvio(formData);
                      await onSubmit(dadosProntos);
                      setShowModal(false);
                      setStep(1);
                      setFormErrors({});
                      setCompletedSteps([]);
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
                    ? 'Editar HPR'
                    : 'Finalizar Registro'}
              </Button>
            )}

          </div>
        </Modal.Footer>
      </Modal>

      <Modal show={showConfirmCancel} onHide={() => setShowConfirmCancel(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar saída</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Você tem certeza que deseja sair? Todos os dados não {modoEdicao ? 'atualizados' : 'salvos'} serão perdidos.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmCancel(false)}>
            <FaBan />
            Cancelar
          </Button>
          <Button variant="danger" onClick={() => {
            setShowConfirmCancel(false);
            handleClose(); // função que fecha o modal principal
          }}>
            <FaTrash />
            Sim, sair
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

FormularioHRP.propTypes = {
  showModal: PropTypes.bool.isRequired,
  setShowModal: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  HPRParaEditar: PropTypes.object,
  modoEdicao: PropTypes.bool
};

FormularioHRP.defaultProps = {
  HPRParaEditar: null,
  modoEdicao: false
};

export default FormularioHRP;
