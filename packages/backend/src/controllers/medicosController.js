const medicosRepository = require('../repository/medicosRepository');
const consultaRepository = require('../repository/consultaRepository');

async function listMedicos(req, res) {
    try {
        const medicos = await medicosRepository.findAll();
        res.status(200).json(medicos);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar médicos", error: error.message });
    }
}

async function getMedicoById(req, res) {
    const { id } = req.params;
    try {
        const medico = await medicosRepository.findById(id);
        if (!medico) {
            return res.status(404).json({ message: "Médico não encontrado" });
        }
        res.status(200).json(medico);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar médico", error: error.message });
    }
}

async function createMedico(req, res) {
    const { nome, especialidade } = req.body;
    const crm = req.body.crm ? req.body.crm.trim() : '';

    if (!nome || !crm || !especialidade) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios: nome, crm e especialidade." });
    }

    try {
        const existingMedico = await medicosRepository.findByCrm(crm);
        if (existingMedico) {
            return res.status(409).json({ message: "Já existe um médico cadastrado com este CRM." });
        }

        const novoMedico = await medicosRepository.create({ nome, crm, especialidade });
        res.status(201).json(novoMedico);
    } catch (error) {
        res.status(500).json({ message: "Erro ao criar médico", error: error.message });
    }
}

async function updateMedico(req, res) {
    const { id } = req.params;
    const { nome, especialidade } = req.body;
    const crm = req.body.crm ? req.body.crm.trim() : '';

    if (!nome || !crm || !especialidade) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios: nome, crm e especialidade." });
    }

    try {
        const medicoExists = await medicosRepository.findById(id);
        if (!medicoExists) {
            return res.status(404).json({ message: "Médico não encontrado." });
        }

        const existingMedicoWithCrm = await medicosRepository.findByCrm(crm);
        if (existingMedicoWithCrm && existingMedicoWithCrm.id !== parseInt(id, 10)) {
            return res.status(409).json({ message: "CRM já cadastrado para outro médico." });
        }

        const medicoAtualizado = await medicosRepository.update(id, { nome, crm, especialidade });
        res.status(200).json(medicoAtualizado);

    } catch (error) {
        res.status(500).json({ message: "Erro ao atualizar médico", error: error.message });
    }
}

async function deleteMedico(req, res) {
    const { id } = req.params;
    try {
        const medico = await medicosRepository.findById(id);
        if (!medico) {
            return res.status(404).json({ message: "Médico não encontrado." });
        }

        const consultas = await consultaRepository.findByMedicoId(id);
        if (consultas && consultas.length > 0) {
            return res.status(409).json({ message: "Não é possível excluir este médico, pois ele está associado a consultas existentes." });
        }

        const success = await medicosRepository.delete(id);
        if (success) {
            res.status(200).json({ message: "Médico excluído com sucesso." });
        } else {
            res.status(404).json({ message: "Médico não encontrado para exclusão." });
        }
    } catch (error) {
        res.status(500).json({ message: "Erro ao excluir médico", error: error.message });
    }
}

module.exports = {
    listMedicos,
    getMedicoById,
    createMedico,
    updateMedico,
    deleteMedico
};
