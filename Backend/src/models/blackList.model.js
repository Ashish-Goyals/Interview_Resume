const mongoose = require ('mongoose');

const blackListSchema = new mongoose.Schema (
  {
    token: {
      type: String,
      required: [true, 'Token is required'],
      unique: [true, 'Token already exists in blacklist'],
    },
  },
  {
    timestamps: true,
  }
);

const blackListModel = mongoose.model ('blacklist', blackListSchema);

module.exports = blackListModel;
