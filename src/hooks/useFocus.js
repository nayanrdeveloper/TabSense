import { useState, useEffect } from 'react';

export function useFocus() {
    const [isFocusActive, setIsFocusActive] = useState(false);
    const [focusEndTime, setFocusEndTime] = useState(null);
    const [allowList, setAllowList] = useState([]);

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 1000); // Poll status/timer
        return () => clearInterval(interval);
    }, []);

    const checkStatus = () => {
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage({ action: "getFocusStatus" }, (response) => {
                if (response) {
                    setIsFocusActive(response.active);
                    setFocusEndTime(response.endTime);
                    setAllowList(response.allowList || []);
                }
            });
        }
    };

    const startFocus = (duration, allowedDomains) => {
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage({
                action: "startFocus",
                duration: duration,
                allowList: allowedDomains
            }, () => {
                checkStatus();
            });
        } else {
            console.log("Mock Start Focus", duration, allowedDomains);
            setIsFocusActive(true);
            setFocusEndTime(Date.now() + duration * 60 * 1000);
        }
    };

    const stopFocus = () => {
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage({ action: "stopFocus" }, () => {
                checkStatus();
            });
        } else {
            setIsFocusActive(false);
        }
    };

    return {
        isFocusActive,
        focusEndTime,
        allowList,
        startFocus,
        stopFocus
    };
}
