import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { toRows } from '$lib/server/db/result';

const EARLY_ADOPTER_CUTOFF = new Date(
	process.env.BADGE_EARLY_ADOPTER_CUTOFF ?? '2026-03-31T23:59:59.000Z'
);

type BadgeSeed = {
	key: string;
	name: string;
	description: string;
	badgeType: string;
	categorySlug: string | null;
	iconValue: string | null;
	imageUrl: string | null;
	sortOrder: number;
};

const STARTER_BADGES: BadgeSeed[] = [
	{
		key: 'early_adopter',
		name: 'Early Adopter',
		description: 'Joined during the early launch phase.',
		badgeType: 'founder',
		categorySlug: null,
		iconValue: '🏁',
		imageUrl: null,
		sortOrder: 10
	},
	{
		key: 'first_quest',
		name: 'First Quest',
		description: 'Completed a first quest.',
		badgeType: 'completion',
		categorySlug: null,
		iconValue: '⚔️',
		imageUrl: null,
		sortOrder: 20
	},
	{
		key: 'helping_hand',
		name: 'Helping Hand',
		description: 'Completed 5 quests.',
		badgeType: 'completion',
		categorySlug: null,
		iconValue: '🤝',
		imageUrl: null,
		sortOrder: 30
	},
	{
		key: 'five_star_helper',
		name: 'Five Star Helper',
		description: 'Earned strong 5-star reviews.',
		badgeType: 'reputation',
		categorySlug: null,
		iconValue: '⭐',
		imageUrl: null,
		sortOrder: 40
	},
	{
		key: 'trusted_neighbor',
		name: 'Trusted Neighbor',
		description: 'Built trust through reliable help.',
		badgeType: 'reputation',
		categorySlug: null,
		iconValue: '🛡️',
		imageUrl: null,
		sortOrder: 50
	},
	{
		key: 'pet_hero',
		name: 'Pet Hero',
		description: 'Known for pet-related help.',
		badgeType: 'category',
		categorySlug: 'pets',
		iconValue: '🐶',
		imageUrl: null,
		sortOrder: 60
	}
];

export type UserEarnedBadge = {
	key: string;
	name: string;
	description: string;
	badgeType: string;
	categorySlug: string | null;
	iconValue: string | null;
	imageUrl: string | null;
	earnedAt: string;
};

async function ensureStarterBadgeDefinitions(): Promise<void> {
	for (const badge of STARTER_BADGES) {
		await db.execute(sql`
			insert into badges (
				key,
				name,
				description,
				badge_type,
				category_slug,
				icon_value,
				image_url,
				sort_order,
				is_active
			)
			values (
				${badge.key},
				${badge.name},
				${badge.description},
				${badge.badgeType},
				${badge.categorySlug},
				${badge.iconValue},
				${badge.imageUrl},
				${badge.sortOrder},
				true
			)
			on conflict (key) do nothing
		`);
	}
}

async function awardBadge(
	userId: number,
	badgeKey: string,
	sourceTaskId: number | null
): Promise<void> {
	await db.execute(sql`
		insert into user_badges (user_id, badge_key, earned_at, source_task_id)
		values (${userId}, ${badgeKey}, now(), ${sourceTaskId})
		on conflict (user_id, badge_key) do nothing
	`);
}

export async function awardMvpBadgesForUser(
	userId: number,
	options?: { sourceTaskId?: number | null }
): Promise<void> {
	if (!Number.isInteger(userId) || userId <= 0) return;

	try {
		await ensureStarterBadgeDefinitions();

		const sourceTaskId =
			options?.sourceTaskId && Number.isInteger(options.sourceTaskId) && options.sourceTaskId > 0
				? options.sourceTaskId
				: null;

		const userResult = await db.execute(sql`
			select created_at
			from users
			where id = ${userId}
			limit 1
		`);
		const userRows = toRows<Record<string, unknown>>(userResult);
		const createdAtRaw = userRows[0]?.created_at;
		if (createdAtRaw) {
			const createdAt = new Date(String(createdAtRaw));
			if (!Number.isNaN(createdAt.getTime()) && createdAt <= EARLY_ADOPTER_CUTOFF) {
				await awardBadge(userId, 'early_adopter', null);
			}
		}

		const completionResult = await db.execute(sql`
			select count(*)::int as completed_count
			from tasks t
			inner join bids b on b.id = t.accepted_bid_id
			where t.status = 'completed'
				and b.worker_id = ${userId}
		`);
		const completionRows = toRows<Record<string, unknown>>(completionResult);
		const completedCount = Number(completionRows[0]?.completed_count ?? 0);

		if (completedCount >= 1) {
			await awardBadge(userId, 'first_quest', sourceTaskId);
		}
		if (completedCount >= 5) {
			await awardBadge(userId, 'helping_hand', sourceTaskId);
		}

		const reputationResult = await db.execute(sql`
			select
				count(*)::int as review_count,
				round(avg(rating)::numeric, 2) as average_rating
			from reviews
			where reviewee_id = ${userId}
		`);
		const reputationRows = toRows<Record<string, unknown>>(reputationResult);
		const reviewCount = Number(reputationRows[0]?.review_count ?? 0);
		const averageRating =
			reputationRows[0]?.average_rating === null || reputationRows[0]?.average_rating === undefined
				? null
				: Number(reputationRows[0]?.average_rating);

		if (reviewCount >= 3 && averageRating !== null && averageRating >= 5) {
			await awardBadge(userId, 'five_star_helper', sourceTaskId);
		}
		if (reviewCount >= 5 && averageRating !== null && averageRating >= 4.8) {
			await awardBadge(userId, 'trusted_neighbor', sourceTaskId);
		}
	} catch {
		// Badge awarding should never block primary workflows.
	}
}

export async function listEarnedBadgesForUser(userId: number): Promise<UserEarnedBadge[]> {
	if (!Number.isInteger(userId) || userId <= 0) return [];

	await ensureStarterBadgeDefinitions();

	const result = await db.execute(sql`
		select
			b.key,
			b.name,
			b.description,
			b.badge_type,
			b.category_slug,
			b.icon_value,
			b.image_url,
			ub.earned_at
		from user_badges ub
		inner join badges b on b.key = ub.badge_key
		where ub.user_id = ${userId}
			and b.is_active = true
		order by b.sort_order asc, ub.earned_at asc
	`);
	const rows = toRows<Record<string, unknown>>(result);
	return rows.map((row) => ({
		key: String(row.key),
		name: String(row.name),
		description: String(row.description),
		badgeType: String(row.badge_type),
		categorySlug: row.category_slug ? String(row.category_slug) : null,
		iconValue: row.icon_value ? String(row.icon_value) : null,
		imageUrl: row.image_url ? String(row.image_url) : null,
		earnedAt: new Date(String(row.earned_at)).toISOString()
	}));
}
