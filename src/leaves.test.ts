import { test } from 'node:test'
import assert from 'node:assert/strict'
import { monthGrid } from './calendar.ts'
import { formatRange, formatShortRange, isOngoing, leaveError, leavesInMonth, parseLeave, pickDay, splitLeaves, weekLanes, type Leave } from './leaves.ts'
import { t } from './pl.ts'

const TODAY = '2026-11-10'
const leave = (architect: string, from: string, to: string): Leave => ({ id: architect + from, architect, from, to, updatedAt: '' })
const row = (architect: string, from: string, to: string) => ({ leave: leave(architect, from, to) })
const label = (r: { leave: Leave }) => `${r.leave.architect} ${formatRange(r.leave)}`

test('leaves: Sections and order', () => {
  const rows = [
    row('Anna Nowak', '2026-12-01', '2026-12-05'),
    row('Jan Kowalski', '2026-11-09', '2026-11-13'),
    row('Anna Nowak', '2026-07-01', '2026-07-14'),
    row('Jan Kowalski', '2026-10-19', '2026-10-23'),
  ]
  const { current, past } = splitLeaves(rows, TODAY)
  assert.deepEqual(current.map(label), ['Jan Kowalski 09.11.2026 - 13.11.2026', 'Anna Nowak 01.12.2026 - 05.12.2026'])
  assert.deepEqual(past.map(label), ['Jan Kowalski 19.10.2026 - 23.10.2026', 'Anna Nowak 01.07.2026 - 14.07.2026'])
})

test('leaves: Same start, by name', () => {
  const { current } = splitLeaves([row('Jan Kowalski', '2026-12-01', '2026-12-02'), row('Anna Nowak', '2026-12-01', '2026-12-09')], TODAY)
  assert.deepEqual(current.map((r) => r.leave.architect), ['Anna Nowak', 'Jan Kowalski'])
})

test('leaves: Ends today', () => {
  const { current, past } = splitLeaves([row('Anna Nowak', '2026-11-02', TODAY)], TODAY)
  assert.equal(current.length, 1)
  assert.equal(past.length, 0)
})

test('leaves: Going on today', () => {
  assert.equal(isOngoing(leave('Jan Kowalski', '2026-11-09', '2026-11-13'), TODAY), true)
  assert.equal(isOngoing(leave('Anna Nowak', '2026-12-01', '2026-12-05'), TODAY), false)
})

test('leaves: One day', () => {
  assert.equal(formatRange(leave('Anna Nowak', '2026-12-07', '2026-12-07')), '07.12.2026')
  assert.equal(formatShortRange(leave('Anna Nowak', '2026-12-07', '2026-12-07')), '07.12')
})

test('leaves: Architect missing', () => {
  assert.equal(leaveError(leave('', '2026-12-01', '2026-12-05')), t.leaveArchitectRequired)
})

test('leaves: Date missing', () => {
  assert.equal(leaveError(leave('Anna Nowak', '', '2026-12-05')), t.leaveDatesRequired)
  assert.equal(leaveError(leave('Anna Nowak', '2026-12-01', '')), t.leaveDatesRequired)
})

test('leaves: End before start', () => {
  assert.equal(leaveError(leave('Anna Nowak', '2026-12-05', '2026-12-01')), t.leaveOrder)
  assert.equal(leaveError(leave('Anna Nowak', '2026-12-05', '2026-12-05')), '')
})

test('leaves: Hand-edited file with a bad date', () => {
  const ok = { id: 'x', architect: 'Anna Nowak', from: '2026-12-01', to: '2026-12-05', updatedAt: 'u' }
  assert.deepEqual(parseLeave(ok), ok)
  assert.throws(() => parseLeave({ ...ok, from: '2026-12' }))
  assert.throws(() => parseLeave({ ...ok, to: '2026-02-30' }))
  assert.throws(() => parseLeave({ ...ok, to: '2026-11-30' }))
  assert.throws(() => parseLeave({ ...ok, architect: '' }))
  assert.throws(() => parseLeave({ ...ok, id: undefined }))
})

