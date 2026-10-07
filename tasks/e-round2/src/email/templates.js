// Transactional email templates. Placeholders look like {{name}}.
// Every template has a subject and a plain-text body; there is no HTML mail.

export const TEMPLATES = {
  'application-received': {
    subject: 'We received your application, {{startup}}',
    body: [
      'Hi {{name}},',
      '',
      'Thanks for applying to Fieldnote on behalf of {{startup}}. We have your application',
      'with reference {{reference}} and will be in touch once the review is done.',
      '',
      'You can reply to this email if something needs correcting.',
      '',
      'The Fieldnote team',
    ].join('\n'),
  },
  'rsvp-confirmed': {
    subject: 'You are on the list: {{event}}',
    body: [
      'Hi {{name}},',
      '',
      'Your seat at {{event}} on {{date}} is confirmed. Doors open at {{doors}}.',
      'The venue is {{venue}}.',
      '',
      'Cannot make it? Please cancel so someone on the waitlist can take your seat.',
      '',
      'The Fieldnote team',
    ].join('\n'),
  },
  'rsvp-waitlisted': {
    subject: 'Waitlisted: {{event}}',
    body: [
      'Hi {{name}},',
      '',
      '{{event}} on {{date}} is full at the moment, so you are number {{position}} on the waitlist.',
      'We will email you straight away if a seat opens up.',
      '',
      'The Fieldnote team',
    ].join('\n'),
  },
  'mentor-intro': {
    subject: 'Introduction: {{mentor}} and {{startup}}',
    body: [
      'Hi {{mentor}} and {{name}},',
      '',
      'This is the introduction we promised. {{mentor}} will mentor {{startup}} this month,',
      'with a focus on {{topic}}. Please agree a first session within the week.',
      '',
      'The Fieldnote team',
    ].join('\n'),
  },
  'interview-slot': {
    subject: 'Your interview slot: {{date}} at {{time}}',
    body: [
      'Hi {{name}},',
      '',
      'Your interview with the Fieldnote panel is booked for {{date}} at {{time}} (Stockholm time)',
      'in {{room}}. It takes 30 minutes.',
      '',
      'The Fieldnote team',
    ].join('\n'),
  },
};

export function templateNames() {
  return Object.keys(TEMPLATES);
}
