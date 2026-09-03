# MSI Ethiopia Client Feedback System — proposal pack

A standalone proposal for an AI-assisted, multilingual, offline-first client feedback
system for MSI Ethiopia's core (SRH) centres and maternity centres, designed to scale to
other MSI country programmes.

> **Note on location.** This pack lives in the ZAYA website repository only because it was
> drafted here. It is **not** part of the ZAYA site build, imports nothing from it and is
> not published by it. It should move to its own MSI-owned repository once MSIE takes it
> forward.

| Document | Purpose | Audience |
|---|---|---|
| [`00-management-brief.md`](./00-management-brief.md) | Four-page brief for the Senior Management Team: what the system does, what management and clients get, how it is run, roadmap, decisions requested | MSIE Senior Management Team |
| [`01-business-requirements.md`](./01-business-requirements.md) | Business Requirements Document: context, objectives, scope, personas, functional and non-functional requirements, safeguarding/ethics, phasing, acceptance criteria, open questions | MSIE leadership, MEL, Quality, Safeguarding, Client Experience, MSI Global |
| [`02-technical-design.md`](./02-technical-design.md) | Technical design: architecture, client apps and offline sync, backend and data model, multilingual approach, AI agent design, analytics, security, hosting on MSIE infrastructure, delivery plan | MSIE IT/Digital, MSI Global Digital, implementation team |
| [`03-admin-module.md`](./03-admin-module.md) | Administration module: admin roles and permission matrix, admin console layout, configuration features for every area (organisation, access, forms, languages, analysis rules, escalation, display, devices, integrations, data & privacy, audit, platform), key workflows, admin security, acceptance criteria | MSIE IT/Digital, MEL, Quality, Client Experience, MSI Global |

## What the system does, in one paragraph

Clients give feedback in their own language through short forms, free narrative or voice —
on a kiosk tablet at the centre, on their own phone via QR code, by SMS/USSD, Telegram or
the hotline — anonymously by default and fully offline when needed. An AI layer of bounded,
auditable agents transcribes, translates, redacts, classifies and scores each item; anything
critical (safeguarding, abuse, coercion, clinical harm, confidentiality breaches, illegal
fees) is escalated within minutes by e-mail and SMS with a tracked case and an escalation
ladder. Managers get live dashboards, scheduled reports and an "ask the data" assistant;
centres get a TV "client voice wall" showing aggregated satisfaction and "You said → We
did" actions. The platform is multi-tenant, hosted on MSI Ethiopia's own domain and server
(with cloud options), and configurable for other MSI country programmes without code
changes.

## Word edition for management

[`MSI-Ethiopia-Client-Feedback-System.docx`](./MSI-Ethiopia-Client-Feedback-System.docx) compiles the four documents into one
Word file (cover, contents, Part A brief, Part B requirements, Part C technical design,
Part D administration). It is generated from the markdown; edit the markdown and rebuild
rather than editing the Word file directly.

## Status

Draft v0.1 (2026-09-03). All statements about MSI Ethiopia's operations are working
assumptions to be validated in the discovery phase (BRD §2 and §12).
