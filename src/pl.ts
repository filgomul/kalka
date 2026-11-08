// Every UI string, in Polish.

import type { BranchKey, Status } from './model.ts'
import type { TaskStatus } from './tasks.ts'
import type { MeetingType } from './meetings.ts'
import type { Kind } from './calendar.ts'

// Milestone style and template names live in model.ts as default data (STYLES, TEMPLATES).

export const months = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień']
export const monthsShort = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru']
export const weekdays = ['pon', 'wt', 'śr', 'czw', 'pt', 'sob', 'nie']

export const branchLabels: Record<BranchKey, string> = {
  konstrukcja: 'branża konstrukcyjna',
  sanitarna: 'branża sanitarna',
  elektryczna: 'branża elektryczna',
  drogowa: 'branża drogowa',
  ppoz: 'rzeczoznawca ppoż.',
  bhpSanepid: 'BHP i Sanepid',
}

export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: 'Do zrobienia',
  doing: 'W trakcie',
  done: 'Wykonane',
}

export const meetingTypeLabels: Record<MeetingType, string> = {
  stacjonarne: 'stacjonarne',
  online: 'online',
}

export const statusLabels: Record<Status, string> = {
  aktywny: 'aktywny',
  wstrzymany: 'wstrzymany',
  zakończony: 'zakończony',
}

