require('dotenv').config();
const {factory} = require('fakingoose');
const {IssuesSchema} = require('../../../src/models.js');
const testProjectName = process.env.TEST_PROJECT_NAME;

const issuesFactory = factory(
  IssuesSchema,
  { 
    _id: { tostring: false }
  }
);

const generateIssue = (params) => {
  return issuesFactory.generate({
    project: testProjectName,
    open: true
  });
}

module.exports = [
  generateIssue(),
  generateIssue(),
];