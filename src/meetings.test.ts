import { test } from 'node:test'
import assert from 'node:assert/strict'
import { byTime, durationLabel, emptyMeeting, endChoices, parseTime, startChoices, withStart, filterMeetings, formatWhen, initialView, meetingError, meetingsForCalendar, parseMeeting, prepareMeetingForSave, splitMeetings, type Meeting } from './meetings.ts'
import { t } from './pl.ts'

const TODAY = '2026-11-10'

function meeting(fields: Partial<Meeting>): Meeting {
  return { id: fields.title ?? 'm', title: 'Spotkanie', date: TODAY, architect: '', type: 'stacjonarne', note: '', updatedAt: '', ...fields }
}
const row = (fields: Partial<Meeting>) => ({ meeting: meeting(fields) })
const titles = (rows: { meeting: Meeting }[]) => rows.map((r) => r.meeting.title)

const lipowa = { project: { id: 'p-lipowa' }, file: 'lipowa.json' }
const sosnowa = { project: { id: 'p-sosnowa' }, file: 'sosnowa.json' }
const projects = [lipowa, sosnowa]
const ids = new Set(projects.map((p) => p.project.id))

test('meetings: Title missing', () => {
  assert.equal(meetingError(meeting({ title: '  ' })), t.meetingTitleRequired)
})

test('meetings: Day missing', () => {
  assert.equal(meetingError(meeting({ date: '' })), t.meetingDateRequired)
  assert.equal(meetingError(meeting({ date: '2026-02-30' })), t.meetingDateRequired)
})

test('meetings: End without start', () => {
  assert.equal(meetingError(meeting({ start: '', end: '11:00' })), t.meetingStartRequired)
})

test('meetings: End before start', () => {
  assert.equal(meetingError(meeting({ start: '11:00', end: '10:30' })), t.meetingOrder)
  assert.equal(meetingError(meeting({ start: '11:00', end: '11:00' })), '')
})

test('meetings: Only a day', () => {
  const draft = { ...emptyMeeting(), title: 'Odbiór próbek', date: '2026-11-20', start: '', end: '' }
  assert.equal(meetingError(draft), '')
  const saved = prepareMeetingForSave(draft)
  assert.equal(saved.type, 'stacjonarne')
  assert.equal(saved.architect, '')
  assert.ok(!('start' in saved) && !('end' in saved) && !('projectId' in saved))
})

test('meetings: Sections and order', () => {
  const rows = [
    row({ title: 'A', date: '2026-11-20', start: '10:00' }),
    row({ title: 'B', date: '2026-11-12' }),
    row({ title: 'C', date: '2026-11-12', start: '09:00' }),
    row({ title: 'D', date: '2026-10-01' }),
    row({ title: 'E', date: '2026-11-03', start: '14:00' }),
  ]
  const { current, past } = splitMeetings(rows, TODAY)
  assert.deepEqual(titles(current), ['C', 'B', 'A'])
  assert.deepEqual(titles(past), ['E', 'D'])
})

test('meetings: Untimed after timed in the past', () => {
  const rows = [row({ title: 'X', date: '2026-11-03' }), row({ title: 'Y', date: '2026-11-03', start: '09:00' }), row({ title: 'Z', date: '2026-11-03', start: '15:00' })]
  assert.deepEqual(titles(splitMeetings(rows, TODAY).past), ['Z', 'Y', 'X'])
})

test('meetings: Today', () => {
  const { current, past } = splitMeetings([row({ date: TODAY, start: '08:00' })], TODAY)
  assert.equal(current.length, 1)
  assert.equal(past.length, 0)
})

test('meetings: No upcoming meetings', () => {
  const { current, past } = splitMeetings([row({ date: '2026-11-01' })], TODAY)
  assert.equal(current.length, 0)
  assert.equal(past.length, 1)
})

test('meetings: Hand-edited file', () => {
  const m = parseMeeting({ id: 'x', title: 'Spotkanie', date: '2026-11-14', type: 'telefon', start: '10', end: '11:00' })
  assert.equal(m.type, 'stacjonarne')
  assert.equal(m.start, undefined)
  assert.equal(m.end, undefined)
  assert.equal(m.note, '')
  assert.equal(m.architect, '')
})

test('meetings: Bad day', () => {
  assert.throws(() => parseMeeting({ id: 'x', title: 'Spotkanie', date: '2026-11' }))
  assert.throws(() => parseMeeting({ title: 'Spotkanie', date: '2026-11-14' }))
})

test('meetings: Project gone', () => {
  const rows = [row({ title: 'gone', projectId: 'p-usuniety' }), row({ title: 'lipowa', projectId: 'p-lipowa' })]
  assert.deepEqual(titles(filterMeetings(rows, { architect: '', withProject: 'bez' }, ids)), ['gone'])
  assert.deepEqual(titles(filterMeetings(rows, { architect: '', withProject: 'z' }, ids)), ['lipowa'])
})

test('meetings: One architect', () => {
  const rows = [row({ title: 'a', architect: 'Anna Nowak' }), row({ title: 'j', architect: 'Jan Kowalski' }), row({ title: 'n' })]
  assert.deepEqual(titles(filterMeetings(rows, { architect: 'Anna Nowak', withProject: '' }, ids)), ['a'])
})

test('meetings: With a project', () => {
  const rows = [row({ title: 'l', projectId: 'p-lipowa' }), row({ title: 's', projectId: 'p-sosnowa' }), row({ title: 'n' })]
  assert.deepEqual(titles(filterMeetings(rows, { architect: '', withProject: 'z' }, ids)), ['l', 's'])
})

