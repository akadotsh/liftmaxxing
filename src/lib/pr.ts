export type PrRecord = {
  createdAt: number;
  exercise: string;
  id: number;
  performedOn: string;
  reps: number;
  weight: number;
};

export const beatsPersonalRecord = (
  lift: Pick<PrRecord, 'reps' | 'weight'>,
  previous?: Pick<PrRecord, 'reps' | 'weight'>
) =>
  !previous ||
  lift.weight > previous.weight ||
  (lift.weight === previous.weight && lift.reps > previous.reps);

export function findPreviousBest(
  records: PrRecord[],
  exercise: string,
  performedOn: string,
  excludedId?: number
) {
  const normalizedExercise = exercise.trim().toLowerCase();

  return records.reduce<PrRecord | undefined>((best, record) => {
    if (
      !normalizedExercise ||
      record.id === excludedId ||
      record.exercise.trim().toLowerCase() !== normalizedExercise ||
      record.performedOn > performedOn
    ) {
      return best;
    }

    return beatsPersonalRecord(record, best) ? record : best;
  }, undefined);
}

export function getNewPrIds(records: PrRecord[]) {
  const bestByExercise = new Map<string, PrRecord>();
  const newPrIds = new Set<number>();
  const oldestFirst = [...records].sort(
    (a, b) =>
      a.performedOn.localeCompare(b.performedOn) ||
      a.createdAt - b.createdAt ||
      a.id - b.id
  );

  for (const record of oldestFirst) {
    const exercise = record.exercise.trim().toLowerCase();
    const previous = bestByExercise.get(exercise);

    if (beatsPersonalRecord(record, previous)) {
      newPrIds.add(record.id);
      bestByExercise.set(exercise, record);
    }
  }

  return newPrIds;
}
