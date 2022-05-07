const Fixtures = require('node-mongodb-fixtures');
const path = require('path');
require('dotenv').config();


const issuesFixture = (dbUrl, dbName) => {
 const fixtures = new Fixtures({ 
   dir: path.resolve(__dirname, './models'),
 });
 return { 
   load: () => fixtures.connect(dbUrl, {useNewUrlParser: true}, dbName).then(() => fixtures.load()),
   cleanup: () => fixtures.unload().then(() => fixtures.disconnect())
 };
}

module.exports = {
  issuesFixture: issuesFixture,
};