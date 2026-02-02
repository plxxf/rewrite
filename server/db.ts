import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, conversions, InsertConversion, Conversion, batchJobs, InsertBatchJob, BatchJob, batchItems, InsertBatchItem, BatchItem } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Conversion history queries
export async function createConversion(conversion: InsertConversion): Promise<Conversion> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(conversions).values(conversion);
  const insertId = Number(result[0].insertId);
  
  const created = await db.select().from(conversions).where(eq(conversions.id, insertId)).limit(1);
  if (!created[0]) {
    throw new Error("Failed to retrieve created conversion");
  }
  
  return created[0];
}

export async function updateConversion(id: number, updates: Partial<InsertConversion>): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(conversions).set(updates).where(eq(conversions.id, id));
}

export async function getUserConversions(userId: number): Promise<Conversion[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return db.select().from(conversions).where(eq(conversions.userId, userId)).orderBy(desc(conversions.createdAt));
}

export async function getConversionById(id: number): Promise<Conversion | undefined> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(conversions).where(eq(conversions.id, id)).limit(1);
  return result[0];
}

export async function deleteConversion(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(conversions).where(eq(conversions.id, id));
}

// Batch job queries
export async function createBatchJob(job: InsertBatchJob): Promise<BatchJob> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(batchJobs).values(job);
  const insertId = Number(result[0].insertId);
  
  const created = await db.select().from(batchJobs).where(eq(batchJobs.id, insertId)).limit(1);
  if (!created[0]) {
    throw new Error("Failed to retrieve created batch job");
  }
  
  return created[0];
}

export async function updateBatchJob(id: number, updates: Partial<InsertBatchJob>): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(batchJobs).set(updates).where(eq(batchJobs.id, id));
}

export async function getBatchJobById(id: number): Promise<BatchJob | undefined> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(batchJobs).where(eq(batchJobs.id, id)).limit(1);
  return result[0];
}

export async function getUserBatchJobs(userId: number): Promise<BatchJob[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return db.select().from(batchJobs).where(eq(batchJobs.userId, userId)).orderBy(desc(batchJobs.createdAt));
}

// Batch item queries
export async function createBatchItem(item: InsertBatchItem): Promise<BatchItem> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(batchItems).values(item);
  const insertId = Number(result[0].insertId);
  
  const created = await db.select().from(batchItems).where(eq(batchItems.id, insertId)).limit(1);
  if (!created[0]) {
    throw new Error("Failed to retrieve created batch item");
  }
  
  return created[0];
}

export async function updateBatchItem(id: number, updates: Partial<InsertBatchItem>): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(batchItems).set(updates).where(eq(batchItems.id, id));
}

export async function getBatchItemsByJobId(jobId: number): Promise<BatchItem[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return db.select().from(batchItems).where(eq(batchItems.batchJobId, jobId));
}
