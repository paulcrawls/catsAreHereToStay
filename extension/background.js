chrome.browserAction.onClicked.addListener(function(tab) {
  var catsLoaded = false;
  chrome.tabs.executeScript(null, {file: "cats.js"}, function() {
      if (!catsLoaded) {
          chrome.tabs.executeScript({code: '$("body").catsJS();'});
          catsLoaded = true;
      }
  });
});