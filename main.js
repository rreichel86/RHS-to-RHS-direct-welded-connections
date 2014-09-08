chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('portada.html', {
    frame: 'none',  
    'bounds': {
      'width': 700,
      'height': 400
    }
      
  });
});
