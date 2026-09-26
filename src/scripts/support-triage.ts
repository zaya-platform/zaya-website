import questions from '../data/triage-questions.json';
import { matchBankQuestion } from './question-match';

type BankQuestion = { route: string; label: string; group: string; question: string; answer: string };
type TriageReply = { route?: unknown; routeConfidence?: unknown; urgency?: unknown; humanReview?: unknown; needsReview?: unknown };

const bank = questions as BankQuestion[];

const routeLabels: Record<string, string> = {
  customer_order: 'Shopping and orders',
  merchant: 'Merchant support',
  delivery: 'Delivery support',
  ride: 'RIDE enquiry',
  diaspora: 'Diaspora enquiry',
  payment_account: 'Payment or account support',
  general: 'General ZAYA enquiry',
};

const reducedMotion = (): boolean =>
  matchMedia('(prefers-reduced-motion: reduce)').matches ||
  document.documentElement.classList.contains('reduce-motion');

const form = document.querySelector<HTMLFormElement>('#zaya-triage-form');

if (form) {
  const message = form.querySelector<HTMLTextAreaElement>('#triage-message');
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const status = form.querySelector<HTMLElement>('[data-triage-status]');
  const hint = form.querySelector<HTMLElement>('[data-triage-hint]');
  const result = document.querySelector<HTMLElement>('#triage-result');
  const routeText = result?.querySelector<HTMLElement>('[data-triage-route]');
  const urgencyCell = result?.querySelector<HTMLElement>('[data-triage-priority-cell]');
  const urgencyText = result?.querySelector<HTMLElement>('[data-triage-urgency]');
  const reviewCell = result?.querySelector<HTMLElement>('[data-triage-review-cell]');
  const reviewText = result?.querySelector<HTMLElement>('[data-triage-review]');
  const fallbackNote = result?.querySelector<HTMLElement>('[data-triage-fallback-note]');
  const emailLink = result?.querySelector<HTMLAnchorElement>('[data-triage-email]');
  const aiTag = result?.querySelector<HTMLElement>('[data-ai-tag]');
  const answerPanel = document.querySelector<HTMLElement>('#triage-answer');
  const answerQuestion = answerPanel?.querySelector<HTMLElement>('[data-answer-question]');
  const answerText = answerPanel?.querySelector<HTMLElement>('[data-answer-text]');
  const answerEmail = answerPanel?.querySelector<HTMLAnchorElement>('[data-answer-email]');
  const enquiryAnchor = document.getElementById('enquiry');

  // Set while the message is exactly a bank question (chip or CTA); cleared as soon as it is edited.
  let bankRoute: string | null = null;

  const setStatus = (text: string): void => {
    if (status) status.textContent = text;
  };

  const clearChipStates = (except?: HTMLButtonElement): void => {
    document.querySelectorAll<HTMLButtonElement>('.triage-chip[aria-pressed="true"]').forEach(chip => {
      if (chip !== except) chip.setAttribute('aria-pressed', 'false');
    });
  };

  const showInstantAnswer = (entry: BankQuestion): void => {
    if (!answerPanel) return;
    if (answerQuestion) answerQuestion.textContent = entry.question;
    if (answerText) answerText.textContent = entry.answer;
    if (answerEmail) {
      const subject = `ZAYA ${entry.route} enquiry`;
      const body = `${entry.question}\n\nAnswered from ZAYA's published information.`;
      answerEmail.href = `mailto:zayaapp@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
    if (result) result.hidden = true;
    answerPanel.hidden = false;
    setStatus('Answered from ZAYA\'s published information — nothing has been sent.');
  };

  const hideAnswer = (): void => {
    if (answerPanel) answerPanel.hidden = true;
  };

  const applyQuestion = (question: BankQuestion, chip?: HTMLButtonElement, showAnswer = false): void => {
    if (!message) return;
    bankRoute = question.route;
    message.value = question.question;
    if (hint) {
      hint.textContent = `Suggested question — ${question.group}: ${question.question}`;
      hint.hidden = false;
    }
    clearChipStates(chip);
    if (chip) chip.setAttribute('aria-pressed', 'true');
    if (result) result.hidden = true;
    if (showAnswer) showInstantAnswer(question);
    else hideAnswer();
    setStatus('Question added — edit it or choose Review my message.');
    message.focus();
    message.select();
  };

  // The chip group sits outside the form (between the intro copy and the form), so query the document.
  document.querySelectorAll<HTMLButtonElement>('.triage-chip').forEach(chip => {
    chip.addEventListener('click', () => {
    const question = bank.find(entry => entry.question === chip.dataset.question);
    if (question) applyQuestion(question, chip, true);
    });
  });

  // Audience CTAs and FAQ "Ask this" links anywhere on the page.
  document.addEventListener('click', event => {
    const trigger = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[data-triage-prefill]');
    if (!trigger || !message) return;
    const question = bank.find(entry => entry.question === trigger.dataset.question);
    if (!question) return;
    event.preventDefault();
    applyQuestion(question);
    enquiryAnchor?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
    history.pushState(null, '', '#enquiry');
  });

  message?.addEventListener('input', () => {
    bankRoute = null;
    if (hint) hint.hidden = true;
    hideAnswer();
    clearChipStates();
  });

  const setEmailLink = (route: string, text: string, viaFallback: boolean): void => {
    if (!emailLink) return;
    const subject = encodeURIComponent(`ZAYA ${route} enquiry`);
    const body = viaFallback
      ? `${text}\n\nSent via the website enquiry fallback.`
      : `${text}\n\nSuggested website route: ${routeLabels[route] || routeLabels.general}`;
    emailLink.href = `mailto:zayaapp@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const showFallback = (text: string): void => {
    const route = bankRoute && routeLabels[bankRoute] ? bankRoute : 'general';
    if (routeText) routeText.textContent = routeLabels[route] || routeLabels.general;
    if (urgencyCell) urgencyCell.hidden = true;
    if (reviewCell) reviewCell.hidden = true;
    if (aiTag) aiTag.hidden = true;
    if (fallbackNote) {
      fallbackNote.textContent = bankRoute
        ? 'Smart review is unavailable — suggestion based on your selected question.'
        : 'Smart review is unavailable — showing the general enquiry route.';
      fallbackNote.hidden = false;
    }
    setEmailLink(route, text, true);
    setStatus('Smart review is unavailable right now. Nothing has been sent — continue by email below, or try again later.');
    if (result) {
      result.hidden = false;
      result.focus();
    }
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const text = message?.value.trim() || '';
    if (!message || !submit || !status || !result || text.length < 12) {
      message?.focus();
      setStatus('Please tell us a little more so we can guide you.');
      return;
    }

    submit.disabled = true;
    submit.textContent = 'Reviewing…';
    setStatus('Finding the right ZAYA route for your message.');
    result.hidden = true;

    // Instant answers: a bank question (exact or clearly the same) answers immediately,
    // with no network call at all. Anything less certain uses the normal review flow.
    const instant = matchBankQuestion(text, bank);
    if (instant) {
      submit.disabled = false;
      submit.textContent = 'Review my message';
      const chip = Array.from(form.querySelectorAll<HTMLButtonElement>('.triage-chip'))
        .find(candidate => candidate.dataset.question === instant.question);
      bankRoute = instant.route;
      clearChipStates(chip ?? undefined);
      if (chip) chip.setAttribute('aria-pressed', 'true');
      showInstantAnswer(instant);
      return;
    }
    hideAnswer();
    if (aiTag) aiTag.hidden = false;

    // One attempt per press — never auto-retried. The client cutoff mirrors the server's 12s limit.
    const controller = new AbortController();
    const cutoff = setTimeout(() => controller.abort(), 12_000);

    try {
      const response = await fetch('/.netlify/functions/jev-triage', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = (await response.json().catch(() => null)) as (TriageReply & { error?: string }) | null;

      if (!response.ok) {
        if (response.status === 400 && data?.error) {
          setStatus(data.error);
          return;
        }
        showFallback(text);
        return;
      }
      if (!data || typeof data.route !== 'string' || !routeLabels[data.route]) {
        showFallback(text);
        return;
      }

      const route: string = data.route;
      const urgency = Number(data.urgency ?? 0);
      const humanReview = Number(data.humanReview ?? 0);
      const needsReview = data.needsReview === true || Number(data.routeConfidence ?? 0) < 0.72;
      const urgencyLabel = urgency >= 2.5
        ? 'High suggested priority'
        : urgency >= 1.5
          ? 'Elevated suggested priority'
          : 'Normal suggested priority';
      const humanLabel = humanReview >= 0.7 || needsReview
        ? 'Personal review recommended'
        : 'Standard enquiry';

      if (routeText) routeText.textContent = routeLabels[route];
      if (urgencyText) urgencyText.textContent = urgencyLabel;
      if (reviewText) reviewText.textContent = humanLabel;
      if (urgencyCell) urgencyCell.hidden = false;
      if (reviewCell) reviewCell.hidden = false;
      if (fallbackNote) fallbackNote.hidden = true;
      if (aiTag) aiTag.hidden = false;
      setEmailLink(route, text, false);
      setStatus('Your message has been reviewed. Nothing has been sent to the ZAYA team yet.');
      result.hidden = false;
      result.focus();
    } catch {
      showFallback(text);
    } finally {
      clearTimeout(cutoff);
      submit.disabled = false;
      submit.textContent = 'Review my message';
    }
  });
}
