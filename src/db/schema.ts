import { pgTable, text, integer, boolean, timestamp, serial, doublePrecision } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define the users table for Firebase-synced accounts
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the RSVPs table
export const rsvps = pgTable('rsvps', {
  id: text('id').primaryKey(), // We use the same ID format as in Firestore/client
  name: text('name').notNull(),
  attending: boolean('attending').notNull(),
  guestsCount: integer('guests_count').notNull(),
  dietaryRequirements: text('dietary_requirements').notNull(),
  message: text('message').notNull(),
  whatsappContact: text('whatsapp_contact').notNull(),
  needsParking: boolean('needs_parking').default(false),
  parkingSpaces: integer('parking_spaces').default(0),
  createdAt: doublePrecision('created_at').notNull(), // Epoch milliseconds
});

// Define the Wishes/Guestbook Duas table
export const wishes = pgTable('wishes', {
  id: text('id').primaryKey(), // We use the same ID format as in Firestore/client
  name: text('name').notNull(),
  message: text('message').notNull(),
  category: text('category').notNull(), // Blessing, Dua, Love, Congratulations
  likes: integer('likes').default(0).notNull(),
  createdAt: doublePrecision('created_at').notNull(), // Epoch milliseconds
});

// Define relations (Optional but useful)
export const usersRelations = relations(users, ({ many }) => ({
  rsvps: many(rsvps),
}));
