require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.connect(process.env['MONGO_URI']);

const { User, createUser } = require('./model/user.model');
const { createExercise } = require('./model/exercise.model');

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

/**
 * 应用首页
 */
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

/**
 * 创建新用户
 */
app.post('/api/users', (req, res) => {
  let username = req.body.username;

  if (!username) {
    return res.json({ error: '请填写用户名' });
  }

  createUser({ username }, (error, data) => {
    if (error) return res.json({ error });
    res.json(data);
  });
});

/**
 * 获取所有用户
 */
app.get('/api/users', async (_req, res) => {
  const users = await User.find();
  res.json(users);
});

/**
 * 按 _id || username 删除用户
 */
app.delete('/api/users', async (req, res) => {
  let deletedCount = 0;

  if (req.query.id && req.query.id !== '') {
    const result = await User.deleteMany({ _id: req.query.id });
    deletedCount += result.deletedCount;
  }

  if (req.query.username && req.query.username !== '') {
    const result = await User.deleteMany({ username: req.query.username });
    deletedCount += result.deletedCount;
  }

  res.send(`成功删除 ${deletedCount} 个用户`);
});

/**
 * 创建新运动
 */
app.post('/api/users/:uid/exercises', async (req, res) => {
  const uid = req.params.uid;
  const user = await User.findById(uid);
  const username = user.username;

  req.body.user = user; // or user._id

  createExercise(req.body, (error, data) => {
    if (error) return res.json({ error });
    const description = data.description;
    const duration = data.duration;
    const date = data.date;

    res.json({ username, description, duration, date, _id: uid });
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
