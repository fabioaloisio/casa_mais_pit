import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { FaLock, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa'
import API_CONFIG from '../config/api'
import './ActivateAccount.css'
import '../styles/auth.css'

function ActivateAccount() {
  const { token } = useParams()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [validToken, setValidToken] = useState(false)
  const [userData, setUserData] = useState(null)
  const [formData, setFormData] = useState({
    senha: '',
    confirmSenha: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Valida o token ao carregar a página
  useEffect(() => {
    validateToken()
  }, [token])
  
  const validateToken = async () => {
    try {
      const apiUrl = API_CONFIG.BASE_URL.replace('/api', '') // Remove /api do final se existir
      console.log('🔗 [FRONTEND] Validando token em:', `${apiUrl}/api/activation/validate/${token}`)

      const response = await fetch(`${apiUrl}/api/activation/validate/${token}`)

      console.log('📡 [FRONTEND] Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ [FRONTEND] Token válido, dados:', data)
        setValidToken(true)
        setUserData(data.data.usuario)
      } else {
        const error = await response.json()
        console.log('❌ [FRONTEND] Token inválido, erro:', error)
        setSubmitError(error.message || 'Token inválido ou expirado')
        setValidToken(false)
      }
    } catch (error) {
      console.error('💥 [FRONTEND] Erro ao validar token:', error)
      setSubmitError('Erro ao validar token de ativação')
      setValidToken(false)
    } finally {
      setLoading(false)
    }
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpa erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }
  
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória'
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres'
    }
    
    if (!formData.confirmSenha) {
      newErrors.confirmSenha = 'Confirmação de senha é obrigatória'
    } else if (formData.senha !== formData.confirmSenha) {
      newErrors.confirmSenha = 'As senhas não conferem'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setSubmitting(true)
    setSubmitError('')

    try {
      const apiUrl = API_CONFIG.BASE_URL.replace('/api', '')
      console.log('🔗 [FRONTEND] Ativando conta em:', `${apiUrl}/api/activation/activate/${token}`)

      const response = await fetch(`${apiUrl}/api/activation/activate/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          senha: formData.senha,
          confirmSenha: formData.confirmSenha
        })
      })

      const data = await response.json()
      console.log('📡 [FRONTEND] Response da ativação:', data)

      if (response.ok) {
        console.log('✅ [FRONTEND] Conta ativada com sucesso!')
        setSubmitSuccess(true)
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        console.log('❌ [FRONTEND] Erro ao ativar:', data)
        setSubmitError(data.message || 'Erro ao ativar conta')
      }
    } catch (error) {
      console.error('💥 [FRONTEND] Erro ao ativar conta:', error)
      setSubmitError('Erro ao conectar com o servidor')
    } finally {
      setSubmitting(false)
    }
  }
  
  const clearField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: ''
    }))
  }
  
  if (loading) {
    return (
      <Container className="activate-container">
        <Card className="activate-card">
          <Card.Body className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Validando token de ativação...</p>
          </Card.Body>
        </Card>
      </Container>
    )
  }
  
  if (!validToken) {
    return (
      <Container className="activate-container">
        <Card className="activate-card">
          <Card.Body>
            <Alert variant="danger">
              <h5>Token Inválido</h5>
              <p>{submitError || 'O link de ativação é inválido ou expirou.'}</p>
              <p>Entre em contato com o administrador para solicitar um novo link.</p>
            </Alert>
            <div className="text-center">
              <Link to="/login" className="btn btn-primary">
                Voltar ao Login
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Container>
    )
  }
  
  if (submitSuccess) {
    return (
      <Container className="activate-container">
        <Card className="activate-card">
          <Card.Body>
            <Alert variant="success">
              <FaCheck className="me-2" />
              <strong>Conta ativada com sucesso!</strong>
              <p className="mb-0 mt-2">Você será redirecionado para a página de login...</p>
            </Alert>
            <div className="text-center">
              <Link to="/login" className="btn btn-primary">
                Ir para Login
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Container>
    )
  }
  
  return (
    <Container className="activate-container">
      <Card className="activate-card">
        <Card.Body>
          <div className="text-center mb-4">
            <h2>Ativar Conta</h2>
            {userData && (
              <p className="text-muted">
                Olá <strong>{userData.nome}</strong>,<br />
                Defina sua senha para ativar sua conta.
              </p>
            )}
          </div>
          
          {submitError && (
            <Alert variant="danger" dismissible onClose={() => setSubmitError('')}>
              {submitError}
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>
                <FaLock className="me-2" />
                Nova Senha
              </Form.Label>
              <div className="input-container">
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  placeholder="Digite sua senha"
                  className={`${errors.senha ? 'input-error' : formData.senha && !errors.senha ? 'input-success' : ''}`}
                  disabled={submitting}
                />
                {formData.senha && (
                  <button
                    type="button"
                    className="clear-field-button clear-senha"
                    onClick={() => clearField('senha')}
                    disabled={submitting}
                    title="Limpar campo de senha"
                    aria-label="Limpar campo de senha"
                  >
                    ×
                  </button>
                )}
                <button
                  type="button"
                  className="password-toggle-register"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={submitting}
                  title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <FaEyeSlash className="olho_icon" role="presentation" />
                  ) : (
                    <FaEye className="olho_icon" role="presentation" />
                  )}
                </button>
              </div>
              {errors.senha && (
                <div className="field-error" role="alert" aria-live="polite">
                  {errors.senha}
                </div>
              )}
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>
                <FaLock className="me-2" />
                Confirmar Senha
              </Form.Label>
              <div className="input-container">
                <Form.Control
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmSenha"
                  value={formData.confirmSenha}
                  onChange={handleChange}
                  placeholder="Confirme sua senha"
                  className={`${errors.confirmSenha ? 'input-error' : formData.confirmSenha && !errors.confirmSenha ? 'input-success' : ''}`}
                  disabled={submitting}
                />
                {formData.confirmSenha && (
                  <button
                    type="button"
                    className="clear-field-button clear-senha"
                    onClick={() => clearField('confirmSenha')}
                    disabled={submitting}
                    title="Limpar campo de confirmação de senha"
                    aria-label="Limpar campo de confirmação de senha"
                  >
                    ×
                  </button>
                )}
                <button
                  type="button"
                  className="password-toggle-register"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={submitting}
                  title={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                  aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                  aria-pressed={showConfirmPassword}
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="olho_icon" role="presentation" />
                  ) : (
                    <FaEye className="olho_icon" role="presentation" />
                  )}
                </button>
              </div>
              {errors.confirmSenha && (
                <div className="field-error" role="alert" aria-live="polite">
                  {errors.confirmSenha}
                </div>
              )}
            </Form.Group>
            
            <div className="d-grid">
              <Button
                variant="primary"
                type="submit"
                size="lg"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      className="me-2"
                    />
                    Ativando...
                  </>
                ) : (
                  'Ativar Conta'
                )}
              </Button>
            </div>
          </Form>
          
          <div className="text-center mt-3">
            <Link to="/login" className="text-decoration-none">
              Voltar ao Login
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default ActivateAccount