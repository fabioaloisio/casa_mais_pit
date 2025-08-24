import { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import FormModal from '../common/FormModal';
import despesasService from '../../services/despesasService';
import { formatMoney } from '@casa-mais/shared';

const DespesaFormModal = ({ show, onHide, onSave, despesa = null, tiposDespesas = [] }) => {
  const [formData, setFormData] = useState({
    descricao: '',
    categoria: '', // Manter para exibição
    tipo_despesa_id: '',
    valor: '',
    data_despesa: '',
    forma_pagamento: '',
    fornecedor: '',
    observacoes: '',
    status: 'pendente'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formasPagamento = [
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'pix', label: 'PIX' },
    { value: 'cartao_debito', label: 'Cartão de Débito' },
    { value: 'cartao_credito', label: 'Cartão de Crédito' },
    { value: 'transferencia', label: 'Transferência Bancária' },
    { value: 'boleto', label: 'Boleto' },
    { value: 'cheque', label: 'Cheque' }
  ];

  const statusOptions = [
    { value: 'pendente', label: 'Pendente' },
    { value: 'paga', label: 'Paga' },
    { value: 'cancelada', label: 'Cancelada' }
  ];

  useEffect(() => {
    if (show) {
      if (despesa) {
        setFormData({
          descricao: despesa.descricao,
          categoria: despesa.categoria,
          tipo_despesa_id: despesa.tipo_despesa_id || '',
          valor: formatMoney(despesa.valor),
          data_despesa: despesa.data_despesa ? new Date(despesa.data_despesa).toISOString().split('T')[0] : '',
          forma_pagamento: despesa.forma_pagamento || '',
          fornecedor: despesa.fornecedor || '',
          observacoes: despesa.observacoes || '',
          status: despesa.status || 'pendente'
        });
      } else {
        setFormData({
          descricao: '',
          categoria: '',
          tipo_despesa_id: '',
          valor: '',
          data_despesa: new Date().toISOString().split('T')[0], // Data atual por padrão
          forma_pagamento: '',
          fornecedor: '',
          observacoes: '',
          status: 'pendente'
        });
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [show, despesa]);

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
    let value = e.target.value;
    
    // Remove tudo que não é dígito ou vírgula
    value = value.replace(/[^\d,]/g, '');
    
    // Se tem vírgula, divide em partes
    const parts = value.split(',');
    if (parts.length > 2) {
      // Se tem mais de uma vírgula, pega só as duas primeiras partes
      value = parts[0] + ',' + parts[1];
    }
    
    // Limita casas decimais a 2
    if (parts[1] && parts[1].length > 2) {
      parts[1] = parts[1].substring(0, 2);
      value = parts[0] + ',' + parts[1];
    }
    
    // Adiciona separadores de milhares na parte inteira
    if (parts[0]) {
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      value = parts.length > 1 ? parts[0] + ',' + parts[1] : parts[0];
    }
    
    // Adiciona R$ no início se há valor
    if (value) {
      value = 'R$ ' + value;
    }
    
    setFormData(prev => ({
      ...prev,
      valor: value
    }));
    
    if (errors.valor) {
      setErrors(prev => ({
        ...prev,
        valor: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    } else if (formData.descricao.trim().length < 3) {
      newErrors.descricao = 'Descrição deve ter pelo menos 3 caracteres';
    }

    if (!formData.tipo_despesa_id) {
      newErrors.categoria = 'Categoria é obrigatória';
    }

    if (!formData.valor.trim()) {
      newErrors.valor = 'Valor é obrigatório';
    } else {
      const valorNumerico = parseFloat(formData.valor.replace(/[^\d,]/g, '').replace(',', '.'));
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        newErrors.valor = 'Valor deve ser maior que zero';
      }
    }

    if (!formData.data_despesa) {
      newErrors.data_despesa = 'Data da despesa é obrigatória';
    } else {
      const hoje = new Date();
      const dataDespesa = new Date(formData.data_despesa);
      
      // Remove a parte do tempo para comparar apenas as datas
      hoje.setHours(0, 0, 0, 0);
      dataDespesa.setHours(0, 0, 0, 0);
      
      if (dataDespesa > hoje) {
        newErrors.data_despesa = 'Data da despesa não pode ser futura';
      }
    }

    if (!formData.forma_pagamento) {
      newErrors.forma_pagamento = 'Forma de pagamento é obrigatória';
    }

    if (!formData.status) {
      newErrors.status = 'Status é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Converte o valor para número
      const valorLimpo = formData.valor.replace(/[^\d,]/g, '').replace(',', '.');
      const valorNumerico = parseFloat(valorLimpo);

      const despesaData = {
        ...formData,
        valor: valorNumerico,
        tipo_despesa_id: parseInt(formData.tipo_despesa_id),
        descricao: formData.descricao.trim(),
        fornecedor: formData.fornecedor.trim(),
        observacoes: formData.observacoes.trim()
      };

      await onSave(despesaData);
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      descricao: '',
      categoria: '',
      tipo_despesa_id: '',
      valor: '',
      data_despesa: '',
      forma_pagamento: '',
      fornecedor: '',
      observacoes: '',
      status: 'pendente'
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
      title={despesa ? 'Editar Despesa' : 'Nova Despesa'}
      loading={isSubmitting}
      size="lg"
      submitLabel={despesa ? 'Atualizar' : 'Cadastrar Despesa'}
    >
      {/* Descrição e Categoria */}
      <Row className="mb-3">
        <Col md={8}>
          <Form.Group>
            <Form.Label>
              Descrição <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              placeholder="Ex: Compra de medicamentos para estoque"
              isInvalid={!!errors.descricao}
            />
            <Form.Control.Feedback type="invalid">
              {errors.descricao}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>
              Categoria <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              name="tipo_despesa_id"
              value={formData.tipo_despesa_id}
              onChange={handleInputChange}
              isInvalid={!!errors.categoria}
            >
              <option value="">Selecione...</option>
              {tiposDespesas.map(tipo => (
                <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.categoria}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Valor, Data e Status */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>
              Valor <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="valor"
              value={formData.valor}
              onChange={handleValorChange}
              placeholder="R$ 0,00"
              isInvalid={!!errors.valor}
            />
            <Form.Control.Feedback type="invalid">
              {errors.valor}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>
              Data da Despesa <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="date"
              name="data_despesa"
              value={formData.data_despesa}
              onChange={handleInputChange}
              isInvalid={!!errors.data_despesa}
            />
            <Form.Control.Feedback type="invalid">
              {errors.data_despesa}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>
              Status <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              isInvalid={!!errors.status}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.status}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Forma de Pagamento e Fornecedor */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Forma de Pagamento <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              name="forma_pagamento"
              value={formData.forma_pagamento}
              onChange={handleInputChange}
              isInvalid={!!errors.forma_pagamento}
            >
              <option value="">Selecione...</option>
              {formasPagamento.map(forma => (
                <option key={forma.value} value={forma.value}>
                  {forma.label}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.forma_pagamento}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Fornecedor</Form.Label>
            <Form.Control
              type="text"
              name="fornecedor"
              value={formData.fornecedor}
              onChange={handleInputChange}
              placeholder="Ex: Farmácia Popular"
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Observações */}
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
              placeholder="Observações adicionais sobre a despesa..."
            />
          </Form.Group>
        </Col>
      </Row>
    </FormModal>
  );
};

export default DespesaFormModal;