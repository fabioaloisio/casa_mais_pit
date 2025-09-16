import { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import FormModal from '../common/FormModal';
import { UnidadeMedidaService } from '../../services/unidadesMedidaService.js';

const ModalCadastroMedicamento = ({ isOpen, onClose, onCadastrar }) => {
  const [formData, setFormData] = useState({
    nome: '',
    forma_farmaceutica: '',
    descricao: '',
    unidade_medida_id: ''
  });

  const [errors, setErrors] = useState({});
  const [unidadesMedida, setUnidadesMedida] = useState([]);

  useEffect(() => {
    const carregarUnidadesMedida = async () => {
      try {
        const dados = await UnidadeMedidaService.obterTodas();
        setUnidadesMedida(dados);
      } catch (error) {
        console.error('Erro ao carregar unidades de medida:', error);
      }
    };

    carregarUnidadesMedida();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <FormModal
      show={isOpen}
      onHide={onClose}
      onSubmit={() => onCadastrar(formData)}
      title="Cadastrar Medicamento"
      size="md"
      validated={Object.keys(errors).length > 0}
    >
      <Row className="mb-3">
        <Col md={12}>
          <Form.Group>
            <Form.Label>Nome do Medicamento *</Form.Label>
            <Form.Control
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              placeholder="Digite o nome do medicamento"
              isInvalid={!!errors.nome}
            />
            <Form.Control.Feedback type="invalid">{errors.nome}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Forma Farmacêutica *</Form.Label> {/* Atualizado */}
            <Form.Control
              type="text"
              name="forma_farmaceutica"
              value={formData.forma_farmaceutica}
              onChange={handleInputChange}
              placeholder="Ex: Comprimido, Xarope, etc."
              isInvalid={!!errors.forma_farmaceutica}
            />
            <Form.Control.Feedback type="invalid">{errors.forma_farmaceutica}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Descrição *</Form.Label> {/* Adicionado */}
            <Form.Control
              type="text"
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              placeholder="Descreva brevemente o medicamento"
              maxLength="250" // Limite de caracteres
              isInvalid={!!errors.descricao}
            />
            <Form.Control.Feedback type="invalid">{errors.descricao}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={12}>
          <Form.Group>
            <Form.Label>Unidade de Medida *</Form.Label>
            <Form.Control
              as="select"
              name="unidade_medida_id"
              value={formData.unidade_medida_id || ''}
              onChange={(e) => setFormData({ ...formData, unidade_medida_id: e.target.value })}
              isInvalid={!!errors.unidade_medida_id}
            >
              <option value="">Selecione...</option>
              {unidadesMedida.map((unidade) => (
                <option key={unidade.id} value={unidade.id}>
                  {unidade.nome} ({unidade.sigla})
                </option>
              ))}
            </Form.Control>

            <Form.Control.Feedback type="invalid">{errors.unidade_medida_id}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
    </FormModal>
  );
};

export default ModalCadastroMedicamento;
