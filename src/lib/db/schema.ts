import { pgTable, serial, text, varchar, timestamp, integer, real, json, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['poster', 'worker', 'both']);
export const taskStatusEnum = pgEnum('task_status', ['open', 'in_progress', 'completed', 'cancelled']);
export const bidStatusEnum = pgEnum('bid_status', ['pending', 'accepted', 'rejected', 'completed']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'refunded']);

// Tables
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password_hash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  avatar_url: text('avatar_url'),
  bio: text('bio'),
  phone: varchar('phone', { length: 20 }),
  role: userRoleEnum('role').notNull().default('poster'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const user_profiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  user_id: serial('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  rating: real('rating').default(0),
  review_count: integer('review_count').default(0),
  total_earned: integer('total_earned').default(0), // cents
  completion_rate: real('completion_rate').default(0), // 0-100
  skills: json('skills').default([]), // JSON array of skill strings
  service_radius_miles: integer('service_radius_miles').default(10),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  creator_id: serial('creator_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }).notNull(), // 'cleaning', 'repair', 'moving', etc.
  budget: integer('budget').notNull(), // cents
  location: varchar('location', { length: 255 }).notNull(),
  latitude: real('latitude'),
  longitude: real('longitude'),
  status: taskStatusEnum('status').notNull().default('open'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  deadline: timestamp('deadline'),
  completed_at: timestamp('completed_at'),
  accepted_bid_id: serial('accepted_bid_id').references(() => bids.id),
});

export const bids = pgTable('bids', {
  id: serial('id').primaryKey(),
  task_id: serial('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  worker_id: serial('worker_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  proposed_price: integer('proposed_price').notNull(), // cents
  message: text('message'),
  status: bidStatusEnum('status').notNull().default('pending'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  sender_id: serial('sender_id').notNull().references(() => users.id),
  recipient_id: serial('recipient_id').notNull().references(() => users.id),
  task_id: serial('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  read_at: timestamp('read_at'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  reviewer_id: serial('reviewer_id').notNull().references(() => users.id),
  reviewee_id: serial('reviewee_id').notNull().references(() => users.id),
  task_id: serial('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  task_id: serial('task_id').notNull().references(() => tasks.id),
  payer_id: serial('payer_id').notNull().references(() => users.id),
  payee_id: serial('payee_id').notNull().references(() => users.id),
  amount: integer('amount').notNull(), // cents
  stripe_payment_intent_id: varchar('stripe_payment_intent_id', { length: 255 }),
  status: paymentStatusEnum('status').notNull().default('pending'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  completed_at: timestamp('completed_at'),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(user_profiles),
  tasks: many(tasks),
  bids: many(bids),
  sent_messages: many(messages, { relationName: 'sender' }),
  received_messages: many(messages, { relationName: 'recipient' }),
  reviews_given: many(reviews, { relationName: 'reviewer' }),
  reviews_received: many(reviews, { relationName: 'reviewee' }),
  payments_made: many(payments, { relationName: 'payer' }),
  payments_received: many(payments, { relationName: 'payee' }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  creator: one(users, { fields: [tasks.creator_id], references: [users.id] }),
  bids: many(bids),
  messages: many(messages),
  reviews: many(reviews),
}));

export const bidsRelations = relations(bids, ({ one }) => ({
  task: one(tasks, { fields: [bids.task_id], references: [tasks.id] }),
  worker: one(users, { fields: [bids.worker_id], references: [users.id] }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, { fields: [messages.sender_id], references: [users.id], relationName: 'sender' }),
  recipient: one(users, { fields: [messages.recipient_id], references: [users.id], relationName: 'recipient' }),
  task: one(tasks, { fields: [messages.task_id], references: [tasks.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  reviewer: one(users, { fields: [reviews.reviewer_id], references: [users.id], relationName: 'reviewer' }),
  reviewee: one(users, { fields: [reviews.reviewee_id], references: [users.id], relationName: 'reviewee' }),
  task: one(tasks, { fields: [reviews.task_id], references: [tasks.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  task: one(tasks, { fields: [payments.task_id], references: [tasks.id] }),
  payer: one(users, { fields: [payments.payer_id], references: [users.id], relationName: 'payer' }),
  payee: one(users, { fields: [payments.payee_id], references: [users.id], relationName: 'payee' }),
}));