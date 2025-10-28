import { useState, useEffect } from 'react'
import { Form, Row, Col, InputGroup } from 'react-bootstrap'
import { FaEye, FaEyeSlash, FaTimes } from 'react-icons/fa'
import FormModal from '../common/FormModal'
import useUnsavedChanges from '../common/useUnsavedChanges'
import ReactivationConfirmDialog from './ReactivationConfirmDialog'
import './UsuarioModal.css'

function UsuarioModal({ show, onHide, onSave, usuario, onReactivate }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmaSenha: '',
    tipo: '',
    ativo: true
  })
  const [errors, setErrors] = useState({})
  const [initialData, setInitialData] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showReactivationDialog, setShowReactivationDialog] = useState(false)
  const [inactiveUserData, setInactiveUserData] = useState(null)
  const [reactivating, setReactivating] = useState(false)
  const { hasUnsavedChanges, confirmClose } = useUnsavedChanges(initialData, formData)

  useEffect(() => {
    if (show) {
      setErrors({})
      setShowPassword(false)
      setShowConfirmPassword(false)
      if (usuario) {
        const dadosIniciais = {
          nome: usuario.nome || '',
          email: usuario.email || '',
          senha: '',
          confirmaSenha: '',
          tipo: usuario.tipo || '',
          ativo: usuario.ativo !== false
        }
        setFormData(dadosIniciais)
        setInitialData(dadosIniciais)
      } else {
        const dadosIniciais = {
          nome: '',
          email: '',
          senha: '',
          confirmaSenha: '',
          tipo: '',
          ativo: true
        }
        setFormData(dadosIniciais)
        setInitialData(dadosIniciais)
      }
    }
  }, [usuario, show])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const clearField = (fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: ''
    }))
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
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

    // Validação de senha apenas para edição (quando usuário quer alterar a senha)
    if (usuario && formData.senha) {
      if (formData.senha.length < 6) {
        newErrors.senha = 'Senha deve ter no mínimo 6 caracteres'
      }

      if (!formData.confirmaSenha.trim()) {
        newErrors.confirmaSenha = 'Confirmação de senha é obrigatória'
      } else if (formData.senha !== formData.confirmaSenha) {
        newErrors.confirmaSenha = 'As senhas não conferem'
      }
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

    // Preparar dados para envio
    const { confirmaSenha, senha, ...dataToSend } = formData

    // Incluir senha apenas se for edição e senha foi preenchida
    if (usuario && senha) {
      dataToSend.senha = senha
    }
    // Para criação de novo usuário, não incluir campo senha

    try {
      await onSave(dataToSend)
      onHide()
    } catch (error) {
      // Detectar erro 409 (usuário inativo)
      if (error.response?.status === 409 && error.response?.data?.data?.canReactivate) {
        setInactiveUserData(error.response.data.data)
        setShowReactivationDialog(true)
      } else {
        // Outros erros são propagados normalmente
        throw error
      }
    }
  }

  const handleReactivateConfirm = async () => {
    if (!inactiveUserData) return

    setReactivating(true)
    try {
      await onReactivate(inactiveUserData.inactiveUserId, {
        nome: formData.nome,
        tipo: formData.tipo
      })
      setShowReactivationDialog(false)
      onHide()
    } catch (error) {
      console.error('Erro ao reativar usuário:', error)
      setErrors({ submit: 'Erro ao reativar usuário: ' + (error.message || 'Erro desconhecido') })
    } finally {
      setReactivating(false)
    }
  }

  const handleClose = () => {
    confirmClose(onHide)
  }

  return (
    <>
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

      {usuario && (
        <>
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Senha (deixe em branco para manter a atual)</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    name="senha"
                    value={formData.senha}
                    onChange={handleInputChange}
                    placeholder="Nova senha (opcional)"
                    isInvalid={!!errors.senha}
                    style={{ paddingRight: formData.senha ? '80px' : '40px' }}
                  />
                  {formData.senha && (
                    <InputGroup.Text
                      style={{
                        position: 'absolute',
                        right: '40px',
                        zIndex: 10,
                        cursor: 'pointer',
                        border: 'none',
                        background: 'transparent'
                      }}
                      onClick={() => clearField('senha')}
                      title="Limpar campo"
                    >
                      <FaTimes />
                    </InputGroup.Text>
                  )}
                  <InputGroup.Text
                    style={{
                      position: 'absolute',
                      right: '8px',
                      zIndex: 10,
                      cursor: 'pointer',
                      border: 'none',
                      background: 'transparent'
                    }}
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </InputGroup.Text>
                  <Form.Control.Feedback type="invalid">
                    {errors.senha}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>

          {formData.senha && (
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Confirmar Senha *</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmaSenha"
                      value={formData.confirmaSenha}
                      onChange={handleInputChange}
                      placeholder="Confirme a senha"
                      isInvalid={!!errors.confirmaSenha}
                      style={{ paddingRight: formData.confirmaSenha ? '80px' : '40px' }}
                    />
                    {formData.confirmaSenha && (
                      <InputGroup.Text
                        style={{
                          position: 'absolute',
                          right: '40px',
                          zIndex: 10,
                          cursor: 'pointer',
                          border: 'none',
                          background: 'transparent'
                        }}
                        onClick={() => clearField('confirmaSenha')}
                        title="Limpar campo"
                      >
                        <FaTimes />
                      </InputGroup.Text>
                    )}
                    <InputGroup.Text
                      style={{
                        position: 'absolute',
                        right: '8px',
                        zIndex: 10,
                        cursor: 'pointer',
                        border: 'none',
                        background: 'transparent'
                      }}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      title={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </InputGroup.Text>
                    <Form.Control.Feedback type="invalid">
                      {errors.confirmaSenha}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
          )}
        </>
      )}

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
              <option value="Financeiro">Financeiro</option>
              <option value="Colaborador">Colaborador</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.tipo}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {usuario && (
        <Row className="mb-3">
          <Col md={12}>
            <Form.Group>
              <Form.Check
                type="switch"
                id="usuario-ativo"
                label={formData.ativo ? "Usuário Ativo" : "Usuário Bloqueado"}
                name="ativo"
                checked={formData.ativo}
                onChange={handleInputChange}
              />
              <Form.Text className="text-muted">
                {formData.ativo 
                  ? "O usuário pode acessar o sistema normalmente" 
                  : "O usuário está bloqueado e não pode fazer login"}
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>
      )}
    </FormModal>

    <ReactivationConfirmDialog
      show={showReactivationDialog}
      onHide={() => setShowReactivationDialog(false)}
      onConfirm={handleReactivateConfirm}
      inactiveUser={inactiveUserData}
      newUserData={formData}
      loading={reactivating}
    />
  </>
  )
}

export default UsuarioModal