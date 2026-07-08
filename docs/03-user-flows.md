# 03 · User Flows

Text flow diagrams for the primary journeys. Every path that touches a not-yet-live
capability terminates at an **honest coming-soon / roadmap** state — never a dead end or
a fake feature.

## Flow A — Shop owner: "will this help my shop?" → join the pilot
```
Home (hero: "Everything near you")
  → Problems We Solve  (recognises: paper notebook, forgotten credit, stock surprises)
  → Who We Serve → Merchants  (Today pain → With-ZAYA benefit; "a sale in 5 seconds")
  → Pricing  (sees FREE forever → decides)
  → Join the pilot (CTA)
      → /contact  → message form (front-end) OR call/email the real numbers
      → confirmation: "We'll be in touch — the pilot is in Nifas Silk Lafto now"
```

## Flow B — Customer: "find & order near me"
```
Home → Who We Serve → Customers
  → interactive "near-you" moment (search shops/services near a saved place)
  → How it works (search → compare prices → pick shop → order → cash/digital → local delivery)
  → Get the app  [Launching]
      → /get-started/customer → app.zaya.et  "Pilot access — coming soon" (get notified)
```

## Flow C — Diaspora: "provide for my family — real goods, with proof"  ★
```
Home → Diaspora story (prominent)  OR  /solutions/diaspora
  → framing: "Provide for your family — real goods, not cash into the dark"
  → 4-step how-it-works:
      1) Choose a trusted shop in their neighbourhood
      2) Order groceries/essentials at shelf prices + one transparent fee
      3) Shop fulfils; local delivery
      4) You get confirmed delivery WITH A PHOTO   (+ optional monthly family basket)
  → Get notified  [On the roadmap]
      → /get-started/diaspora → app.zaya.et coming-soon
  (NEVER "send money"; NO transport product named — H4/H5)
```

## Flow D — Supermarket / enterprise
```
Home → Who We Serve → Supermarkets
  → multi-cashier operations, scan-and-go, one live dashboard (Live/Launching tagged)
  → future WEB business workspace for the big screen  [On the roadmap]
  → Pricing → Premium Max (from 999 ETB/mo + per-branch)
  → Talk to us → /contact (enterprise enquiry)
```

## Flow E — Delivery partner
```
Home → Who We Serve → Delivery Partners
  → opportunity: easy registration, jobs, navigation, performance tracking  [Roadmap]
  → Register interest → /get-started/delivery → app.zaya.et coming-soon
```

## Flow F — Gateway: Sign In / Get Started (the navigational front door)
```
Any page → header "Sign In"
  → /signin  → app.zaya.et  "Pilot access — coming soon"
             → (honest: explains the pilot cohort; offers "get notified" + contact)

Any page → header "Get Started" (primary CTA)
  → /get-started  → Role Selection grid (6 roles, each a card)
      → /get-started/[role] → app.zaya.et coming-soon for that role
  (No account, no form-that-pretends-to-register — H1/H3. "Get notified" + contact only.)
```

## Flow G — Language switch
```
Any page → Language ▾ (am · om · ti · en, each in its own script)
  → hero + nav + primary CTAs switch live; full-page localized routes where available
  → choice persisted (cookie/localStorage) + reflected in the URL locale prefix
  → drafts clearly flagged in code until founder-verified (F3)
```

## Flow H — Learn ZAYA in minutes (resources)
```
Home / Help Center → "Learn ZAYA in minutes" guide cards:
  sign in with your phone · add products & stock · record your first sale · manage the credit book
  → /help/[slug]  (placeholder guide pages until real content — Placeholder tag)
```

## Flow I — Contact / Join the pilot
```
Footer or /contact → "Join the pilot" CTA
  → message form (name, role, phone/email, message)  [front-end only]
  → on deploy: posts to a form service (Formspree/Netlify Forms)
  → until wired: shows the real email + two phones as the working channel
  → success state: honest confirmation, no fake ticket number
```

## Reduced-motion / low-end path (cross-cutting)
```
prefers-reduced-motion OR low-end device
  → hero radar-pulse + scroll reveals collapse to a static, still-beautiful composition
  → no functional content is behind an animation; everything is readable without JS
```
