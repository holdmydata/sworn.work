import { redirect } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { toRows } from '$lib/server/db/result';
import { calculateLevelFromXp, levelTitleFor, xpRequiredForLevel } from '$lib/server/progression';
import { awardMvpBadgesForUser, listEarnedBadgesForUser } from '$lib/server/badges';
import { findAppUserIdByEmail } from '$lib/server/tasks/users';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user?.email) {
		throw redirect(302, '/login');
	}

	const appUserId = await findAppUserIdByEmail(locals.user.email);
	let displayName = locals.user.name || 'Sworn Member';
	let avatarUrl: string | null = null;
	let memberSince: string | null = null;

	let xp = 0;
	let level = 1;
	let completedQuestsCount = 0;
	let averageRating: number | null = null;
	let reviewsReceivedCount = 0;
	let badges: Awaited<ReturnType<typeof listEarnedBadgesForUser>> = [];
	let recentReview: {
		rating: number;
		comment: string | null;
		reviewerName: string;
		createdAt: string;
	} | null = null;

	if (appUserId) {
		await awardMvpBadgesForUser(appUserId);

		const identityResult = await db.execute(sql`
			select name, avatar_url, created_at
			from users
			where id = ${appUserId}
			limit 1
		`);
		const identityRows = toRows<Record<string, unknown>>(identityResult);
		if (identityRows.length > 0) {
			displayName = String(identityRows[0].name ?? displayName);
			avatarUrl = identityRows[0].avatar_url ? String(identityRows[0].avatar_url) : null;
			memberSince = identityRows[0].created_at
				? new Date(String(identityRows[0].created_at)).toISOString()
				: null;
		}

		const completedResult = await db.execute(sql`
			select count(*)::int as completed_count
			from tasks t
			left join bids b on b.id = t.accepted_bid_id
			where t.status = 'completed'
				and (t.creator_id = ${appUserId} or b.worker_id = ${appUserId})
		`);
		const completedRows = toRows<Record<string, unknown>>(completedResult);
		completedQuestsCount = Number(completedRows[0]?.completed_count ?? 0);

		const reputationResult = await db.execute(sql`
			select
				round(avg(rating)::numeric, 2) as average_rating,
				count(*)::int as reviews_received_count
			from reviews
			where reviewee_id = ${appUserId}
		`);
		const reputationRows = toRows<Record<string, unknown>>(reputationResult);
		const avgRaw = reputationRows[0]?.average_rating;
		averageRating = avgRaw === null || avgRaw === undefined ? null : Number(avgRaw);
		reviewsReceivedCount = Number(reputationRows[0]?.reviews_received_count ?? 0);

		const upsertStatsResult = await db.execute(sql`
			insert into user_stats (user_id, xp, level, quests_completed, reviews_received, average_rating)
			values (
				${appUserId},
				0,
				1,
				${completedQuestsCount},
				${reviewsReceivedCount},
				${averageRating ?? 0}
			)
			on conflict (user_id)
			do update set
				quests_completed = excluded.quests_completed,
				reviews_received = excluded.reviews_received,
				average_rating = excluded.average_rating,
				updated_at = now()
			returning xp, level, quests_completed, reviews_received, average_rating
		`);
		const statsRows = toRows<Record<string, unknown>>(upsertStatsResult);
		if (statsRows.length > 0) {
			xp = Number(statsRows[0].xp ?? 0);
			level = calculateLevelFromXp(xp);
			completedQuestsCount = Number(statsRows[0].quests_completed ?? completedQuestsCount);
			reviewsReceivedCount = Number(statsRows[0].reviews_received ?? reviewsReceivedCount);
			averageRating =
				reviewsReceivedCount > 0 ? Number(statsRows[0].average_rating ?? averageRating ?? 0) : null;

			await db.execute(sql`
				update user_stats
				set level = ${level}, updated_at = now()
				where user_id = ${appUserId}
					and level <> ${level}
			`);
		}

		const recentReviewResult = await db.execute(sql`
			select
				r.rating,
				r.comment,
				r.created_at,
				u.name as reviewer_name
			from reviews r
			inner join users u on u.id = r.reviewer_id
			where r.reviewee_id = ${appUserId}
			order by r.created_at desc
			limit 1
		`);
		const recentReviewRows = toRows<Record<string, unknown>>(recentReviewResult);
		if (recentReviewRows.length > 0) {
			recentReview = {
				rating: Number(recentReviewRows[0].rating),
				comment: recentReviewRows[0].comment ? String(recentReviewRows[0].comment) : null,
				reviewerName: String(recentReviewRows[0].reviewer_name ?? 'Member'),
				createdAt: new Date(String(recentReviewRows[0].created_at)).toISOString()
			};
		}

		badges = await listEarnedBadgesForUser(appUserId);
	}

	return {
		levelProgressPercent: Math.min(
			100,
			Math.max(
				0,
				Math.round(
					((xp - xpRequiredForLevel(level)) /
						(xpRequiredForLevel(level + 1) - xpRequiredForLevel(level))) *
						100
				)
			)
		),
		nextLevel: level + 1,
		xpToNextLevel: Math.max(0, xpRequiredForLevel(level + 1) - xp),
		displayName,
		email: locals.user.email,
		avatarUrl,
		memberSince,
		level,
		levelTitle: levelTitleFor(level),
		xp,
		completedQuestsCount,
		averageRating,
		reviewsReceivedCount,
		badges,
		recentReview
	};
};
