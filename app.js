"use strict"
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var partials = require('express-partials');

// 安装express-session
var session = require('express-session');

// 设置flash
const flash = require('connect-flash');

// mongodb数据库相关代码
var MongoStore = require('connect-mongo');
var { UrlOfDb, NameOfDb } = require('./models/setting');

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(partials()); // 为了引用layout.ejs模板

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 将session数据存入mongodb, 这个会让数据库里面新增一个名字为session的表格。保存session数据。
app.use(session({
  secret: 'hello mongo',
  cookie: { maxAge: 1800000 },
  rolling: true,
  saveUninitialized: true,
  resave: false,
  store: new MongoStore({
    mongoUrl: UrlOfDb + '/' + NameOfDb,
  })
}))

app.use(flash()); // 为了使用req.flash

// 界面提示变量，error，success，user
app.use(function (req, res, next) {
  var error = req.flash('error');
  var success = req.flash('success');
  res.locals.user = req.session.user;
  res.locals.error = error.length ? error : null;
  res.locals.success = success.length ? success : null;
  next();
});

app.get('/', routes.index);
app.get('/u/:user', routes.user);
app.post('/post', routes.postMes);

app.get('/reg', routes.checkNotLogin); // 注册界面应该是没有登录的用户，才可以进行注册
app.get('/reg', routes.reg);

app.post('/reg', routes.checkNotLogin); // 注册之前检验是否登录。注册用户应该是没有登录的用户。
app.post('/reg', routes.doReg);

app.get('/login', routes.checkNotLogin);
app.get('/login', routes.login);

app.post('/login', routes.checkNotLogin);
app.post('/login', routes.doLogin);

app.get('/logout', routes.checkLogin); // 登出，先验证是验证已经登入。登入才有登出。
app.get('/logout', routes.logout);

app.get('/delete', routes.deleteBlog);
app.get('/update', routes.updateBlog);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
