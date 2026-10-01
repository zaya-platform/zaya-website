// Email drafts for the guided enquiry. Kept free of DOM access so the exact
// mailto: links visitors receive can be unit-tested.

export const ENQUIRY_ADDRESS = 'zayaapp@gmail.com';

/** Builds a mailto: link; subject and body are plain text and are encoded exactly once here. */
export function mailtoHref(subject: string, body: string): string {
  return `mailto:${ENQUIRY_ADDRESS}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Draft after a smart review (or its fallback): the visitor's own message plus the suggested route. */
export function reviewedEnquiryMailto(route: string, routeLabel: string, text: string, viaFallback: boolean): string {
  const subject = `ZAYA ${route} enquiry`;
  const body = viaFallback
    ? `${text}\n\nSent via the website enquiry fallback.`
    : `${text}\n\nSuggested website route: ${routeLabel}`;
  return mailtoHref(subject, body);
}

/**
 * Draft after an instant answer from the published question bank. The visitor's own
 * words lead the email whenever they differ from the bank question, so nothing they
 * wrote is lost by being answered instantly.
 */
export function instantAnswerMailto(entry: { route: string; question: string }, typed: string): string {
  const own = typed.trim();
  const sameAsBank = own === '' || own === entry.question;
  const body = sameAsBank
    ? `${entry.question}\n\nAnswered from ZAYA's published information.`
    : `${own}\n\nAnswered on the website from ZAYA's published information for: ${entry.question}`;
  return mailtoHref(`ZAYA ${entry.route} enquiry`, body);
}
