# MSI Ethiopia Client Feedback System (CFS) — Business Requirements Document

| Field | Value |
|---|---|
| Document | BRD v0.1 (draft for MSI Ethiopia review) |
| Date | 2026-09-03 |
| Scope | Core (family planning / SRH) centres **and** maternity centres of MSI Ethiopia; designed for later roll-out to other MSI country programmes |
| Status | **Draft — every operational statement about MSI Ethiopia in §2 must be validated by the MSIE programme, quality and safeguarding teams before sign-off** |
| Companion | `02-technical-design.md` (architecture, data model, AI design, hosting) |

---

## 1. Executive summary

MSI Ethiopia (MSIE, the Ethiopian country programme of MSI Reproductive Choices, operating in Ethiopia since 1990) delivers sexual and reproductive health (SRH) and maternity services through its own centres, outreach teams, a social-franchise network and a contact centre. Client voice today is captured mostly on paper (suggestion boxes, complaint registers, periodic client exit interviews), which is slow to analyse, hard to act on, largely monolingual and invisible to management until weeks later.

The **Client Feedback System (CFS)** is a web-based, mobile-ready, offline-tolerant platform that lets clients give feedback in their own language — through short pre-defined forms, free narrative text, or **voice** — from a kiosk in the centre, their own phone, SMS/USSD, Telegram, or the hotline. An **AI agentic layer** transcribes, translates, classifies, scores severity, and drafts insights; **critical issues** (safety, safeguarding, abuse, clinical harm, denial of service, fraud) are escalated within minutes by e-mail/SMS to the responsible managers with a tracked case. Management gets **live dashboards**, **scheduled reports** and a **conversational analytics assistant**; centres get a **TV/screen "client voice wall"** that shows aggregated satisfaction and "You said → We did" actions to waiting clients.

The system is **multi-tenant** from day one so that other MSI country programmes can be onboarded as separate tenants (own languages, forms, sites, escalation rules, data residency), and is designed to be **hosted on MSI Ethiopia's own domain and server** (with a cloud option).

### 1.1 Objectives

| # | Objective | How we know (indicator; baseline to be set during discovery — no target is asserted here) |
|---|---|---|
| O1 | Make it easy and safe for every client to give feedback, regardless of literacy, language or device | Feedback submissions per 100 client visits, by channel and language |
| O2 | Turn feedback into action at centre and national level | % of feedback items triaged within 48 h; % of critical items acknowledged within SLA; number of closed "You said → We did" actions per quarter |
| O3 | Detect and escalate critical issues (safeguarding, safety, abuse, clinical incidents) immediately | Median time from submission to management notification; 0 missed critical items in quarterly audit sample |
| O4 | Give management evidence for decisions | Dashboard weekly active managers; reports issued on schedule; decisions logged with feedback reference |
| O5 | Close the loop with clients | % of centres with a live client-voice display; number of published "We did" actions |
| O6 | Scale to other MSI country programmes with configuration, not code | Time to onboard a new tenant (target: configuration only, no code change) |

### 1.2 Guiding principles

1. **Client safety and confidentiality first.** Feedback about SRH and abortion care is sensitive in Ethiopia. Anonymous by default; identity only with explicit, informed consent; nothing identifiable is ever shown on a public screen.
2. **Works on cheap phones and bad networks.** Offline-first, low data, no app install required (PWA), optional Android app for kiosks.
3. **AI assists, humans decide.** Every AI classification is reviewable; every critical escalation reaches a named person; every AI action is logged.
4. **Honest metrics.** Dashboards show sample sizes and confidence; small samples are suppressed rather than over-interpreted.
5. **Configure, don't fork.** Forms, taxonomies, languages, escalation rules and branding are tenant configuration so Ethiopia's build becomes the MSI multi-country product.

---

## 2. Business context — MSI Ethiopia operations (to be validated)

> The bullets below are the working understanding used to shape the requirements. They are drawn from public MSI / MSIE material and general knowledge of the Ethiopian health system. **Each item must be confirmed or corrected by MSIE in the discovery phase.** Nothing here should be quoted externally as fact.

### 2.1 Organisation and service channels
- **MSI Ethiopia** is one of the largest non-governmental SRH providers in Ethiopia, part of the global MSI Reproductive Choices partnership (UK-registered charity, operating in ~35 countries).
- Service delivery channels (each a feedback "context" in the system):
  - **MSI centres ("core" clinics)** — static clinics in Addis Ababa and regional cities offering family planning (short-acting, long-acting reversible and permanent methods), comprehensive/safe abortion care and post-abortion care within Ethiopian law, cervical-cancer screening and treatment, HIV testing and counselling, STI management, general outpatient, laboratory and ultrasound.
  - **Maternity centres (MCH)** — antenatal care, skilled delivery (normal and, where equipped, caesarean), postnatal care, newborn care, immunisation and postpartum family planning. Different client journey (repeat visits over months, partners/family involved, inpatient stays).
  - **Outreach / mobile teams** — periodic visits to rural health facilities and communities; intermittent or no connectivity.
  - **Social franchise network (e.g. BlueStar)** — private providers branded and quality-assured by MSIE; feedback must be attributable to the franchisee site.
  - **Community-based providers / MSI Ladies** — home and community services.
  - **Contact centre / hotline** — telephone counselling, appointment booking, complaints. Natural voice-feedback channel.
  - **Public-sector support** — training and supplies to government facilities (feedback likely out of scope for phase 1).
