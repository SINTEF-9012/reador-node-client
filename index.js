/// <reference path="typings/node/node.d.ts"/>
var restler = require('restler');
var Reador;
(function (Reador) {
    var endpoint = "https://app.reador.net";
    var throwError = function (data, response) {
        console.log(data);
        throw new Error("Reador API error (" + response.statusCode + ")");
    };
    var Client = (function () {
        function Client(username, password) {
            this.authentification = { username: username, password: password };
        }
        Client.prototype.Searches = function (callback) {
            var _this = this;
            restler.get(endpoint + '/searches.json', this.authentification).on('success', function (data) {
                //console.log(data);
                var result = [];
                if (data && data.forEach) {
                    data.forEach(function (search) {
                        var s = new Search(_this);
                        s.name = search.name;
                        s.id = parseInt(search.id);
                        s.createdAt = new Date(search.created_at);
                        result.push(s);
                    });
                }
                callback(result);
            }).on('fail', throwError);
        };
        Client.prototype.Search = function (tags, callback, params) {
            var _this = this;
            var name = params && params.name ? params.name : tags.join(" ");
            restler.postJson(endpoint + '/searches/createFromString.json', {
                tags: tags,
                lang: params && params.lang ? params.lang : "en",
                name: name
            }, this.authentification).on('success', function (data) {
                var s = new Search(_this);
                s.name = name, s.id = parseInt(data.id);
                s.createdAt = new Date(data.created_at);
                callback(s);
            }).on('fail', throwError);
        };
        Client.prototype.SearchLoadDelete = function (tags, callback) {
            this.Search(tags, function (search) {
                search.Load(function (t) {
                    callback(t);
                    search.Delete();
                });
            });
        };
        Client.prototype.SearchTagsCloudDelete = function (tags, callback) {
            this.Search(tags, function (search) {
                search.TagsCloud(function (t) {
                    callback(t);
                    search.Delete();
                });
            });
        };
        return Client;
    })();
    Reador.Client = Client;
    var Search = (function () {
        function Search(client) {
            if (!client) {
                throw new Error("A client object is required");
            }
            this._client = client;
        }
        Search.prototype.TagsCloud = function (callback) {
            restler.get(endpoint + '/searches/tagsCloud/' + this.id + '.json', this._client.authentification).on('success', callback).on('fail', throwError);
        };
        Search.prototype.Load = function (callback) {
            restler.get(endpoint + '/searches/' + this.id + '.json', this._client.authentification).on('success', callback).on('fail', throwError);
        };
        Search.prototype.Delete = function (callback) {
            var r = restler.del(endpoint + '/searches/' + this.id, this._client.authentification).on('fail', throwError);
            if (callback) {
                r.on('success', callback);
            }
        };
        return Search;
    })();
    Reador.Search = Search;
})(Reador || (Reador = {}));
module.exports = Reador.Client;
