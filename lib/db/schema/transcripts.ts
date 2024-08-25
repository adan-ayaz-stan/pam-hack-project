import { sql } from 'drizzle-orm';
import {
  text,
  varchar,
  timestamp,
  pgTable,
  boolean,
  json
} from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { nanoid } from '@/lib/utils';
import { createSelectSchema } from 'drizzle-zod';

export const transcripts = pgTable('transcripts', {
  id: varchar('id', { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  title: text('title').notNull(),
  outcome: boolean('outcome').notNull().default(false),
  messages: json('messages').notNull(),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`now()`)
});

export const insertTranscriptSchema = createSelectSchema(transcripts)
  .extend({})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  });

export type TTranscript = z.infer<typeof insertTranscriptSchema>;
