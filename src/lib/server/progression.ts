export const BASE_APPROVAL_XP = 20;
export const FIVE_STAR_BONUS_XP = 5;

export function calculateLevelFromXp(xp: number): number {
	const safeXp = Number.isFinite(xp) ? Math.max(0, Math.floor(xp)) : 0;
	return Math.floor(Math.sqrt(safeXp / 20)) + 1;
}

export function xpRequiredForLevel(level: number): number {
	const safeLevel = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;
	return 20 * (safeLevel - 1) * (safeLevel - 1);
}

const LEVEL_TITLES: Record<number, string> = {
	1: 'Helper',
	2: 'Fixer',
	3: 'Reliable',
	4: 'Neighborhood Hero',
	5: 'Guild Champion'
};

export function levelTitleFor(level: number): string | null {
	return LEVEL_TITLES[level] ?? null;
}
