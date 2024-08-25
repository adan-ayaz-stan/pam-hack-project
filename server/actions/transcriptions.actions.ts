'use server';

import { db } from '@/lib/db';
import { transcripts, TTranscript } from '@/lib/db/schema/transcripts';
import { count, eq } from 'drizzle-orm';

export async function createTranscription(data: TTranscript) {
  try {
    const newTranscript = await db.insert(transcripts).values(data).returning();
    return newTranscript;
  } catch (err) {
    throw err;
  }
}

export async function getSuccessfulTranscriptions() {
  try {
    const transcriptsAll = await db
      .select()
      .from(transcripts)
      .where(eq(transcripts.outcome, true));
    return transcriptsAll;
  } catch (err) {
    return [];
  }
}

export async function getFailedTranscriptions() {
  try {
    const transcriptsAll = await db
      .select()
      .from(transcripts)
      .where(eq(transcripts.outcome, false));
    return transcriptsAll;
  } catch (err) {
    return [];
  }
}

export async function getSuccessfulTranscriptionsCount() {
  try {
    const transcriptsCount = await db
      .select({ count: count() })
      .from(transcripts)
      .where(eq(transcripts.outcome, true));
    return transcriptsCount[0].count;
  } catch (err) {
    return 0;
  }
}

export async function getFailedTranscriptionsCount() {
  try {
    const transcriptsCount = await db
      .select({ count: count() })
      .from(transcripts)
      .where(eq(transcripts.outcome, false));
    return transcriptsCount[0].count;
  } catch (err) {
    return 0;
  }
}