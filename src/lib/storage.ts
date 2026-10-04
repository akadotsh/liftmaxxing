import * as SQLite from 'expo-sqlite';

export type PersonalRecord = {
  createdAt: number;
  exercise: string;
  id: number;
  performedOn: string;
  reps: number;
  weight: number;
  workoutType: string;
};

export type ThemeMode = 'system' | 'light' | 'dark';
export type WeightUnit = 'kg' | 'lb';

export type Preferences = {
  themeMode: ThemeMode;
  weightUnit: WeightUnit;
};

type SettingRow = { key: string; value: string };

const parsePreferences = (settings: Record<string, string>): Preferences => ({
  themeMode:
    settings.themeMode === 'light' || settings.themeMode === 'dark'
      ? settings.themeMode
      : 'system',
  weightUnit: settings.weightUnit === 'lb' ? 'lb' : 'kg',
});

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
      performed_on TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS personal_records_created_at
      ON personal_records (created_at DESC);
  `);

  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(personal_records)');
  if (!columns.some(({ name }) => name === 'performed_on')) {
    await db.execAsync(`
      ALTER TABLE personal_records ADD COLUMN performed_on TEXT;
      UPDATE personal_records
      SET performed_on = date(created_at / 1000, 'unixepoch', 'localtime')
      WHERE performed_on IS NULL;
    `);
  }
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
        COALESCE(performed_on, date(created_at / 1000, 'unixepoch', 'localtime')) AS performedOn,
        created_at AS createdAt
      FROM personal_records
      ORDER BY performedOn DESC, created_at DESC, id DESC
    `),
  ]);
  const settings = Object.fromEntries(settingRows.map(({ key, value }) => [key, value]));

  return {
    configuredRoutine: settings.configuredRoutine,
    personalRecords,
    preferences: parsePreferences(settings),
    selectedType: settings.selectedType ?? '',
    workoutTypes: workoutTypeRows.map(({ name }) => name),
  };
}

export async function loadPreferences() {
  const db = await database;
  const rows = await db.getAllAsync<SettingRow>(
    `SELECT key, value FROM settings WHERE key IN ('themeMode', 'weightUnit')`
  );
  return parsePreferences(Object.fromEntries(rows.map(({ key, value }) => [key, value])));
}

export async function savePreference(key: keyof Preferences, value: string) {
  const db = await database;
  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    key,
    value
  );
}

export async function loadExerciseHistory(exercise: string) {
  const db = await database;
  return db.getAllAsync<PersonalRecord>(
    `SELECT
      id,
      exercise,
      weight_kg AS weight,
      reps,
      workout_type AS workoutType,
      COALESCE(performed_on, date(created_at / 1000, 'unixepoch', 'localtime')) AS performedOn,
      created_at AS createdAt
    FROM personal_records
    WHERE exercise = ? COLLATE NOCASE
    ORDER BY performedOn DESC, created_at DESC, id DESC`,
    exercise
  );
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
      (exercise, weight_kg, reps, workout_type, performed_on, created_at)
      VALUES (?, ?, ?, ?, ?, ?)`,
    record.exercise,
    record.weight,
    record.reps,
    record.workoutType,
    record.performedOn,
    createdAt
  );

  return { ...record, createdAt, id: result.lastInsertRowId };
}

export async function updatePersonalRecord(record: PersonalRecord) {
  const db = await database;
  await db.runAsync(
    `UPDATE personal_records
      SET exercise = ?, weight_kg = ?, reps = ?, workout_type = ?, performed_on = ?
      WHERE id = ?`,
    record.exercise,
    record.weight,
    record.reps,
    record.workoutType,
    record.performedOn,
    record.id
  );
}

export async function deletePersonalRecord(id: number) {
  const db = await database;
  await db.runAsync('DELETE FROM personal_records WHERE id = ?', id);
}
