import { sql } from 'drizzle-orm';
import { text, varchar, timestamp, pgTable, pgEnum } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { nanoid } from '@/lib/utils';
import { createSelectSchema } from 'drizzle-zod';

export const subscriptionEnum = pgEnum('subscription_enum', [
  'active',
  'scheduled',
  'cancelled',
  'overdue',
  'inactive'
]);

export const subscriptions = pgTable('subscriptions', {
  id: varchar('id', { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  user_id: varchar('user_id', { length: 191 }).notNull(),
  name: text('name').notNull().default('Unknown'),
  vehicle_make: text('vehicle_make').notNull().default('Unknown'),
  vehicle_plate: text('vehicle_plate').notNull().default('XXXX-XXX'),
  subscription: subscriptionEnum('subscription').notNull().default('inactive'),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`now()`)
});

export const insertSubscriptionSchema = createSelectSchema(subscriptions)
  .extend({})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  });

export type TSubscription = z.infer<typeof insertSubscriptionSchema>;
