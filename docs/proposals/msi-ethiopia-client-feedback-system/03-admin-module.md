# MSI Ethiopia Client Feedback System (CFS) — Administration Module Specification

| Field | Value |
|---|---|
| Document | Admin Module Spec v0.1 (draft) |
| Date | 2026-09-03 |
| Expands | BRD §5.8 (FR-ADM-1 … FR-ADM-9) and Technical Design §4.4 |
| Audience | MSIE IT/Digital, MEL, Quality, Client Experience, MSI Global Digital |

---

## 1. Purpose

The **Admin Console** is the part of the system where authorised staff configure and govern everything the clients, managers and screens see — without any code change. It is what makes the Ethiopia build reusable by other MSI country programmes: a new country is a new tenant configured through this console.

Design rules:
1. **Configuration, not code.** Forms, languages, taxonomy, escalation rules, branding, retention and integrations are data.
2. **Least privilege.** Every admin capability is a separate permission; scope is always bounded to a tenant, region or site.
3. **Nothing sensitive by default.** Admins manage the system; they do not automatically see client feedback, audio or safeguarding cases.
4. **Everything is versioned and audited.** Any change that affects clients (forms, consent text, translations, display content) is versioned, previewable and attributable.
5. **Safe to hand to a small IT team.** Guided wizards, validation, previews, and an "undo" (rollback) path for the risky settings.

---

## 2. Administrative roles and scopes

### 2.1 Role hierarchy

| Role | Scope | Who (MSIE) | Summary |
|---|---|---|---|
| **Platform Admin** (super admin) | whole deployment | MSI Global Digital / MSIE IT lead (2 named people) | Creates tenants, sets deployment-wide security, AI providers, hosting-level settings; cannot read any tenant's feedback data |
| **Tenant Admin** | one tenant (country programme) | MSIE IT/Digital + Client Experience lead | Full configuration of the country: sites, users, forms, languages, taxonomy, escalation, display, retention, integrations |
| **Site Hierarchy Admin** | region(s) or site(s) | Regional / Area Managers (delegated) | Manages users, devices and display playlists within their region/sites; cannot change forms or escalation rules |
| **Content Admin** | tenant | Client Experience / Communications | Forms, translations, voice prompts, consent texts, display slides, "You said → We did" content; publishes with approval |
| **MEL Admin** | tenant | MEL team | Taxonomy, indicators, suppression thresholds, denominators import, exports, AI evaluation review |
| **Quality / Safeguarding Admin** | tenant | QA lead, Safeguarding Focal Point | Escalation matrix, SLAs, sensitivity rules, restricted-case access assignments |
| **Device Admin** | site(s) | Centre managers / IT technicians | Pair, name, reset, disable kiosks and displays at their sites |
| **Auditor** (read-only) | tenant | Internal audit, donors (time-boxed) | Read configuration and audit logs; export; no changes |

Operational roles (Centre Manager, Reviewer, MEL Analyst, Safeguarding Focal Point, Contact-centre Agent, Viewer) are defined in the BRD and are *assigned* through this module but are not admin roles themselves.

### 2.2 Permission matrix (C = create/edit, R = read, P = publish/approve, D = delete/disable, — = none)

| Capability | Platform Admin | Tenant Admin | Site Hier. Admin | Content Admin | MEL Admin | Quality/SG Admin | Device Admin | Auditor |
|---|---|---|---|---|---|---|---|---|
| Tenants (create, residency, AI mode) | C/D | R | — | — | — | — | — | R |
| Tenant settings (branding, langs, calendar, tz) | R | C | — | R | R | R | — | R |
| Regions & sites | R | C/D | C (own scope) | R | R | R | R | R |
| Users & role bindings | R (no PII) | C/D | C (own scope, non-admin roles) | — | — | C (safeguarding role only) | — | R |
| SSO / identity provider config | C | R | — | — | — | — | — | R |
| Forms & logic | — | C/P | — | C/P | R | R | — | R |
| Translations & voice prompts | — | C/P | — | C/P | R | — | — | R |
| Consent & privacy texts | — | C (P with Platform Admin/legal approval) | — | C | — | — | — | R |
| Taxonomy & keyword lists | — | C/P | — | — | C/P | C (critical keywords) | — | R |
| Escalation matrix, SLAs, ladders | — | C/P | — | — | R | C/P | — | R |
| Sensitivity rules & restricted-case access | — | R | — | — | — | C/P | — | R |
| Suppression thresholds & indicators | — | C | — | — | C/P | — | — | R |
| Display playlists & slides | — | C/P | C (own scope) | C/P | — | — | — | R |
| "You said → We did" approvals | — | P | P (own scope) | C | — | — | — | R |
| Devices (pair/reset/disable) | — | C/D | C/D (own scope) | — | — | — | C/D (own sites) | R |
| Notification templates & channels | — | C/P | — | C | — | R | — | R |
| Integrations (SMS, e-mail, Telegram, imports) | C (providers) | C (credentials for tenant) | — | — | C (imports) | — | — | R |
| AI settings (provider per tenant, features on/off, prompt versions) | C | C (features) | — | — | R | R | — | R |
| Retention & data-subject requests | C (defaults) | C | — | — | — | — | — | R |
| Audit log | R (system) | R | R (own scope) | — | R | R | — | R |
| Feedback items / audio / cases | — | — | — | — | — | R (restricted per role) | — | — |

