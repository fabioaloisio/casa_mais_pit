import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaEdit, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { mapUserType } from '../utils/userTypes';

const Profile = () => {
  const { user } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [formData, setFormData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmSenha: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    senhaAtual: false,
    novaSenha: false,
    confirmSenha: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
    
    if (!formData.senhaAtual.trim()) {
      newErrors.senhaAtual = 'Senha atual é obrigatória';
    }
    
    if (!formData.novaSenha.trim()) {
      newErrors.novaSenha = 'Nova senha é obrigatória';
    } else if (formData.novaSenha.length < 6) {
      newErrors.novaSenha = 'Nova senha deve ter pelo menos 6 caracteres';
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

    if (formData.senhaAtual === formData.novaSenha) {
      newErrors.novaSenha = 'A nova senha deve ser diferente da senha atual';
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3003/api'}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Senha alterada com sucesso!');
        setFormData({
          senhaAtual: '',
          novaSenha: '',
          confirmSenha: ''
        });
        setShowChangePassword(false);
      } else {
        if (data.errors && data.errors.length > 0) {
          const errorObj = {};
          data.errors.forEach(error => {
            if (error.includes('atual')) {
              errorObj.senhaAtual = error;
            } else if (error.includes('nova') || error.includes('senha')) {
              errorObj.novaSenha = error;
            } else {
              errorObj.general = error;
            }
          });
          setErrors(errorObj);
        } else {
          setErrors({ general: data.message || 'Erro ao alterar senha' });
        }
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      setErrors({ general: 'Erro de conexão. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowChangePassword(false);
    setFormData({
      senhaAtual: '',
      novaSenha: '',
      confirmSenha: ''
    });
    setErrors({});
  };

  if (!user) {
    return (
      <div className="conteudo">
        <Alert variant="warning">
          Carregando informações do perfil...
        </Alert>
      </div>
    );
  }

  return (
    <div className="conteudo">
      <div className="topo">
        <h1>Meu Perfil</h1>
        <p>Gerencie suas informações pessoais e configurações de segurança</p>
      </div>

      <Row>
        <Col lg={8}>
          {/* Informações do Usuário */}
          <Card className="mb-4">
            <Card.Header className="d-flex align-items-center">
              <FaUser className="me-2" />
              <h5 className="mb-0">Informações Pessoais</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="form-label text-muted">Nome Completo</label>
                    <p className="fw-medium">{user.nome}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="form-label text-muted">Email</label>
                    <p className="fw-medium">{user.email}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="form-label text-muted">Tipo de Usuário</label>
                    <p>
                      <span className={`badge ${mapUserType(user.tipo) === 'Administrador' ? 'bg-success' : 'bg-primary'}`}>
                        {mapUserType(user.tipo)}
                      </span>
                    </p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="form-label text-muted">Data de Cadastro</label>
                    <p className="fw-medium">
                      {user.data_cadastro ? new Date(user.data_cadastro).toLocaleDateString('pt-BR') : 'N/A'}
                    </p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Segurança */}
          <Card>
            <Card.Header className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <FaLock className="me-2" />
                <h5 className="mb-0">Segurança</h5>
              </div>
              {!showChangePassword && (
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setShowChangePassword(true)}
                >
                  <FaEdit className="me-1" /> Alterar Senha
                </Button>
              )}
            </Card.Header>
            <Card.Body>
              {!showChangePassword ? (
                <div>
                  <p className="text-muted mb-3">
                    Mantenha sua conta segura alterando sua senha regularmente.
                  </p>
                  <div className="d-flex align-items-center text-muted">
                    <FaLock className="me-2" />
                    <span>Senha: ••••••••••</span>
                  </div>
                </div>
              ) : (
                <div>
                  {errors.general && (
                    <Alert variant="danger">
                      {errors.general}
                    </Alert>
                  )}

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Senha Atual <span className="text-danger">*</span></Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showPasswords.senhaAtual ? 'text' : 'password'}
                          name="senhaAtual"
                          value={formData.senhaAtual}
                          onChange={handleChange}
                          placeholder="Digite sua senha atual"
                          isInvalid={!!errors.senhaAtual}
                          disabled={loading}
                        />
                        <Button
                          variant="link"
                          className="position-absolute end-0 top-50 translate-middle-y border-0 text-muted"
                          onClick={() => toggleShowPassword('senhaAtual')}
                          style={{ zIndex: 10 }}
                        >
                          {showPasswords.senhaAtual ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                        <Form.Control.Feedback type="invalid">
                          {errors.senhaAtual}
                        </Form.Control.Feedback>
                      </div>
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Nova Senha <span className="text-danger">*</span></Form.Label>
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
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Confirmar Nova Senha <span className="text-danger">*</span></Form.Label>
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
                      </Col>
                    </Row>

                    <Alert variant="info" className="small">
                      <strong>Requisitos da senha:</strong>
                      <ul className="mb-0 mt-2">
                        <li>Pelo menos 6 caracteres</li>
                        <li>1 letra minúscula (a-z)</li>
                        <li>1 letra maiúscula (A-Z)</li>
                        <li>1 número (0-9)</li>
                      </ul>
                    </Alert>

                    <div className="d-flex gap-2 justify-content-end">
                      <Button 
                        variant="outline-secondary" 
                        onClick={handleCancel}
                        disabled={loading}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        variant="primary"
                        disabled={loading}
                        className="d-flex align-items-center"
                      >
                        {loading ? (
                          <>
                            <Spinner size="sm" className="me-2" />
                            Alterando...
                          </>
                        ) : (
                          <>
                            <FaCheck className="me-2" />
                            Alterar Senha
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">💡 Dicas de Segurança</h6>
            </Card.Header>
            <Card.Body>
              <div className="small">
                <div className="mb-3">
                  <strong>🔐 Senha Forte</strong>
                  <p className="text-muted mb-0">Use uma combinação de letras maiúsculas, minúsculas e números.</p>
                </div>
                <div className="mb-3">
                  <strong>🔄 Troque Regularmente</strong>
                  <p className="text-muted mb-0">Altere sua senha periodicamente para manter sua conta segura.</p>
                </div>
                <div className="mb-3">
                  <strong>🚫 Não Compartilhe</strong>
                  <p className="text-muted mb-0">Nunca compartilhe sua senha com outras pessoas.</p>
                </div>
                <div>
                  <strong>📱 Mantenha-se Atento</strong>
                  <p className="text-muted mb-0">Se suspeitar que sua conta foi comprometida, altere a senha imediatamente.</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;