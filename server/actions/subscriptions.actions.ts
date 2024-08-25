'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { subscriptions, TSubscription } from '@/lib/db/schema/subscriptions';
import { eq } from 'drizzle-orm';

export async function getSubscription(): Promise<TSubscription | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  try {
    const subscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.user_id, session.user.id));

    const data = subscription[0];

    return data;
  } catch (err) {
    return null;
  }
}

export async function createScheduledSubscription(
  user_data: Omit<TSubscription, 'user_id' | 'subscription'>
) {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  try {
    const subscription = await db
      .insert(subscriptions)
      .values({
        user_id: session.user.email,
        subscription: 'scheduled',
        ...user_data
      })
      .returning();

    const data = subscription[0];

    return data;
  } catch (err) {
    return null;
  }
}

export async function getAllSubscribers() {
  try {
    const subscriptionsAll = await db.select().from(subscriptions);
    return subscriptionsAll;
  } catch (err) {
    return [];
  }
}
