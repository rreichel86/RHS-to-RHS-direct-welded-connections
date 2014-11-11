/*jslint browser: true, devel: true*/
/*global chrome */

window.onclick = function () {
    "use strict";
    chrome.app.window.create('principal/main.html', {
        id: 'RhsConex',
        frame: 'chrome',
        bounds: {
            "left": 0,
            "top": 0,
            'width': 624,
            'height': 734
        },
        maxWidth: 624,
        minWidth: 624
    });
    window.close();

};