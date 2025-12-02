import apiService from './api';

class UsuarioService {
  async listarTodos() {
    try {
      const response = await apiService.request('/usuarios', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response;
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      throw error;
    }
  }

  async criarUsuario(dadosUsuario) {
    try {
      const response = await apiService.request('/usuarios', {
        method: 'POST',
        body: JSON.stringify(dadosUsuario),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  async atualizarUsuario(id, dadosUsuario) {
    try {
      const response = await apiService.request(`/usuarios/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dadosUsuario),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  async excluirUsuario(id) {
    try {
      const response = await apiService.request(`/usuarios/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response;
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      throw error;
    }
  }

  async buscarPorId(id) {
    try {
      const response = await apiService.request(`/usuarios/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  }

  async alterarStatus(id, ativo) {
    try {
      const response = await apiService.request(`/usuarios/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ ativo }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response;
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      throw error;
    }
  }

  async reactivateAndUpdate(id, dadosUsuario) {
    try {
      const response = await apiService.request(`/usuarios/${id}/reactivate-and-update`, {
        method: 'POST',
        body: JSON.stringify(dadosUsuario),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response;
    } catch (error) {
      console.error('Erro ao reativar e atualizar usuário:', error);
      throw error;
    }
  }
}

const usuarioService = new UsuarioService();
export default usuarioService;