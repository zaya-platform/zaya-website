// Real contact details (Part 7) + form wiring (F5). Editable via the CMS.
export const contact = {
  email: 'zayaapp@gmail.com',
  phones: ['+251 91 283 5922', '+251 96 519 6475'],
  location: 'Addis Ababa, Ethiopia',
  // F5 — set at deploy (Formspree/Netlify Forms). Until then the form shows the
  // email/phones as the working channel instead of pretending to submit.
  formEndpoint: '', // e.g. 'https://formspree.io/f/xxxxxxx'
  // Short privacy line shown on the form (it collects names/phones) — F5.
  formPrivacyNote:
    'We use your name and phone only to reply about the pilot. See our Privacy Policy.',
} as const;