const pieces = (rows: { leave: Leave }[], week: string[]) =>
  weekLanes(rows, week).map((p) => [p.row.leave.architect, p.start, p.span, p.lane])

test('calendar: One week', () => {
  const week = monthGrid('2026-11')[2] // Mon 9 - Sun 15 November
  assert.deepEqual(pieces([row('Anna Nowak', '2026-11-10', '2026-11-13')], week), [['Anna Nowak', 2, 4, 0]])
})

test('calendar: Across weeks and months', () => {
  const r = [row('Anna Nowak', '2026-11-27', '2026-12-02')]
  const nov = monthGrid('2026-11')
  assert.deepEqual(pieces(r, nov[4]), [['Anna Nowak', 5, 3, 0]]) // Fri 27 - Sun 29
  assert.deepEqual(pieces(r, nov[5]), [['Anna Nowak', 1, 3, 0]]) // Mon 30 - Wed 2
  assert.deepEqual(pieces(r, nov[3]), [])
  const dec = monthGrid('2026-12')
  assert.equal(dec[0][0], '2026-11-30')
  assert.deepEqual(pieces(r, dec[0]), [['Anna Nowak', 1, 3, 0]])
})

test('calendar: Overlapping leaves', () => {
  const r = [row('Jan Kowalski', '2026-11-11', '2026-11-17'), row('Anna Nowak', '2026-11-09', '2026-11-13')]
  const nov = monthGrid('2026-11')
  assert.deepEqual(pieces(r, nov[2]), [['Anna Nowak', 1, 5, 0], ['Jan Kowalski', 3, 5, 1]])
  assert.deepEqual(pieces(r, nov[3]), [['Jan Kowalski', 1, 2, 0]])
  // a later leave reuses a freed line
  const later = [...r, row('Ewa Lis', '2026-11-14', '2026-11-15')]
  assert.deepEqual(pieces(later, nov[2]).at(-1), ['Ewa Lis', 6, 2, 0])
})

test('calendar: Leave across two months', () => {
  const r = [row('Anna Nowak', '2026-11-27', '2026-12-02'), row('Jan Kowalski', '2026-10-05', '2026-10-06')]
  assert.deepEqual(leavesInMonth(r, '2026-11').map((x) => x.leave.architect), ['Anna Nowak'])
  assert.deepEqual(leavesInMonth(r, '2026-12').map((x) => x.leave.architect), ['Anna Nowak'])
  assert.deepEqual(leavesInMonth(r, '2027-01'), [])
  assert.equal(formatShortRange(r[0].leave), '27.11 - 02.12')
})

test('leaves: Pick a range', () => {
  const first = pickDay({ from: '', to: '', picking: false }, '2026-12-01')
  assert.deepEqual(first, { from: '2026-12-01', to: '2026-12-01', picking: true })
  assert.deepEqual(pickDay(first, '2026-12-05'), { from: '2026-12-01', to: '2026-12-05', picking: false })
})

test('leaves: Pick one day', () => {
  const first = pickDay({ from: '', to: '', picking: false }, '2026-12-07')
  assert.deepEqual(pickDay(first, '2026-12-07'), { from: '2026-12-07', to: '2026-12-07', picking: false })
})

test('leaves: Earlier day starts again', () => {
  const first = pickDay({ from: '', to: '', picking: false }, '2026-12-05')
  assert.deepEqual(pickDay(first, '2026-12-01'), { from: '2026-12-01', to: '2026-12-01', picking: true })
})

test('leaves: Change an existing leave', () => {
  const loaded = { from: '2026-12-01', to: '2026-12-05', picking: false }
  const first = pickDay(loaded, '2026-12-01')
  assert.deepEqual(pickDay(first, '2026-12-08'), { from: '2026-12-01', to: '2026-12-08', picking: false })
})
