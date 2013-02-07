/*!
 * Copyright (c) 2011 Chris Osborn
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * Author: Chris Osborn
 * Date: 9/6/11
 */

"use strict";

/**
 * @namespace
 */
function MonkeyPatcher() {
    this.patches = [];
}

var mp_singleton;

/**
 *
 * @param {function} cb
 */
MonkeyPatcher.setUp = function(cb) {
    if (mp_singleton) {
        throw new Error('MonkeyPatcher.setUp() called, but already set up');
    }
    mp_singleton = new MonkeyPatcher();
    cb && cb();
};

/**
 *
 * @param {function} cb
 */
MonkeyPatcher.tearDown = function(cb) {
    if (!mp_singleton) {
        throw new Error('MonkeyPatcher.tearDown() called, but not previously set up');
    }
    mp_singleton.tearDown();
    mp_singleton = null;
    cb && cb();
};


/**
 * Patch the attr property on object to have the given value. The patch
 * will be removed and the original value restored when tearDown() is called.
 *
 * @param object
 * @param attr
 * @param value
 */
MonkeyPatcher.prototype.patch = function(object, attr, value) {
    if (typeof object[attr] === typeof value) {
        this.patches.push({
            object: object,
            attr: attr,
            original: object[attr]
        });
        object[attr] = value;
    } else {
        throw new Error('monkey patched "' + attr + '" value does not match type of existing property');
    }
};

MonkeyPatcher.patch = function() {
    if (!mp_singleton) {
        throw new Error('MonkeyPatcher is not set up');
    }
    return mp_singleton.patch.apply(mp_singleton, arguments);
};

/**
 * Like patch(), but intended for wrapping methods when the wrapper needs
 * access to the original method implementation. Within the body of the
 * given method it is possible to call this.wrappedMethod() to invoke
 * the original.
 *
 * @param object
 * @param attr
 * @param method
 */
MonkeyPatcher.prototype.wrap = function(object, attr, method) {
    if (typeof object[attr] !== 'function') {
        throw new Error('only function properties can be wrapped');
    }
    var wrapped = object[attr];
    this.patch(object, attr, function() {
        Object.defineProperty(this, 'wrappedMethod', {
            'value': wrapped,
            'enumerable': false,
            'configurable': true
        });
        var ret = method.apply(this, arguments);
        delete this.wrappedMethod;
        return ret;
    });
};

MonkeyPatcher.wrap = function() {
    if (!mp_singleton) {
        throw new Error('MonkeyPatcher is not set up');
    }
    return mp_singleton.wrap.apply(mp_singleton, arguments);
};

/**
 * Tear down this MonkeyPatcher, removing all patches and restoring
 * the patched objects to their original states.
 */
MonkeyPatcher.prototype.tearDown = function() {
    var patch;
    while (patch = this.patches.pop()) {
        patch.object[patch.attr] = patch.original;
    }
};

exports.MonkeyPatcher = MonkeyPatcher;
