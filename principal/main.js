/*jslint browser: true, devel: true*/
/*global chrome */

window.onclick = function () {
    "use strict";
    chrome.app.window.create('principal/main.html', {
        id: 'RhsConex',
        frame: 'chrome',
        bounds: {
            'width': 624,
            'height': 735
        },
        maxWidth: 1070,
        minWidth: 624
    });

    window.close();

};