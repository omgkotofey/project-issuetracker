'use strict';

module.exports = (app, issuesManager) =>  {

  app.route('/api/issues/:project')
  
    .get(async(req, res) => {
      const projectName = req.params.project;
      const issues = await issuesManager.findAllForProject(projectName, req.query);
      return res.status(200).json(issues);
    })
    
    .post(async(req, res) => {
      const projectName = req.params.project;
      try {
        const issue = await issuesManager.createFromData({
          project: projectName,
          ...req.body
        });
  
        return res.status(200).json(issue);
      } catch (err) {
        if (err.name == 'ValidationError') {
          console.error(err.message);
          return res.status(200).json({error: 'required field(s) missing'});
        }

        return res.status(500);
      }
    })
    
    .put(async (req, res) => {
      const projectName = req.params.project;
      const { _id, ...updateParams } = req.body;
      if (!_id) {
         // we will not return the 400 code cuz of fcc tests requirements
        return res.status(200).json({ 
          error: 'missing _id' 
        });
      }

      if (Object.keys(updateParams).length === 0) {
        return res.status(200).json({ 
           error: 'no update field(s) sent',
          _id: _id
        });
      }
     
      const issue = await issuesManager.findInProjectById(_id, projectName);
      if (!issue) {
        return res.status(200).json({
          error: 'could not update',
          _id: _id
        });
      }

      try {
          await issuesManager.updateFromData(issue, updateParams);
        // we will not return the whole updated model cuz of fcc tests requirements
        return res.status(200).json({
          result: 'successfully updated', 
          _id: _id
        });
      } catch (err) {
        console.error(err);
        return res.status(200).json({
          error: 'could not update',
          _id: _id
        });
      }
    })
    
    .delete(async(req, res) => {
      const projectName = req.params.project;
      const { _id } = req.body;
      if (!_id) {
         // we will not return the 400 code cuz of fcc tests requirements
        return res.status(200).json({ 
          error: 'missing _id' 
        });
      }

      const issue = await issuesManager.findInProjectById(_id, projectName);
      if (!issue) {
        // we will not return the 204 code cuz of fcc tests requirements
        return res.status(200).json({
          error: 'could not delete', 
          _id: _id
        });
      }
      
      await issuesManager.remove(issue);
        // we will not return the 204 code cuz of fcc tests requirements
        return res.status(200).json({
          result: 'successfully deleted', 
          _id: _id
        });
    });
    
};
