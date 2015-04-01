'use strict';

var MonkeyPatcher = require('../..').MonkeyPatcher;

exports.success = function(test) {

    var obj = {
        method: function method(arg1, arg2) {
            test.equal(this, obj);
            test.equal(arg1, '<arg1>');
            test.equal(arg2, '<arg2>');
        }
    };

    MonkeyPatcher.tap(obj, 'method', function(arg1, arg2) {
        test.equal(this, obj);
        test.equal(arg1, '<arg1>');
        test.equal(arg2, '<arg2>');
    });

    test.expect(6);
    obj.method('<arg1>', '<arg2>');
    test.done();
};