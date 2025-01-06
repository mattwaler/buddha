import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { relations } from 'drizzle-orm';

export const items = sqliteTable('items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name'),
  groupId: integer('group_id'),
  userId: integer('user_id'),
})

export const itemsRelations = relations(items, ({ many, one }) => ({
  completions: many(completions),
  group: one(groups, {
    fields: [items.groupId],
    references: [groups.id]
  }),
  user: one(users, {
    fields: [items.userId],
    references: [users.id]
  }),
}))

export const completions = sqliteTable('completions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  completedAt: text('completed_at'),
  itemId: integer('item_id'),
  userId: integer('user_id')
})

export const completionsRelations = relations(completions, ({ one }) => ({
  item: one(items, {
    fields: [completions.userId],
    references: [items.id]
  }),
  user: one(users, {
    fields: [completions.userId],
    references: [users.id]
  }),
}))

export const groups = sqliteTable('groups', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name'),
  userId: integer('user_id')
})

export const groupsRelations = relations(groups, ({ many, one }) => ({
  items: many(items),
  user: one(users, {
    fields: [groups.userId],
    references: [users.id]
  }),
}))

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  password: text('password').notNull(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  items: many(items),
  groups: many(groups),
  completions: many(completions),
}))
