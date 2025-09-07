import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:3003/api';

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data.usuario);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, senha) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data.usuario);
        setToken(data.data.token);
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.usuario));
        toast.success('Login realizado com sucesso!');
        return { success: true };
      } else {
        toast.error(data.message || 'Erro no login');
        return { success: false, message: data.message, errors: data.errors };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Erro ao conectar com o servidor');
      return { success: false, message: 'Erro ao conectar com o servidor' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (nome, email, senha, confirmSenha) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nome, email, senha, confirmSenha })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data.usuario);
        setToken(data.data.token);
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.usuario));
        toast.success('Cadastro realizado com sucesso!');
        return { success: true };
      } else {
        toast.error(data.message || 'Erro no cadastro');
        return { success: false, message: data.message, errors: data.errors };
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast.error('Erro ao conectar com o servidor');
      return { success: false, message: 'Erro ao conectar com o servidor' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.info('Logout realizado com sucesso');
  };

  const isAuthenticated = () => {
    return !!user && !!token;
  };

  // Níveis de acesso conforme especificação ERS
  const ROLES = {
    ADMINISTRADOR: 'Administrador',
    FINANCEIRO: 'Financeiro',
    COLABORADOR: 'Colaborador'
  };

  // Normaliza o tipo de usuário para o formato padrão
  const normalizeUserType = (type) => {
    if (!type) return null;
    
    const typeUpper = type.toUpperCase();
    
    if (typeUpper === 'ADMIN' || typeUpper === 'ADMINISTRADOR') {
      return ROLES.ADMINISTRADOR;
    }
    if (typeUpper === 'FINANCEIRO') {
      return ROLES.FINANCEIRO;
    }
    if (typeUpper === 'OPERADOR' || typeUpper === 'COLABORADOR') {
      return ROLES.COLABORADOR;
    }
    
    return null;
  };

  const getUserRole = () => {
    return normalizeUserType(user?.tipo);
  };

  const isAdmin = () => {
    return getUserRole() === ROLES.ADMINISTRADOR;
  };

  const isFinanceiro = () => {
    return getUserRole() === ROLES.FINANCEIRO;
  };

  const isColaborador = () => {
    return getUserRole() === ROLES.COLABORADOR;
  };

  // Compatibilidade com código existente
  const isOperator = () => {
    return isColaborador();
  };

  // Mapeamento de permissões por requisito funcional conforme ERS
  const PERMISSIONS = {
    // Requisitos Básicos
    RF_B1: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Gerenciar Assistidas
    RF_B2: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Gerenciar Tipos de Substâncias
    RF_B3: [ROLES.ADMINISTRADOR],                     // Gerenciar Doadores
    RF_B4: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Gerenciar Medicamentos
    RF_B5: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Gerenciar Unidades de Medida
    RF_B6: [ROLES.ADMINISTRADOR, ROLES.FINANCEIRO],  // Gerenciar Doações
    RF_B7: [ROLES.ADMINISTRADOR, ROLES.FINANCEIRO],  // Gerenciar Tipos de Despesas
    
    // Requisitos Funcionais
    RF_F1: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Efetuar Entrada na Instituição
    RF_F2: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Efetuar Saída da Instituição
    RF_F3: [ROLES.ADMINISTRADOR, ROLES.FINANCEIRO],  // Gerenciar Despesas
    RF_F4: [ROLES.ADMINISTRADOR, ROLES.FINANCEIRO],  // Lançar Doação Monetária
    RF_F5: [ROLES.ADMINISTRADOR, ROLES.FINANCEIRO],  // Atualizar Caixa
    RF_F6: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Gerenciar Consultas
    RF_F7: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Lançar Prescrição
    RF_F8: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Lançar História Patológica
    RF_F9: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Registrar Dados Pós-Consulta
    
    // Requisitos de Sistema (Relatórios)
    RF_S1: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Relatório de Assistidas
    RF_S2: [ROLES.ADMINISTRADOR],                     // Relatório de Despesas
    RF_S3: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Relatório de Consultas
    RF_S4: [ROLES.ADMINISTRADOR],                     // Relatório de Doações
    RF_S5: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Relatório de Medicamentos
    RF_S6: [ROLES.ADMINISTRADOR, ROLES.COLABORADOR], // Relatório de Internações
    RF_S7: [ROLES.ADMINISTRADOR]                      // Relatório de Doadores
  };

  const hasPermission = (requirementCode) => {
    if (!user) return false;
    
    const userRole = getUserRole();
    const allowedRoles = PERMISSIONS[requirementCode];
    
    if (!allowedRoles) {
      console.warn(`Código de requisito não mapeado: ${requirementCode}`);
      // Se não houver mapeamento, apenas administrador tem acesso
      return userRole === ROLES.ADMINISTRADOR;
    }
    
    return allowedRoles.includes(userRole);
  };

  // Função auxiliar para verificar permissão por múltiplos requisitos
  const hasAnyPermission = (...requirementCodes) => {
    return requirementCodes.some(code => hasPermission(code));
  };

  // Função auxiliar para verificar se tem permissão por role
  const hasRole = (allowedRoles) => {
    if (!user) return false;
    const userRole = getUserRole();
    return allowedRoles.includes(userRole);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    isFinanceiro,
    isColaborador,
    isOperator, // Mantido para compatibilidade
    hasPermission,
    hasAnyPermission,
    hasRole,
    getUserRole,
    ROLES,
    PERMISSIONS
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};