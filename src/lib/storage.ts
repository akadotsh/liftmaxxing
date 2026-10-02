import * as SQLite from 'expo-sqlite';

export type PersonalRecord = {
  createdAt: number;
  exercise: string;
  id: number;
  reps: number;
  weight: number;
  workoutType: string;
};

type SettingRow = { key: string; value: string };

const database = SQLite.openDatabaseAsync('liftmaxxing.db');

export async function initializeDatabase() {
  const db = await database;

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workout_types (
      name TEXT PRIMARY KEY NOT NULL,
      sort_order INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS personal_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exercise TEXT NOT NULL,
      weight_kg REAL NOT NULL CHECK (weight_kg > 0),
      reps INTEGER NOT NULL CHECK (reps > 0),
      workout_type TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS personal_records_created_at
      ON personal_records (created_at DESC);
  `);
}

export async function loadAppData() {
  const db = await database;
  const [settingRows, workoutTypeRows, personalRecords] = await Promise.all([
    db.getAllAsync<SettingRow>('SELECT key, value FROM settings'),
    db.getAllAsync<{ name: string }>(
      'SELECT name FROM workout_types ORDER BY sort_order ASC'
    ),
    db.getAllAsync<PersonalRecord>(`
      SELECT
        id,
        exercise,
        weight_kg AS weight,
        reps,
        workout_type AS workoutType,
        created_at AS createdAt
      FROM personal_records
      ORDER BY created_at DESC, id DESC
    `),
  ]);
  const settings = Object.fromEntries(settingRows.map(({ key, value }) => [key, value]));

  return {
    configuredRoutine: settings.configuredRoutine,
    personalRecords,
    selectedType: settings.selectedType ?? '',
    workoutTypes: workoutTypeRows.map(({ name }) => name),
  };
}

export async function saveWorkoutSetup(
  configuredRoutine: string,
  workoutTypes: string[],
  selectedType: string
) {
  const db = await database;

  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM workout_types');

    for (const [sortOrder, name] of workoutTypes.entries()) {
      await db.runAsync(
        'INSERT INTO workout_types (name, sort_order) VALUES (?, ?)',
        name,
        sortOrder
      );
    }

    await db.runAsync(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      'configuredRoutine',
      configuredRoutine
    );
    await db.runAsync(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      'selectedType',
      selectedType
    );
  });
}

export async function insertWorkoutType(name: string, sortOrder: number) {
  const db = await database;

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'INSERT INTO workout_types (name, sort_order) VALUES (?, ?)',
      name,
      sortOrder
    );
    await db.runAsync(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      'selectedType',
      name
    );
  });
}

export async function deleteWorkoutType(name: string, selectedType: string) {
  const db = await database;

  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM workout_types WHERE name = ?', name);
    await db.runAsync(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      'selectedType',
      selectedType
    );
  });
}

export async function saveSelectedWorkoutType(selectedType: string) {
  const db = await database;
  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    'selectedType',
    selectedType
  );
}

export async function insertPersonalRecord(
  record: Omit<PersonalRecord, 'createdAt' | 'id'>
): Promise<PersonalRecord> {
  const db = await database;
  const createdAt = Date.now();
  const result = await db.runAsync(
    `INSERT INTO personal_records
      (exercise, weight_kg, reps, workout_type, created_at)
      VALUES (?, ?, ?, ?, ?)`,
    record.exercise,
    record.weight,
    record.reps,
    record.workoutType,
    createdAt
  );

  return { ...record, createdAt, id: result.lastInsertRowId };
}
