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

// --- Focus Mode Logic ---

let focusState = {
    active: false,
    endTime: null,
    allowList: [] // Domains allowed
};

// Restore state on startup
chrome.storage.local.get(['focusState'], (result) => {
    if (result.focusState) {
        focusState = result.focusState;
        // If expired while closed, reset
        if (focusState.active && Date.now() > focusState.endTime) {
            endFocusSession();
        }
    }
});

// Listener for tab updates to enforce blocking
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!focusState.active || !tab.url) return;

    try {
        const url = new URL(tab.url);
        // Skip internal pages
        if (url.protocol === 'chrome:' || url.protocol === 'chrome-extension:' || url.protocol === 'about:') return;

        const hostname = url.hostname;

        // If strictly allowlist mode: Block if NOT in allowList
        // Simple check: is the hostname in the allowList?
        // Note: allowList should be specific domains like "google.com"
        const isAllowed = focusState.allowList.some(allowed => hostname.includes(allowed));

        if (!isAllowed) {
            // Redirect to blocked page
            const blockedUrl = chrome.runtime.getURL("focus.html");
            if (tab.url !== blockedUrl) {
                chrome.tabs.update(tabId, { url: blockedUrl });
            }
        }
    } catch (e) {
        // ignore invalid urls
    }
});

// Alarm for focus timer
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "focus_timer_end") {
        endFocusSession();
    }
});

function endFocusSession() {
    focusState.active = false;
    focusState.endTime = null;
    chrome.storage.local.set({ focusState });
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'vite.svg', // validation: make sure icons exist or use default
        title: 'TabSense Focus',
        message: 'Focus session completed! Great job.'
    });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startFocus") {
        focusState.active = true;
        focusState.endTime = Date.now() + (request.duration * 60 * 1000);
        focusState.allowList = request.allowList || [];

        // Save state
        chrome.storage.local.set({ focusState });
        chrome.alarms.create("focus_timer_end", { delayInMinutes: request.duration });

        // Immediately enforce on current tabs
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                if (!tab.url) return;
                try {
                    const url = new URL(tab.url);
                    if (url.protocol === 'chrome:' || url.protocol === 'chrome-extension:' || url.protocol === 'about:') return;

                    const hostname = url.hostname;
                    const isAllowed = focusState.allowList.some(allowed => hostname.includes(allowed));

                    if (!isAllowed) {
                        chrome.tabs.update(tab.id, { url: chrome.runtime.getURL("focus.html") });
                    }
                } catch (e) { }
            });
        });

        sendResponse({ success: true });
    } else if (request.action === "stopFocus") {
        focusState.active = false;
        focusState.endTime = null;
        chrome.storage.local.set({ focusState });
        chrome.alarms.clear("focus_timer_end");
        sendResponse({ success: true });
    } else if (request.action === "getFocusStatus") {
        sendResponse({ active: focusState.active, endTime: focusState.endTime, allowList: focusState.allowList });
    }
    return true; // Keep channel open
});

