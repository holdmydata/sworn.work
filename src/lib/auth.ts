// import { betterAuth } from "better-auth";
// import { drizzleAdapter } from "better-auth/adapters/drizzle";
// import { db } from "./db";
// import * as schema from "./db/schema";

// export const auth = betterAuth({
//   database: drizzleAdapter(db, {
//     provider: "pg",
//     usersTable: schema.users,
//   }),
//   emailAndPassword: {
//     enabled: true,
//   },
//   socialProviders: {},
// });

// TODO: Fix better-auth export issue in better-auth 1.5.4
export const auth = null; // Placeholder