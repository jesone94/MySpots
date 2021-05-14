const { Schema, model } = require('mongoose');

const User = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  image: {
    url: String,
    filename: String,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  friends: [{ type: Schema.Types.ObjectId, ref: 'users', unique: true }],
  spots: [{ type: Schema.Types.ObjectId, ref: 'spots' }],
  favorites: [{ type: Schema.Types.ObjectId, ref: 'spots', unique: true }],
});
module.exports = model('users', User);
