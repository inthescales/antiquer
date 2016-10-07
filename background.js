chrome.contextMenus.removeAll();
chrome.contextMenus.create({
      title: "first",
      contexts: ["browser_action"],
      onclick: function() {
        alert('first');
      }
});