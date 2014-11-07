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

chrome.runtime.onUpdateAvailable.addListener(function (details) {
    "use strict";
    console.log("updating to version " + details.version);
    chrome.runtime.reload();
});

chrome.runtime.requestUpdateCheck(function (status) {
    "use strict";
    if (status === "update_available") {
        console.log("update pending...");
    } else if (status === "no_update") {
        console.log("no update found");
    } else if (status === "throttled") {
        console.log("Oops, I'm asking too frequently - I need to back off.");
    }
});