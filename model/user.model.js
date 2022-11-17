const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true }
});
// get '/api/users/:uid/logs' - Solution 2
// 添加虚拟字段
// userSchema.virtual('exercises', {
//   ref: 'Exercise',
//   localField: '_id',
//   foreignField: 'user',
//   justOne: false
// });

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
