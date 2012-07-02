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
    component: {type: String, required: true, validate: /[a-z_]+/},
    name: {type: String, required: true, validate: /[a-z_]+/},
    data_type: {type: String, enum: ['number', 'date', 'daterange', 'string' ]},
    constraint: [constraint],
    default: mongoose.Schema.Types.Mixed,
    deleted: {type: Boolean, default: false}
});

schema.statics.active = function (cb) {
    return this.find('deleted', {'$ne':true}).run(cb);
}

schema.statics.inactive = function (cb) {
    return this.find('deleted', true).run(cb);
}

var _model = mm.create(schema,
    {name:"config_template", type:"model"}
);

module.exports = function () {
    return _model;
}