- **Clients**: predominantly women of reproductive age (15–49), adolescents and youth, urban low- and middle-income and rural populations; varying literacy; many prefer to speak rather than write; many will not want their name attached to feedback about SRH services.
- **Languages** (initial set, to confirm by catchment): Amharic, Afaan Oromoo, Tigrinya, Somali, Sidaamu Afoo, Afar, Wolaytta, English. Ethiopic script (Ge'ez) for Amharic/Tigrinya; Latin script for Afaan Oromoo/Somali/Afar/Sidaamu Afoo/Wolaytta.
- **Existing systems** (confirm names/versions with MSIE IT): MSI's global clinic information system (client records / service data), a DHIS2 export to the Federal Ministry of Health, Microsoft 365 for e-mail and identity, a contact-centre telephony system, and MSI global quality-assurance tools (clinical audit, client exit interview instruments, incident reporting, the MSI safeguarding reporting channel).
- **Governance**: Country Director; Programme / Operations Directors; Medical Development Team (clinical quality); Quality Assurance; Monitoring, Evaluation & Learning (MEL); Safeguarding Focal Point; Marketing/Client Experience; IT/Digital; Centre Managers; Regional Managers; MSI Global Support Office (Client Voice / Quality).

### 2.2 Current-state feedback practice (assumed)
- Suggestion boxes and complaint books in centres; opened irregularly; handwritten, mostly Amharic.
- Periodic **client exit interviews (CEI)** run by MEL/QA on a sample basis (structured questionnaire, tablets or paper).
- Complaints escalate through the centre manager verbally or by e-mail; no single register, no SLA tracking.
- Serious incidents reported through MSI's incident and safeguarding procedures (separate systems, paper/e-mail).
- Results reach management quarterly or later; little segmentation by service line or language; no closed loop back to clients.

### 2.3 Regulatory and policy frame
- **Ethiopia Personal Data Protection Proclamation No. 1321/2024** — lawful basis, consent, data-subject rights, breach notification, cross-border transfer restrictions (relevant to any cloud AI or hosting outside Ethiopia).
- **Ethiopian health information / confidentiality norms** (FMoH) and the sensitivity of abortion-care data.
- **MSI global policies**: Safeguarding (children and vulnerable adults) with a 24-hour reporting expectation, Data Protection (UK GDPR applies to the UK entity), Client-centred care / Client Charter, Incident Management, Whistleblowing.
- **Donor expectations**: many programmes are donor-funded and require accountability-to-affected-populations (AAP) / complaint and feedback mechanisms (CFM) with documented response.

---

## 3. Scope

### 3.1 In scope (Phase 1 — Ethiopia pilot and national roll-out)
1. Client feedback capture: pre-defined forms, narrative text, voice, star/smiley ratings; kiosk, QR-to-phone (PWA), SMS/USSD, Telegram bot, hotline/IVR, staff-assisted entry, paper-to-digital transcription.
2. Multilingual UI, forms and content; AI translation of narratives and voice transcripts into the management working language (English/Amharic).
3. AI agentic processing: transcription, translation, PII redaction, sentiment, thematic classification, severity, duplicate detection, summarisation, insight and report drafting, conversational analytics.
4. Critical-issue flagging and escalation (e-mail, SMS, Telegram, in-app) with case management, SLAs, audit trail.
5. Management dashboards (site, region, national, service line, channel, language, time), drill-down to anonymised verbatims.
6. Reports: scheduled and on-demand (PDF/Excel/PowerPoint export), donor/AAP-style, MSI global indicator alignment.
7. Public display mode for TVs/screens in centres (aggregated satisfaction, "You said → We did", how-to-give-feedback prompts, health messaging).
8. Administration: tenants, sites, users/roles, form builder, taxonomy, languages, escalation rules, display playlists.
9. Multi-tenant foundation for other MSI countries; per-tenant data isolation and configuration.
10. Offline-first web/mobile clients with automatic sync; responsive across desktop, laptop, tablet, phone, TV.
11. Hosting on MSIE-controlled domain and server(s), with backups, monitoring and a cloud alternative.

### 3.2 Out of scope (Phase 1)
- Clinical record keeping / EMR functions; appointment booking; billing.
- Staff performance appraisal (feedback is about services and experience, not individual HR decisions — a policy safeguard, see §8).
- Replacing MSI's formal incident-management or safeguarding case-management systems (CFS *routes to* them and records the hand-off).
- Public-sector facility feedback (candidate for Phase 3).
- Automated outbound marketing.

---

## 4. Stakeholders and personas

| Persona | Needs | Typical device / context |
|---|---|---|
| **Client (Adey, 24, Afaan Oromoo speaker, first LARC visit)** | Give feedback privately in her language in < 2 minutes, by voice if she prefers; be sure her name is not attached; see that feedback changes things | Kiosk tablet at exit; her own Android phone via QR; poor data plan |
| **Maternity client (Selam, 31, 3rd ANC visit; later delivery)** | Give feedback at different visits; report a serious concern about the ward; maybe get a follow-up call if she asks | Phone during waiting; family member may help |
| **Front-desk / client-experience officer** | Encourage feedback; assist low-literacy clients without seeing their answers; keep the kiosk working | Kiosk tablet, basic training |
| **Centre Manager** | See own centre's feedback daily; get critical alerts; log actions; publish "We did" items to the screen | Laptop, phone |
| **Regional / Area Manager** | Compare centres; spot trends; follow up on overdue cases | Laptop, phone |
| **Quality Assurance / Medical Development lead** | Triage clinical-quality themes; link to clinical audits; verify AI classifications | Laptop |
| **Safeguarding Focal Point** | Receive safeguarding flags within minutes, restricted visibility, hand off to MSI safeguarding process | Phone + laptop |
| **MEL team** | Design forms, sampling, indicators; export data; validate methodology; run CEI campaigns | Laptop, Excel/Power BI |
| **Country Director / Senior Management Team** | One-page view of client voice, critical incidents, actions closed; monthly board pack | Phone, laptop |
| **Contact-centre agent** | Log voice feedback from calls; tag the site and service | Desktop + telephony |
| **IT / Digital administrator (MSIE)** | Deploy, back up, manage users/SSO, monitor, upgrade | Server, admin console |
| **MSI Global Support Office** | Cross-country comparable indicators; onboard new countries | Web, exports |
| **Donor / external auditor** | Evidence of a functioning complaint and feedback mechanism | Reports |

---

## 5. Functional requirements

Requirement IDs: **FR-<area>-<n>**. Priority: **M** = must (pilot), **S** = should (national roll-out), **C** = could (later).

### 5.1 Feedback capture (FR-CAP)

| ID | Requirement | Pri |
|---|---|---|
| FR-CAP-1 | The system shall offer **pre-defined forms** (e.g. client exit survey, maternity discharge survey, outreach quick-pulse, complaint form, compliment form) with question types: single/multi-choice, 5-point smiley/star, NPS-style 0–10, yes/no, short text, long narrative, voice recording, photo (optional), date, site/service pick-list. | M |
| FR-CAP-2 | Every form shall be **available in all tenant languages**; the client picks language on the first screen (flags + native names, large tap targets, audio prompt on tap). | M |
| FR-CAP-3 | The client shall be able to submit **narrative feedback** (free text) alone or in addition to a form, in any supported language or script. | M |
| FR-CAP-4 | The client shall be able to record **voice feedback** (up to a configurable limit, default 3 min) in-browser/in-app, re-listen, re-record or delete before submitting. Recording works offline and uploads later. | M |
| FR-CAP-5 | **Kiosk mode**: a locked-down tablet at the exit/waiting area runs the feedback app full-screen, resets after each submission or after 60 s idle, shows a privacy screen, and works fully offline with later sync. | M |
| FR-CAP-6 | **QR / short link**: posters, discharge papers and receipts carry a site-specific QR code / short URL opening the PWA on the client's phone without installing an app (< 300 KB initial load, works on Android 8+ browsers). | M |
| FR-CAP-7 | **SMS / USSD** channel: a client can send feedback by SMS to a short code, or use a USSD menu for rating questions; responses are ingested and matched to site by keyword or code. (Dependent on Ethio Telecom / Safaricom Ethiopia gateway contract.) | S |
| FR-CAP-8 | **Telegram bot** (Telegram is widely used in Ethiopia): guided feedback conversation, voice notes accepted; no phone number stored unless the client opts in. WhatsApp as a configurable equivalent for other countries. | S |
| FR-CAP-9 | **Hotline / IVR**: callers can leave a recorded feedback message after service, or an agent logs feedback on the caller's behalf (agent-assisted form). | S |
| FR-CAP-10 | **Staff-assisted / proxy entry**: outreach and community staff can enter feedback for a client on their device, flagged as "assisted", with the client's consent recorded. | M |
| FR-CAP-11 | **Paper fallback**: printed forms (with QR + form version) can be photographed or typed in later by staff; original marked as paper source. | S |
| FR-CAP-12 | Feedback can be **anonymous** (default) or **identified** (client enters phone number and consents to follow-up); consent text is per language and versioned. | M |
| FR-CAP-13 | The client can indicate **"I want someone to contact me"** and choose channel (call/SMS/Telegram); this creates a follow-up task. | M |
| FR-CAP-14 | **Accessibility**: large text mode, high-contrast, screen-reader labels, audio playback of every question (pre-recorded human voice per language, with TTS fallback), icon-based answers for low literacy. | M |
| FR-CAP-15 | **Contextual metadata** captured automatically where available: site, service line, channel, device, date/time, form version, language, assisted flag; never GPS without consent. | M |
| FR-CAP-16 | **Trigger points** configurable per site: at exit, on discharge, X days after visit (SMS/Telegram nudge if consented), after outreach session. | S |
| FR-CAP-17 | **Duplicate / spam protection** suited to kiosks: rate limiting per device, honeypot fields, optional simple challenge on public web forms; never blocks genuine offline batches. | M |

### 5.2 Multilingual (FR-LNG)

| ID | Requirement | Pri |
|---|---|---|
| FR-LNG-1 | Tenant-configurable language list; Ethiopia initial: Amharic (am), Afaan Oromoo (om), Tigrinya (ti), Somali (so), Sidaamu Afoo (sid), Afar (aa), Wolaytta (wal), English (en). | M |
| FR-LNG-2 | All UI strings, form content, consent texts, display-screen content and notification templates are translatable through the admin console (no code change); missing translations fall back to tenant default with a visible flag in admin. | M |
| FR-LNG-3 | Ethiopic script rendering and input (on-screen Amharic/Tigrinya keyboards on kiosk), correct fonts (e.g. Noto Sans Ethiopic), correct sorting and date formats (Ethiopian calendar display option). | M |
| FR-LNG-4 | Voice feedback is **transcribed** in the source language and **translated** into the tenant working languages (English + Amharic) by the AI layer; original audio and source-language transcript are retained per retention policy. | M |
| FR-LNG-5 | Narrative text in any language is auto-detected and translated; the original is always shown alongside the translation to reviewers. | M |
| FR-LNG-6 | Transcription/translation confidence is stored; low-confidence items are queued for **human verification** by bilingual staff (verification UI with audio scrub, side-by-side edit). | M |
| FR-LNG-7 | Public display content rotates through selected languages per site. | S |

### 5.3 AI agentic layer (FR-AI)

The AI layer is a set of **bounded agents** with explicit inputs, outputs, tools and human checkpoints (design in the technical document §6). Requirements:

| ID | Requirement | Pri |
|---|---|---|
| FR-AI-1 | **Intake agent**: for every new item — transcribe (voice), detect language, translate, redact personal data (names, phone numbers, IDs) from the *analysis copy*, classify into the tenant taxonomy (multi-label: e.g. waiting time, staff attitude, privacy/confidentiality, cost/fees, drug/commodity availability, cleanliness, counselling quality, pain management, informed consent, discrimination/stigma, safety/abuse, facility/infrastructure, follow-up, compliments), sentiment (−1..+1), severity (info / low / medium / high / **critical**), and a one-line summary. Output includes confidence per field and rationale. | M |
| FR-AI-2 | **Critical-issue detection**: rule-based keyword/phrase lists per language **plus** model judgement; categories: safeguarding (child, vulnerable adult, sexual exploitation/abuse/harassment by staff), physical/verbal abuse, coercion (forced method, denial of method or of legal service), serious clinical harm or death, breach of confidentiality, fraud/illegal fees, discrimination, threats to staff or facility. Any positive from either path → **critical** until a human downgrades it. | M |
| FR-AI-3 | **Escalation agent**: on critical, compose the alert (who, what, where, severity, quoted redacted excerpt, suggested first actions, links), pick recipients from the tenant escalation matrix, send via configured channels, open a case, start SLA timer, and re-notify/escalate up the ladder if unacknowledged. Never sends the client's identity unless the case type requires it and the recipient has that permission. | M |
| FR-AI-4 | **Duplicate and cluster detection**: near-duplicate items (same device/timeframe/text) grouped; emerging clusters (e.g. sudden rise in "no contraceptive implants available" at one site) flagged as **trend alerts** with thresholds set by MEL. | S |
| FR-AI-5 | **Insight agent**: on a schedule (daily site digest, weekly regional, monthly national) synthesise themes, changes vs. previous period, notable verbatims (redacted), open critical cases, and recommended actions; drafts are marked "AI draft" and require a human publisher before distribution. | M |
| FR-AI-6 | **Report agent**: generate report packs from templates (board pack, donor AAP report, MSI global client-voice indicators) as PDF/Excel/PowerPoint using only warehouse figures (no invented numbers); every figure traceable to a query. | S |
| FR-AI-7 | **Analyst copilot** ("ask the data"): managers ask questions in English or Amharic ("Which centres had the most privacy complaints last month?"); the agent runs read-only, row-level-secured queries over the semantic layer and answers with the figures, the chart and the query used. It refuses questions outside its data or permissions. | S |
| FR-AI-8 | **Conversational feedback assistant** (client-facing, optional per site): a guided chat/voice dialogue in the client's language that asks the form questions conversationally, clarifies ambiguous answers, and never gives medical advice (redirects to hotline). | C |
| FR-AI-9 | **Human-in-the-loop controls**: reviewers can correct any AI label; corrections feed an evaluation set; classification accuracy per language is reported monthly; the AI layer can be disabled per tenant/feature with the system degrading to manual triage. | M |
| FR-AI-10 | **Transparency and audit**: every AI output stores model, version, prompt version, timestamp, confidence, and is visible in the item's history. | M |
| FR-AI-11 | **Data minimisation for AI**: only redacted analysis copies are sent to any external AI service; option to run all AI on in-country infrastructure (self-hosted models) where policy or law requires. | M |

### 5.4 Escalation and case management (FR-CASE)

| ID | Requirement | Pri |
|---|---|---|
| FR-CASE-1 | Tenant-configurable **escalation matrix**: category × severity × site/region → recipients (roles and named backups), channels, SLA (acknowledge, respond, resolve). Default: critical → Centre Manager + Regional Manager + QA lead + (safeguarding cases) Safeguarding Focal Point, within 15 minutes, by e-mail and SMS. | M |
| FR-CASE-2 | **Flag e-mail** contains: severity badge, site, service, date, category, redacted excerpt (translated + original), AI rationale, case link, and required actions; plain-text friendly for low bandwidth; no attachments by default. | M |
| FR-CASE-3 | **Acknowledgement** via one-click link (signed, expiring), reply-to-e-mail, SMS reply keyword, or in-app; unacknowledged after SLA → next tier; after second SLA → Country Director/SMT. | M |
| FR-CASE-4 | **Case workflow**: New → Acknowledged → Investigating → Action planned → Resolved → Closed (with reason) → optionally Reopened; assignments, comments, attachments, linked items, due dates; restricted "sensitive" cases visible only to authorised roles. | M |
| FR-CASE-5 | **Hand-off records** for safeguarding and clinical incidents: CFS records that the case was referred to the MSI safeguarding / incident process, with reference number, and locks further detail entry in CFS. | M |
| FR-CASE-6 | Follow-up with identified clients (call/SMS/Telegram) is logged; the client may be asked whether the issue was resolved (closed-loop rating). | S |
| FR-CASE-7 | **"You said → We did"** publishing: a resolved case or theme can be turned into a public action statement (site or national), reviewed and translated before it appears on displays and public pages. | M |
| FR-CASE-8 | Overdue cases, SLA breaches and reopened cases appear in dashboards and weekly digests. | M |

### 5.5 Dashboards and analytics (FR-DASH)

| ID | Requirement | Pri |
|---|---|---|
| FR-DASH-1 | Role-based dashboards: **Site**, **Region**, **National**, **Executive**, **Quality**, **Safeguarding** (restricted), **MEL**. | M |
| FR-DASH-2 | Core measures: volume by channel/language/form; satisfaction (mean rating, % positive), NPS-style score, theme frequency and sentiment, critical items, open/overdue cases, SLA compliance, response rate vs. client visits (from EMR/service statistics import), trend lines and period comparison. | M |
| FR-DASH-3 | Filters: date range, site(s), region, service line (FP, safe abortion/PAC, maternity, cervical screening, HIV/STI, OPD…), channel, language, form, client segment (age band, first vs. repeat, if collected). | M |
| FR-DASH-4 | Drill-down from any number to the list of underlying (redacted) items; click-through to the full item with audio player (permission-gated). | M |
| FR-DASH-5 | **Small-sample suppression**: any cell with fewer than *n* responses (default 10) shows "insufficient data"; percentages show n. | M |
| FR-DASH-6 | **Near-real-time**: new items and status changes appear within 30 s on open dashboards when online; the dashboard also works from the last synced snapshot offline (read-only). | M |
| FR-DASH-7 | Site-comparison league views are **restricted to management roles** and show confidence intervals; not shown on public displays. | S |
| FR-DASH-8 | Export of any view to CSV/Excel/PNG; scheduled e-mail of a dashboard snapshot. | M |
| FR-DASH-9 | Optional connector for Power BI / Excel (read-only warehouse views) for MEL. | S |

### 5.6 Reports and insights (FR-REP)

| ID | Requirement | Pri |
|---|---|---|
| FR-REP-1 | Report templates: daily site digest (e-mail), weekly regional summary, monthly national client-voice report, quarterly board pack, donor AAP/CFM report, ad-hoc theme deep-dive, MSI global indicator extract. | M |
| FR-REP-2 | Outputs: PDF, Excel, PowerPoint; branded per tenant; Amharic and English versions. | S |
| FR-REP-3 | Every AI-written narrative section is clearly labelled and reviewable; numbers are pulled from the warehouse, never generated. | M |
| FR-REP-4 | Distribution lists and schedules per report; delivery by e-mail or in-app; archived with version history. | M |

### 5.7 Public display mode (FR-DISP)

| ID | Requirement | Pri |
|---|---|---|
| FR-DISP-1 | A **display route** for TVs/screens (Android TV, Chromecast, a cheap Android box, a Raspberry Pi, or a laptop) that runs full-screen with no login after a one-time pairing code. | M |
| FR-DISP-2 | Slides: site satisfaction this month (aggregated, min n), top compliments (theme-level), "You said → We did" actions, how to give feedback (QR, SMS, Telegram, kiosk), client charter/rights, health messaging, waiting-time pledge; multilingual rotation; MSI branding. | M |
| FR-DISP-3 | **Never shows** verbatim text, names, individual ratings, staff names, or complaint details; content passes an approval step. | M |
| FR-DISP-4 | Works offline for at least 7 days from cached content; refreshes automatically when connected; shows last-updated time. | M |
| FR-DISP-5 | Central playlist management per site/region; scheduling (e.g. maternity content in MCH waiting areas); emergency message override. | S |
| FR-DISP-6 | Also serves as a **presentation mode** for management meetings (curated national view, keyboard-driven). | S |

### 5.8 Administration and configuration (FR-ADM)

| ID | Requirement | Pri |
|---|---|---|
| FR-ADM-1 | **Tenant management**: create tenant (country programme), default language, working languages, time zone, calendar, branding, data-residency setting, AI provider setting, retention policy. | M |
| FR-ADM-2 | **Site hierarchy**: tenant → region/area → site (type: centre, maternity, outreach team, franchise, hotline) → service lines; site codes aligned with EMR/DHIS2 org units. | M |
| FR-ADM-3 | **Users, roles, permissions**: SSO (Microsoft 365 / Entra ID) plus local accounts; roles: tenant admin, national manager, regional manager, centre manager, QA reviewer, safeguarding focal point, MEL analyst, contact-centre agent, kiosk device, display device, read-only viewer; row-level scoping by site/region. | M |
| FR-ADM-4 | **Form builder**: versioned forms with logic (skip/branch), translations, scoring, publish per site/channel; changes never alter historical data. | M |
| FR-ADM-5 | **Taxonomy manager**: hierarchical categories with per-language keyword lists and examples used to steer AI classification; versioned. | M |
| FR-ADM-6 | **Escalation matrix editor**, notification templates, SLA settings, on-call/backup rotation. | M |
| FR-ADM-7 | **Device management**: register kiosks and displays, see last sync, remotely reset or disable, assign site and form set. | M |
| FR-ADM-8 | **Audit log** viewer (who viewed/edited what), exportable for audits. | M |
| FR-ADM-9 | **Data tools**: import site list, service statistics (visits per site/month) for response-rate denominators, bulk export, data-subject request handling (find and erase identified client data). | S |

### 5.9 Integration (FR-INT)

| ID | Requirement | Pri |
|---|---|---|
| FR-INT-1 | E-mail via MSIE's Microsoft 365 (Graph API or SMTP relay) for alerts, digests, reports. | M |
| FR-INT-2 | SMS gateway (Ethio Telecom / Safaricom Ethiopia or aggregator) for alerts and client channel; provider abstraction so other countries plug in their own. | M (alerts) / S (client channel) |
| FR-INT-3 | Telegram Bot API (and WhatsApp Business API for other countries). | S |
| FR-INT-4 | Identity: OpenID Connect to Microsoft Entra ID; SCIM or CSV user provisioning. | M |
| FR-INT-5 | Service statistics import (monthly visits per site/service) from the clinic information system or DHIS2 export (CSV/API) as denominators. **No clinical data is imported.** | S |
| FR-INT-6 | Outbound webhooks and a read-only REST API for MSI global aggregation and BI tools. | S |
| FR-INT-7 | Referral link to MSI incident/safeguarding tools (deep link + reference number; no automatic data push unless MSI approves). | S |

---

## 6. Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-PERF-1 | Client feedback PWA: first load ≤ 300 KB compressed, interactive ≤ 3 s on a 2 G/3 G connection and a low-end Android phone; every subsequent open works offline. |
| NFR-PERF-2 | Dashboard queries return ≤ 2 s for 12 months of national data at 1 million items; live updates ≤ 30 s. |
| NFR-PERF-3 | AI intake: 95 % of text items classified ≤ 60 s; voice items ≤ 5 min after upload; critical alerts dispatched ≤ 2 min after classification. |
| NFR-AVAIL-1 | Target 99.5 % monthly availability for the server; kiosks and phones keep capturing offline during outages, so **capture availability is 100 % by design**. |
| NFR-SYNC-1 | Sync is automatic, idempotent and resumable; a kiosk holding 5,000 offline items (including audio) syncs without data loss; conflicts on shared records are resolved deterministically and logged. |
| NFR-SEC-1 | OWASP ASVS Level 2; TLS 1.2+ everywhere; encryption at rest (disk and field-level for identifiers and audio); MFA for admin roles; secrets never in code. |
| NFR-SEC-2 | Row-level security by tenant and site; safeguarding cases visible only to authorised roles; every access to identified data and to audio is audit-logged. |
| NFR-PRIV-1 | Compliance with Ethiopia's Personal Data Protection Proclamation (1321/2024) and MSI Data Protection Policy; DPIA completed before pilot; consent and privacy notices per language; data-subject access/erasure supported; retention: identified data ≤ 24 months, audio ≤ 12 months after verified transcript (configurable per tenant). |
| NFR-PRIV-2 | Data residency configurable: Ethiopia-only hosting and in-country AI processing mode available; if cloud AI is used, only redacted analysis copies leave the server, under a data-processing agreement, with no training on MSI data. |
| NFR-A11Y-1 | WCAG 2.2 AA for all client and staff interfaces; reduced-motion respected; keyboard operable; screen-reader tested in Amharic and English. |
| NFR-I18N-1 | Unicode throughout; Ethiopic and Latin scripts; locale-aware dates (Gregorian and Ethiopian calendar display); pluralisation rules via ICU MessageFormat. |
| NFR-COMPAT-1 | Browsers: Chrome/Edge/Firefox/Safari last 2 versions, Android WebView 8+, iOS Safari 15+; screen sizes 320 px to 4 K TV; kiosk Android tablets 8"–11"; Android TV / Chromium kiosk. |
| NFR-SCALE-1 | Multi-tenant: 20+ country programmes, 500+ sites, 5 million items without architecture change; horizontal scale of API and workers. |
| NFR-OPS-1 | Deployable by MSIE IT with one command (Docker Compose) on one Ubuntu server; nightly encrypted backups off-site; RPO ≤ 24 h (≤ 1 h with WAL shipping), RTO ≤ 8 h; monitoring with alerting to IT. |
| NFR-MAINT-1 | Open, documented codebase (MSI-owned repository), automated tests ≥ 70 % line coverage on backend, infrastructure as code, semantic versioning, upgrade path without downtime for clients (offline capture continues). |
| NFR-DOC-1 | Admin manual, kiosk set-up guide, display set-up guide, client-facing posters in all languages, training curriculum for centre staff and managers, runbooks for IT. |

---

## 7. Data and indicators

### 7.1 Core entities (business view)
Tenant · Site · Service line · Form (versioned) · Question · Feedback item · Answer · Attachment (audio/photo) · Transcript · Translation · AI annotation · Case · Case event · Escalation · Alert delivery · Public action ("We did") · Display playlist · User · Role · Device · Audit event · Service statistics (denominators).

### 7.2 Indicator set (initial; MEL to finalise; aligned where possible with MSI global client-voice and quality indicators)
- Feedback volume and **response rate** (items ÷ client visits) by site, channel, language, service line.
- **Satisfaction score** (mean 1–5), % rating 4–5, **recommend score** (0–10, promoters − detractors).
- **Theme index**: % of items mentioning each taxonomy category; sentiment by theme.
- **Critical incidents**: count, time-to-notify, time-to-acknowledge, time-to-resolve, SLA compliance.
- **Closed-loop**: actions published, client follow-ups completed, re-contact satisfaction.
- **AI quality**: classification agreement with human review per language; transcription word-error rate (sampled).
- **Equity lenses**: differences by language, age band, first vs. repeat client, service line — with suppression rules.

---

## 8. Safeguarding, ethics and policy safeguards

1. **Anonymity by default.** No login, no phone number, no photo required. Device IDs are hashed and rotate.
2. **Explicit consent** for identification, voice recording, follow-up contact, and any reuse of anonymised quotes.
3. **No targeting of individual staff.** Feedback mentioning a staff member is routed to the manager as a case, not surfaced in league tables; the policy is written into the tenant configuration and training.
4. **Safeguarding path.** Any safeguarding indicator → restricted case → Safeguarding Focal Point within 15 min → MSI safeguarding procedure (24-hour reporting). CFS stores minimal detail once handed off.
5. **Crisis messaging.** If a client indicates immediate danger or a medical emergency in a channel that supports replies (Telegram, SMS, chat assistant), the system replies with the hotline and emergency numbers; the AI assistant never gives clinical advice.
6. **Stigma-aware language.** Forms and prompts are reviewed by MSIE's client-experience and clinical teams for non-judgemental wording in every language.
7. **Bias monitoring.** Classification and sentiment accuracy are measured per language; underperforming languages get human-first triage until fixed.
8. **Right to be forgotten** for identified clients; anonymised aggregates persist.
9. **DPIA and ethical review** before pilot; local Institutional Review Board consult if feedback data is to be used for research.

---

## 9. Assumptions, dependencies, constraints, risks

### 9.1 Assumptions
- MSIE will provide a server (or VM) and a sub-domain (e.g. `feedback.msiethiopia.org`, name to be decided), plus Microsoft 365 for e-mail/SSO.
- MSIE will contract an SMS gateway; costs of SMS and (if used) cloud AI are operational budget lines.
- MSIE staff time for form design, taxonomy review, translation and pilot supervision is available (MEL, QA, client experience).
- Kiosk tablets, stands and TVs are procured by MSIE; the software targets low-cost Android hardware.

### 9.2 Dependencies
- Approval of consent/privacy texts by MSIE legal/data protection and MSI Global.
- Translation and voice-recording of prompts in each language (professional translators + native speakers).
- Baseline data from current CEI/complaints to set targets.

### 9.3 Constraints
- Intermittent power and internet at sites → offline-first is mandatory, not optional.
- Limited IT staff → simple single-server deployment, managed updates, strong runbooks.
- Ethiopian-language speech recognition is less mature than English → human verification queue and pilot measurement are required; voice feedback quality is a **pilot hypothesis**, not a guarantee.
- Data protection restricts cross-border transfer → design for in-country processing option.

### 9.4 Key risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Low client uptake / social desirability bias | Weak evidence | Staff-independent kiosk placement, anonymous default, voice option, multiple channels, visible "We did" loop, response-rate monitoring, periodic sampled CEI as a control |
| Poor ASR / translation in local languages | Missed or mislabelled issues | Rule-based critical keywords per language, human verification queue, per-language accuracy reporting, fall back to text and staff-assisted capture |
| Missed critical issue | Client harm, reputational risk | Dual detection (rules + model), critical-by-default when uncertain, escalation ladder, weekly audit sample |
| Alert fatigue | Managers ignore flags | Severity calibration, dedupe/clustering, digest for non-critical, SLA dashboards |
| Data breach / misuse of sensitive SRH data | Legal, ethical, trust | Anonymity default, redaction before AI, field encryption, RBAC, audit, DPIA, retention limits |
| Server/power outages | Data loss | Offline capture, queued sync, off-site backups, UPS guidance |
| Vendor lock-in for AI | Cost/policy exposure | Provider abstraction, self-hosted model option, exportable data and prompts |
| Scope creep into HR/incident systems | Confusion, misuse | Explicit out-of-scope, hand-off design, policy safeguards |

---

## 10. Delivery approach and phasing

| Phase | Duration (indicative) | Content | Exit gate |
|---|---|---|---|
| **0 · Discovery & design** | 4–6 weeks | Validate §2 with MSIE; site visits (1 core, 1 maternity, 1 outreach); forms/taxonomy/escalation matrix workshops; DPIA; language list; hosting decision; UX prototypes tested with clients | Signed-off BRD v1.0, prototype usability report, hosting & data-protection approval |
| **1 · MVP pilot** | 10–12 weeks build + 12 weeks pilot | Kiosk + QR PWA, forms + narrative + voice (am/om/en first), AI intake + critical escalation (e-mail/SMS), case management, site/national dashboards, daily digest, display mode v1, admin basics, Docker deployment on MSIE server; pilot in 2 core centres + 1 maternity centre | Pilot evaluation: uptake, AI accuracy per language, escalation SLA, staff/client feedback; go/no-go for roll-out |
| **2 · National roll-out** | 3–6 months | All centres and maternity centres; remaining languages; SMS/USSD and Telegram channels; hotline integration; reports (PDF/Excel/PPT); analyst copilot; Power BI views; training at scale | All sites live, indicators reported monthly to SMT |
| **3 · Multi-country & advanced** | ongoing | Tenant onboarding kit; WhatsApp; conversational assistant; franchise and outreach depth; MSI global aggregation API; in-country AI model option | First additional country programme live on the same platform |

**Team (indicative)**: product lead (MSIE client experience/MEL), tech lead/architect, 2 full-stack engineers, 1 mobile/PWA engineer, 1 AI/NLP engineer, UX designer with Ethiopian-language experience, QA engineer, DevOps (part-time), translators/voice talent per language, change-management/training lead, data-protection advisor.

**Budget categories** (figures to be produced with MSIE after discovery — none asserted here): software build; hardware (tablets, stands, TVs/boxes); server or cloud; SMS/AI usage; translation/voice; training and roll-out; support and maintenance (annual).

---

## 11. Acceptance criteria (pilot)

1. A client in each pilot centre can complete the exit form in Amharic, Afaan Oromoo or English on the kiosk **with the network cable unplugged**, and the item appears on the national dashboard within 60 s of reconnection.
2. A 60-second Amharic voice message is transcribed, translated and classified, with the reviewer able to correct the label; the correction is visible in the audit trail.
3. A test narrative describing staff abuse triggers a critical alert e-mail **and** SMS to the configured recipients within 2 minutes, opens a case, and escalates after an unacknowledged 30-minute SLA in the test configuration.
4. The safeguarding test case is invisible to a centre-manager account and visible to the safeguarding focal point account.
5. The display screen shows only aggregated content, keeps rotating for 7 days offline, and updates within 5 minutes when reconnected.
6. The weekly AI digest is generated, labelled as AI draft, edited and published by a manager, and delivered by e-mail.
7. Dashboard cells with fewer than 10 responses show "insufficient data".
8. A data-subject erasure request for an identified client removes identifiers and audio and leaves anonymised aggregates intact.
9. Backup restore drill completed by MSIE IT from the runbook.
10. Accessibility audit (WCAG 2.2 AA) passes on the client PWA and kiosk flow; reduced-motion honoured.

---

## 12. Open questions for MSI Ethiopia (discovery inputs)

1. Confirm the service-channel list and the number of centres, maternity centres, outreach teams and franchise sites for Phase 2 sizing.
2. Which languages are needed at which sites in the pilot, and who will translate and record voice prompts?
3. Which existing systems must feed denominators (visits per site) and what export exists (CSV, DHIS2 API)?
4. Confirm the escalation matrix, on-call arrangements and SLA expectations for critical categories; confirm safeguarding reporting route and 24-hour requirement.
5. Preferred hosting: MSIE on-premises server, an Ethiopian cloud/data-centre provider, or MSI global cloud — and the data-residency position of MSIE and MSI Global for AI processing.
6. SMS gateway and short-code availability; Telegram usage among clients; hotline platform and recording policy.
7. Approval process for content on public displays and for "You said → We did" statements.
8. Branding and tone-of-voice guidelines; client charter text in each language.
9. Retention periods MSIE/MSI Global require for feedback, identified data and audio.
10. Which MSI global client-voice indicators must be reported, and in which format/frequency.

---

## Appendix A — Glossary
- **AAP / CFM**: Accountability to Affected Populations / Complaint and Feedback Mechanism (donor terminology).
- **CEI**: Client Exit Interview.
- **LARC / SARC**: Long-acting / short-acting reversible contraception.
- **PAC / CAC**: Post-abortion care / comprehensive abortion care.
- **MEL**: Monitoring, Evaluation and Learning.
- **PWA**: Progressive Web App — a website that installs like an app and works offline.
- **ASR**: Automatic speech recognition (transcription).
- **SLA**: Service level agreement — target time to acknowledge/resolve.
- **Tenant**: one country programme's isolated configuration and data inside the shared platform.
