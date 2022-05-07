require('dotenv').config();

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

const testProjectName = process.env.TEST_PROJECT_NAME;
const nonExistingIssueId = '6272e9ae07bddf0ee9f6c655';

const issuesFakes = require('./fixtures/models/issues.js');
const issuesFixtureFactory = require('./fixtures/fixtures.js');
const issuesFixture = issuesFixtureFactory.issuesFixture(
  process.env.MONGO_URI, 
  process.env.MONGO_TEST_DATABASE
);

chai.use(chaiHttp);

suite('Functional Tests', function() {
  const buildUrl = (url) => {
    return `/api/issues/${testProjectName}/${url ? url : ''}`;
  }
  
  before(async () => await issuesFixture.load());
  after(async () => await issuesFixture.cleanup());
  
  this.timeout(5000);
  test('GET all issues', (done) => {       
    chai
      .request(server)
      .get(buildUrl())
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.equal(res.body.length, 2);
        done();
      });
  });

  test('GET get non exising issue', (done) => {       
    chai
      .request(server)
      .get(buildUrl(`?_id=1234`))
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.equal(res.body.length, 0);
        done();
      });
  });

  test('GET get exising issue', (done) => {       
    chai
      .request(server)
      .get(buildUrl(`?_id=${issuesFakes[0]._id}`))
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.equal(res.body.length, 1);
        assert.equal(res.body[0]._id, issuesFakes[0]._id.toString());
        done();
      });
  });

  test('GET all issues with params', (done) => {       
    chai
      .request(server)
      .get(buildUrl(`?open=true`))
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.equal(res.body.length, 2);
        done();
      });
  });

  test('POST issue with required params', (done) => {       
    chai
      .request(server)
      .post(buildUrl())
      .type('form')
      .send({
          created_by: "somebody",
          issue_text: "text",
          issue_title: "title"
        })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.include(res.body, {
          created_by: "somebody",
          issue_text: "text",
          issue_title: "title",
          assigned_to: "",
          open: true,
          status_text: ""
        });
        let nowTimeStamp = (new Date()).getTime();
        assert.isBelow(Date.parse(res.body.created_on), nowTimeStamp);
        assert.isBelow(Date.parse(res.body.updated_on), nowTimeStamp);

        let resultId = res.body._id;
        chai
        .request(server)
        .get(buildUrl(`?_id=${resultId}`))
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.equal(res.body.length, 1);
          assert.equal(res.body[0]._id, resultId);
          done();
        });
      });
  });

  test('POST issue with invalid params', (done) => {       
    chai
      .request(server)
      .post(buildUrl())
      .type('form')
      .send({
          issue_title: "" // only issue_title
        })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  test('PUT issue without _id', (done) => {       
    chai
      .request(server)
      .put(buildUrl())
      .type('form')
      .send({}) // no _id given
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  test('PUT issue with empty params', (done) => {       
    chai
      .request(server)
      .put(buildUrl())
      .type('form')
      .send({
        _id: nonExistingIssueId // no update params given
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body.error, 'no update field(s) sent');
        done();
      });
  });

  test('PUT non existing issue with valid params', (done) => {       
    chai
      .request(server)
      .put(buildUrl())
      .type('form')
      .send({
        _id: nonExistingIssueId,
        issue_title: 'New title',
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body.error, 'could not update');
        done();
      });
  });

  test('PUT existing issue with invalid params', (done) => {       
    chai
      .request(server)
      .put(buildUrl())
      .type('form')
      .send({
        _id: issuesFakes[0]._id.toString(),
        open: 123, // invalid value for bool field
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body.error, 'could not update');
        done();
      });
  });

  test('PUT existing issue with valid params', (done) => { 
    const newTitle = 'New title';
    assert.notEqual(issuesFakes[0].issue_title, newTitle);
    
    chai
      .request(server)
      .put(buildUrl())
      .type('form')
      .send({
        _id: issuesFakes[0]._id.toString(),
        issue_title: newTitle,
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.deepEqual(res.body, {
          _id: issuesFakes[0]._id.toString(),
          result: 'successfully updated', 
        });

        chai
        .request(server)
        .get(buildUrl(`?_id=${issuesFakes[0]._id.toString()}`))
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.equal(res.body.length, 1);
          assert.equal(res.body[0].issue_title, newTitle);
          done();
        });
      });
  });

  test('DELETE issue without _id', (done) => {       
    chai
      .request(server)
      .delete(buildUrl())
      .type('form')
      .send({}) // no _id given
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  test('DELETE non existing issue', (done) => {       
    chai
      .request(server)
      .delete(buildUrl())
      .type('form')
      .send({
        _id: nonExistingIssueId // no update params given
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body.error, 'could not delete');
        done();
      });
  });

  test('DELETE existing issue', (done) => { 
    chai
      .request(server)
      .delete(buildUrl())
      .type('form')
      .send({
        _id: issuesFakes[0]._id.toString(),
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.deepEqual(res.body, {
          _id: issuesFakes[0]._id.toString(),
          result: 'successfully deleted', 
        });

        chai
        .request(server)
        .get(buildUrl(`?_id=${issuesFakes[0]._id.toString()}`))
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.equal(res.body.length, 0);
          done();
        });
      });
  });
});
