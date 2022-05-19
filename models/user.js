// 用户名和密码 模型数据
var MongoClient = require('mongodb').MongoClient;
var { UrlOfDb, NameOfDb, NameOfUser } = require('./setting')

function User(name, password) {
    this.name = name;
    this.password = password;
};

module.exports = User;

// 方法放到原型对象上面
User.prototype.save = function save(callback) {
    // 存入 Mongodb 的文档
    var user = {
        name: this.name,
        password: this.password,
    };
    MongoClient.connect(UrlOfDb, function (err, client) {
        if (err) {
            return callback(err);
        }
        var DataBase = client.db(NameOfDb); // 创建数据库
        var Collection = DataBase.collection(NameOfUser); // 连接到表
        // 插入 user 数据
        Collection.insertOne(user, { safe: true }, function (err, user) {
            if(err) {
                return callback(err);
            }
            client.close();
            callback(err, user);
        });
    });
};

// 此方法写在构造函数上面
User.get = function get (name, callback) {
    MongoClient.connect(UrlOfDb, function(err, client) {
        if(err) {
            return callback(err)
        }
        var DataBase = client.db(NameOfDb)
        var collection = DataBase.collection(NameOfUser)
        collection.find({ 'name': name }).toArray(function(err, result) {
            if(err) {
                return callback(err)
            }
            client.close()
            callback(err, result)
        })
    })
}