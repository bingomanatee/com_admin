var NE = require('nuby-express');
var mm = NE.deps.support.mongoose_model;
var mongoose = NE.deps.mongoose;
var util = require('util');
var _ = require('underscore');
var Gate = NE.deps.support.Gate;

var constraint = new mongoose.Schema({
    type:String,
    value:mongoose.Schema.Types.Mixed
});

var schema = new mongoose.Schema({
    src:{type:String, required:true},
    class:{type:String, required:true},
    name:{type:String, required:true, unique: true},
    data_type:{type:String, enum:['number', 'date', 'daterange', 'string', 'text']},
    default:mongoose.Schema.Types.Mixed,
    notes:String,
    value:mongoose.Schema.Types.Mixed,
    deleted:{type:Boolean, default:false}
});

schema.statics.active = function (cb) {
    return this.find('deleted', {'$ne':true}).run(cb);
}

schema.statics.inactive = function (cb) {
    return this.find('deleted', true).run(cb);
}

var _model = mm.create(schema,
    {
        name:"cc_options",
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
                        cb(null, opt_values);
                    }
                });
            } else {
                this.get({name:name}, function (err, opt) {
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
            var keys = _.sortBy(_.keys(opts), _.identity);

            this.find({name:{"$in":keys}}, function (err, opt_records) {
                if (opt_records.length < keys.length) {
                    return cb(new Error('could not find all the keys'));
                }

                var keyed_records = _.reduce(opt_records, function (kr, record) {
                    kr[record.name] = record;
                    return kr;
                }, {});

               if (_.isEqual(_.sortBy(_.keys(keyed_records), _.identity), keys)){
                   _.each(keyed_records, function(record, key){
                        record.value = opts[key];
                       record.save(); // @TODO: care about response?
                   });
                   cb(null, keyed_records);
               } else {
                   cb(new Error('bad match of keys'));
               }
            })
        }
    }
);

module.exports = function () {
    return _model;
}
