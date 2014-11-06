/*jslint browser: true, devel: true*/
/*global chrome */

chrome.app.runtime.onLaunched.addListener(function () {
    "use strict";
    chrome.app.window.create('principal/portada.html', {
        frame: 'none',
        'bounds': {
            'width': 700,
            'height': 400
        }
    });
});
