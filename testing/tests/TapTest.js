'use strict';

var MonkeyPatcher = require('../..').MonkeyPatcher;

exports.success = function(test) {

    var obj = {
        method: function method(arg1, arg2) {
            test.equal(this, obj);
            test.equal(arg1, '<arg1>');
            test.equal(arg2, '<arg2>');
            return '<return-value>';
        }
    };

    MonkeyPatcher.tap(obj, 'method', function(arg1, arg2) {
        test.equal(this, obj);
        test.equal(arg1, '<arg1>');
        test.equal(arg2, '<arg2>');
    });

    test.expect(7);
    test.equal(obj.method('<arg1>', '<arg2>'), '<return-value>');
    test.done();
};