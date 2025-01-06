// books.ts
import { Hono } from 'hono'
import db from '../db/db'
import { items } from '../db/schema'
import { eq } from 'drizzle-orm'
import { jwt } from 'hono/jwt'
import type { Payload } from './users'

const app = new Hono()

app.use('/*', jwt({ secret: process.env.JWT_SECRET }))

// CREATE
app.post('/', async (c) => {
  const payload: Payload = c.get('jwtPayload')
  const body = await c.req.json()
  if (!body.name) {
    throw new Error('No message in request body.')
  }
  await db.insert(items).values({ name: body.name, userId: payload.id })
  const message = { success: true }
  return c.json(message, 200)
})

// READ
app.get('/', async (c) => {
  const payload: Payload = c.get('jwtPayload')
  const data = await db.query.items.findMany({
    where: eq(items.userId, payload.id)
  })
  return c.json(data, 200)
})

// UPDATE
app.patch('/:id', async (c) => {})

// DELETE
app.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  await db.delete(items).where(eq(items.id, id))
  const message = { success: true }
  return c.json(message, 200)
})

export default app
