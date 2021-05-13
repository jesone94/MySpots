const { Schema, model } = require('mongoose');
const Comment = new Schema({
  text: {
    type: String,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
});
module.exports = model('comments', Comment);
