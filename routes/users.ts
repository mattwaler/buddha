import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import db from '../db/db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import { password } from 'bun'
import { jwt } from 'hono/jwt'

export interface Payload {
  email: string,
  id: number,
  exp: number,
}

const app = new Hono()

app.use('/verify', jwt({ secret: process.env.JWT_SECRET }))

app.get('/verify', async (c) => {
  return c.json({ success: true })
})

app.post('/create', async (c) => {
  // Validate body
  const body = await c.req.json()
  if (!body.email || !body.password) {
    const message = "Invalid request body."
    return c.json({ message }, 400)
  }
  // Check for existing user
  const user = await db.query.users.findFirst({ where: eq(users.email, body.email) })
  if (user) {
    const message = "User already exists."
    return c.json({ message }, 400)
  }
  // Hash password
  const hashedPassword = await password.hash(body.password)
  // Create user
  const result = await db.insert(users).values({ email: body.email, password: hashedPassword }).returning()
  // Create JWT for user
  const payload = {
    email: body.email,
    id: result[0].id,
    exp: Math.floor(Date.now() / 1000) + 60 * 20160,
  }
  const token = await sign(payload, process.env.JWT_SECRET)
  return c.json({ token: token }, 200)
})

app.post('/login', async (c) => {
  // Validate body
  const body = await c.req.json()
  if (!body.email || !body.password) {
    const message = "Invalid request body."
    return c.json({ message }, 400)
  }
  // Lookup User
  const user = await db.query.users.findFirst({ where: eq(users.email, body.email) })
  if (!user) {
    const message = "User does not exist."
    return c.json({ message }, 400)
  }
  // Check password
  const isMatch = password.verify(body.password, user.password)
  if (!isMatch) {
    const message = "Incorrect password."
    return c.json({ message }, 400)
  }
  // Create JWT
  const payload = {
    email: body.email,
    id: user.id,
    exp: Math.floor(Date.now() / 1000) + 60 * 20160,
  }
  const token = await sign(payload, process.env.JWT_SECRET)
  return c.json({ token: token }, 200)
})

export default app
