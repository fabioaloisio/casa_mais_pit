import apiService from './api';

export const substanciasService = {
    obterTodos: async () => {
        try {
            const response = await apiService.get('/substancias');
            return response.success ? response.data : [];
        } catch (error) {
            console.error('Erro ao buscar substâncias:', error.message);
            throw new Error('Erro ao carregar substâncias. Tente novamente.');
        }
    },

    obterPorId: async (id) => {
        try {
            const response = await apiService.get(`/substancias/${id}`);
            return response.success ? response.data : null;
        } catch (error) {
            console.error('Erro ao buscar substância:', error.message);
            throw new Error('Erro ao carregar substância. Tente novamente.');
        }
    },

    create: async (substancia) => {
        try {
            const response = await apiService.post('/substancias', substancia);
            return response;
        } catch (error) {
            console.error('Erro ao criar substância:', error.message);
            throw new Error('Erro ao criar substância. Tente novamente.');
        }
    },

    update: async (id, substancia) => {
        try {
            const response = await apiService.put(`/substancias/${id}`, substancia);
            return response;
        } catch (error) {
            console.error('Erro ao atualizar substância:', error.message);
            throw new Error('Erro ao atualizar substância. Tente novamente.');
        }
    },

    delete: async (id) => {
        try {
            const response = await apiService.delete(`/substancias/${id}`);
            return response;
        } catch (error) {
            console.error('Erro ao excluir substância:', error.message);
            throw new Error('Erro ao excluir substância. Tente novamente.');
        }
    },

    // Métodos legados (compatibilidade)
    getAll: async () => {
        console.warn('getAll está obsoleto. Use obterTodos()');
        return await substanciasService.obterTodos();
    },

    getById: async (id) => {
        console.warn('getById está obsoleto. Use obterPorId()');
        return await substanciasService.obterPorId(id);
    },

    add: async (substanciaData) => {
        console.warn('add está obsoleto. Use create()');
        return await substanciasService.create(substanciaData);
    },

    remove: async (id) => {
        console.warn('remove está obsoleto. Use delete()');
        return await substanciasService.delete(id);
    }
};

export default substanciasService;
