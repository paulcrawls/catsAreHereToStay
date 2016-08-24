chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.executeScript(null, {file: "cats.js"}, function() {
      chrome.tabs.executeScript({code: '$("body").catsJS();'});
  });
});