chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.links) {
    sendResponse({ status: "Links received" });
  }
});
