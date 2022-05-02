const { Issues } = require('./models.js');

module.exports = {
  
  findAllForProject: async (projectName, filter) => {
    return await Issues.find({
      'project': projectName,
      ...filter
    }).exec();
  },

  findInProjectById: async (id, projectName) => {
    try {
      return await Issues.findOne({
        '_id': id,
        'project': projectName
      }).exec();
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  createFromData: async (data) => {
    return await Issues.create(data);
  },

  updateFromData: async (issue, data) => {
    return await Issues.findOneAndUpdate({_id: issue._id}, data).exec();
  },

  remove: async (issue) => {
    return await Issues.findOneAndDelete({_id: issue._id}).exec();
  }
}