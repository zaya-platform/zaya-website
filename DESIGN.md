---
name: ZAYA marketing website
description: The established ZAYA identity, refined for clear product discovery and enquiry.
colors:
  navy: "#1e2a4a"
  teal: "#0ea5a4"
  teal-ink: "#087976"
  coral: "#ff7a45"
  coral-hover: "#ff925f"
  coral-hover-promo: "#ff8a5c"
  cloud: "#f4f7f8"
  mint: "#e4f4f2"
  surface: "#edf5f4"
  muted: "#596378"
  line: "#c9d9d9"
  plum: "#6d5dd3"
typography:
  display:
    fontFamily: "Poppins, Noto Sans Ethiopic, Nyala, Arial, sans-serif"
    fontSize: "clamp(52px, 6.3vw, 84px)"
    lineHeight: 1.16
    letterSpacing: "-.035em"
  display-tablet:
    fontSize: "clamp(42px, 7vw, 60px)"
  display-phone:
    fontSize: "clamp(38px, 10vw, 54px)"
  headline:
    fontSize: "clamp(32px, 3.8vw, 52px)"
    lineHeight: 1.16
    letterSpacing: "-.035em"
  body:
    fontFamily: "Poppins, Noto Sans Ethiopic, Nyala, Arial, sans-serif"
    fontSize: "16px"
    lineHeight: 1.7
  secondary:
    fontSize: "14px"
  caption:
    fontSize: "12px"
  metadata:
    fontSize: "13px"
  action:
    fontSize: "15px"
  audience-tab:
    fontSize: "17px"
  intro:
    fontSize: "19px"
  intro-phone:
    fontSize: "16px"
  section-title:
    fontSize: "clamp(26px, 2.5vw, 34px)"
  product-title-tablet:
    fontSize: "27px"
  product-title-phone:
    fontSize: "30px"
  compact-title:
    fontSize: "24px"
  dialog-title-phone:
    fontSize: "21px"
  brand-letter:
    fontSize: "32px"
  legal-title:
    fontSize: "48px"
  legal-title-phone:
    fontSize: "36px"
  legal-heading:
    fontSize: "26px"
rounded:
  control: "10px"
  panel: "16px"
  skip-link: "8px"
  diagram-element: "12px"
  phone-frame: "24px"
  phone-screen: "19px"
  status: "30px"
  status-dot: "50%"
  portrait-top-left: "90px"
  portrait-tight: "18px"
  portrait-bottom-right: "70px"
  portrait-phone-bottom-right: "50px"
spacing:
  space-1: "4px"
  space-2: "8px"
  space-3: "12px"
  space-4: "16px"
  space-6: "24px"
  space-8: "32px"
  space-12: "48px"
  space-16: "64px"
  space-24: "96px"
components:
  button-primary:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.navy}"
    rounded: "{rounded.control}"
    padding: "15px 22px"
  product-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.navy}"
    rounded: "{rounded.panel}"
---

# Design System: ZAYA

## Overview

**Creative North Star: “Everything near you.”**

Preserve the existing ZAYA identity while making its product and next steps easier to understand. The established combination is Poppins, the official logo, navy text, teal structure, orange actions, light surfaces and genuine Ethiopian photography. It should feel warm, trustworthy, local and practical.

This is the canonical design record for both Impeccable and UI UX Pro Max work. `PRODUCT.md` owns product facts. `.impeccable/surfaces/home.md` owns homepage strategy. Shared tokens live in `src/styles/global.css`; the Features menu uses `src/styles/features.css`, while Promo and BrandMeaning components have scoped styles. Homepage and legal pages share the consolidated global stylesheet. Changes to those decisions should update this document, rather than create a competing design system.

## Colors

Use the frontmatter values as the palette. Navy is the main text colour. Cloud is the page background; mint and the slightly quieter surface token distinguish product and planned-content regions. Orange/coral identifies primary enquiry and playback actions. Teal is a brand accent; dark teal is used where text or control outlines need contrast. Plum is the visible keyboard-focus colour. Line is a structural divider, not the sole indication that a control is interactive.

