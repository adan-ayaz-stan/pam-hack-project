'use server';

import { db } from '@/lib/db';
import { tasks } from '@/lib/db/schema/tasks';

export async function getTasks() {
  try {
    const tasksAll = await db.select().from(tasks);
    return tasksAll;
  } catch (err) {
    return [];
  }
}

type NewTask = typeof tasks.$inferInsert;

export async function createTask(task: NewTask) {
  try {
    const newTask = await db.insert(tasks).values(task).returning();

    return newTask;
  } catch (err) {
    throw err;
  }
}
