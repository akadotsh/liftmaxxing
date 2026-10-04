import { getNewPrIds } from '../src/lib/pr.ts';

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

if ([...ids].join(',') !== '1,2,4') {
  throw new Error(`Unexpected New PR records: ${[...ids].join(',')}`);
}
