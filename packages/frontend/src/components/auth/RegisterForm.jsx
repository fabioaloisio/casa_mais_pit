import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaUserPlus, FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmSenha: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmSenha: ''
  });
  const [fieldTouched, setFieldTouched] = useState({
    nome: false,
    email: false,
    senha: false,
    confirmSenha: false
  });
  const { register, loading } = useAuth();

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
    
    if (name === 'nome') {
      if (!value.trim()) {
        error = 'Nome precisa ser preenchido';
      } else if (value.trim().length < 2) {
        error = 'Nome deve ter pelo menos 2 caracteres';
      }
    }
    
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

    if (name === 'confirmSenha') {
      if (!value.trim()) {
        error = 'Confirmação de senha precisa ser preenchida';
      } else if (value !== formData.senha) {
        error = 'Senhas não conferem';
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
      nome: true,
      email: true,
      senha: true,
      confirmSenha: true
    });

    // Validar todos os campos
    const nomeValid = validateField('nome', formData.nome);
    const emailValid = validateField('email', formData.email);
    const senhaValid = validateField('senha', formData.senha);
    const confirmSenhaValid = validateField('confirmSenha', formData.confirmSenha);
    
    if (!nomeValid || !emailValid || !senhaValid || !confirmSenhaValid) {
      return;
    }

    await register(formData.nome, formData.email, formData.senha, formData.confirmSenha);
  };

  return (
    <div className="form2">
      <form className="formCad" onSubmit={handleSubmit}>
        <div className="login2">
          <FaUserPlus alt="ícone de cadastro" />
          <h1>Cadastre-se</h1>
        </div>
        <p className="description2">Insira seus dados pessoais</p>
        
        <div className="register-fields">
          <label htmlFor="nome">
            Nome
            <div className="input-container">
              <FaUser className="input-icon" role="presentation" />
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Nome completo"
                className={`input_nome ${errors.nome && fieldTouched.nome ? 'input-error' : formData.nome && !errors.nome ? 'input-success' : ''}`}
                aria-describedby={errors.nome && fieldTouched.nome ? "nome-error" : undefined}
                aria-invalid={errors.nome && fieldTouched.nome ? "true" : "false"}
                required
              />
              {formData.nome && (
                <button
                  type="button"
                  className="clear-field-button"
                  onClick={() => clearField('nome')}
                  title="Limpar campo de nome"
                  aria-label="Limpar campo de nome"
                >
                  ×
                </button>
              )}
            </div>
            {errors.nome && fieldTouched.nome && (
              <div 
                id="nome-error" 
                className="field-error" 
                role="alert"
                aria-live="polite"
              >
                {errors.nome}
              </div>
            )}
          </label>

          <label htmlFor="email_cadastro">
            E-mail
            <div className="input-container">
              <FaEnvelope className="input-icon" role="presentation" />
              <input
                type="email"
                id="email_cadastro"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="E-mail"
                className={`input_email ${errors.email && fieldTouched.email ? 'input-error' : formData.email && !errors.email ? 'input-success' : ''}`}
                aria-describedby={errors.email && fieldTouched.email ? "email-cadastro-error" : undefined}
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
                id="email-cadastro-error" 
                className="field-error" 
                role="alert"
                aria-live="polite"
              >
                {errors.email}
              </div>
            )}
          </label>

          <label htmlFor="senha_cadastro">
            Senha
            <div className="input-container">
              <FaLock className="input-icon" role="presentation" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="senha_cadastro"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Senha"
                className={`input_senha ${errors.senha && fieldTouched.senha ? 'input-error' : formData.senha && !errors.senha ? 'input-success' : ''}`}
                aria-describedby={errors.senha && fieldTouched.senha ? "senha-cadastro-error" : undefined}
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
                className="password-toggle-register"
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
                id="senha-cadastro-error" 
                className="field-error" 
                role="alert"
                aria-live="polite"
              >
                {errors.senha}
              </div>
            )}
          </label>

          <label htmlFor="confirm_senha">
            Confirmar Senha
            <div className="input-container">
              <FaLock className="input-icon" role="presentation" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirm_senha"
                name="confirmSenha"
                value={formData.confirmSenha}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Confirmar senha"
                className={`input_confirmsenha ${errors.confirmSenha && fieldTouched.confirmSenha ? 'input-error' : formData.confirmSenha && !errors.confirmSenha ? 'input-success' : ''}`}
                aria-describedby={errors.confirmSenha && fieldTouched.confirmSenha ? "confirm-senha-error" : undefined}
                aria-invalid={errors.confirmSenha && fieldTouched.confirmSenha ? "true" : "false"}
                required
              />
              {formData.confirmSenha && (
                <button
                  type="button"
                  className="clear-field-button clear-senha"
                  onClick={() => clearField('confirmSenha')}
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
            {errors.confirmSenha && fieldTouched.confirmSenha && (
              <div 
                id="confirm-senha-error" 
                className="field-error" 
                role="alert"
                aria-live="polite"
              >
                {errors.confirmSenha}
              </div>
            )}
          </label>
        </div>

        <button 
          type="submit" 
          className="submit_cad" 
          disabled={loading}
        >
          {loading ? (
            <div className="loading">Cadastrando...</div>
          ) : (
            'CADASTRAR'
          )}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;