Reading client feedback requires an **operational** role (e.g. Centre Manager, Reviewer) granted explicitly; an admin role never implies it.

### 2.3 Scoping model

- Every role binding = `(user, role, scope_type ∈ {tenant, region, site}, scope_id)`.
- A user may hold several bindings (e.g. Content Admin for the tenant + Centre Manager for one site).
- Scope inheritance flows down the hierarchy (tenant → region → site); it never flows up.
- Delegated admins can only grant roles **at or below** their own scope and **never** an admin role higher than their own.

---

## 3. Admin console — information architecture

```
/app/admin
├── Overview            (health, pending approvals, sync status, alerts delivery, AI status)
├── Organisation
│   ├── Tenant settings (name, branding, languages, calendar, time zone, working languages)
│   ├── Regions & sites (hierarchy, site codes, types, service lines, languages, status)
│   └── Service statistics (denominators import, history)
├── People & access
│   ├── Users           (invite, SSO-linked, local accounts, status, MFA)
│   ├── Role bindings   (who can do what, where)
│   ├── Access requests (self-service requests → approval)
│   └── Sessions        (active sessions, force sign-out)
├── Feedback design
│   ├── Forms           (builder, versions, logic, scoring, assignment, preview)
│   ├── Question bank   (reusable questions with translations and audio)
│   ├── Consent & privacy texts (versions, legal approval)
│   └── Channels        (QR/short links, SMS keywords, Telegram bot, IVR menu, kiosk defaults)
├── Language
│   ├── Languages       (enable/disable, default, fallback)
│   ├── Translations    (UI, forms, display, notifications; completeness; import/export)
│   ├── Voice prompts   (upload/record per question per language)
│   └── Glossary        (SRH terms per language used by AI translation)
├── Analysis rules
│   ├── Taxonomy        (categories, examples, keyword lists per language, versions)
│   ├── Critical detection (critical keyword/phrase lists per language, test bench)
│   ├── Sensitivity     (which categories create restricted/safeguarding cases)
│   ├── Trend alerts    (thresholds per site/category)
│   └── AI settings     (features on/off, provider mode, prompt versions, eval results)
├── Escalation
│   ├── Escalation matrix (category × severity × scope → recipients, channels, SLA)
│   ├── Ladders & on-call (tiers, backups, rotations, quiet-hours behaviour)
│   ├── Notification templates (per channel, per language, preview/test send)
│   └── Delivery log     (sent/failed alerts, retries)
├── Display & public content
│   ├── Playlists        (per site/region, slides, schedule, languages)
│   ├── Slide library    (approved slide templates, health messaging)
│   ├── "You said → We did" (queue, approval, publish, expiry)
│   └── Emergency message
├── Devices
│   ├── Kiosks           (pair, assign site/forms, last sync, queue size, reset, disable)
│   └── Displays         (pair, assign playlist, last seen, cached-until, restart)
├── Reports & schedules (templates, distribution lists, schedules, archive)
├── Integrations        (e-mail, SMS, Telegram/WhatsApp, identity, imports, webhooks, API keys)
├── Data & privacy      (retention policies, data-subject requests, exports, anonymisation runs)
├── Audit log           (search, filter, export)
└── Platform (Platform Admin only): tenants, providers, security policy, system status, release notes
```

Each area follows the same UI pattern: list → detail → **draft / preview / publish** with a change summary and (where required) an approval step. Every screen is available in English and Amharic.

---

## 4. Feature specifications by area

