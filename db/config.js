const mongoose = require('mongoose');
require('dotenv').config();

const options = {
  useNewUrlParser: true, //
  useFindAndModify: false,
  useCreateIndex: true, //
  useUnifiedTopology: true,
  poolSize: 10,
  bufferMaxEntries: 0,
};

const dbConnectionURL = process.env.DB_URL;
async function dbConnect() {
  await mongoose.connect(dbConnectionURL, options, (err) => {
    if (err) return console.log(err);

    console.log('Success connected to mongo');
  });
}
module.exports = dbConnect;
