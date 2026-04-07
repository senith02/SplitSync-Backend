# Design System Specification: The Fluid Ledger

## 1. Overview & Creative North Star
### The Creative North Star: "The Weightless Balance"
To move beyond the generic "fintech" look, this design system adopts a philosophy of **Weightless Balance**. Financial apps often feel rigid, stressful, and cluttered. We are rejecting that in favor of an editorial, high-end experience that feels more like a lifestyle magazine than a spreadsheet.

By utilizing **intentional asymmetry**, **glassmorphic depth**, and **tonal layering**, we create a space that feels trustworthy yet approachable. We break the "template" look by using extreme typography scales—pairing massive, elegant display headers with tight, functional utility labels. The goal is a UI that doesn't just display data but "curates" the user’s financial life.

---

## 2. Colors & Surface Philosophy
The palette is built on a foundation of "Mint and Mineral" tones, designed to evoke a sense of calm and precision.

### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders are strictly prohibited for sectioning or containment. Boundaries must be defined through background shifts or tonal transitions. To separate a list from a header, use `surface-container-low` against a `surface` background. 

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-translucent materials. 
- **Base Level:** `surface` (#f7faf6)
- **Secondary Level:** `surface-container-low` (#eff5ef) for subtle grouping.
- **Action Level:** `surface-container-highest` (#dbe5dd) for interactive cards.

### The "Glass & Gradient" Rule
To elevate the experience, use **Glassmorphism** for floating action buttons or sticky navigation bars. Use `surface_container_lowest` at 80% opacity with a `20px` backdrop blur. 
- **Signature Gradient:** For primary CTAs, use a linear gradient from `primary` (#006d4e) to `primary_fixed_dim` (#78e9bb) at a 135-degree angle. This adds "soul" and a premium finish that flat fills lack.

---

## 3. Typography
We utilize a dual-font strategy to balance editorial flair with high-density data readability.

| Token | Font Family | Size | Purpose |
| :--- | :--- | :--- | :--- |
| **display-lg** | Plus Jakarta Sans | 3.5rem | Hero balances & massive numerical callouts. |
| **headline-md** | Plus Jakarta Sans | 1.75rem | Section titles & onboarding headers. |
| **title-sm** | Inter | 1rem | Card titles & navigation items. |
| **body-md** | Inter | 0.875rem | Primary data, descriptions, and list content. |
| **label-sm** | Inter | 0.6875rem | Micro-copy, timestamps, and "Who owes what." |

**Editorial Note:** Use `display-lg` with a tight negative letter-spacing (-0.02em) to create a sophisticated, "custom-build" appearance for financial totals.

---

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering** rather than structural geometry.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` background. The shift from #ffffff to #eff5ef creates a natural, soft "lift" without the "dirty" look of heavy shadows.
*   **Ambient Shadows:** When a float is required (e.g., a "Split Bill" button), use a shadow with a blur of `32px`, an offset of `y: 8px`, and an opacity of 6%. Use a tint of `on_surface` (#2b352f) to keep the shadow feeling like part of the environment.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use `outline-variant` (#aab4ad) at **15% opacity**. Never use 100% opaque lines.
*   **Rounding:** Follow the scale religiously. Use `xl` (3rem) for main containers and `md` (1.5rem) for internal cards to create a "nested" organic feel.

---

## 5. Components

### Buttons
*   **Primary:** Uses the "Signature Gradient" (Primary to Primary-Fixed-Dim). Border radius: `full`. No border. High-contrast `on_primary` text.
*   **Secondary:** `secondary_container` background with `on_secondary_container` text. This provides a soft, pastel alternative for neutral actions.
*   **Tertiary:** Transparent background with `primary` text. Use for low-emphasis actions like "Cancel" or "View Details."

### Input Fields
*   **Styling:** No bottom line. Use a `surface-container-highest` background with a `md` (1.5rem) corner radius. 
*   **States:** On focus, transition the background to `surface_container_lowest` and apply a 10% opacity `primary` Ghost Border.

### Cards & Lists (The "Split" Interface)
*   **Rule:** Forbid divider lines.
*   **Implementation:** Separate transaction items using `8px` of vertical white space (Spacing `2`). 
*   **Nesting:** A group "Total" card should use `surface_container_lowest` (#ffffff) to appear as the "top" layer, while individual friend entries beneath it use `surface_container` (#e8f0e9).

### Expense Chips
*   **Positive (You are owed):** `primary_container` (#86f8c8) background with `on_primary_container` (#005e43) text.
*   **Negative (You owe):** `tertiary_container` (#f98787) background with `on_tertiary_container` (#570a13) text.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical spacing. A `headline-lg` might have `spacing-12` above it but only `spacing-4` below it to create an editorial flow.
*   **Do** use `display-sm` for large monetary values to give them an "authoritative" feel.
*   **Do** embrace white space. If a screen feels "empty," it’s likely working.

### Don't
*   **Don't** use 1px dividers between list items. Use background color blocks or spacing.
*   **Don't** use pure black (#000000) for text. Always use `on_surface` (#2b352f) to maintain the soft, premium vibe.
*   **Don't** use sharp corners. Every interactive element must have at least an `sm` (0.5rem) radius to stay "Friendly."