Requirement IDs extend the BRD numbering (FR-ADM-10 onward). Priority: **M** pilot, **S** national, **C** later.

### 4.1 Overview dashboard (admin home)

| ID | Requirement | Pri |
|---|---|---|
| FR-ADM-10 | Shows system health (API, workers, queue depth, AI provider status, e-mail/SMS provider status), devices offline > 24 h, kiosks with > 100 queued items, failed alert deliveries, pending approvals (forms, translations, display content, "We did" items, access requests), translation completeness per language. | M |
| FR-ADM-11 | Each tile links to the relevant list pre-filtered; a "what changed this week" feed lists configuration changes with actor and rollback links. | S |

### 4.2 Organisation

| ID | Requirement | Pri |
|---|---|---|
| FR-ADM-12 | **Tenant settings**: name, country, logo/colours (with contrast check), default and working languages, calendar (Gregorian/Ethiopian display), time zone, first day of week, currency label, contact/hotline numbers (shown to clients in emergencies), public site URL. | M |
| FR-ADM-13 | **Regions & sites**: unlimited-depth hierarchy; site fields: code (unique per tenant, aligned to EMR/DHIS2 org-unit code), name (per language), type (centre, maternity, outreach team, franchise, hotline), service lines, client languages, address/GPS (optional), status (active/paused/closed), opening hours (for trigger scheduling); bulk import/export CSV; merge/rename with history preserved. | M |
| FR-ADM-14 | **Service statistics** (denominators): CSV or API import of visits per site/service/month with validation, duplicate detection and a preview before commit; import history and rollback. | S |

### 4.3 People & access

| ID | Requirement | Pri |
|---|---|---|
| FR-ADM-15 | **Users**: invite by e-mail (SSO users auto-link on first login), local accounts for non-M365 staff, phone number for SMS alerts, preferred language, status (invited/active/suspended/deactivated); deactivation revokes sessions and device tokens, reassigns open cases. | M |
| FR-ADM-16 | **Role bindings** editor with scope picker (tenant/region/site tree), effective-permissions preview ("this user can…"), and guard-rails: cannot grant above own scope/role; safeguarding role requires a second approver (Quality/Safeguarding Admin). | M |
| FR-ADM-17 | **MFA policy**: mandatory TOTP for all admin roles and safeguarding roles; optional for others; reset flow with identity verification logged. | M |
| FR-ADM-18 | **Access requests**: a manager can request a role for a colleague; the appropriate admin approves/denies with reason; all steps audited. | S |
| FR-ADM-19 | **Sessions & tokens**: view active sessions per user; force sign-out; list and revoke API keys and device tokens. | M |
| FR-ADM-20 | **Bulk operations**: CSV import of users with role bindings; periodic access review report (who has what, last login) exportable for quarterly review. | S |

### 4.4 Feedback design (forms, consent, channels)

| ID | Requirement | Pri |
|---|---|---|
| FR-ADM-21 | **Form builder**: drag-and-drop pages and questions; types per BRD FR-CAP-1; required/optional; skip and branch logic (condition builder); scoring (e.g. satisfaction index); question bank reuse; per-site/per-channel assignment; kiosk vs phone layouts previewed on device frames. | M |
| FR-ADM-22 | **Versioning**: editing a published form creates a draft; publishing creates a new immutable version; responses always reference their version; version diff view; roll back by re-publishing an older version. | M |
| FR-ADM-23 | **Publish checks** (blocking): all assigned languages translated; audio prompts present for kiosk forms (or explicitly waived); consent text version attached; at least one critical free-text or voice question when the form is a complaint form; accessibility lint (labels, contrast). | M |
| FR-ADM-24 | **Preview & test mode**: run the form as a client in any language on a simulated kiosk/phone; test submissions are flagged and excluded from analytics. | M |
| FR-ADM-25 | **Consent & privacy texts**: versioned per language; require legal/DPO approval (Platform Admin or designated approver) before publish; clients' consent records reference the version. | M |
| FR-ADM-26 | **Channels**: generate site QR codes and short links (print-ready PDF posters per language); SMS keywords/short code mapping to sites; Telegram bot start-parameters per site; IVR menu mapping; kiosk defaults (idle timeout, privacy screen text, assisted-mode PIN). | M |

### 4.5 Language

