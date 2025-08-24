import { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { FaEnvelope, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ForgotPasswordModal = ({ show, onHide }) => {
  const [formData, setFormData] = useState({ email: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Limpar erro quando usuário digita
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3003/api'}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase() })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        toast.success('Instruções enviadas! Verifique seu email.');
        
        // Em modo desenvolvimento, mostrar URL no console
        if (data.dev_reset_url) {
          console.log('🔗 Link de recuperação (modo dev):', data.dev_reset_url);
        }
      } else {
        if (data.errors && data.errors.length > 0) {
          setErrors({ email: data.errors[0] });
        } else {
          toast.error(data.message || 'Erro ao solicitar recuperação');
        }
      }
    } catch (error) {
      console.error('Erro ao solicitar recuperação:', error);
      toast.error('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ email: '' });
    setErrors({});
    setSuccess(false);
    setLoading(false);
    onHide();
  };

  const handleTryAgain = () => {
    setSuccess(false);
    setFormData({ email: '' });
    setErrors({});
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header className="bg-primary text-white">
        <Modal.Title className="d-flex align-items-center">
          <FaEnvelope className="me-2" />
          Recuperar Senha
        </Modal.Title>
        <Button 
          variant="link" 
          className="text-white p-0 ms-auto" 
          onClick={handleClose}
        >
          <FaTimes size={20} />
        </Button>
      </Modal.Header>

      <Modal.Body className="p-4">
        {success ? (
          <div className="text-center">
            <div className="mb-3">
              <FaPaperPlane size={60} className="text-success" />
            </div>
            <h5 className="text-success mb-3">Email Enviado!</h5>
            <p className="mb-4">
              Se o email estiver cadastrado em nosso sistema, você receberá as instruções 
              para redefinir sua senha.
            </p>
            <p className="text-muted small mb-4">
              <strong>Não recebeu o email?</strong><br />
              • Verifique sua caixa de spam<br />
              • Aguarde alguns minutos<br />
              • Certifique-se de que digitou o email correto
            </p>
            <div className="d-flex gap-2">
              <Button variant="outline-primary" onClick={handleTryAgain}>
                Tentar Outro Email
              </Button>
              <Button variant="primary" onClick={handleClose}>
                Fechar
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-muted">
                Digite seu email cadastrado e enviaremos as instruções para redefinir sua senha.
              </p>
            </div>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Digite seu email"
                    isInvalid={!!errors.email}
                    disabled={loading}
                    className="ps-5"
                  />
                  <FaEnvelope 
                    className="position-absolute text-muted" 
                    style={{ left: '15px', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </div>
              </Form.Group>

              <Alert variant="info" className="small">
                <strong>⚡ Processo rápido:</strong> O link de recuperação expira em 2 horas por segurança.
              </Alert>

              <div className="d-flex justify-content-end gap-2">
                <Button 
                  variant="outline-secondary" 
                  onClick={handleClose}
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
                      Enviando...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="me-2" />
                      Enviar Instruções
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ForgotPasswordModal;