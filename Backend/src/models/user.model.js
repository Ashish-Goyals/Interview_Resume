const mongoose = require ('mongoose');

const userSchema = new mongoose.Schema ({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: [true, 'Username already takens'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: [true, 'Email already takens'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false,
  },
});

const userModel = mongoose.model ('users', userSchema);

module.exports = userModel;