Measured solid-colour contrast for the current tokens: navy on coral **5.47:1**; muted on cloud **5.60:1**; dark teal on cloud **4.87:1**; plum on cloud **4.69:1**. Bright teal on cloud is **2.81:1**, so reserve it for decorative brand geometry instead of normal text or essential control boundaries. These calculations do not substitute for checking rendered states and composed backgrounds.

Minor retained drift: global primary buttons use `coral-hover`, while Promo playback/retry buttons use the slightly darker `coral-hover-promo`. Both are documented as implemented variants; they are not a new general-purpose accent palette.

## Typography

Poppins 400/500/600/700 is served locally as WOFF2 with `font-display: swap`. Preserve this typeface. Base body text is 16px and secondary explanations 14px. Controls normally use 14–15px; small status/metadata treatments may use 13px. The hero introduction is 19px, reducing to 16px on phones. The compact header Explore ZAYA control uses 12px below 650px; audience names inside its dropdown remain 14px on phones, accompanied by icons, descriptions and availability status.

Headings use balanced wrapping, a 1.16 line height and -.035em tracking; the hierarchy ranges from the responsive display title to 26–34px section subheadings. Body paragraphs use 1.7 line height and a maximum 70ch measure. Do not use small labels to carry essential launch or availability information.

Frontmatter also catalogs actual contextual sizes: 17px product audience tabs/FAQ labels, 19/16px hero introductions, 27px tablet and 30px phone product titles, 24px compact titles, 21px phone dialog titles, 32px brand letters, and 48/36px legal titles with 26px legal headings. These describe existing role-specific variants, not extra interchangeable steps for new body copy.

The fallback stack includes Noto Sans Ethiopic and Nyala. `:lang(am)` removes Latin tracking and uses 1.8 line height. This is layout preparation, not delivered translation or a bundled Ethiopic font: an approved translation and verified font coverage remain follow-up work.

## Layout

Use the existing 4px spacing scale, with 16–24px inside related groups and 32–64px between larger groups. Section padding is fluid (`clamp(52px,5vw,80px)`). The main wrapper is at most 1280px with 32px side gutters, reducing to 20px on phones. The compact phone header uses 12px side gutters; the phone hero uses 16px.

At wide sizes, the hero has two columns: the introduction and secondary copy sit on the left while the independent scene occupies the right. At 900px and below the secondary navigation becomes a menu and the hero follows introduction → scene → secondary copy and actions. Explore ZAYA stays directly visible beside the brand in the header, outside the phone Menu. Its single dropdown contains the four audience icon links in four columns on desktop and two columns at 900px and below. At 650px and below product panels and planned experiences stack. The Promo switches to one column below 750px. At very short landscape heights, the header becomes non-sticky and the hero uses a compact two-column arrangement.

The desktop Features disclosure uses a bounded 540px-wide panel with two-column groups and a scroll limit based on the viewport. Inside the phone Menu, it becomes a single-column section in the outer navigation’s scrolling flow. The “What is ZAYA?” letter disclosures use one column below 600px, two from 600px and four from 1050px.

The closed header is 88px high, 80px below 900px, and 72px below 650px. Scroll padding and target margins account for it. Opening Explore ZAYA reserves the measured dropdown height in the header, pushing the hero down instead of covering its scene. The bounded dropdown scrolls internally on short displays and closes before destination scrolling. Content should wrap rather than rely on horizontal clipping. Preserve the ability to zoom and test narrow, intermediate and wide widths. The homepage section rhythm uses a tighter `clamp(52px,5vw,80px)` band so the narrative stays connected on tall screens. A three-item quick-start rail beneath the hero gives visitors direct paths to the product experiences, delivery workflow and promo.

## Elevation & Depth

