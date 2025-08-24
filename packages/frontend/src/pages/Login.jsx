import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import '../styles/auth.css';

const Login = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { isAuthenticated } = useAuth();

  // Redirecionar se já estiver autenticado
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const toggleForm = () => {
    setIsLoginMode(!isLoginMode);
  };

  const renderWelcomeSection = () => {
    if (isLoginMode) {
      return (
        <div className="welcome">
          <svg
            className="logo"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 550 470"
          >
            <g fill="white" fillRule="nonzero">
              <text 
                x="275" 
                y="200" 
                textAnchor="middle" 
                fontSize="100" 
                fontWeight="bold"
                fill="white"
              >
                CASA +
              </text>
              <text 
                x="275" 
                y="280" 
                textAnchor="middle" 
                fontSize="28"
                fill="white"
              >
                Casa de Lázaro de Betânia
              </text>
            </g>
          </svg>
          <p className="texto_cad">
            Bem-vindo de volta! <br />
            Acesse sua conta.
          </p>
          <button className="button_cad" onClick={toggleForm}>
            Não tem conta? Cadastre-se
          </button>
        </div>
      );
    } else {
      return (
        <div className="welcome2">
          <svg
            className="logo2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 550 470"
          >
            <g fill="white" fillRule="nonzero">
              <text 
                x="275" 
                y="200" 
                textAnchor="middle" 
                fontSize="100" 
                fontWeight="bold"
                fill="white"
              >
                CASA +
              </text>
              <text 
                x="275" 
                y="280" 
                textAnchor="middle" 
                fontSize="28"
                fill="white"
              >
                Casa de Lázaro de Betânia
              </text>
            </g>
          </svg>
          <p className="texto_cad2">
            Junte-se a nós! <br />
            Crie sua conta e ajude a fazer a diferença na Casa Mais.
          </p>
          <button className="button_cad2" onClick={toggleForm}>
            Já tem conta? Faça login
          </button>
        </div>
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {isLoginMode ? (
          <>
            {renderWelcomeSection()}
            <LoginForm onToggleForm={toggleForm} />
          </>
        ) : (
          <>
            <RegisterForm onToggleForm={toggleForm} />
            {renderWelcomeSection()}
          </>
        )}
      </div>
    </div>
  );
};

export default Login;