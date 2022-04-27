'use strict';

module.exports = (app, issuesManager) =>  {

  app.route('/api/issues/:project')
  
    .get(async(req, res) => {
      const projectName = req.params.project;
      const issues = await issuesManager.findAllForProject(projectName);
      return res.status(200).json(issues);
    })
    
    .post(async(req, res) => {
      const projectName = req.params.project;
      try {
        const issue = await issuesManager.createFromData({
          project: projectName,
          ...req.body
        });
  
        return res.status(201).json(issue);
      } catch (err) {
        if (err.name == 'ValidationError') {
          return res.status(400).send(err.message);
        }

        return res.status(500);
      }
    })
    
    .put(async (req, res) => {
      const projectName = req.params.project;
      const { _id } = req.body;
      
      const issue = await issuesManager.findInProjectById(_id, projectName);
      if (!issue) {
        return res.status(404).send('Not found');
      }

      const updatedIssue = await issuesManager.updateFromData(issue, req.body);
      return res.status(200).json(updatedIssue);
    })
    
    .delete(async(req, res) => {
      const projectName = req.params.project;
      const { _id } = req.body;
      
      const issue = await issuesManager.findInProjectById(_id, projectName);
      if (!issue) {
        return res.status(404).send('Not found');
      }
      
      await issuesManager.remove(issue);
      return res.status(204).send('No content');
    });
    
};
