import { integer, pgTable, serial, text, timestamp, unique } from 'drizzle-orm/pg-core'

export const appUsers = pgTable('app_users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const movies = pgTable('movies', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  director: text('director').notNull(),
  genre: text('genre').notNull(),
  year: integer('year').notNull(),
  duration: integer('duration').notNull(),
  rating: text('rating').notNull(),
  description: text('description').notNull(),
  posterUrl: text('poster_url').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  movieId: integer('movie_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [unique().on(table.userId, table.movieId)])
