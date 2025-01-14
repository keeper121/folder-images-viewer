document.getElementById("load-gallery").addEventListener("click", () => {
  injectAndOpenGallery();
});

/**
 * Inject the content script into the active tab and open the gallery
 */
function injectAndOpenGallery() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;

    // Inject the content script into the active tab
    chrome.scripting.executeScript(
      {
        target: { tabId },
        files: ["content.js"],
      },
      () => {
        console.log("Content script injected successfully!");
        // Send a message to the content script to open the gallery
        chrome.tabs.sendMessage(tabId, { action: "openGallery" }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error sending message:", chrome.runtime.lastError);
          } else {
            console.log("Response from content script:", response);
          }
          window.close(); // Closes the popup
        });
      }
    );
  });
}