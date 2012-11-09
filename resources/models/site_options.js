var NE = require('nuby-express');
var mm = NE.deps.support.mongoose_model;
var util = require('util');
var _ = require('underscore');
var _DEBUG = false;

var _model;

var _model_def = {
    name:"site_options",
    type:"model",
    option_value:function (name, cb) {
        var self = this;
        if (_.isArray(name)) {
            this.find({name:{"$in":name}}, function (err, opts) {
                if (err) {
                    cb(err);
                } else {
                    var opt_values = {};
                    name.forEach(function (n) {
                        opt_values[n] = null;
                    });
                    opts.forEach(function (o) {
                        opt_values[o.name] = o.value
                    });
                    if (_DEBUG) console.log('returning opt values: %s', util.inspect(opt_values));
                    cb(null, opt_values);
                }
            });
        } else {
            this.find_one({name:name}, function (err, opt) {
                if (err) {
                    cb(err);
                } else if (opt) {
                    cb(null, opt.value);
                } else {
                    cb(new Error('cannot find option ' + name));
                }
            })
        }
    },

    reload_cache: function(cb){
        _model.cache = {};
        _model.active(function (err, records) {
                    if (records) {
                        _.each(records, function (r) {
                            _model.cache[r.name] = r.value;
                        })
                    }
                    if (cb){
                        cb(null, _model.cache);
                    }
                });
    },

    read_resource_options:function (src) {
        var opts = src.direct_config('options');
        if (opts && _.isArray(opts)) {
            opts.forEach(function (opt) {
                opt.src = src.path;
                _model.find_one({name:opt.name}, function (err, opt_record) {
                    if (opt_record) {
                    } else {
                        _model.put(opt, function (err, saved_new_record) {
                            if (err) {
                                throw err;
                            } else if (saved_new_record) {
                                saved_new_record.value = opt.default;
                                saved_new_record.save();
                            }
                        })
                    }
                })
            })
        }
    },

    cache:false,

    get_cache:function (cb) {
        if (cb) {
            this.reload_cache(cb);
        } else {
            return _.clone(_model.cache);
        }
    },

    /**
     * note EVERY key passed must exist or NO values are set.
     * Also, this method does NOT confirm changes.
     *
     * @param opts
     * @param cb
     * @return {*}
     */
    set_options:function (opts, cb) {
        if (!opts) return cb(new Error('no opts passed'));
        if (!_.isObject(opts)) return cb(new Error('opts are not object'));

        var self = this;
        var keys = _.keys(opts);
        console.log('looking to set options %s', util.inspect(keys));

        this.find({name:{"$in":keys}}, function (err, opt_records) {
            if (err) {
                cb(err);
            } else {
                console.log('found %s records', opt_records.length);
                opt_records.forEach(function (opt_record) {
                    if (opts.hasOwnProperty(opt_record.name)) {
                        var value = opts[opt_record.name];
                        if (_DEBUG || 1) console.log('setting value of %s to %s', util.inspect(opt_record.toJSON()), value);
                        opt_record.value = value;
                        opt_record.save();
                    }
                });

                cb(null, opt_records);
            }
        })
    }
}

module.exports = function (mongoose_inject) {

    if (!_model) {
        if (!mongoose_inject) {
            mongoose_inject = NE.deps.mongoose;
        }

        var schema = new mongoose_inject.Schema({
            src:{type:String, required:true},
            name:{type:String, required:true, unique:true},
            data_type:{type:String, enum:['number', 'date', 'daterange', 'string', 'text']},
            default:mongoose_inject.Schema.Types.Mixed,
            notes:String,
            value:mongoose_inject.Schema.Types.Mixed,
            deleted:{type:Boolean, default:false}
        });

        _model= mm.create(schema, _model_def, mongoose_inject);

        _model.reload_cache();
    }

    return _model;
}