Tonal surfaces create most of the hierarchy. The shared shadow is `0 16px 40px #1e2a4a16`, used for phone frames, diagram elements and the dialog. App screenshots remain upright and readable. The portrait is now upright in the product introduction; the small Promo logo treatment retains restrained depth. The new hero's 3D scene provides the main dimensional composition.

The homepage hero contains one focal Three.js scene: a ZAYA hub connects a shopping bag, storefront, delivery parcel and globe on a conceptual neighbourhood platform. Choosing an audience link in Explore ZAYA highlights its node, connection and grounded selection halo before navigating to the relevant details; pointer and scroll input gently change perspective without changing the selected audience. The static diagram also raises and enlarges the selected node. Selection changes glide over about half a second. Visitors can drag horizontally (mouse or touch) to turn the model up to about 40° either way; it eases back to the resting view after six quiet seconds, vertical touch movement still scrolls the page, and a drag is never treated as a tap. Tapping or clicking a shape selects it, in both the 3D model and the static diagram. With Riders selected, a dotted coral route runs from the storefront to the shopping bag and a small parcel travels along it: an illustration of shop-managed delivery, not live tracking. The model stays mounted independently of the header disclosure, so menu interactions never replace or hide it. All essential content remains HTML. The 3D module loads separately when the scene is visible; reduced motion, saved motion-off preference, data saver, 2G and lower-capacity device hints keep the static diagram. WebGL failure or context loss also leaves a working diagram and navigation. Animation stops offscreen or in a hidden tab. The scene has a local pause control; the footer's persistent motion control covers the whole page. The header logo has a visible three-second wave and pauses on hover/focus. No React or animation framework was added. The existing extension-only sidecar predates this change; these rules and the source are the current implementation record.

The right hero column uses light mint around the dedicated scene, its heading, product-preview caption and pause control. Audience navigation lives in the header Explore ZAYA dropdown. Inside the composition, a scene explorer (four highlight buttons — Customers, Merchants, Riders, Diaspora — above one detail card with a description, the availability status and a single link to the relevant section) selects connections without leaving the hero. It appears only when JavaScript runs, drives both the 3D model and the static diagram, announces each choice politely to screen readers, and lays its buttons out two by two unless the panel is at least 500px wide (a container query, so whole words never break). Its choices do not show the scene tooltip, keeping the model uncovered; the tooltip still follows its node while the model turns. The caption adds “Drag to turn · tap a shape” only while the 3D model is running. The shop-managed delivery diagram has a “Play the journey” control that walks its three steps (about two seconds each); choosing any step stops it. Customer and merchant links lead to actual app walkthroughs; Riders describes shop-managed delivery, and Diaspora remains explicitly planned. The official SVG logo keeps its original colours and proportions. The authentic Addis portrait remains alongside the real product-preview introduction, with its photographer credit. No pinned scrolling or scroll hijacking is used. Shared overrides live in `src/styles/neighbourhood-page.css` and `src/styles/motion.css`; scene styles are scoped in `Neighbourhood.astro` and audience navigation styles in `ExploreMenu.astro`.

## Shapes

Controls use a 10px radius and larger panels a 16px radius. The skip link uses 8px; diagram elements 12px; the phone frame/screen pair 24px/19px. Status labels use 30px pills and their dots are circular. These contextual values are catalogued separately from the reusable control/panel pair.

The product-introduction portrait uses asymmetric corners (`48px 16px 40px 16px`) and an explicit photographer caption. Screenshots remain upright. The static network fallback uses geometric connection lines; the enhanced scene uses a compact model platform. Keep official SVG logo proportions and colours intact.

## Components

