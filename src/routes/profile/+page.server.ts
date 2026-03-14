import { redirect } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { toRows } from '$lib/server/db/result';
import { findAppUserIdByEmail } from '$lib/server/tasks/users';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user?.email) {
		throw redirect(302, '/login');
	}

	const appUserId = await findAppUserIdByEmail(locals.user.email);
	let memberSince: string | null = null;
	let completedQuestsCount = 0;
	let averageRating: number | null = null;
	let reviewsReceivedCount = 0;
	let recentReview:
		| {
				rating: number;
				comment: string | null;
				reviewerName: string;
				createdAt: string;
		  }
		| null = null;

	if (appUserId) {
		const identityResult = await db.execute(sql`
			select created_at
			from users
			where id = ${appUserId}
			limit 1
		`);
		const identityRows = toRows<Record<string, unknown>>(identityResult);
		memberSince = identityRows[0]?.created_at ? new Date(String(identityRows[0].created_at)).toISOString() : null;

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
	}

	return {
		displayName: locals.user.name || 'Sworn Member',
		email: locals.user.email,
		memberSince,
		levelLabel: 'Level 1 - Helper',
		completedQuestsCount,
		averageRating,
		reviewsReceivedCount,
		recentReview
	};
};
