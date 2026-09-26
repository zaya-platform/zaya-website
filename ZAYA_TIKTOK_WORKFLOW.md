# ZAYA website prompt pack from the TikTok workflow

Source reviewed: [Nathan Hodgson AI — ChatGPT 6 Astra and Claude Code website workflow](https://www.tiktok.com/@nathanhodgson.ai/video/7687192416008408342)

The source video is 37 seconds long. This document paraphrases its workflow and turns it into original instructions for the ZAYA website.

## What the speaker demonstrates

1. Start in ChatGPT 6 Astra and describe the visual scene you want to create.
2. Ask it for a complete creative plan covering art direction, colours, lighting, camera behaviour, animation, and movement.
3. Move that plan into Claude Code.
4. Ask Claude Code to build the experience with a 3D web framework.
5. Make the scene respond to scrolling and pointer movement.
6. Verify that the experience also works well on a phone.

The useful lesson for ZAYA is the sequence: define the experience precisely, translate it into a technical build brief, add meaningful interaction, and validate it across devices.

## ZAYA creative-direction prompt

> Create a complete art direction for the ZAYA App Ethiopia marketing website. ZAYA means **Zonal, Availability, Yours, Access** and promises **Everything near you**. Present ZAYA as a platform being developed in Ethiopia for customers, neighbourhood merchants and shop-managed delivery, with a planned diaspora experience. Riders here means the shop’s own deliverers; it does not mean an available passenger-ride service.
>
> Use ZAYA's teal, coral, violet, white, and deep navy brand colours. Keep most backgrounds light and warm. Use dark navy mainly for text and small areas of contrast; avoid large black or heavy blue backgrounds. Use the official ZAYA logo and location-pin icon without changing their proportions or colours.
>
> Build the visual story around a living urban network in Addis Ababa and other modern Ethiopian towns. Show realistic people, shops, streets, smartphones, delivery moments, rides, and diaspora connections. People and environments must look recognisably Ethiopian and contemporary. Avoid generic futuristic cities, rural imagery, national-flag colour decoration, and synthetic-looking stock imagery.
>
> Define the colour system, typography, lighting, depth, camera movement, object movement, transitions, hover states, touch responses, and mobile behaviour. Every animation should explain how ZAYA connects a person to something nearby.

## ZAYA implementation prompt

> Improve the existing Astro-based ZAYA website using the approved creative direction and current ZAYA content. Preserve working pages, links, accessibility, SEO, privacy information, and the guided enquiry function.
>
> Create a lightweight 3D hero scene centred on the ZAYA location-pin logo. Show four connected paths for Customers, Merchants, Riders, and Diaspora. Let the paths gently pulse or wave to represent an active local network. Reveal a short benefit when a user hovers, taps, or focuses each path. The scene should respond subtly to pointer movement on desktop, touch gestures on mobile, and page scroll.
>
> Use native Three.js in an isolated Astro component, or use React Three Fiber only if the project already includes a React integration and the added bundle cost is justified. Load the 3D scene progressively. Provide a fast static fallback for slow devices, data-saving conditions, unsupported browsers, and reduced-motion users.
>
> Keep text readable over every visual. Use semantic HTML, keyboard-accessible controls, visible focus states, meaningful alternative text, and WCAG AA colour contrast. Do not make essential information dependent on animation. Prevent horizontal overflow and layout gaps at 320 px, 375 px, 768 px, 1024 px, and large desktop widths.
>
> Add purposeful interactions across the homepage: an accessible Features menu, interactive “What is ZAYA?” explanation, audience cards for the four user groups, a visible ZAYA Promo section, and clear calls to action. Keep motion calm, responsive, and tied to the user's action. Avoid decorative effects that slow the site or distract from the message.

## ZAYA motion specification

- **Logo wave:** a gentle 2–3 second breathing or wave cycle; pause on hover and respect reduced-motion settings.
- **Pointer response:** maximum 3–5 degrees of scene tilt so the interface stays comfortable.
- **Scroll response:** gently change the scene’s perspective while keeping audience selection under the visitor’s control.
- **Touch response:** tap to reveal details; do not depend on hover.
- **Performance:** target a stable 60 fps on capable devices and degrade gracefully on low-power phones.
- **Accessibility:** provide a pause control for non-essential motion and a complete static alternative.

## Review prompt

> Review the finished ZAYA website as a customer, merchant, rider, diaspora user, keyboard user, and mobile user. Check that every section communicates a purpose, no large unexplained blank spaces remain, the official branding is consistent, and all controls work with mouse, keyboard, and touch. Confirm that animation never hides content or blocks navigation. Test on common phone, tablet, laptop, and desktop sizes, then fix every layout, contrast, performance, and interaction issue found.

## Recommended use

Use the creative-direction prompt first. Review and approve the resulting direction. Then give the approved direction together with the implementation prompt to the coding tool. Finish with the review prompt before deploying.
