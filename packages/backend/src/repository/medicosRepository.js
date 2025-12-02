const BaseRepository = require('../../../shared/repository/BaseRepository');

class MedicosRepository extends BaseRepository {
  constructor() {
    super('medicos');
  }


  async findAll(conditions = {}, options = {}) {
    const defaultOptions = { orderBy: 'nome' };
    const mergedOptions = { ...defaultOptions, ...options };
    return super.findAll(conditions, mergedOptions);
  }


  async findByCrm(crm) {
    return this.findOne({ crm });
  }
}

module.exports = new MedicosRepository();
