require('dotenv').config();

const mongoose = require("mongoose");

if (process.env['NODE_ENV'] !== 'test') {
  mongoose.connect(
    process.env['MONGO_URI'], {
    dbName: process.env['MONGO_DATABASE'],
    useNewUrlParser: true
  });
}

const IssuesSchema = new mongoose.Schema({
  assigned_to: {
    type: String,
    required: false,
    default: ""
  },
  created_by: {
    type: String,
    required: true
  },
  issue_text: {
    type: String,
    required: true
  },
  issue_title: {
    type: String,
    required: true
  },
  open: {
    type: Boolean,
    required: true,
    default: true
  },
  status_text: {
    type: String,
    required: false,
    default: ""
  },
  project: {
    type: String,
    required: true,
    select: false
  }
}, { 
  versionKey: false,
  timestamps: { createdAt: 'created_on', updatedAt: 'updated_on' }
});

module.exports = {
  Issues: mongoose.model('Issues', IssuesSchema)
}