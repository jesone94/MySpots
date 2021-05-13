const { Schema, model } = require('mongoose');

const Spot = new Schema({
  coords: [
    {
      type: Number,
    },
  ],
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  comments: [{ type: Schema.Types.ObjectId, ref: 'comments' }],
});
module.exports = model('spots', Spot);
