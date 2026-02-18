// Background service worker
console.log("TabSense background service worker loaded.");

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
    console.log("TabSense installed.");
});
