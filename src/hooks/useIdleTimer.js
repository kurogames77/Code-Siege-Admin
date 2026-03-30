import { useEffect, useRef, useState, useCallback } from 'react';

const IDLE_TIMEOUT = 5 * 60 * 1000;   // 5 minutes
const WARNING_AT   = 4 * 60 * 1000;   // Show warning at 4 minutes (60s before logout)
const CHECK_INTERVAL = 1000;           // Check every second

/**
 * Tracks user activity and returns idle state.
 * - `isWarning`    : true when idle for 4+ minutes (warning phase)
 * - `secondsLeft`  : countdown seconds until auto-logout (only meaningful when isWarning)
 * - `isTimedOut`   : true when 5 minutes elapsed — consumer should trigger logout
 * - `resetTimer()` : manually reset the idle clock (e.g. user clicks "Stay Logged In")
 */
const useIdleTimer = () => {
    const lastActivity = useRef(Date.now());
    const [isWarning, setIsWarning] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(60);
    const [isTimedOut, setIsTimedOut] = useState(false);

    const resetTimer = useCallback(() => {
        lastActivity.current = Date.now();
        setIsWarning(false);
        setSecondsLeft(60);
        setIsTimedOut(false);
    }, []);

    useEffect(() => {
        // ── Activity listeners ──────────────────────────────────
        const EVENTS = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart', 'pointerdown'];

        const handleActivity = () => {
            // Only reset if we're NOT already in the warning phase.
            // During warning the user must explicitly click "Stay Logged In".
            if (!isWarning) {
                lastActivity.current = Date.now();
            }
        };

        EVENTS.forEach(evt => window.addEventListener(evt, handleActivity, { passive: true }));

        // ── Idle checker ────────────────────────────────────────
        const interval = setInterval(() => {
            const elapsed = Date.now() - lastActivity.current;

            if (elapsed >= IDLE_TIMEOUT) {
                setIsTimedOut(true);
                setIsWarning(false);
            } else if (elapsed >= WARNING_AT) {
                setIsWarning(true);
                const remaining = Math.ceil((IDLE_TIMEOUT - elapsed) / 1000);
                setSecondsLeft(Math.max(remaining, 0));
            } else {
                setIsWarning(false);
                setSecondsLeft(60);
            }
        }, CHECK_INTERVAL);

        return () => {
            EVENTS.forEach(evt => window.removeEventListener(evt, handleActivity));
            clearInterval(interval);
        };
    }, [isWarning]);

    return { isWarning, secondsLeft, isTimedOut, resetTimer };
};

export default useIdleTimer;
