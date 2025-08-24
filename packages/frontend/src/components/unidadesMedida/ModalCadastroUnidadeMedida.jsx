import { useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import FormModal from '../common/FormModal';

const ModalCadastroUnidadeMedida = ({ isOpen, onClose, onCadastrar }) => {
  const [formData, setFormData] = useState({
    nome: '',
    sigla: ''
  });
  const [errors, setErrors] = useState({});

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.sigla.trim()) {
      newErrors.sigla = 'Sigla é obrigatória';
    } else if (formData.sigla.length > 5) {
      newErrors.sigla = 'Sigla deve ter no máximo 5 caracteres';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const novaUnidadeMedida = {
      id: Date.now(),
      nome: formData.nome,
      sigla: formData.sigla
    };

    await onCadastrar(novaUnidadeMedida);
    onClose();

    setFormData({
      nome: '',
      sigla: ''
    });
    setErrors({});
  };

  return (
    <FormModal
      show={isOpen}
      onHide={onClose}
      onSubmit={handleSubmit}
      title="Cadastrar Unidade de Medida"
      size="md"
      validated={Object.keys(errors).length > 0}
    >
      <Row className="mb-3">
        <Col md={12}>
          <Form.Group>
            <Form.Label>Nome da Unidade de Medida *</Form.Label>
            <Form.Control
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              placeholder="Digite o nome da unidade"
              isInvalid={!!errors.nome}
            />
            <Form.Control.Feedback type="invalid">
              {errors.nome}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={12}>
          <Form.Group>
            <Form.Label>Sigla *</Form.Label>
            <Form.Control
              type="text"
              name="sigla"
              value={formData.sigla}
              onChange={handleInputChange}
              placeholder="Ex: kg, mL, un..."
              isInvalid={!!errors.sigla}
            />
            <Form.Control.Feedback type="invalid">
              {errors.sigla}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
    </FormModal>
  );
};

export default ModalCadastroUnidadeMedida;