| ID | Requirement | Pri |
|---|---|---|
| FR-ADM-27 | **Languages**: enable/disable per tenant and per site; default and fallback order; script and font settings; Ethiopian calendar toggle for client-facing dates. | M |
| FR-ADM-28 | **Translation workbench**: table of keys × languages with status (missing / machine-drafted / translated / reviewed); filter by scope; inline edit; **machine draft** button (AI translation, clearly marked, never auto-published); reviewer approval; XLIFF/CSV export-import for professional translators; completeness gauges per language. | M |
| FR-ADM-29 | **Voice prompts**: upload or record in-browser per question per language; waveform preview; auto-normalise loudness; version per form version; missing-audio report. | M |
| FR-ADM-30 | **Glossary**: SRH/clinical terms and preferred renderings per language; used by AI translation prompts and shown to translators. | S |

### 4.6 Analysis rules (taxonomy, critical detection, sensitivity, AI)

| ID | Requirement | Pri |
|---|---|---|
| FR-ADM-31 | **Taxonomy manager**: hierarchical categories (2 levels), each with description, positive/negative examples, and keyword/phrase lists per language; versioned; publishing a new version optionally triggers re-classification of the last N months (batch job with cost estimate shown before confirming). | M |
| FR-ADM-32 | **Critical detection test bench**: paste or pick sample texts (any language) and see rule hits and model output side by side before publishing keyword changes; regression set of known-critical samples must still trigger (blocking check). | M |
| FR-ADM-33 | **Sensitivity rules**: map categories/flags to case sensitivity (normal/restricted/safeguarding) and to the roles allowed to view; changes require Quality/Safeguarding Admin approval. | M |
| FR-ADM-34 | **Trend alert thresholds**: per category and scope (e.g. ≥ 5 items on "commodity stock-out" at one site in 7 days, or +50 % vs previous 4-week average); recipients and channel. | S |
| FR-ADM-35 | **AI settings**: per tenant: provider mode (cloud / local / hybrid — Platform Admin sets what is allowed, Tenant Admin chooses within it); features on/off (transcription, translation, classification, digests, reports, copilot, client assistant); confidence thresholds for auto-accept vs human verification; prompt/taxonomy version in use; monthly accuracy report per language; kill-switch that reverts to manual triage. | M |

### 4.7 Escalation

| ID | Requirement | Pri |
|---|---|---|
| FR-ADM-36 | **Escalation matrix editor**: rules with match conditions (category, critical flag, severity, site/region, channel, service line, time of day), recipients (roles resolved at send time + named users + external e-mail/SMS), channels, SLA per tier, ladder (tier 1 → 2 → 3 with delays), quiet-hours behaviour (critical always sends; non-critical batched into digest). Rule simulation: "who would be alerted for this item?". | M |
| FR-ADM-37 | **On-call & backups**: rotation calendar per role/site (weekly), automatic fallback when a recipient is deactivated or on leave; coverage gaps highlighted. | S |
| FR-ADM-38 | **Notification templates**: per channel (e-mail HTML+text, SMS, Telegram, push) and per language with placeholders; preview with sample data; "send test to me"; SMS length counter with Ethiopic character handling. | M |
| FR-ADM-39 | **Delivery log**: every alert with status per channel (queued/sent/delivered/failed/acknowledged), retry, resend; failures over threshold raise an IT alert. | M |

### 4.8 Display & public content

| ID | Requirement | Pri |
|---|---|---|
| FR-ADM-40 | **Playlist manager**: per site or region; slides from the library (satisfaction summary, top compliments, "We did", how-to-give-feedback, client charter, health message, custom image/text); per-slide duration and languages; schedule by day/time/site type; version and preview; publish requires content approval. | M |
| FR-ADM-41 | **Guard-rails**: data slides render only from suppressed aggregates (min n configurable, default 10); free-text slides pass a PII scan (names, phone numbers) and require approval; no slide can reference an individual item. | M |
| FR-ADM-42 | **"You said → We did" queue**: managers propose actions from cases/themes; Content Admin edits wording per language; approver publishes to site/region/national; expiry date; archive. | M |
| FR-ADM-43 | **Emergency message**: tenant/region/site-wide override slide (e.g. service disruption) with start/end; logged. | S |

### 4.9 Devices

| ID | Requirement | Pri |
|---|---|---|
| FR-ADM-44 | **Pairing**: admin generates a 6-digit code (10-minute validity); device enters it; device record created with type, site, name; token scoped to site and mode. | M |
| FR-ADM-45 | **Monitoring**: last seen, app version, battery (Android), storage free, queued items, last successful sync, cached-content age (displays); filters "needs attention". | M |
| FR-ADM-46 | **Actions**: rename, reassign site/forms/playlist, force config refresh, remote reset (clear local data **after** confirming queue is empty or with explicit acknowledgment of loss), disable/revoke token, replace device (transfer settings). | M |
| FR-ADM-47 | **Kiosk policy**: idle timeout, privacy screen, assisted-mode PIN, allowed forms, language subset, screen brightness schedule; policy templates per site type. | S |

### 4.10 Reports & schedules

| ID | Requirement | Pri |
|---|---|---|
| FR-ADM-48 | Manage report templates (enable/disable, branding, sections incl. AI narrative on/off), distribution lists (roles/users/external e-mails with approval), schedules (cron-like picker with time zone), and the archive (search, re-send, retention). | S |

### 4.11 Integrations

| ID | Requirement | Pri |
|---|---|---|
| FR-ADM-49 | Configure e-mail (Microsoft Graph app registration or SMTP), SMS provider adapter and credentials, Telegram/WhatsApp bot tokens, identity provider (OIDC metadata, claim mapping, SCIM), imports (service statistics), outbound webhooks (events, secret, retry), API keys (scoped, expiring). Credentials are write-only (never displayed again), stored in the secrets store; "test connection" for each. | M |

### 4.12 Data & privacy

| ID | Requirement | Pri |
|---|---|---|
| FR-ADM-50 | **Retention policies** per data class (identified contact data, audio, transcripts, anonymised items, cases, audit) with tenant defaults set by Platform Admin within legal bounds; dry-run report before applying; execution log. | M |
| FR-ADM-51 | **Data-subject requests**: search by phone/e-mail/reference across identified data; export (machine-readable) or erase (identifiers, audio, contact data; anonymised aggregates kept); dual approval; completion certificate logged. | M |
| FR-ADM-52 | **Exports**: scoped CSV/Excel exports of items (redacted by default; identified export needs a documented purpose and approval), configuration export (JSON) for backup or for seeding a new tenant. | M |
| FR-ADM-53 | **Anonymisation runs**: ad-hoc job to strip residual identifiers from older free text using the redaction engine; report of changes. | S |

### 4.13 Audit log

| ID | Requirement | Pri |
|---|---|---|
| FR-ADM-54 | Searchable, filterable (actor, action, object, scope, date), immutable log of all admin actions, access to identified data/audio, alert deliveries, AI kill-switch changes, logins/MFA events; export CSV; retention ≥ 5 years (configurable). | M |
| FR-ADM-55 | Rollback links where supported (forms, translations, taxonomy, escalation rules, playlists) create a *new* version equal to the older one; nothing is silently overwritten. | M |

### 4.14 Platform (Platform Admin only)

| ID | Requirement | Pri |
|---|---|---|
| FR-ADM-56 | **Tenant lifecycle**: create (wizard: country, languages, calendar, residency, AI mode allowed, initial admin), suspend, archive/export, delete (after retention hold, dual approval). Seed a tenant from an exported configuration (e.g. "Ethiopia baseline") to onboard a new country in minutes. | M (create) / S (seed) |
| FR-ADM-57 | **Security policy**: password/MFA rules for local accounts, session lifetimes, IP allow-lists for admin, device token lifetimes, rate limits. | M |
| FR-ADM-58 | **Providers**: register available AI, SMS, e-mail, ASR providers and which tenants may use them; residency labels on each. | M |
| FR-ADM-59 | **System status & maintenance**: version, migrations, queue health, storage use, backup status and last restore drill, maintenance-mode banner (capture continues offline). | M |

---

## 5. Key admin workflows

### 5.1 Onboard a new site (≈ 15 minutes)
1. Organisation → Regions & sites → *Add site* (code, name per language, type, service lines, languages).
2. Feedback design → Forms → assign exit form(s) and complaint form to the site; check publish checks pass for its languages.
3. Escalation → confirm the matrix resolves recipients for the site (simulation) and add the Centre Manager binding under People & access.
4. Devices → generate pairing codes for kiosk(s) and display(s); pair on the hardware.
5. Display → assign playlist; approve default slides.
6. Feedback design → Channels → print the site's QR posters (per language).
7. Overview shows the site as "ready" once a test submission has synced and a test alert has been acknowledged.

