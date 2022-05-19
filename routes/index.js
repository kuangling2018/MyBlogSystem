var User = require('../models/user');
var Post = require('../models/post');
const { Route } = require('express');

/* GET home page. */
var index = function (req, res) {
  console.log('首页输出session数据', req.session);
  Post.get(null, function(err, result) {
    if(err) {
      result = []
    } 
    res.render('index', {
      title: '首页界面',
      layout: 'layout',
      posts: result,
    });
  })
};

var updateBlog = function (req, res) {
  const { time, mes, isIndex } = req.query;
  const [ digitalTime, name ] = time.split('_');
  var post = new Post(name, mes, digitalTime);
  post.update(function(err) {
    if(err) {
      req.flash('error', err);
      return
    }
    if(isIndex) {
      return res.redirect('/');
    }
    res.redirect('/u/' + name);
  });
}

var deleteBlog = function (req, res) {
  const { time, isIndex } = req.query;
  const name = time.split('_')[1];
  Post.deleteBLog(time, function(err, result) {
    if(err) {
      req.flash('error', err)
      return
    }
    if(isIndex) { // 首页删除
      return res.redirect('/');
    }
    res.redirect('/u/' + name); // 用户界面删除
  })
};

// 某个用户的微博
var user = function (req, res) {
  var { user: name } = req.params
  Post.get(name, function(err, result) {
    if(err) {
      req.flash('error', err)
      return redirect('/')
    }
    res.render('users', {
      title: name,
      layout: 'layout',
      posts: result,
    });
  })
};

// 发表微博
var postMes = function (req, res) {
  var { mes } = req.body;
  var { name } = req.session.user;
  var post = new Post(name, mes);
  post.save(function(err) {
    if(err) {
      req.flash('error', err)
      return res.redirect('/')
    }
    res.redirect('/')
  })
};

var reg = function (req, res) {
  res.render('reg', {
    title: '注册界面',
    layout: 'layout',
  });
};

var doReg = function (req, res) {
  var { password, passwordRepeat, name } = req.body
  if( name.length == 0 ) {
    req.flash('error', '用户名不能为空');
    return res.redirect('/reg')
  }  
  if( password !== passwordRepeat) {
    req.flash('error', '两次输入密码不一致');
    return res.redirect('/reg')
  }
  var user = new User(name, password);
  User.get(name, function(err, result){
    if(result.length > 0) {
      err = '此用户名已经注册';
    }
    if(err) {
      req.flash('error', err)
      return res.redirect('/reg')
    }
    user.save(function(err) {
      if(err) {
        req.flash('error', err)
        return res.redirect('/reg')
      }
      req.session.user = user;
      // 把数据存入session里面，方便以后验证用户是否登录
      req.flash('success', '注册成功');
      res.redirect('/')
    })
  })
};

var login = function (req, res) {
  res.render('login', {
    title: '登录界面',
    layout: 'layout',
  });
};

var doLogin = function (req, res) {
  var { password, name } = req.body
  if (password.length == 0 || name.length == 0 ) {
    req.flash('error', '用户名或密码不能为空');
    return res.redirect('/login')
  }
  User.get(name, function(err, result) {
    if(result.length == 0 || result[0].password !== password) {
      err = '用户名或者密码不正确';
    }
    if(err) {
      req.flash('error', err)
      return res.redirect('/login')
    }
    req.session.user = req.body;
    req.flash('success', '登录成功');
    res.redirect('/')
  })
};

var logout = function (req, res) {
  req.session.user = null // 把null存入session里面
  req.flash('success', '登出成功');
  res.redirect('/')
};

var checkLogin = function(req, res, next) {
  if(!req.session.user) {
    req.flash('error', '未登入');
    return res.redirect('/login');
  }
  next()
}

var checkNotLogin = function(req, res, next) {
  if(req.session.user) {
    req.flash('error', '已登入');
    return res.redirect('/');
  }
  next();
}

module.exports = {
  index,
  user,
  postMes,
  reg,
  doReg,
  login,
  doLogin,
  logout,
  deleteBlog,
  updateBlog,
  checkNotLogin,
  checkLogin
}
