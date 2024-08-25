import { sql } from 'drizzle-orm';
import { text, varchar, timestamp, pgTable } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { nanoid } from '@/lib/utils';
import { createSelectSchema } from 'drizzle-zod';

export const tasks = pgTable('tasks', {
  id: varchar('id', { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  title: text('title').notNull(),
  description: text('description').notNull(),
  location: text('location').notNull(),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`now()`)
});

export const insertTaskSchema = createSelectSchema(tasks).extend({}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type TTask = z.infer<typeof insertTaskSchema>;
