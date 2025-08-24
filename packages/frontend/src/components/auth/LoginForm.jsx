import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaSignInAlt, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    senha: ''
  });
  const [fieldTouched, setFieldTouched] = useState({
    email: false,
    senha: false
  });
  const { login, loading } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpar erro quando usuário começa a digitar
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setFieldTouched({
      ...fieldTouched,
      [name]: true
    });

    // Validar campo quando usuário sai dele
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = '';
    
    if (name === 'email') {
      if (!value.trim()) {
        error = 'Email precisa ser preenchido';
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        error = 'Email deve ter um formato válido';
      }
    }
    
    if (name === 'senha') {
      if (!value.trim()) {
        error = 'Senha precisa ser preenchida';
      } else if (value.length < 6) {
        error = 'Senha deve ter pelo menos 6 caracteres';
      }
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    return error === '';
  };

  const clearField = (fieldName) => {
    setFormData({
      ...formData,
      [fieldName]: ''
    });
    setErrors({
      ...errors,
      [fieldName]: ''
    });
    setFieldTouched({
      ...fieldTouched,
      [fieldName]: false
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Marcar todos os campos como touched
    setFieldTouched({
      email: true,
      senha: true
    });

    // Validar todos os campos
    const emailValid = validateField('email', formData.email);
    const senhaValid = validateField('senha', formData.senha);
    
    if (!emailValid || !senhaValid) {
      return;
    }

    const result = await login(formData.email, formData.senha);
    
    if (result.success && rememberMe) {
      localStorage.setItem('rememberedEmail', formData.email);
    }
  };

  const handleForgotPassword = () => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData({ ...formData, email: savedEmail });
    }
  };

  return (
    <div className="form">
      <form onSubmit={handleSubmit}>
        <div className="login">
          <FaSignInAlt alt="ícone de entrada" />
          <h1>Faça seu login</h1>
        </div>
        <p className="description">Entre com suas informações de cadastro</p>
        
        <label htmlFor="email">
          E-mail
          <div className="input-container">
            <FaEnvelope className="input-icon" role="presentation" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Digite seu e-mail"
              className={`email ${errors.email && fieldTouched.email ? 'input-error' : formData.email && !errors.email ? 'input-success' : ''}`}
              aria-describedby={errors.email && fieldTouched.email ? "email-error" : undefined}
              aria-invalid={errors.email && fieldTouched.email ? "true" : "false"}
              required
            />
            {formData.email && (
              <button
                type="button"
                className="clear-field-button"
                onClick={() => clearField('email')}
                title="Limpar campo de email"
                aria-label="Limpar campo de email"
              >
                ×
              </button>
            )}
          </div>
          {errors.email && fieldTouched.email && (
            <div 
              id="email-error" 
              className="field-error" 
              role="alert"
              aria-live="polite"
            >
              {errors.email}
            </div>
          )}
        </label>

        <label htmlFor="senha">
          Senha
          <div className="input-container">
            <FaLock className="input-icon" role="presentation" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="senha"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Digite sua senha"
              className={`senha ${errors.senha && fieldTouched.senha ? 'input-error' : formData.senha && !errors.senha ? 'input-success' : ''}`}
              aria-describedby={errors.senha && fieldTouched.senha ? "senha-error" : undefined}
              aria-invalid={errors.senha && fieldTouched.senha ? "true" : "false"}
              required
            />
            {formData.senha && (
              <button
                type="button"
                className="clear-field-button clear-senha"
                onClick={() => clearField('senha')}
                title="Limpar campo de senha"
                aria-label="Limpar campo de senha"
              >
                ×
              </button>
            )}
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
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
          {errors.senha && fieldTouched.senha && (
            <div 
              id="senha-error" 
              className="field-error" 
              role="alert"
              aria-live="polite"
            >
              {errors.senha}
            </div>
          )}
        </label>

        <div className="form-options">
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="checkbox"
            />
            Lembrar de mim
          </label>
          
          <button 
            type="button" 
            className="forgot-password esqueceu" 
            onClick={handleForgotPassword}
          >
            Esqueceu a senha?
          </button>
        </div>

        <button 
          type="submit" 
          className="submit" 
          disabled={loading}
        >
          {loading ? (
            <div className="loading">Entrando...</div>
          ) : (
            'ENTRAR'
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;