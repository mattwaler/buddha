import { Hono } from 'hono'
import items from './routes/items'
import users from './routes/users'
import { Database } from "bun:sqlite"
import { logger } from 'hono/logger'

const db = new Database("./db/storage/db.sqlite")
db.exec("PRAGMA journal_mode = WAL;");

const app = new Hono()

app.use(logger())

app.route('/items', items)
app.route('/users', users)

export default app
