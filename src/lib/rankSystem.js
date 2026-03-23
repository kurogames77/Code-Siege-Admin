export const RANKS = [
    { id: 1, minExp: 0, name: 'SIEGE NOVICE' },
    { id: 2, minExp: 1000, name: 'CODE INITIATE' },
    { id: 3, minExp: 2500, name: 'BINARY APPRENTICE' },
    { id: 4, minExp: 5000, name: 'SYNTAX SOLDIER' },
    { id: 5, minExp: 10000, name: 'DEBUG KNIGHT' },
    { id: 6, minExp: 20000, name: 'SCRIPT MASTER' },
    { id: 7, minExp: 40000, name: 'CODE WARRIOR' },
    { id: 8, minExp: 75000, name: 'SYSTEM SENTINEL' },
    { id: 9, minExp: 125000, name: 'ELITE COMPILER' },
    { id: 10, minExp: 200000, name: 'GRANDMASTER HACKER' },
    { id: 11, minExp: 350000, name: 'APEX LEGEND' },
    { id: 12, minExp: 500000, name: 'SIEGE DEITY' },
];

export const getRankFromExp = (exp) => {
    // Find the highest rank where exp >= minExp
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (exp >= RANKS[i].minExp) {
            return RANKS[i];
        }
    }
    return RANKS[0]; // Fallback
};
