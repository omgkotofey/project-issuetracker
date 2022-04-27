const { Issues } = require('./models.js');

module.exports = {
  
  findAllForProject: async (projectName) => {
    return await Issues.find({'project': projectName}).exec();
  },

  findInProjectById: async (id, projectName) => {
    return await Issues.findOne({
      '_id': id,
      'project': projectName
    }).exec();
  },

  createFromData: async (data) => {
    return await Issues.create(data);
  },

  updateFromData: async (issue, data) => {
    delete data._id;
    return await Issues.findOneAndUpdate(issue._id, data);
  },

  remove: async (issue) => {
    return await Issues.findOneAndDelete(issue.id);
  }
}