import { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import FormModal from '../common/FormModal';
import useUnsavedChanges from '../common/useUnsavedChanges';

const ModalEditarUnidadeMedida = ({ unidadeMedida, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nome: '',
    sigla: ''
  });
  const [errors, setErrors] = useState({});
  const [initialData, setInitialData] = useState({});

  useEffect(() => {
    if (unidadeMedida) {
      setFormData(unidadeMedida);
      setInitialData(unidadeMedida);
      setErrors({});
    }
  }, [unidadeMedida]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'O nome da unidade de medida é obrigatório';
    }

    if (!formData.sigla.trim()) {
      newErrors.sigla = 'A sigla é obrigatória';
    } else if (formData.sigla.length > 5) {
      newErrors.sigla = 'A sigla deve ter no máximo 5 caracteres';
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    await onSave(formData);
  };

  const { hasUnsavedChanges, confirmClose } = useUnsavedChanges(initialData, formData);

  const handleClose = () => {
    confirmClose(onClose);
  };

  if (!unidadeMedida) return null;

  return (
    <FormModal
      show={true}
      onHide={handleClose}
      onSubmit={handleSubmit}
      title="Editar Unidade de Medida"
      size="md"
      submitLabel="Salvar"
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

export default ModalEditarUnidadeMedida;