test('meetings: Without a project', () => {
  const rows = [row({ title: 'l', projectId: 'p-lipowa' }), row({ title: 'n' })]
  assert.deepEqual(titles(filterMeetings(rows, { architect: '', withProject: 'bez' }, ids)), ['n'])
})

test('meetings: Six meetings', () => {
  assert.equal(initialView(6), 'cards')
  assert.equal(initialView(0), 'cards')
})

test('meetings: Seven meetings', () => {
  assert.equal(initialView(7), 'list')
})

test('meetings: Full card (date and times)', () => {
  assert.equal(formatWhen(meeting({ date: '2026-11-14', start: '10:00', end: '11:30' })), '14.11.2026 10:00-11:30')
  assert.equal(formatWhen(meeting({ date: '2026-11-14', start: '10:00' })), '14.11.2026 10:00')
  assert.equal(formatWhen(meeting({ date: '2026-11-14' })), '14.11.2026')
})

test('calendar: Order in a day', () => {
  const list = [meeting({ title: 'bez', date: '2026-11-14' }), meeting({ title: '14', date: '2026-11-14', start: '14:00' }), meeting({ title: '09', date: '2026-11-14', start: '09:00' })]
  assert.deepEqual(list.sort(byTime).map((m) => m.title), ['09', '14', 'bez'])
})

test('calendar: Meetings by their architect', () => {
  const rows = [
    row({ title: 'lipowa z Anną', architect: 'Anna Nowak', projectId: 'p-lipowa' }),
    row({ title: 'luźne Anny', architect: 'Anna Nowak' }),
    row({ title: 'luźne Jana', architect: 'Jan Kowalski' }),
  ]
  assert.deepEqual(titles(meetingsForCalendar(rows, { architect: 'Anna Nowak', projects: null }, projects)), ['lipowa z Anną', 'luźne Anny'])
})

test('calendar: Meetings of one project', () => {
  const rows = [
    row({ title: 'lipowa Jana', architect: 'Jan Kowalski', projectId: 'p-lipowa' }),
    row({ title: 'sosnowa', projectId: 'p-sosnowa' }),
    row({ title: 'luźne' }),
  ]
  assert.deepEqual(titles(meetingsForCalendar(rows, { architect: 'Anna Nowak', projects: ['lipowa.json'] }, projects)), ['lipowa Jana'])
  assert.deepEqual(titles(meetingsForCalendar(rows, { architect: '', projects: ['lipowa.json', 'sosnowa.json'] }, projects)), ['lipowa Jana', 'sosnowa'])
})

test('calendar: No project ticked', () => {
  const rows = [row({ title: 'lipowa', projectId: 'p-lipowa' }), row({ title: 'luźne' })]
  assert.deepEqual(meetingsForCalendar(rows, { architect: '', projects: [] }, projects), [])
})

test('calendar: Status leaves meetings alone', () => {
  const rows = [row({ title: 'aktywny', projectId: 'p-lipowa' })]
  assert.deepEqual(titles(meetingsForCalendar(rows, { architect: '', projects: null, status: 'zakończony' } as any, projects)), ['aktywny'])
})

test('calendar: Counts', () => {
  assert.deepEqual([1, 2, 3, 4, 5, 12, 14, 22, 25, 112].map(t.meetingCount), [
    '1 spotkanie', '2 spotkania', '3 spotkania', '4 spotkania', '5 spotkań', '12 spotkań', '14 spotkań', '22 spotkania', '25 spotkań', '112 spotkań',
  ])
})

test('meetings: Pick the start', () => {
  assert.deepEqual(withStart({}, '10:00'), { start: '10:00', end: '11:00' })
  const list = startChoices().map((c) => c.time)
  assert.deepEqual([list[0], list[1], list.at(-1), list.length], ['07:00', '07:15', '21:00', 57])
})

test('meetings: End list', () => {
  const list = endChoices('10:00').map((c) => `${c.time} ${c.note}`)
  assert.deepEqual(list.slice(0, 4), ['10:15 15 min', '10:30 30 min', '10:45 45 min', '11:00 1 h'])
  assert.equal(list.at(-1), '18:00 8 h')
  assert.equal(durationLabel(90), '1 h 30 min')
  assert.equal(endChoices('20:00').at(-1)?.time, '23:45')
})

test('meetings: Typed time', () => {
  for (const typed of ['930', '9.30', '9:30', '09:30', '0930', ' 9,30 ']) assert.equal(parseTime(typed), '09:30', typed)
  assert.equal(parseTime('9'), '09:00')
  assert.equal(parseTime('14'), '14:00')
  for (const bad of ['jutro', '25', '9:75', '12345', '']) assert.equal(parseTime(bad), null, bad)
})

test('meetings: Length kept', () => {
  assert.deepEqual(withStart({ start: '10:00', end: '11:30' }, '13:00'), { start: '13:00', end: '14:30' })
})

test('meetings: Past midnight', () => {
  assert.deepEqual(withStart({}, '23:30'), { start: '23:30', end: '' })
  assert.deepEqual(withStart({ start: '10:00', end: '12:00' }, '22:30'), { start: '22:30', end: '' })
})

test('meetings: No times', () => {
  assert.deepEqual(withStart({ start: '10:00', end: '11:00' }, ''), { start: '', end: '' })
})
