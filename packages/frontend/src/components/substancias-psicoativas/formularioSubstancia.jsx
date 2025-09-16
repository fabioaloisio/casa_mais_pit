import { useState, useEffect } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import PropTypes from "prop-types";
import { ERROR_MESSAGES } from "@casa-mais/shared";
import '../../components/assistidas/Assistidas.css';

const FormularioSubstancia = ({ showModal, setShowModal, onSubmit, substanciaParaEditar, modoEdicao }) => {
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setShowModal(false);
    setFormData({});
    setFormErrors({});
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (showModal) {
      if (modoEdicao && substanciaParaEditar) {
        setFormData(substanciaParaEditar);
      } else {
        setFormData({});
      }
      setFormErrors({});
      setIsSubmitting(false);
    }
  }, [showModal, modoEdicao, substanciaParaEditar]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.nome) errors.nome = ERROR_MESSAGES.REQUIRED_FIELD;
    if (!formData.categoria) errors.categoria = ERROR_MESSAGES.REQUIRED_FIELD;
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error("Erro ao salvar substância:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={showModal} onHide={handleClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {modoEdicao ? "Editar Substância" : "Cadastro de Substância"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate>
          <Form.Group className="mb-3">
            <Form.Label>
              Nome <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="nome"
              value={formData.nome || ""}
              onChange={handleChange}
              isInvalid={!!formErrors.nome}
              placeholder="Ex: Álcool, Maconha, Cocaína"
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.nome}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Categoria <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              name="categoria"
              value={formData.categoria || ""}
              onChange={handleChange}
              isInvalid={!!formErrors.categoria}
            >
              <option value="">Selecione...</option>
              <option value="Depressor">Depressor</option>
              <option value="Estimulante">Estimulante</option>
              <option value="Perturbador">Perturbador</option>
              <option value="Outros">Outros</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {formErrors.categoria}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descrição</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="descricao"
              value={formData.descricao || ""}
              onChange={handleChange}
              placeholder="Observações adicionais..."
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          disabled={isSubmitting}
          onClick={handleSubmit}
          
        >
          {isSubmitting
            ? "Salvando..."
            : modoEdicao
            ? "Atualizar Substância"
            : "Cadastrar Substância"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

FormularioSubstancia.propTypes = {
  showModal: PropTypes.bool.isRequired,
  setShowModal: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  substanciaParaEditar: PropTypes.object,
  modoEdicao: PropTypes.bool,
};

FormularioSubstancia.defaultProps = {
  substanciaParaEditar: null,
  modoEdicao: false,
};

export default FormularioSubstancia;
