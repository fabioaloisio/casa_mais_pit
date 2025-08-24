import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    novaSenha: '',
    confirmSenha: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    novaSenha: false,
    confirmSenha: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenData, setTokenData] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Token de recuperação não fornecido');
      navigate('/login');
      return;
    }

    validateToken();
  }, [token, navigate]);

  const validateToken = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3003/api'}/auth/validate-reset-token/${token}`);
      const data = await response.json();

      if (data.success) {
        setTokenValid(true);
        setTokenData(data.data);
      } else {
        setTokenValid(false);
        toast.error(data.message || 'Link de recuperação inválido ou expirado');
      }
    } catch (error) {
      console.error('Erro ao validar token:', error);
      setTokenValid(false);
      toast.error('Erro ao validar link de recuperação');
    } finally {
      setValidating(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Limpar erro quando usuário digita
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const toggleShowPassword = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.novaSenha.trim()) {
      newErrors.novaSenha = 'Nova senha é obrigatória';
    } else if (formData.novaSenha.length < 6) {
      newErrors.novaSenha = 'Senha deve ter pelo menos 6 caracteres';
    } else {
      const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;
      if (!senhaRegex.test(formData.novaSenha)) {
        newErrors.novaSenha = 'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número';
      }
    }
    
    if (!formData.confirmSenha.trim()) {
      newErrors.confirmSenha = 'Confirmação de senha é obrigatória';
    } else if (formData.novaSenha !== formData.confirmSenha) {
      newErrors.confirmSenha = 'Senhas não conferem';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3003/api'}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          novaSenha: formData.novaSenha,
          confirmSenha: formData.confirmSenha
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        toast.success('Senha alterada com sucesso!');
      } else {
        if (data.errors && data.errors.length > 0) {
          const errorObj = {};
          data.errors.forEach(error => {
            if (error.includes('senha')) {
              errorObj.novaSenha = error;
            } else {
              errorObj.general = error;
            }
          });
          setErrors(errorObj);
        } else {
          setErrors({ general: data.message || 'Erro ao redefinir senha' });
        }
      }
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      setErrors({ general: 'Erro de conexão. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (validating) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Card className="text-center p-4">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 mb-0">Validando link de recuperação...</p>
        </Card>
      </Container>
    );
  }

  if (!tokenValid) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Card className="text-center p-4">
          <FaTimesCircle size={60} className="text-danger mb-3" />
          <h4>Link Inválido</h4>
          <p className="text-muted mb-4">
            Este link de recuperação é inválido ou já expirou.<br />
            Solicite um novo link de recuperação.
          </p>
          <Button variant="primary" onClick={handleBackToLogin}>
            Voltar ao Login
          </Button>
        </Card>
      </Container>
    );
  }

  if (success) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Card className="text-center p-4">
          <FaCheckCircle size={60} className="text-success mb-3" />
          <h4>Senha Redefinida!</h4>
          <p className="text-muted mb-4">
            Sua senha foi alterada com sucesso.<br />
            Você já pode fazer login com a nova senha.
          </p>
          <Button variant="primary" onClick={handleBackToLogin}>
            Fazer Login
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="min-vh-100 d-flex align-items-center">
      <Row className="justify-content-center w-100">
        <Col xs={12} sm={8} md={6} lg={5}>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white text-center py-3">
              <FaLock size={40} className="mb-2" />
              <h3>Redefinir Senha</h3>
              <p className="mb-0">Digite sua nova senha</p>
            </Card.Header>
            
            <Card.Body className="p-4">
              {tokenData && (
                <Alert variant="info" className="small">
                  <strong>Email:</strong> {tokenData.email}<br />
                  <strong>Nome:</strong> {tokenData.nome}
                </Alert>
              )}

              {errors.general && (
                <Alert variant="danger">
                  {errors.general}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Nova Senha</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPasswords.novaSenha ? 'text' : 'password'}
                      name="novaSenha"
                      value={formData.novaSenha}
                      onChange={handleChange}
                      placeholder="Digite sua nova senha"
                      isInvalid={!!errors.novaSenha}
                      disabled={loading}
                    />
                    <Button
                      variant="link"
                      className="position-absolute end-0 top-50 translate-middle-y border-0 text-muted"
                      onClick={() => toggleShowPassword('novaSenha')}
                      style={{ zIndex: 10 }}
                    >
                      {showPasswords.novaSenha ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                    <Form.Control.Feedback type="invalid">
                      {errors.novaSenha}
                    </Form.Control.Feedback>
                  </div>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Confirmar Nova Senha</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPasswords.confirmSenha ? 'text' : 'password'}
                      name="confirmSenha"
                      value={formData.confirmSenha}
                      onChange={handleChange}
                      placeholder="Digite novamente a nova senha"
                      isInvalid={!!errors.confirmSenha}
                      disabled={loading}
                    />
                    <Button
                      variant="link"
                      className="position-absolute end-0 top-50 translate-middle-y border-0 text-muted"
                      onClick={() => toggleShowPassword('confirmSenha')}
                      style={{ zIndex: 10 }}
                    >
                      {showPasswords.confirmSenha ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                    <Form.Control.Feedback type="invalid">
                      {errors.confirmSenha}
                    </Form.Control.Feedback>
                  </div>
                </Form.Group>

                <Alert variant="warning" className="small">
                  <strong>Requisitos da senha:</strong>
                  <ul className="mb-0 mt-2">
                    <li>Pelo menos 6 caracteres</li>
                    <li>1 letra minúscula (a-z)</li>
                    <li>1 letra maiúscula (A-Z)</li>
                    <li>1 número (0-9)</li>
                  </ul>
                </Alert>

                <div className="d-grid gap-2">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="lg"
                    disabled={loading}
                    className="d-flex align-items-center justify-content-center"
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Redefinindo...
                      </>
                    ) : (
                      <>
                        <FaLock className="me-2" />
                        Redefinir Senha
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline-secondary" 
                    onClick={handleBackToLogin}
                    disabled={loading}
                  >
                    Voltar ao Login
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPassword;