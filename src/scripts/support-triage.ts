const form = document.querySelector<HTMLFormElement>('#zaya-triage-form');

if (form) {
  const message = form.querySelector<HTMLTextAreaElement>('#triage-message');
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const status = form.querySelector<HTMLElement>('[data-triage-status]');
  const result = document.querySelector<HTMLElement>('#triage-result');
  const routeText = result?.querySelector<HTMLElement>('[data-triage-route]');
  const urgencyText = result?.querySelector<HTMLElement>('[data-triage-urgency]');
  const reviewText = result?.querySelector<HTMLElement>('[data-triage-review]');
  const emailLink = result?.querySelector<HTMLAnchorElement>('[data-triage-email]');

  const routeLabels: Record<string, string> = {
    customer_order: 'Shopping and orders',
    merchant: 'Merchant support',
    delivery: 'Delivery support',
    ride: 'RIDE enquiry',
    diaspora: 'Diaspora enquiry',
    payment_account: 'Payment or account support',
    general: 'General ZAYA enquiry',
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const text = message?.value.trim() || '';
    if (!message || !submit || !status || !result || text.length < 12) {
      message?.focus();
      if (status) status.textContent = 'Please tell us a little more so we can guide you.';
      return;
    }

    submit.disabled = true;
    submit.textContent = 'Reviewing…';
    status.textContent = 'Finding the right ZAYA route for your message.';
    result.hidden = true;

    try {
      const response = await fetch('/.netlify/functions/jev-triage', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The reviewer is unavailable.');

      const route = routeLabels[data.route] || routeLabels.general;
      const urgency = data.urgency >= 2.5
        ? 'High suggested priority'
        : data.urgency >= 1.5
          ? 'Elevated suggested priority'
          : 'Normal suggested priority';
      const human = data.humanReview >= 0.7 || data.needsReview
        ? 'Personal review recommended'
        : 'Standard enquiry';

      if (routeText) routeText.textContent = route;
      if (urgencyText) urgencyText.textContent = urgency;
      if (reviewText) reviewText.textContent = human;
      if (emailLink) {
        const subject = encodeURIComponent(`ZAYA ${route} enquiry`);
        const body = encodeURIComponent(`${text}\n\nSuggested website route: ${route}`);
        emailLink.href = `mailto:zayaapp@gmail.com?subject=${subject}&body=${body}`;
      }
      status.textContent = 'Your message has been reviewed. Nothing has been sent to the ZAYA team yet.';
      result.hidden = false;
      result.focus();
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : 'The reviewer is unavailable. Please use email instead.';
    } finally {
      submit.disabled = false;
      submit.textContent = 'Review my message';
    }
  });
}
