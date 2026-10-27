const min = (n) => new Date(Date.now() - n * 60000).toISOString();
const hrs = (n) => min(n * 60);
const days = (n) => hrs(n * 24);
const ahead = (n) => {
  const d = new Date(Date.now() + n * 86400000);
  const p = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T08:00`;
};

const item = (id, o) => ({ priority: 'Normal', push: false, scheduledFor: null, publishedAt: null, reach: 0, open: 0, readSec: 0, ...o, id });

export function makeContent() {
  return [
    item(1, { title: 'CSC 304 exam venue moved to Auditorium B', type: 'Announcement', priority: 'Urgent', source: 'Examinations Office', audience: 'Computer Science · 300L', status: 'Live', updatedAt: min(32), publishedAt: min(32), push: true, reach: 214, open: 93, readSec: 38 }),
    item(2, { title: 'Second semester registration closes 26 September', type: 'Announcement', priority: 'Important', source: 'Registrar', audience: 'All students', status: 'Live', updatedAt: hrs(26), publishedAt: hrs(26), push: true, reach: 4870, open: 71, readSec: 56 }),
    item(3, { title: 'FOCIT introduces machine learning elective for 400 level', type: 'News', source: 'FOCIT Comms', audience: 'FOCIT', status: 'Draft', updatedAt: days(3) }),
    item(4, { title: 'New study hub opens in Block C with 24-hour access', type: 'News', source: 'Student Affairs', audience: 'All students', status: 'Live', updatedAt: days(2), publishedAt: days(2), reach: 5240, open: 55, readSec: 112 }),
    item(5, { title: 'Library extends opening hours during exams', type: 'News', source: 'Library Services', audience: 'All students', status: 'Live', updatedAt: days(3), publishedAt: days(3), reach: 3120, open: 62, readSec: 74 }),
    item(6, { title: 'Hostel allocation list for 2026/2027 session released', type: 'Announcement', priority: 'Important', source: 'Student Affairs', audience: 'All students', status: 'Live', updatedAt: days(4), publishedAt: days(4), push: true, reach: 4410, open: 88, readSec: 51 }),
    item(7, { title: 'FOCIT Tech Week: speaker lineup confirmed', type: 'Event', source: 'FOCIT Comms', audience: 'FOCIT', status: 'Live', updatedAt: days(5), publishedAt: days(5), push: true, reach: 640, open: 74, readSec: 96 }),
    item(8, { title: 'Inter-faculty football tournament registration', type: 'Event', source: 'Sports Directorate', audience: 'Entire institution', status: 'Live', updatedAt: days(6), publishedAt: days(6), reach: 2380, open: 49, readSec: 121 }),
    item(9, { title: 'Revised lecture timetable for Computer Science 200L', type: 'Announcement', source: 'Computer Science Department', audience: 'Computer Science · 200L', status: 'Live', updatedAt: days(7), publishedAt: days(7), push: true, reach: 176, open: 90, readSec: 44 }),
    item(10, { title: 'Scholarship applications open for final-year students', type: 'News', source: 'Student Affairs', audience: 'Final year students', status: 'Scheduled', updatedAt: days(1), scheduledFor: ahead(3) }),
    item(11, { title: 'Campus network maintenance on Saturday night', type: 'Announcement', priority: 'Important', source: 'ICT Unit', audience: 'Entire institution', status: 'Live', updatedAt: days(8), publishedAt: days(8), push: true, reach: 3960, open: 77, readSec: 29 }),
    item(12, { title: 'Convocation rehearsal schedule', type: 'Event', source: 'Registrar', audience: 'Graduating students', status: 'Draft', updatedAt: days(9) }),
    item(13, { title: 'Guest lecture on cloud security', type: 'Event', source: 'FOCIT Comms', audience: 'FOCIT', status: 'Live', updatedAt: days(9), publishedAt: days(9), reach: 412, open: 58, readSec: 88 }),
    item(14, { title: 'Matriculation ceremony dress code', type: 'Announcement', source: 'Registrar', audience: 'New students', status: 'Draft', updatedAt: days(10) }),
  ];
}

const ev = (id, o) => ({ saved: 0, scheduledFor: null, ...o, id });
export function makeEvents() {
  return [
    ev(1, { title: 'FOCIT Tech Week — opening keynote', when: '2026-11-02T10:00', venue: 'Main Auditorium', type: 'Official', status: 'Live', saved: 340 }),
    ev(2, { title: 'Matriculation ceremony 2025/2026', when: '2026-10-23T09:00', venue: 'Sports Complex', type: 'Official', status: 'Live', saved: 1102 }),
    ev(3, { title: 'Inter-faculty football final', when: '2026-11-14T16:00', venue: 'University Stadium', type: 'Official', status: 'Scheduled', scheduledFor: '2026-10-20T08:00' }),
    ev(4, { title: 'Career fair 2026', when: '2026-11-19T10:00', venue: 'Student Centre', type: 'Official', status: 'Live', saved: 764 }),
    ev(5, { title: 'Departmental orientation for new students', when: '2026-10-16T11:00', venue: 'Lecture Theatre 2', type: 'Official', status: 'Live', saved: 295 }),
    ev(6, { title: 'Faculty research symposium', when: '2026-12-03T09:30', venue: 'Senate Building Hall', type: 'Official', status: 'Draft' }),
    ev(7, { title: 'Lagos Developer Bootcamp recruitment drive', when: '2026-10-28T11:00', venue: 'FOCIT Block A', type: 'Promoted', status: 'Live' }),
    ev(8, { title: 'Women in Tech mixer', when: '2026-11-07T15:00', venue: 'Innovation Hub', type: 'Promoted', status: 'Live' }),
    ev(9, { title: 'Startup pitch night', when: '2026-11-12T17:30', venue: 'Business School Hall', type: 'Promoted', status: 'Live' }),
    ev(10, { title: 'Cybersecurity CTF qualifier', when: '2026-11-21T09:00', venue: 'Computer Lab 3', type: 'Promoted', status: 'Live' }),
    ev(11, { title: 'Blood donation drive', when: '2026-10-30T10:00', venue: 'Medical Centre forecourt', type: 'Official', status: 'Live', saved: 188 }),
    ev(12, { title: 'Alumni homecoming', when: '2026-12-12T12:00', venue: 'Main Auditorium', type: 'Official', status: 'Draft' }),
  ];
}

export const makeCalendar = () => [
  { id: 1, date: '2026-09-18', title: 'Second semester lectures begin', category: 'Academic Session', status: 'Live', scheduledFor: null },
  { id: 2, date: '2026-09-22', title: 'Course registration opens', category: 'Registration', status: 'Live', scheduledFor: null },
  { id: 3, date: '2026-09-25', title: 'Matriculation ceremony', category: 'Ceremony', status: 'Live', scheduledFor: null },
  { id: 4, date: '2026-09-30', title: 'Faculty assessment week begins', category: 'Examinations', status: 'Draft', scheduledFor: null },
  { id: 5, date: '2026-10-01', title: 'Independence Day', category: 'Public Holiday', status: 'Live', scheduledFor: null },
];

export const makeAdmins = () => [
  { id: 1, name: 'Dr. O. Eboreime', email: 'o.eboreime@uniosun.example', role: 'Faculty administrator', scope: 'FOCIT · news, events, announcements', status: 'Active', lastActive: min(59) },
  { id: 2, name: 'M. Athar', email: 'm.athar@uniosun.example', role: 'Department administrator', scope: 'Computer Science · announcements only', status: 'Active', lastActive: hrs(1) },
  { id: 3, name: 'Registrar’s Office', email: 'registrar@uniosun.example', role: 'Institution administrator', scope: 'Full publishing rights, institution-wide', status: 'Active', lastActive: hrs(2) },
  { id: 4, name: 'Examinations Office', email: 'exams@uniosun.example', role: 'Department administrator', scope: 'FOCIT · announcements and calendar', status: 'Active', lastActive: min(70) },
  { id: 5, name: 'Prof. K. Adeyemi', email: 'k.adeyemi@uniosun.example', role: 'Institution administrator', scope: 'Full publishing rights, institution-wide', status: 'Active', lastActive: days(12) },
  { id: 6, name: 'T. Ojo', email: 't.ojo@uniosun.example', role: 'Department administrator', scope: 'Technology · news and announcements', status: 'Active', lastActive: days(52) },
  { id: 7, name: 'Mrs. B. Salami', email: 'b.salami@uniosun.example', role: 'Faculty administrator', scope: 'Science · news and events', status: 'Active', lastActive: days(3) },
  { id: 8, name: 'ICT Unit', email: 'ict@uniosun.example', role: 'Department administrator', scope: 'ICT · announcements only', status: 'Active', lastActive: hrs(5) },
  { id: 9, name: 'Student Affairs Office', email: 'studentaffairs@uniosun.example', role: 'Department administrator', scope: 'Student Affairs · news, events, announcements', status: 'Active', lastActive: days(1) },
  { id: 10, name: 'Dr. A. Fagbemi', email: 'a.fagbemi@uniosun.example', role: 'Faculty administrator', scope: 'Engineering · news, events, announcements', status: 'Suspended', lastActive: days(64) },
  { id: 11, name: 'Mr. C. Nwosu', email: 'c.nwosu@uniosun.example', role: 'Department administrator', scope: 'Mathematics · announcements and calendar', status: 'Active', lastActive: days(9) },
  { id: 12, name: 'Library Services', email: 'library@uniosun.example', role: 'Department administrator', scope: 'Library · news and announcements', status: 'Active', lastActive: hrs(3) },
];

export const makeAlerts = () => [
  { id: 1, title: 'Campus Emergency Test', message: 'This is a high priority emergency alert broadcast.', sentAt: days(46) },
];

export const DEFAULT_PROFILE = {
  first: 'John',
  last: 'Doe',
  phone: '+234 801 234 5678',
  email: 'john.doe@uniosun.example',
  role: 'Faculty administrator',
  permission: 'Super admin',
  department: 'Administration',
  photo: null,
};
export const DEFAULT_INSTITUTION = {
  name: 'Osun State University',
  short: 'UNIOSUN',
  site: 'uniosun.example',
  industry: 'Education',
  address: '',
  contactEmail: '',
  phone: '',
  publisherName: '',
  replyTo: '',
  defaultAudience: 'Students',
  defaultPriority: 'Normal',
  requireUrgentApproval: true,
};
export const DEFAULT_PREFS = { push: true, email: true, urgent: true, digest: false };
