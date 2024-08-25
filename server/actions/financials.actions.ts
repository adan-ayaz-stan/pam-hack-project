'use server';

import { db } from '@/lib/db';
import { subscriptions } from '@/lib/db/schema/subscriptions';
import { count, eq } from 'drizzle-orm';

// In USD
const SUBSCRIPTION_CHARGES = 29.99;

export async function getTotalRevenue() {
  const subscriptionsCount = await db
    .select({ count: count() })
    .from(subscriptions);

  return subscriptionsCount[0].count * SUBSCRIPTION_CHARGES;
}

export async function getSubscriptionCount() {
  const subscriptionsCount = await db
    .select({ count: count() })
    .from(subscriptions);

  return subscriptionsCount[0].count;
}

export async function getActiveSubscriptionCount() {
  const subscriptionsCount = await db
    .select({ count: count() })
    .from(subscriptions)
    .where(eq(subscriptions.subscription, 'active'));

  return subscriptionsCount[0].count;
}

export async function getScheduledSubscriptionCount() {
  const subscriptionsCount = await db
    .select({ count: count() })
    .from(subscriptions)
    .where(eq(subscriptions.subscription, 'scheduled'));

  return subscriptionsCount[0].count;
}