export const t = {
  appName: 'Kalka',
  tagline: 'projekty i terminy pracowni',
  folder: 'otwarty folder danych',
  projects: 'Projekty',
  unsupported: 'Kalka działa tylko w przeglądarkach Google Chrome i Microsoft Edge. Otwórz tę stronę w jednej z nich.',
  pickFolder: 'Wybierz folder Kalka',
  openFolder: 'Otwórz folder Kalka',
  pickHint: 'Wskaż folder Kalka na wspólnym OneDrive. Przeglądarka zapamięta wybór na tym komputerze.',
  folderUnavailable: 'Nie udało się otworzyć zapamiętanego folderu (przeniesiony, usunięty albo brak zgody). Wybierz go ponownie.',
  loading: 'Wczytywanie…',
  brokenFiles: 'Nie udało się odczytać plików:',
  syncConflict: 'konflikt synchronizacji',

  newProject: 'Nowy projekt',
  refresh: 'Odśwież',
  search: 'Szukaj (tytuł, miejscowość, adres)',
  allArchitects: 'wszyscy architekci',
  statusDefault: 'aktywne i wstrzymane',
  statusAll: 'wszystkie statusy',
  empty: 'Brak projektów.',
  noUpcoming: 'brak nadchodzących terminów',
  overdue: 'po terminie',

  colLp: 'l.p.',
  colTitle: 'tytuł',
  colCity: 'miejscowość',
  colArchitect: 'arch. prowadzący',
  colNext: 'najbliższy termin',
  colStatus: 'status',

  project: 'Projekt',
  lp: 'l.p.',
  title: 'tytuł',
  city: 'miejscowość',
  address: 'adres',
  leadArchitect: 'arch. prowadzący',
  noArchitects: 'Dodaj architektów w pliku kalka.json',
  status: 'status',
  milestones: 'Terminy',
  day: 'dzień',
  done: 'zrealizowane',
  planned: 'planowane',
  confirmed: 'potwierdzone',
  unconfirmed: 'niepotwierdzone',
  month: 'miesiąc',
  branches: 'Zakres branż',
  notes: 'uwagi',
  save: 'Zapisz',
  saving: 'Zapisywanie…',
  cancel: 'Anuluj',
  titleRequired: 'Podaj tytuł projektu.',
  conflict: 'Ktoś inny zapisał ten projekt w międzyczasie. Odśwież i wprowadź zmiany ponownie.',
  saveFailed: 'Nie udało się zapisać:',
  notFound: 'Nie ma takiego projektu.',
  back: 'Wróć',

  tasks: 'Zadania',
  tasksHint: 'Zmiany zadań zapisują się od razu.',
  addTask: 'Dodaj zadanie',
  newTask: 'Nowe zadanie',
  task: 'Zadanie',
  taskTitle: 'tytuł',
  description: 'opis',
  due: 'termin',
  assignee: 'osoba',
  taskState: 'stan',
  remove: 'Usuń',
  confirmRemove: (title: string) => `Usunąć zadanie „${title}”?`,
  addMilestone: 'Dodaj termin',
  newMilestone: 'Nowy termin',
  milestone: 'Termin',
  milestoneTitle: 'nazwa',
  milestoneStyle: 'styl',
  milestoneTitleRequired: 'Podaj nazwę terminu.',
  add: 'Dodaj',
  change: 'Zmień',
  edit: 'Edytuj',
  moveMilestone: 'Przesuń termin',
  confirmRemoveMilestone: (name: string) => `Usunąć termin „${name}”?`,
  milestonesHint: 'Zmiany terminów zapisują się od razu.',
  timelineConflict: 'Ktoś inny zmienił ten projekt w międzyczasie. Terminy wczytano ponownie - powtórz zmianę.',
  taskTitleRequired: 'Podaj tytuł zadania.',
  taskConflict: 'Ktoś inny zmienił to zadanie w międzyczasie. Zadania są odświeżone, wprowadź zmianę ponownie.',

  calendar: 'Kalendarz',
  deadlines: 'Terminy',
  today: 'Dziś',
  prevMonth: 'poprzedni miesiąc',
  nextMonth: 'następny miesiąc',
  prevRange: 'poprzedni okres',
  nextRange: 'następny okres',
  from: 'od',
  to: 'do',
  rangeLength: 'liczba miesięcy',
  pickMonth: 'wybierz miesiąc',
  viewMonth: 'Miesiąc',
  viewOverview: 'Przegląd',
  more: 'więcej',
  wholeMonth: 'mies.',
  allProjects: 'wszystkie projekty',
  thisMonth: 'w tym miesiącu',
  legend: 'legenda',
  weekOf: 'tydzień od',
  noDeadlines: 'Brak terminów.',
  colDate: 'data',
  colMilestone: 'etap',
  colProject: 'projekt',

  leaves: 'Urlopy',
  leavesCurrent: 'Bieżące i nadchodzące',
  leavesPast: 'Minione',
  noLeaves: 'Brak nadchodzących urlopów.',
  addLeave: 'Dodaj urlop',
  newLeave: 'Nowy urlop',
  leave: 'Urlop',
  architect: 'architekt',
  architectFilter: 'Architekt',
  ongoing: 'trwa',
  leaveArchitectRequired: 'Wybierz architekta.',
  leaveDatesRequired: 'Podaj daty od i do.',
  leaveOrder: 'Data „do” nie może być wcześniejsza niż „od”.',
  confirmRemoveLeave: (who: string, dates: string) => `Usunąć urlop: ${who}, ${dates}?`,
  leaveConflict: 'Ktoś inny zmienił ten urlop w międzyczasie. Urlopy są odświeżone, wprowadź zmianę ponownie.',
  leaveTitle: (who: string, dates: string) => `${who} - urlop ${dates}`,
  colDates: 'daty',
  leaveDates: 'termin urlopu',
  pickFirstDay: 'Kliknij pierwszy dzień urlopu.',
  pickLastDay: 'Kliknij ostatni dzień urlopu (ten sam dzień dla jednodniowego).',
  leaveShort: 'urlop',

  meetings: 'Spotkania',
  meeting: 'Spotkanie',
  newMeeting: 'Nowe spotkanie',
  addMeeting: 'Dodaj spotkanie',
  meetingTitle: 'nazwa',
  meetingDate: 'data',
  meetingType: 'typ',
  meetingNote: 'notatka',
  noProject: 'bez projektu',
  viewCards: 'Karty',
  viewList: 'Lista',
  noMeetings: 'Brak nadchodzących spotkań.',
  meetingsHint: 'Zmiany spotkań zapisują się od razu.',
  allMeetings: 'wszystkie spotkania',
  withProject: 'z projektem',
  withoutProject: 'bez projektu',
  colNote: 'notatka',
  colType: 'typ',
  meetingTitleRequired: 'Podaj nazwę spotkania.',
  meetingDateRequired: 'Podaj datę spotkania.',
  meetingStartRequired: 'Podaj godzinę „od”.',
  meetingOrder: 'Godzina „do” nie może być wcześniejsza niż „od”.',
  confirmRemoveMeeting: (title: string) => `Usunąć spotkanie „${title}”?`,
  /** "1 spotkanie", "2 spotkania", "5 spotkań", "22 spotkania" */
  meetingCount: (n: number) => {
    const few = n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)
    return `${n} ${n === 1 ? 'spotkanie' : few ? 'spotkania' : 'spotkań'}`
  },
  meetingConflict: 'Ktoś inny zmienił to spotkanie w międzyczasie. Spotkania są odświeżone, wprowadź zmianę ponownie.',

  filterArchitect: 'Architekt prowadzący',
  filterStatus: 'Status projektu',
  filterProject: 'Projekt',
  filterShow: 'Pokaż',
  showEverything: 'wszystko',
  showNothing: 'nic',
  noEntries: 'brak wpisów',
}

/** The "Pokaż" choices in the calendar. */
export const kindLabels: Record<Kind, string> = {
  terminy: 'Terminy',
  spotkania: 'Spotkania',
  urlopy: 'Urlopy',
}
