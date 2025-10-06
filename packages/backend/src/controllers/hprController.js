// const { HPR } = require('../models/HPR');
// const hprRepository = require('../repository/hprRepository'); // novo repository para HPR

// class HPRController {
//   async getAll(req, res) {
//     try {
//       const { assistida_id, dataInicio, dataFim } = req.query;
//       let hprs;

//       if (assistida_id || dataInicio || dataFim) {
//         hprs = await hprRepository.findAllWithFilters({ assistida_id, dataInicio, dataFim });
//       } else {
//         hprs = await hprRepository.findAll();
//       }

//       res.json({
//         success: true,
//         data: hprs.map(h => h.toJSON()),
//         total: hprs.length
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   async create(req, res) {
//     try {
//       const hpr = new HPR(req.body);
//       const errors = hpr.validate();

//       if (errors.length > 0) {
//         return res.status(400).json({
//           success: false,
//           message: 'Dados inválidos',
//           errors
//         });
//       }

//       const newHPR = await hprRepository.create(hpr);

//       res.status(201).json({
//         success: true,
//         data: newHPR[0].toJSON(),
//         message: 'HPR cadastrada com sucesso'
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   async update(req, res) {
//     try {
//       const { id } = req.params;

//       const existingHPR = await hprRepository.findById(id);
//       if (!existingHPR) {
//         return res.status(404).json({
//           success: false,
//           message: 'HPR não encontrada'
//         });
//       }

//       const hpr = new HPR({ ...req.body, id });
//       const errors = hpr.validate();
//       if (errors.length > 0) {
//         return res.status(400).json({
//           success: false,
//           message: 'Dados inválidos',
//           errors
//         });
//       }

//       const updatedHPR = await hprRepository.update(hpr.id, hpr);

//       res.json({
//         success: true,
//         data: updatedHPR[updatedHPR.length - 1].toJSON()
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   async delete(req, res) {
//     try {
//       const { id } = req.params;
//       const existingHPR = await hprRepository.findById(id);
//       if (!existingHPR) {
//         return res.status(404).json({
//           success: false,
//           message: 'HPR não encontrada'
//         });
//       }

//       const deleted = await hprRepository.delete(id);
//       if (deleted) {
//         res.json({
//           success: true,
//           message: 'HPR excluída com sucesso'
//         });
//       } else {
//         res.status(500).json({
//           success: false,
//           message: 'Erro ao deletar HPR'
//         });
//       }
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   async getById(req, res) {
//     try {
//       const { id } = req.params;
//       const hprList = await hprRepository.findById(id);

//       if (!hprList || hprList.length === 0) {
//         return res.status(404).json({
//           success: false,
//           message: 'HPR não encontrada'
//         });
//       }

//       // Mapear cada HPR para JSON
//       const data = hprList.map(hpr => hpr.toJSON());

//       res.status(200).json({
//         success: true,
//         data
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

// }

// module.exports = new HPRController();



const { HPR } = require('../models/HPR');
const hprRepository = require('../repository/hprRepository');

class HPRController {
  async getAll(req, res) {
    try {
      const { assistida_id, dataInicio, dataFim } = req.query;
      let hprs;

      if (assistida_id || dataInicio || dataFim) {
        hprs = await hprRepository.findAllWithFilters({ assistida_id, dataInicio, dataFim });
      } else {
        hprs = await hprRepository.findAll();
      }

      res.json({
        success: true,
        data: hprs.map(h => h.toJSON()),
        total: hprs.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async create(req, res) {
    try {
      const hpr = new HPR(req.body);
      const errors = hpr.validate();

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors
        });
      }

      // Pega o userId do token decodificado
      const userId = req.user.id; // assumindo que você tem um middleware de auth que coloca o user em req.user

      const newHPR = await hprRepository.create(hpr, userId);

      res.status(201).json({
        success: true,
        data: newHPR[newHPR.length - 1].toJSON(),
        message: 'HPR cadastrada com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const existingHPR = await hprRepository.findById(id);
      if (!existingHPR || existingHPR.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'HPR não encontrada'
        });
      }

      const hpr = new HPR({ ...req.body, id });
      const errors = hpr.validate();
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors
        });
      }

      const userId = req.user.id;
      const updatedHPR = await hprRepository.update(hpr.id, hpr, userId);

      res.json({
        success: true,
        data: updatedHPR[updatedHPR.length - 1].toJSON()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const existingHPR = await hprRepository.findById(id);
      if (!existingHPR || existingHPR.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'HPR não encontrada'
        });
      }

      const userId = req.user.id;
      const deleted = await hprRepository.delete(id, userId);

      res.json({
        success: true,
        message: 'HPR marcada como excluída'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const hprList = await hprRepository.findById(id);

      if (!hprList || hprList.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'HPR não encontrada'
        });
      }

      const data = hprList.map(hpr => hpr.toJSON());

      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new HPRController();
