import assert from 'node:assert/strict';

import { beatsPersonalRecord, findPreviousBest, getNewPrIds } from '../src/lib/pr.ts';

const record = (id, weight, reps, performedOn) => ({
  createdAt: id,
  exercise: 'Bench press',
  id,
  performedOn,
  reps,
  weight,
});

const ids = getNewPrIds([
  record(4, 105, 3, '2026-04-04'),
  record(2, 100, 6, '2026-04-02'),
  record(1, 100, 5, '2026-04-01'),
  record(3, 95, 10, '2026-04-03'),
]);

assert.deepEqual([...ids], [1, 2, 4]);
assert.equal(beatsPersonalRecord({ weight: 100, reps: 5 }, { weight: 100, reps: 5 }), false);
assert.equal(beatsPersonalRecord({ weight: 100, reps: 6 }, { weight: 100, reps: 5 }), true);
assert.equal(beatsPersonalRecord({ weight: 101, reps: 1 }, { weight: 100, reps: 10 }), true);

const records = [
  record(1, 100, 5, '2026-04-01'),
  record(2, 105, 3, '2026-04-03'),
  { ...record(3, 110, 2, '2026-04-05'), exercise: 'Squat' },
];

assert.equal(findPreviousBest(records, ' bench PRESS ', '2026-04-02')?.id, 1);
assert.equal(findPreviousBest(records, 'Bench press', '2026-04-04')?.id, 2);
assert.equal(findPreviousBest(records, 'Bench press', '2026-04-04', 2)?.id, 1);
