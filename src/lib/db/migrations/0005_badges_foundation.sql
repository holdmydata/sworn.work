CREATE TABLE "badges" (
	"key" varchar(100) PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"badge_type" varchar(40) NOT NULL,
	"category_slug" varchar(100),
	"icon_value" text,
	"image_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"badge_key" varchar(100) NOT NULL,
	"earned_at" timestamp DEFAULT now() NOT NULL,
	"source_task_id" integer
);
--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_key_badges_key_fk" FOREIGN KEY ("badge_key") REFERENCES "public"."badges"("key") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_source_task_id_tasks_id_fk" FOREIGN KEY ("source_task_id") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "user_badges_user_id_badge_key_unique" ON "user_badges" USING btree ("user_id","badge_key");
--> statement-breakpoint
INSERT INTO "badges" ("key", "name", "description", "badge_type", "category_slug", "icon_value", "image_url", "sort_order", "is_active") VALUES
	('early_adopter', 'Early Adopter', 'Joined during the early launch phase.', 'founder', null, '🏁', null, 10, true),
	('first_quest', 'First Quest', 'Completed a first quest.', 'completion', null, '⚔️', null, 20, true),
	('helping_hand', 'Helping Hand', 'Completed 5 quests.', 'completion', null, '🤝', null, 30, true),
	('five_star_helper', 'Five Star Helper', 'Earned strong 5-star reviews.', 'reputation', null, '⭐', null, 40, true),
	('trusted_neighbor', 'Trusted Neighbor', 'Built trust through reliable help.', 'reputation', null, '🛡️', null, 50, true),
	('pet_hero', 'Pet Hero', 'Known for pet-related help.', 'category', 'pets', '🐶', null, 60, true)
ON CONFLICT ("key") DO NOTHING;
