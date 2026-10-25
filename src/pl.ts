// Every UI string, in Polish.

import type { BranchKey, MilestoneKey, Status } from './model.ts'

export const milestoneLabels: Record<MilestoneKey, string> = {
  rozpoczecie: 'data rozpoczęcia',
  koncepcja: 'wydanie koncepcji',
  pbDoUrzedu: 'PB do urzędu',
  uzupelnienie: 'uzupełnienie do urzędu',
  pozwolenie: 'uzyskanie pozwolenia',
  branzysci: 'termin branżystów',
}

export const branchLabels: Record<BranchKey, string> = {
  konstrukcja: 'branża konstrukcyjna',
  sanitarna: 'branża sanitarna',
  elektryczna: 'branża elektryczna',
  drogowa: 'branża drogowa',
  ppoz: 'rzeczoznawca ppoż.',
  bhpSanepid: 'BHP i Sanepid',
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
  back: 'Wróć do listy',
}
