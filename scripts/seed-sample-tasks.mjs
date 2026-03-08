import postgres from 'postgres';
import fs from 'node:fs';

function readDatabaseUrlFromEnvLocal() {
	try {
		const text = fs.readFileSync('.env.local', 'utf8');
		const match = text.match(/^DATABASE_URL=(.*)$/m);
		if (!match) return null;
		return match[1].trim().replace(/^"|"$/g, '');
	} catch {
		return null;
	}
}

const url = process.env.DATABASE_URL || readDatabaseUrlFromEnvLocal();

if (!url) {
	console.error('DATABASE_URL is required');
	process.exit(1);
}

const sql = postgres(url, { max: 1 });

const sampleUsers = [
	{ email: 'poster1@sworn.local', name: 'Avery Poster', role: 'poster' },
	{ email: 'poster2@sworn.local', name: 'Jordan Poster', role: 'poster' }
];

const sampleTasks = [
	{
		email: 'poster1@sworn.local',
		title: 'Mow front and back yard',
		description: 'Need mowing and edging for a medium lot. Please bring your own equipment.',
		category: 'Home & yard',
		budget: 7000,
		location: 'Fayetteville, AR',
		city: 'Fayetteville',
		state: 'AR',
		verificationType: 'photo',
		deadlineDays: 3
	},
	{
		email: 'poster2@sworn.local',
		title: 'Furniture assembly for office desk',
		description: 'Assemble one desk and one chair in home office. Should take about 2 hours.',
		category: 'Skilled trades',
		budget: 9000,
		location: 'Bentonville, AR',
		city: 'Bentonville',
		state: 'AR',
		verificationType: 'video',
		deadlineDays: 5
	},
	{
		email: 'poster1@sworn.local',
		title: 'Grocery pickup and delivery',
		description: 'Pickup from local store and deliver to my home. Includes 2 heavy water packs.',
		category: 'Errands & support',
		budget: 4500,
		location: 'Rogers, AR',
		city: 'Rogers',
		state: 'AR',
		verificationType: 'photo',
		deadlineDays: 1
	},
	{
		email: 'poster2@sworn.local',
		title: 'Dog walking this weekend',
		description: 'Walk our golden retriever twice on Saturday. Friendly dog, leash provided.',
		category: 'Pet care',
		budget: 6000,
		location: 'Springdale, AR',
		city: 'Springdale',
		state: 'AR',
		verificationType: 'both',
		deadlineDays: 4
	}
];

try {
	await sql.begin(async (tx) => {
		// Temporary compatibility fix for earlier schema that made accepted_bid_id required.
		await tx`alter table tasks alter column accepted_bid_id drop default`;
		await tx`alter table tasks alter column accepted_bid_id drop not null`;

		for (const user of sampleUsers) {
			await tx`
				insert into users (email, password_hash, name, role)
				values (${user.email}, ${'seed_placeholder_hash'}, ${user.name}, ${user.role})
				on conflict (email) do update set name = excluded.name, role = excluded.role
			`;
		}

		for (const task of sampleTasks) {
			const creator = await tx`
				select id from users where email = ${task.email} limit 1
			`;

			if (creator.length === 0) continue;

			const deadline = new Date();
			deadline.setDate(deadline.getDate() + task.deadlineDays);

			await tx`
				insert into tasks (
					creator_id, title, description, category, budget, location, city, state,
					address_line1, postal_code, verification_type, status, deadline, accepted_bid_id
				)
				values (
					${creator[0].id}, ${task.title}, ${task.description}, ${task.category}, ${task.budget},
					${task.location}, ${task.city}, ${task.state}, ${'hidden-until-accepted'},
					${'72701'}, ${task.verificationType}, 'open', ${deadline}, null
				)
				on conflict do nothing
			`;
		}
	});

	console.log('Sample users/tasks seeded');
} catch (error) {
	console.error('Failed to seed sample tasks:', error);
	process.exit(1);
} finally {
	await sql.end();
}
