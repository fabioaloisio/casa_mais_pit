import apiService from './api';

const createMedico = (medicoData) => {
    return apiService.post('/medicos', medicoData);
};

const getAllMedicos = () => {
    return apiService.get('/medicos');
};

const getMedicoById = (id) => {
    return apiService.get(`/medicos/${id}`);
};

const updateMedico = (id, medicoData) => {
    return apiService.put(`/medicos/${id}`, medicoData);
};

const deleteMedico = (id) => {
    return apiService.delete(`/medicos/${id}`);
};

export {
    createMedico,
    getAllMedicos,
    getMedicoById,
    updateMedico,
    deleteMedico
};
