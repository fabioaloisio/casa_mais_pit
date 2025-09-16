import { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import FormModal from '../common/FormModal';
import doadoresService from '../../services/doadoresService';
import { validateCPF, validateCNPJ, ERROR_MESSAGES } from '@casa-mais/shared';

const DoadorFormModal = ({ show, onHide, onSave, doador = null, tipoDoador = 'PF' }) => {
  const [formData, setFormData] = useState({
    tipo_doador: 'PF',
    nome: '',
    documento: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (show) {
      if (doador) {
        setFormData({
          tipo_doador: doador.tipo_doador,
          nome: doador.nome,
          documento: doador.documento,
          email: doador.email || '',
          telefone: doador.telefone,
          endereco: doador.endereco || '',
          cidade: doador.cidade || '',
          estado: doador.estado || '',
          cep: doador.cep || ''
        });
      } else {
        setFormData({
          tipo_doador: tipoDoador,
          nome: '',
          documento: '',
          email: '',
          telefone: '',
          endereco: '',
          cidade: '',
          estado: '',
          cep: ''
        });
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [show, doador, tipoDoador]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDocumentoChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (formData.tipo_doador === 'PF') {
      // CPF: 999.999.999-99
      if (value.length > 11) {
        value = value.slice(0, 11);
      }
      if (value.length >= 9) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
      } else if (value.length >= 6) {
        value = value.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
      } else if (value.length >= 3) {
        value = value.replace(/(\d{3})(\d+)/, '$1.$2');
      }
    } else {
      // CNPJ: 99.999.999/9999-99
      if (value.length > 14) {
        value = value.slice(0, 14);
      }
      if (value.length >= 12) {
        value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d+)/, '$1.$2.$3/$4-$5');
      } else if (value.length >= 8) {
        value = value.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
      } else if (value.length >= 5) {
        value = value.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
      } else if (value.length >= 2) {
        value = value.replace(/(\d{2})(\d+)/, '$1.$2');
      }
    }
    
    setFormData(prev => ({
      ...prev,
      documento: value
    }));
    
    if (errors.documento) {
      setErrors(prev => ({
        ...prev,
        documento: ''
      }));
    }
  };

  const handleTelefoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    
    if (value.length >= 11) {
      value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (value.length >= 7) {
      if (value.length === 10) {
        value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      } else {
        value = value.replace(/(\d{2})(\d{5})(\d+)/, '($1) $2-$3');
      }
    } else if (value.length >= 3) {
      value = value.replace(/(\d{2})(\d+)/, '($1) $2');
    } else if (value.length >= 1) {
      value = value.replace(/(\d+)/, '($1');
    }
    
    setFormData(prev => ({
      ...prev,
      telefone: value
    }));
    
    if (errors.telefone) {
      setErrors(prev => ({
        ...prev,
        telefone: ''
      }));
    }
  };

  const handleCepChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 8) {
      value = value.slice(0, 8);
    }
    
    if (value.length >= 5) {
      value = value.replace(/(\d{5})(\d+)/, '$1-$2');
    }
    
    setFormData(prev => ({
      ...prev,
      cep: value
    }));
    
    if (errors.cep) {
      setErrors(prev => ({
        ...prev,
        cep: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.documento.trim()) {
      newErrors.documento = `${formData.tipo_doador === 'PF' ? 'CPF' : 'CNPJ'} é obrigatório`;
    } else {
      const documentoLimpo = formData.documento.replace(/\D/g, '');
      // Validação rigorosa usando shared package
      if (formData.tipo_doador === 'PF') {
        if (!validateCPF(documentoLimpo)) {
          newErrors.documento = ERROR_MESSAGES.INVALID_CPF;
        }
      } else if (formData.tipo_doador === 'PJ') {
        if (!validateCNPJ(documentoLimpo)) {
          newErrors.documento = ERROR_MESSAGES.INVALID_CNPJ;
        }
      }
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    setIsSubmitting(true);

    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    const dataToSave = {
      ...formData,
      documento: formData.documento.replace(/\D/g, ''),
      telefone: formData.telefone.replace(/\D/g, ''),
      cep: formData.cep.replace(/\D/g, '') || null,
      email: formData.email || null,
      endereco: formData.endereco || null,
      cidade: formData.cidade || null,
      estado: formData.estado || null
    };

    try {
      console.log('Dados enviados para salvar:', dataToSave);
      await onSave(dataToSave);
      onHide();
    } catch (error) {
      console.error('Erro ao salvar doador no modal:', error);
      if (error.message.includes('já cadastrado')) {
        setErrors({ documento: 'Documento já cadastrado' });
      } else {
        setErrors({ submit: 'Erro ao salvar doador' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const estadosBrasil = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  return (
    <FormModal
      show={show}
      onHide={onHide}
      onSubmit={handleSubmit}
      title={`${doador ? 'Editar' : 'Novo'} Doador - ${formData.tipo_doador === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}`}
      size="lg"
      loading={isSubmitting}
      submitLabel={doador ? 'Atualizar' : 'Cadastrar Doador'}
      validated={Object.keys(errors).length > 0}
    >
      {/* Nome e Documento */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              {formData.tipo_doador === 'PF' ? 'Nome Completo' : 'Razão Social'} *
            </Form.Label>
            <Form.Control
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              isInvalid={!!errors.nome}
              placeholder={formData.tipo_doador === 'PF' ? 'Nome completo' : 'Razão social da empresa'}
            />
            <Form.Control.Feedback type="invalid">
              {errors.nome}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>{formData.tipo_doador === 'PF' ? 'CPF' : 'CNPJ'} *</Form.Label>
            <Form.Control
              type="text"
              name="documento"
              value={formData.documento}
              onChange={handleDocumentoChange}
              isInvalid={!!errors.documento}
              placeholder={formData.tipo_doador === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
            />
            <Form.Control.Feedback type="invalid">
              {errors.documento}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Email e Telefone */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>E-mail</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              isInvalid={!!errors.email}
              placeholder="email@exemplo.com"
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Telefone *</Form.Label>
            <Form.Control
              type="text"
              name="telefone"
              value={formData.telefone}
              onChange={handleTelefoneChange}
              isInvalid={!!errors.telefone}
              placeholder="(00) 00000-0000"
            />
            <Form.Control.Feedback type="invalid">
              {errors.telefone}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Endereço */}
      <Row className="mb-3">
        <Col md={8}>
          <Form.Group>
            <Form.Label>Endereço</Form.Label>
            <Form.Control
              type="text"
              name="endereco"
              value={formData.endereco}
              onChange={handleInputChange}
              placeholder="Rua, Avenida, número..."
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>CEP</Form.Label>
            <Form.Control
              type="text"
              name="cep"
              value={formData.cep}
              onChange={handleCepChange}
              placeholder="00000-000"
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Cidade e Estado */}
      <Row className="mb-3">
        <Col md={8}>
          <Form.Group>
            <Form.Label>Cidade</Form.Label>
            <Form.Control
              type="text"
              name="cidade"
              value={formData.cidade}
              onChange={handleInputChange}
              placeholder="Nome da cidade"
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Estado</Form.Label>
            <Form.Select
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
            >
              <option value="">Selecione...</option>
              {estadosBrasil.map(estado => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {errors.submit && (
        <Row className="mb-3">
          <Col>
            <small className="text-danger">{errors.submit}</small>
          </Col>
        </Row>
      )}
    </FormModal>
  );
};

export default DoadorFormModal;