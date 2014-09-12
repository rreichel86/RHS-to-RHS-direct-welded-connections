window.onclick = function () {
    chrome.app.window.create('main.html', {
        id: 'RhsConex',
        frame: 'chrome',
        bounds: {
            'width': 624,
            'height': 735,
        },
        maxWidth: 1070,
        minWidth: 624
    });

    window.close()

}