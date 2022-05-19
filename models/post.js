// 博客 数据模型
var MongoClient = require('mongodb').MongoClient;
var { UrlOfDb, NameOfDb, NameOfBlog } = require('./setting');

function Post(name, mes, time) {
    this.name = name
    this.mes = mes
    if(time) {
        this.time = time + '_' + name;
    } else {
        this.time = new Date().getTime() + '_' + name
    }
}

module.exports = Post

Post.prototype.save = function save(callback) {
    const post = {
        name: this.name,
        mes: this.mes,
        time: this.time,
    }
    MongoClient.connect(UrlOfDb, function(err, client) {
        if(err) {
            return callback(err)
        }
        var DataBase = client.db(NameOfDb)
        var Collection = DataBase.collection(NameOfBlog)
        Collection.insertOne(post, { safe: true }, function(err, result) {
            if(err) {
                return callback(err)
            }
            client.close()
            callback(err, result)
        })
    })
}

Post.prototype.update = function update(callback) {
    const filter = { time: this.time };
    const updateData = { $set: { mes: this.mes }};
    MongoClient.connect(UrlOfDb, function(err, client) {
        if(err) {
            return callback(err)
        }
        var DataBase = client.db(NameOfDb)
        var Collection = DataBase.collection(NameOfBlog)
        Collection.updateOne(filter, updateData, function(err, result) {
            if(err) {
                return callback(err)
            }
            client.close()
            callback(err, result)
        })
    })
}

Post.get = function get(name, callback) {
    var query = {};
    if(name) {
        query.name = name
    }
    MongoClient.connect(UrlOfDb, function(err, client){
        if(err) {
            return callback(err)
        }
        var DataBase = client.db(NameOfDb);
        var Collection = DataBase.collection(NameOfBlog);
        Collection.find(query).sort({ time: -1 }).toArray(function(err, result) {
            if(err) {
                return callback(err)
            }
            client.close()
            callback(err, result)
        })
    })
}

Post.deleteBLog = function deleteBlog(time, callback) {
    MongoClient.connect(UrlOfDb, function(err, client){
        if(err) {
            return callback(err)
        }
        var DataBase = client.db(NameOfDb);
        var Collection = DataBase.collection(NameOfBlog);
        Collection.deleteOne({'time': time }, function(err, result) {
            if(err) {
                return callback(err)
            }
            client.close()
            callback(err, result)
        })
    })
}

