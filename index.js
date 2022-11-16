require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.connect(process.env['MONGO_URI']);

const { User, createUser } = require('./model/user.model');
const { Exercise, createExercise } = require('./model/exercise.model');

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
    const date = new Date(data.date).toDateString();

    res.json({ username, description, duration, date, _id: uid });
  });
});

/**
 * 获取 _id 用户的 exercise 运动日志
 * Solution 1
 */
app.get('/api/users/:uid/logs', async (req, res) => {
  const uid = req.params.uid;
  if (!/\w{24}/.test(uid)) return res.json({ error: 'uid 不正确' });

  const user = await User.findById(uid);
  if (user === null) return res.json({ error: `uid: ${uid} 不存在` });
  const username = user.username;

  // 初始按日期过滤参数
  let { from, to, limit } = req.query;
  if (!from) from = '1970-01-01';
  if (!to) to = Date();

  // 处理统计字段 && 定义查询过滤对象 && 及查询数量参数
  const queryfilter = { user: uid, date: { $gt: from, $lt: to } };
  let count = await Exercise.countDocuments(queryfilter);

  if (limit && limit !== '0') {
    limit = Number.parseInt(limit);
    count = Math.min(count, limit);
  }

  // 获取运动列表
  const exercises = await Exercise.find(
    queryfilter,
    'description duration date -_id',
    { limit: limit }
  );

  const log = exercises.map(item => {
    item = item.toObject(); // 转为普通对象，方便修改对象的值
    item.date = new Date(item.date).toDateString();
    return item;
  });

  res.json({ _id: uid, username, count, log });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
