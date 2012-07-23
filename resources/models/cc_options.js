var NE = require('nuby-express');
var mm = NE.deps.support.mongoose_model;
var mongoose = NE.deps.mongoose;
var util = require('util');
var _ = require('underscore');

var constraint = new mongoose.Schema({
   type: String,
    value: mongoose.Schema.Types.Mixed
});

var schema = new mongoose.Schema({
    src: {type: String, required: true},
    class: {type: String, required: true},
    name: {type: String, required: true},
    data_type: {type: String, enum: ['number', 'date', 'daterange', 'string', 'text']},
    default: mongoose.Schema.Types.Mixed,
    notes: String,
    value: mongoose.Schema.Types.Mixed,
    deleted: {type: Boolean, default: false}
});

schema.statics.active = function (cb) {
    return this.find('deleted', {'$ne':true}).run(cb);
}

schema.statics.inactive = function (cb) {
    return this.find('deleted', true).run(cb);
}

var _model = mm.create(schema,
    {name:"cc_options", type:"model"}
);

module.exports = function () {
    return _model;
}
