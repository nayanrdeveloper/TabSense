import { useState, useEffect } from 'react';

const HEAVY_SITES = [
    'youtube.com',
    'twitch.tv',
    'netflix.com',
    'figma.com',
    'meet.google.com',
    'zoom.us'
];

export function useTabs() {
    const [allTabs, setAllTabs] = useState([]);
    const [inactiveTabs, setInactiveTabs] = useState([]);
    const [duplicateTabs, setDuplicateTabs] = useState([]);
    const [heavyTabs, setHeavyTabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [autoCleanEnabled, setAutoCleanEnabled] = useState(false);

    useEffect(() => {
        fetchTabs();

        // Load Auto Clean setting
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get(['autoCleanEnabled'], (result) => {
                setAutoCleanEnabled(result.autoCleanEnabled || false);
            });
        }

        // Listen for tab updates
        const handleTabUpdate = () => fetchTabs();

        if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.onCreated.addListener(handleTabUpdate);
            chrome.tabs.onUpdated.addListener(handleTabUpdate);
            chrome.tabs.onRemoved.addListener(handleTabUpdate);
        }

        return () => {
            if (typeof chrome !== 'undefined' && chrome.tabs) {
                chrome.tabs.onCreated.removeListener(handleTabUpdate);
                chrome.tabs.onUpdated.removeListener(handleTabUpdate);
                chrome.tabs.onRemoved.removeListener(handleTabUpdate);
            }
        }
    }, []);

    const fetchTabs = async () => {
        setLoading(true);
        try {
            let tabs = [];
            if (typeof chrome !== 'undefined' && chrome.tabs) {
                tabs = await chrome.tabs.query({});
            } else {
                // Mock data for development
                tabs = generateMockTabs();
            }

            setAllTabs(tabs);
            analyzeTabs(tabs);
        } catch (error) {
            console.error("Error fetching tabs:", error);
        } finally {
            setLoading(false);
        }
    };

    const analyzeTabs = (tabs) => {
        const now = Date.now();
        const INACTIVE_THRESHOLD = 30 * 60 * 1000; // 30 minutes

        const inactive = [];
        const duplicatesMap = new Map();
        const duplicates = [];
        const heavy = [];

        tabs.forEach(tab => {
            // Inactive Detection
            // Note: lastAccessed might not update until tab is activated.
            if (tab.lastAccessed && (now - tab.lastAccessed > INACTIVE_THRESHOLD) && !tab.active) {
                inactive.push(tab);
            }

            // Duplicate Detection
            if (tab.url) {
                if (duplicatesMap.has(tab.url)) {
                    const original = duplicatesMap.get(tab.url);
                    // Add both to duplicates list if not already added
                    if (!duplicates.some(d => d.id === original.id)) {
                        duplicates.push(original);
                    }
                    duplicates.push(tab);
                } else {
                    duplicatesMap.set(tab.url, tab);
                }
            }

            // Heavy Detection
            const isAudible = tab.audible;
            const isHeavySite = HEAVY_SITES.some(site => tab.url && tab.url.includes(site));
            if (isAudible || isHeavySite) {
                heavy.push(tab);
            }
        });

        setInactiveTabs(inactive);
        setDuplicateTabs(duplicates);
        setHeavyTabs(heavy);
    };

    const closeTab = async (tabId) => {
        if (typeof chrome !== 'undefined' && chrome.tabs) {
            await chrome.tabs.remove(tabId);
        } else {
            setAllTabs(prev => {
                const newTabs = prev.filter(t => t.id !== tabId);
                analyzeTabs(newTabs);
                return newTabs;
            });
        }
    };

    const closeTabs = async (tabIds) => {
        if (typeof chrome !== 'undefined' && chrome.tabs) {
            await chrome.tabs.remove(tabIds);
        } else {
            setAllTabs(prev => {
                const newTabs = prev.filter(t => !tabIds.includes(t.id));
                analyzeTabs(newTabs);
                return newTabs;
            });
        }
    }

    const groupTabsByDomain = async () => {
        if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.tabs.group) return;

        const tabs = await chrome.tabs.query({ currentWindow: true });
        const groups = {};

        // Group by hostname
        tabs.forEach(tab => {
            if (!tab.url || tab.pinned) return;
            try {
                const url = new URL(tab.url);
                const hostname = url.hostname;
                if (!groups[hostname]) {
                    groups[hostname] = [];
                }
                groups[hostname].push(tab.id);
            } catch (e) {
                // ignore invalid urls
            }
        });

        // Create groups
        for (const [hostname, tabIds] of Object.entries(groups)) {
            if (tabIds.length > 1) { // Only group if > 1 tab
                const groupId = await chrome.tabs.group({ tabIds });
                await chrome.tabGroups.update(groupId, { title: hostname });
            }
        }
    };

    const suspendAllInactive = async () => {
        if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.tabs.discard) return;

        const now = Date.now();
        const INACTIVE_THRESHOLD = 30 * 60 * 1000;

        // Re-fetch to be safe
        const tabs = await chrome.tabs.query({ active: false, audible: false });
        for (const tab of tabs) {
            if (tab.pinned) continue;
            if (tab.lastAccessed && (now - tab.lastAccessed > INACTIVE_THRESHOLD)) {
                await chrome.tabs.discard(tab.id);
            }
        }
        fetchTabs(); // Refresh UI
    };

    const toggleAutoClean = (enabled) => {
        setAutoCleanEnabled(enabled);
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.set({ autoCleanEnabled: enabled });
        }
    };

    return {
        allTabs,
        inactiveTabs,
        duplicateTabs,
        heavyTabs,
        loading,
        autoCleanEnabled,
        closeTab,
        closeTabs,
        groupTabsByDomain,
        suspendAllInactive,
        toggleAutoClean,
        refresh: fetchTabs
    };
}

function generateMockTabs() {
    const now = Date.now();
    return [
        { id: 1, title: 'Google', url: 'https://google.com', lastAccessed: now, active: true, audible: false },
        { id: 2, title: 'YouTube - Relaxing Music', url: 'https://youtube.com/watch?v=123', lastAccessed: now - 1000, active: false, audible: true },
        { id: 3, title: 'Old Article', url: 'https://example.com/article', lastAccessed: now - (35 * 60 * 1000), active: false, audible: false }, // Inactive
        { id: 4, title: 'Google', url: 'https://google.com', lastAccessed: now - 5000, active: false, audible: false }, // Duplicate
        { id: 5, title: 'Figma Design', url: 'https://figma.com/file/123', lastAccessed: now - 10000, active: false, audible: false }, // Heavy
    ];
}
