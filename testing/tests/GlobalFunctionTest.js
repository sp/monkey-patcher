'use strict';

var MonkeyPatcher = require('../..').MonkeyPatcher;
var fs = require('fs');

exports['fs.existsSync'] = {

    'works as a global function' : function(test) {

        //for some reason some code stores a reference to existsSync
        var existsSync = fs.existsSync;

        //baseline - existsSync works even when invoked as a global method
        test.ok(fs.existsSync('package.json'));
        test.ok(existsSync('package.json'));

        test.done();
    },

    'can be wrapped with MonkeyPatcher' : function(test) {

        //Use monkey-patcher to wrap fs.existsSync
        MonkeyPatcher.setUp();
        MonkeyPatcher.wrap(fs, 'existsSync', function(filePath) {

          if (filePath === 'package.json')
            return false;
          else
            return this.wrappedMethod.apply(fs, arguments);
        });

        //for some reason code takes stores reference to wrapped version
        var existsSync = fs.existsSync;

        //wrap works when fs.existsSync invoked as method
        test.ok(!fs.existsSync('package.json'));

        //wrap works when existsSync invoked as global function
        test.ok(!existsSync('package.json'));

        test.done();
    }
};
