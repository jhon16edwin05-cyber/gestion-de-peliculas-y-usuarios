'use server'

import { and, desc, eq, ilike, or, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { appUsers, favorites, movies } from '@/lib/db/schema'

export type UserInput = { name: string; email: string }
export type MovieInput = {
  title: string
  director: string
  genre: string
  year: number
  duration: number
  rating: string
  description: string
  posterUrl: string
}

const ratings = ['G', 'PG', 'PG-13', 'R']

function required(value: string, label: string) {
  const clean = value.trim()
  if (!clean) throw new Error(`${label} es obligatorio`)
  return clean
}

function validateMovie(input: MovieInput) {
  const year = Number(input.year)
  const duration = Number(input.duration)
  if (!Number.isInteger(year) || year < 1888 || year > new Date().getFullYear() + 5) throw new Error('Ingresa un año válido')
  if (!Number.isInteger(duration) || duration <= 0) throw new Error('La duración debe ser un número positivo')
  if (!ratings.includes(input.rating)) throw new Error('Selecciona una clasificación válida')
  return {
    title: required(input.title, 'El título'),
    director: required(input.director, 'El director'),
    genre: required(input.genre, 'El género'),
    year,
    duration,
    rating: input.rating,
    description: required(input.description, 'La descripción'),
    posterUrl: input.posterUrl.trim(),
  }
}

export async function getDashboardData() {
  const [users, filmRows, favoriteRows] = await Promise.all([
    db.select().from(appUsers).orderBy(desc(appUsers.createdAt)),
    db.select().from(movies).orderBy(desc(movies.createdAt)),
    db.select().from(favorites).orderBy(desc(favorites.createdAt)),
  ])
  return {
    users: users.map((user) => ({ ...user, createdAt: user.createdAt.toISOString() })),
    movies: filmRows.map((movie) => ({ ...movie, createdAt: movie.createdAt.toISOString() })),
    favorites: favoriteRows.map((favorite) => ({ ...favorite, createdAt: favorite.createdAt.toISOString() })),
  }
}

export async function saveUser(input: UserInput, id?: number) {
  const name = required(input.name, 'El nombre')
  const email = required(input.email, 'El correo').toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Ingresa un correo electrónico válido')
  try {
    if (id) {
      await db.update(appUsers).set({ name, email }).where(eq(appUsers.id, id))
      return { ok: true as const, id }
    }
    const [created] = await db.insert(appUsers).values({ name, email }).returning({ id: appUsers.id })
    return { ok: true as const, id: created.id }
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error && error.code === '23505') throw new Error('Ya existe un usuario con ese correo')
    throw error
  }
}

export async function deleteUser(id: number) {
  await db.delete(favorites).where(eq(favorites.userId, id))
  await db.delete(appUsers).where(eq(appUsers.id, id))
  return { ok: true as const }
}

export async function saveMovie(input: MovieInput, id?: number) {
  const values = validateMovie(input)
  if (id) await db.update(movies).set(values).where(eq(movies.id, id))
  else await db.insert(movies).values(values)
  return { ok: true as const }
}

export async function deleteMovie(id: number) {
  await db.delete(favorites).where(eq(favorites.movieId, id))
  await db.delete(movies).where(eq(movies.id, id))
  return { ok: true as const }
}

export async function toggleFavorite(userId: number, movieId: number) {
  const existing = await db.select({ id: favorites.id }).from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.movieId, movieId))).limit(1)
  if (existing.length) await db.delete(favorites).where(eq(favorites.id, existing[0].id))
  else await db.insert(favorites).values({ userId, movieId })
  return { ok: true as const }
}

export async function getSearchCounts(query: string) {
  const term = `%${query.trim()}%`
  const [users, filmRows] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(appUsers).where(or(ilike(appUsers.name, term), ilike(appUsers.email, term))),
    db.select({ count: sql<number>`count(*)::int` }).from(movies).where(or(ilike(movies.title, term), ilike(movies.director, term), ilike(movies.genre, term))),
  ])
  return { users: users[0].count, movies: filmRows[0].count }
}
