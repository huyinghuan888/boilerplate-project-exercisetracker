const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

/**
 * 创建新用户
 */
function createUser(userDto, result) {
  const user = new User(userDto);

  user.save((error, data) => {
    if (error) return result(error.message);
    result(null, data);
  });
}

exports.User = User;
exports.createUser = createUser;