### 5.2 Publish a new form version
Draft → edit → preview in each language/device → publish checks → optional Content Admin approval → publish → clients receive it at next config sync (kiosks within minutes when online); previous version's data untouched.

### 5.3 Change critical keywords
Analysis rules → Critical detection → edit list (per language) → test bench (regression samples must pass) → Quality/Safeguarding Admin approval → publish → audit entry; optional re-scan of the last 30 days.

### 5.4 Grant safeguarding access
People & access → Role bindings → add *Safeguarding Focal Point* at tenant scope → second approval by Quality/Safeguarding Admin → MFA enforced at next login → audit entry; access review report lists it quarterly.

### 5.5 Handle a data-subject erasure request
Data & privacy → Data-subject requests → search → review matches → request erasure → second approver → job runs → certificate stored → requester notified via the channel they used.

### 5.6 Onboard a new country programme (Platform Admin)
Platform → Tenants → *Create from seed* ("MSI baseline" export) → set languages, calendar, residency, allowed AI mode, initial Tenant Admin → Tenant Admin completes sites, users, translations, escalation → go-live checklist in Overview.

---

## 6. Admin UX requirements

- Responsive web (desktop first; tablet usable; phone for approvals and device actions).
- Every destructive action: confirmation with the object name typed or a clear consequence summary; soft-delete with 30-day restore where possible.
- Inline validation and explicit "why can't I publish?" lists.
- Keyboard-operable, WCAG 2.2 AA, English and Amharic UI (other languages as translated).
- Contextual help panel per screen and links to the admin manual; guided tours for first-time Tenant Admins.
- Change summaries ("You are changing 3 recipients and 1 SLA") before publish.

---

## 7. Security requirements specific to administration

| ID | Requirement |
|---|---|
| NFR-ADM-1 | Admin routes require an authenticated session with MFA and, optionally, an IP allow-list; sessions expire after 30 minutes idle (configurable). |
| NFR-ADM-2 | Separation of duties: the person who edits a safeguarding-related rule, a consent text or a restricted-role binding cannot be the sole approver. |
| NFR-ADM-3 | Break-glass: Platform Admin can temporarily grant an emergency role with a mandatory reason, 24-hour expiry and an alert to the Tenant Admin and Auditor. |
| NFR-ADM-4 | Credentials and tokens are write-only in the UI and stored in the secrets store; audit records the change but never the value. |
| NFR-ADM-5 | All configuration is exportable as JSON and restorable; configuration backups are part of the nightly backup set. |
| NFR-ADM-6 | Admin actions are rate-limited and logged with actor, IP, user-agent and before/after diff (redacted for secrets). |
| NFR-ADM-7 | Admin API mirrors the console (OpenAPI) so MSI Global can automate onboarding; same permissions apply. |

---

## 8. Acceptance criteria (admin module, pilot)

1. A Tenant Admin onboards a new site end-to-end (workflow 5.1) without developer help, in under 30 minutes, following the manual.
2. A form change is published as a new version; old submissions still display with their original questions; rollback recreates the prior version.
3. Publishing a form with a missing Afaan Oromoo translation is blocked with a clear message; adding the translation unblocks it.
4. A critical keyword change that would stop a regression sample from triggering is blocked in the test bench.
5. An attempt by a Site Hierarchy Admin to grant a Tenant Admin role is refused and logged.
6. A safeguarding role binding requires and records a second approval; the user is prompted for MFA at next login.
7. Pairing, disabling and re-pairing a kiosk works; a disabled kiosk cannot submit; its queued items are preserved until re-enabled or explicitly discarded with acknowledgment.
8. A display slide containing a phone number in free text is blocked by the PII scan until edited.
9. A data-subject erasure request completes with dual approval and leaves aggregates unchanged.
10. The audit log shows every action from tests 1–9 with actor, time and diff, and exports to CSV.
11. A new tenant seeded from the Ethiopia configuration export is ready for site set-up in under one hour.

---

## 9. Open questions for MSIE (admin)

1. Who are the two named Platform Admins, and does MSI Global want that role for multi-country governance?
2. Which approvals must be dual-controlled beyond safeguarding and consent texts (e.g. escalation matrix, display content)?
3. Is Microsoft Entra ID group membership to be used to auto-assign roles (e.g. an "MSIE Centre Managers" group → Centre Manager role at their site)?
4. Required retention for the audit log and configuration history.
5. Whether regional managers should be delegated admins (Site Hierarchy Admin) at launch or only after national roll-out.
