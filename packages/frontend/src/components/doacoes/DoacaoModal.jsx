import { useState, useEffect, useRef } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { validateDoacaoForm, parseCurrency } from '@casa-mais/shared';
import { maskCurrency } from '../../utils/dom';
import FormModal from '../common/FormModal';
import useUnsavedChanges from '../common/useUnsavedChanges';
import DoadorSelector from './DoadorSelector';
import DoadorFormModal from './DoadorFormModal';
import doadoresService from '../../services/doadoresService';

const DoacaoModal = ({ show, onHide, onSave, doacao }) => {
  const [formData, setFormData] = useState({
    valor: '',
    dataDoacao: new Date().toISOString().split('T')[0],
    observacoes: ''
  });
  const [selectedDoador, setSelectedDoador] = useState(null);
  const [tipoDoador, setTipoDoador] = useState('PF');
  const [showDoadorModal, setShowDoadorModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState({});
  const { hasUnsavedChanges, confirmClose } = useUnsavedChanges(initialData, formData);

  useEffect(() => {
    if (show) {
      // Sempre resetar o estado de submissão quando o modal abre
      setIsSubmitting(false);
      setErrors({});
      
      if (doacao) {
        const dadosIniciais = {
          valor: doacao.valor ? `R$ ${doacao.valor.toFixed(2).replace('.', ',')}` : '',
          dataDoacao: doacao.dataDoacao ? doacao.dataDoacao.split('T')[0] : new Date().toISOString().split('T')[0],
          observacoes: doacao.observacoes || ''
        };
        setFormData(dadosIniciais);
        setInitialData(dadosIniciais);
        
        // Se há dados do doador, configurar doador selecionado
        if (doacao.doador) {
          setSelectedDoador(doacao.doador);
          setTipoDoador(doacao.doador.tipo_doador || 'PF');
        }
      } else {
        const dadosIniciais = {
          valor: '',
          dataDoacao: new Date().toISOString().split('T')[0],
          observacoes: ''
        };
        setFormData(dadosIniciais);
        setInitialData(dadosIniciais);
        setSelectedDoador(null);
        setTipoDoador('PF');
      }
    } else {
      // Quando o modal fecha, resetar estados
      setIsSubmitting(false);
      setErrors({});
      setSelectedDoador(null);
      setTipoDoador('PF');
    }
  }, [doacao, show]);

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

  const handleValorChange = (e) => {
    maskCurrency(e);
    setFormData(prev => ({
      ...prev,
      valor: e.target.value
    }));
  };

  const handleDoadorSelect = (doador) => {
    if (doador === 'NEW_DOADOR') {
      setShowDoadorModal(true);
    } else {
      setSelectedDoador(doador);
      // Limpar erro de doador se houver
      if (errors.doador) {
        setErrors(prev => ({
          ...prev,
          doador: ''
        }));
      }
    }
  };

  const handleDoadorSave = async (novoDoador) => {
    try {
      const doadorCriado = await doadoresService.create(novoDoador);
      setSelectedDoador(doadorCriado);
      setShowDoadorModal(false);
    } catch (error) {
      console.error('Erro ao criar doador:', error);
      // O erro será tratado no próprio modal do doador
    }
  };

  const handleSubmit = async (e) => {
    setIsSubmitting(true);

    // Validar se doador foi selecionado
    const validationErrors = {};
    
    if (!selectedDoador) {
      validationErrors.doador = 'Selecione um doador';
    }
    
    if (!formData.valor || parseCurrency(formData.valor) <= 0) {
      validationErrors.valor = 'Valor deve ser maior que zero';
    }
    
    if (!formData.dataDoacao) {
      validationErrors.dataDoacao = 'Data da doação é obrigatória';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    const dataToSave = {
      doadorId: selectedDoador.id,
      valor: parseCurrency(formData.valor),
      dataDoacao: formData.dataDoacao,
      observacoes: formData.observacoes || null
    };

    // Chamar onSave diretamente, sem try-catch
    await onSave(dataToSave);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    confirmClose(onHide);
  };

  return (
    <>
      <FormModal
        show={show}
        onHide={handleClose}
        onSubmit={handleSubmit}
        title={doacao ? 'Editar Doação' : 'Cadastrar Doação'}
        size="lg"
        loading={isSubmitting}
        submitLabel={doacao ? 'Atualizar' : 'Cadastrar'}
        validated={Object.keys(errors).length > 0}
      >
        {/* Seleção de Doador */}
        <DoadorSelector
          selectedDoador={selectedDoador}
          onDoadorSelect={handleDoadorSelect}
          tipoDoador={tipoDoador}
          onTipoChange={setTipoDoador}
        />
        
        {errors.doador && (
          <Row className="mb-3">
            <Col>
              <small className="text-danger">{errors.doador}</small>
            </Col>
          </Row>
        )}

        {/* Dados da Doação */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Data da Doação *</Form.Label>
              <Form.Control
                type="date"
                name="dataDoacao"
                value={formData.dataDoacao}
                onChange={handleInputChange}
                isInvalid={!!errors.dataDoacao}
                max={new Date().toISOString().split('T')[0]}
              />
              <Form.Control.Feedback type="invalid">
                {errors.dataDoacao}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Valor da Doação *</Form.Label>
              <Form.Control
                type="text"
                name="valor"
                value={formData.valor}
                onChange={handleValorChange}
                isInvalid={!!errors.valor}
                placeholder="R$ 0,00"
              />
              <Form.Control.Feedback type="invalid">
                {errors.valor}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Observações</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
                placeholder="Observações adicionais..."
              />
            </Form.Group>
          </Col>
        </Row>
      </FormModal>
      
      {/* Modal para cadastro de novo doador */}
      <DoadorFormModal
        show={showDoadorModal}
        onHide={() => setShowDoadorModal(false)}
        onSave={handleDoadorSave}
        tipoDoador={tipoDoador}
      />
    </>
  );
};

export default DoacaoModal;