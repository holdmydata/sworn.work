CREATE TYPE "public"."verification_type" AS ENUM('photo', 'video', 'both');--> statement-breakpoint
CREATE TYPE "public"."proof_type" AS ENUM('photo', 'video');--> statement-breakpoint
CREATE TYPE "public"."verification_decision" AS ENUM('approved', 'disputed', 'rejected');--> statement-breakpoint

ALTER TABLE "tasks" ALTER COLUMN "accepted_bid_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "accepted_bid_id" DROP DEFAULT;--> statement-breakpoint

ALTER TABLE "tasks" ADD COLUMN "city" varchar(120) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "state" varchar(2) DEFAULT 'AR' NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "address_line1" varchar(255);--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "address_line2" varchar(255);--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "postal_code" varchar(20);--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "verification_type" "verification_type" DEFAULT 'photo' NOT NULL;--> statement-breakpoint

CREATE TABLE "task_proofs" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" serial NOT NULL,
	"submitted_by_user_id" serial NOT NULL,
	"proof_type" "proof_type" NOT NULL,
	"proof_url" text NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE "verification_decisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" serial NOT NULL,
	"proof_id" serial,
	"decided_by_user_id" serial NOT NULL,
	"decision" "verification_decision" NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

ALTER TABLE "task_proofs" ADD CONSTRAINT "task_proofs_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_proofs" ADD CONSTRAINT "task_proofs_submitted_by_user_id_users_id_fk" FOREIGN KEY ("submitted_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "verification_decisions" ADD CONSTRAINT "verification_decisions_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_decisions" ADD CONSTRAINT "verification_decisions_proof_id_task_proofs_id_fk" FOREIGN KEY ("proof_id") REFERENCES "public"."task_proofs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_decisions" ADD CONSTRAINT "verification_decisions_decided_by_user_id_users_id_fk" FOREIGN KEY ("decided_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
