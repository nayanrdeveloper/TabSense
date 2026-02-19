import { useMemo } from 'react';

export function useHealthScore(tabs, duplicates) {
    const healthData = useMemo(() => {
        let score = 100;
        const penalties = [];
        const bonuses = [];

        // 1. Tab Count Penalty
        // -2 for every tab above 10
        const tabCount = tabs.length;
        if (tabCount > 10) {
            const p = (tabCount - 10) * 2;
            score -= p;
            penalties.push(`-${p} for ${tabCount} open tabs`);
        }

        // 2. Duplicate Penalty
        // -5 for every duplicate group
        const duplicateCount = duplicates.reduce((acc, group) => acc + group.tabs.length, 0);
        if (duplicateCount > 0) {
            const p = duplicateCount * 5;
            score -= p;
            penalties.push(`-${p} for ${duplicateCount} duplicate tabs`);
        }

        // Clamp score
        score = Math.max(0, Math.min(100, score));

        // Determine Rank
        let rank = "Zen Master";
        let color = "text-emerald-400"; // Green
        let barColor = "bg-emerald-500";

        if (score < 50) {
            rank = "Tab Hoarder";
            color = "text-rose-500"; // Red
            barColor = "bg-rose-500";
        } else if (score < 80) {
            rank = "Browser Boss";
            color = "text-amber-400"; // Orange/Yellow
            barColor = "bg-amber-500";
        }

        return {
            score,
            rank,
            color,
            barColor,
            penalties
        };
    }, [tabs, duplicates]);

    return healthData;
}
