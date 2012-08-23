function _comp(c1, c2) {
    if (c1 > c2) {
        return 1;
    } else if (c1 < c2) {
        return -1;
    } else {
        return 0;
    }
}

/**
* complement to jQuery's serializeArray - compacts the returned array as an object
 * @param form_data: Object
 * @return {Object}
 * @private
 */
function deserialize(form_data) {
    var out = {};

    _.each(form_data, function (field) {
        if (out[field.name]) {
            if (!_.isArray(out[field.name])) {
                out[field.name] = [out[field.name]];
            }
            out[field.name].push(field.value);
        } else {
            out[field.name] = field.value;
        }

    });

    return out;
}

/* Extend jQuery with functions for PUT and DELETE requests. */

function _ajax_request(url, data, callback, type, method) {
    if (!type){ type = 'JSON'}
    if (jQuery.isFunction(data)) {
        method = type;
        type = callback;
        callback = data;
        data = {};
    }
    return jQuery.ajax({
        type: method,
        url: url,
        data: data,
        success: callback,
        dataType: type
    });
}

jQuery.extend({
    put: function(url, data, callback, type) {
        return _ajax_request(url, data, callback, type, 'PUT');
    },
    delete_: function(url, data, callback, type) {
        return _ajax_request(url, data, callback, type, 'DELETE');
    }
});