import { useState, useEffect } from 'react'
import { Form, Row, Col } from 'react-bootstrap'
import FormModal from '../common/FormModal'
import useUnsavedChanges from '../common/useUnsavedChanges'

function UsuarioModal({ show, onHide, onSave, usuario }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    tipo: ''
  })
  const [errors, setErrors] = useState({})
  const [initialData, setInitialData] = useState({})
  const { hasUnsavedChanges, confirmClose } = useUnsavedChanges(initialData, formData)

  useEffect(() => {
    if (show) {
      setErrors({})
      if (usuario) {
        const dadosIniciais = {
          nome: usuario.nome || '',
          email: usuario.email || '',
          senha: '',
          tipo: usuario.tipo || ''
        }
        setFormData(dadosIniciais)
        setInitialData(dadosIniciais)
      } else {
        const dadosIniciais = {
          nome: '',
          email: '',
          senha: '',
          tipo: ''
        }
        setFormData(dadosIniciais)
        setInitialData(dadosIniciais)
      }
    }
  }, [usuario, show])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido'
    }
    
    if (!usuario && !formData.senha.trim()) {
      newErrors.senha = 'Senha é obrigatória para novo usuário'
    } else if (formData.senha && formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter no mínimo 6 caracteres'
    }
    
    if (!formData.tipo) {
      newErrors.tipo = 'Tipo de usuário é obrigatório'
    }
    
    return newErrors
  }

  const handleSubmit = async (e) => {
    const validationErrors = validateForm()
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    await onSave(formData)
    onHide()
  }

  const handleClose = () => {
    confirmClose(onHide)
  }

  return (
    <FormModal
      show={show}
      onHide={handleClose}
      onSubmit={handleSubmit}
      title={usuario ? 'Editar Usuário' : 'Cadastro de Usuário'}
      size="md"
      submitLabel={usuario ? 'Atualizar' : 'Cadastrar'}
      validated={Object.keys(errors).length > 0}
    >
      <Row className="mb-3">
        <Col md={12}>
          <Form.Group>
            <Form.Label>Nome Completo *</Form.Label>
            <Form.Control
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              placeholder="Digite o nome completo"
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
            <Form.Label>E-mail *</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="exemplo@email.com"
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={12}>
          <Form.Group>
            <Form.Label>Senha {usuario ? '(deixe em branco para manter a atual)' : '*'}</Form.Label>
            <Form.Control
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleInputChange}
              placeholder={usuario ? 'Nova senha (opcional)' : 'Digite a senha'}
              isInvalid={!!errors.senha}
            />
            <Form.Control.Feedback type="invalid">
              {errors.senha}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={12}>
          <Form.Group>
            <Form.Label>Tipo de Usuário *</Form.Label>
            <Form.Select
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}
              isInvalid={!!errors.tipo}
            >
              <option value="">Selecione o tipo</option>
              <option value="Administrador">Administrador</option>
              <option value="Operador">Operador</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.tipo}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
    </FormModal>
  )
}

export default UsuarioModal