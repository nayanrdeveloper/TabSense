// Background service worker
console.log("TabSense background service worker loaded.");

const AUTO_CLEAN_ALARM = "auto_clean_check";
const CHECK_INTERVAL_MINUTES = 5;
const INACTIVE_THRESHOLD_MS = 20 * 60 * 1000; // 20 minutes

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
    console.log("TabSense installed.");
    // Create alarm for periodic checks
    chrome.alarms.create(AUTO_CLEAN_ALARM, { periodInMinutes: CHECK_INTERVAL_MINUTES });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === AUTO_CLEAN_ALARM) {
        const result = await chrome.storage.local.get(['autoCleanEnabled']);
        if (result.autoCleanEnabled) {
            console.log("Running Auto Clean...");
            await performAutoClean();
        }
    }
});

async function performAutoClean() {
    try {
        const tabs = await chrome.tabs.query({ active: false, audible: false, hidden: false }); // hidden: false usually means not minimized/in other window? No, hidden means not in current window usually. Just check active: false.
        const now = Date.now();

        for (const tab of tabs) {
            // Skip pinned tabs usually? Let's skip pinned.
            if (tab.pinned) continue;

            if (tab.lastAccessed && (now - tab.lastAccessed > INACTIVE_THRESHOLD_MS)) {
                // Suspend the tab
                try {
                    await chrome.tabs.discard(tab.id);
                    console.log(`Auto-discarded tab: ${tab.id}`);
                } catch (e) {
                    console.warn(`Failed to discard tab ${tab.id}:`, e);
                }
            }
        }
    } catch (err) {
        console.error("Auto Clean Failed:", err);
    }
}
