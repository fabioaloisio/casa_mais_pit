import { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import FormModal from '../common/FormModal';

const TipoDespesaFormModal = ({ show, onHide, onSave, tipoDespesa = null }) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    ativo: true
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (show) {
      if (tipoDespesa) {
        setFormData({
          nome: tipoDespesa.nome || '',
          descricao: tipoDespesa.descricao || '',
          ativo: Boolean(tipoDespesa.ativo) // Converte 1/0 para true/false
        });
      } else {
        setFormData({
          nome: '',
          descricao: '',
          ativo: true
        });
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [show, tipoDespesa]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    } else if (formData.nome.trim().length > 100) {
      newErrors.nome = 'Nome deve ter no máximo 100 caracteres';
    }

    if (formData.descricao && formData.descricao.trim().length > 500) {
      newErrors.descricao = 'Descrição deve ter no máximo 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log('TipoDespesaFormModal - handleSubmit chamado');
    console.log('FormData:', formData);
    
    if (!validateForm()) {
      console.log('Validação falhou');
      return;
    }

    setIsSubmitting(true);

    try {
      const tipoDespesaData = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim() || null,
        ativo: formData.ativo
      };

      console.log('Dados a serem enviados:', tipoDespesaData);
      await onSave(tipoDespesaData);
      console.log('onSave executado com sucesso');
    } catch (error) {
      console.error('Erro ao salvar tipo de despesa:', error);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nome: '',
      descricao: '',
      ativo: true
    });
    setErrors({});
    setIsSubmitting(false);
    onHide();
  };

  return (
    <FormModal
      show={show}
      onHide={handleClose}
      onSubmit={handleSubmit}
      title={tipoDespesa ? 'Editar Tipo de Despesa' : 'Novo Tipo de Despesa'}
      loading={isSubmitting}
      size="md"
      submitLabel={tipoDespesa ? 'Atualizar' : 'Cadastrar Tipo'}
    >
      {/* Nome */}
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>
              Nome <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              placeholder="Ex: Medicamentos, Alimentação, Limpeza..."
              isInvalid={!!errors.nome}
              maxLength={100}
            />
            <Form.Control.Feedback type="invalid">
              {errors.nome}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Nome da categoria de despesa (máx. 100 caracteres)
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      {/* Descrição */}
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>Descrição</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              placeholder="Descrição detalhada do tipo de despesa..."
              isInvalid={!!errors.descricao}
              maxLength={500}
            />
            <Form.Control.Feedback type="invalid">
              {errors.descricao}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Descrição opcional para detalhar a categoria (máx. 500 caracteres)
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      {/* Status Ativo */}
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Check
              type="checkbox"
              name="ativo"
              checked={formData.ativo}
              onChange={handleInputChange}
              label="Tipo de despesa ativo"
              id="ativo-checkbox"
            />
            <Form.Text className="text-muted">
              Tipos inativos não aparecem na lista de categorias ao cadastrar despesas
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>
    </FormModal>
  );
};

export default TipoDespesaFormModal;