- **Primary actions:** orange fill, navy text, 52px minimum height; smaller navigation actions and media buttons remain at least 48px. Secondary text links are visibly underlined and comfortably tappable. Hover changes colour without moving surrounding layout.
- **Focus:** a 3px plum outline with 5px offset. The screenshot dialog uses a tighter offset so outlines remain visible inside the dialog edge.
- **Navigation:** a native Features disclosure contains nine regular links grouped by shoppers, merchants and further exploration. On phones, visitors open Menu → Features. Comparison and customer-credit links select the relevant audience and its actual screenshot; RIDE and Diaspora links remain visibly Planned. Keyboard ArrowDown/ArrowUp/Home/End supplement normal Tab navigation. Escape closes the inner disclosure first and returns focus to Features; a second Escape closes the outer menu. Tab-out and outside-header clicks dismiss open navigation. Hashes retain direct audience entry and browser navigation. Active location uses an underline as well as colour.
- **Explore ZAYA:** one native header `details`/`summary` disclosure with a chevron and four audience icon links. It remains visible alongside the brand on phones, outside the secondary Menu. The expanded panel reserves header height rather than overlaying the scene; desktop uses four columns and mobile/tablet two. Enter/Space operate natively, ordinary Tab reaches each link, and arrow/Home/End keys supplement navigation. Escape closes the disclosure and returns focus to its summary; outside interaction or moving focus out dismisses it. Links close the panel before moving to the relevant customer or merchant preview, shop-managed delivery or planned Diaspora content. The scene stays mounted throughout. Without JavaScript, the disclosure and links remain usable and the panel participates in normal layout.
- **Product audience tabs:** semantic tablist/tab/tabpanel roles, selected state, roving tab order, arrow/Home/End navigation. The selected state combines mint fill and a dark-teal underline. These remain in the product walkthrough, separate from the header Explore ZAYA navigation.
- **Product previews:** actual screenshots, visible demonstration-data labels, two screen choices per audience and a native enlarged-view dialog. Close stays visible while the image scrolls; Escape closes and focus returns to its opener. Without JavaScript, both audience panels remain available.
- **Delivery diagram:** an illustrative shop-managed workflow with three buttons and a live textual description. The diagram does not represent a live map or a passenger service.
- **Promo:** native controls, explicit playback, initial `preload="none"`, 1080p default and optional 4K. Enhanced controls appear only after initialization; retry and a direct link provide recovery. The same-composition WebP poster reduces transferred image bytes while retaining the supplied original.
- **FAQ:** native `details` and `summary`, with visible expansion indicators and keyboard support.
- **Brand meaning:** “What is ZAYA?” preserves `#meaning` and presents Zonal, Availability, Yours and Access in four native disclosures. The first starts open; the shared native group supports exclusive expansion. Each summary pairs the letter and full word with an SVG chevron, using an 88px target and visible focus. Scoped rules prevent FAQ expansion styles from rotating text. Enter/Space operate natively; the chevron transition respects reduced-motion and the website motion control. No additional JavaScript is required.
- **Contact:** a guided enquiry uses the existing server-side Jev integration to suggest a route and priority, then lets the visitor continue by email. Results stay hidden until a successful review. Priorities describe suggestions rather than promise response times. Email and telephone links remain available; nothing automatically registers the visitor or sends an enquiry to the ZAYA team.

Static-audit distinctions: the enlarged dialog image intentionally has no initial `src`; the selected real screenshot’s URL and alt text are assigned before `showModal()`. It is not a visible placeholder. The tabs’ 3px bottom border communicates selection on square tab buttons; it is not an ornamental border on a rounded card. These explanations classify the existing implementation without suppressing detector rules or asserting a new verification pass.

## Do's and Don'ts

- Do retain the official branding, authentic portrait credit, demonstration-data labels and distinction between testing and plans.
- Do make product copy, status and next actions more prominent than optional brand storytelling.
- Do reuse shared tokens, preserve clear focus, keep touch controls comfortable and respect reduced motion.
- Do defer below-the-fold media and reserve image/video dimensions.
- Don’t replace the established visual identity or add heavy animation dependencies without a demonstrated need.
- Don’t fabricate screenshots, people’s endorsements, availability claims, prices or service evidence.
- Don’t expose a partial language switcher or claim that email enquiries automatically register visitors.

