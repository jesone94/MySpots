const app = require('./app');
const mongoose = require('mongoose');
const { connect } = require('mongoose');
require('dotenv').config();

const port = process.env.PORT ?? 3000;

const dbConnect = require('./db/config');
async function start() {
  await dbConnect();
  app.listen(process.env.PORT || 3000, () => {
    console.log('Connection to databse is successful %s', process.env.DB_URL);
  });
}
start();
