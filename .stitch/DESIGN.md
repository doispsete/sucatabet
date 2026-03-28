# Design System Strategy: High-Performance Dark Mode

## 1. Overview & Creative North Star
**Creative North Star: The Kinetic Void**
This design system is built to transform high-stakes data into a premium, editorial experience. Unlike standard dashboards that rely on cluttered grids and heavy borders, "The Kinetic Void" utilizes a pitch-black foundation to allow information to "emerge" through light and depth. We move beyond the "template" look by using intentional asymmetry, overlapping glass elements, and high-contrast typography scales that feel more like a luxury fintech publication than a typical betting app.

The experience is defined by:
*   **Hyper-Contrast Clarity:** Leveraging the #000000 depth to make the Neon Green and Electric Blue accents vibrate with life.
*   **Atmospheric Depth:** Using "frosted" surfaces and glowing boundaries to simulate a high-tech HUD.
*   **Editorial Authority:** Utilizing Manrope’s geometric confidence for numbers and Inter’s legibility for data, ensuring even complex betting slips feel effortless to read.

---

## 2. Colors & Surface Logic

### The Palette
*   **Background (`#131313` to `#000000`):** The absolute foundation.
*   **Primary Accent (`#00FF9D`):** Used for "Growth," "Action," and "Success." It is high-chroma and commands immediate attention.
*   **Secondary Accent (`#00D1FF`):** Used for "Focus," "Active States," and "Calculations."
*   **Tertiary/Warning (`#FFDD65`):** Reserved strictly for "Pending" or "Attention Required" states.

### The "No-Line" Rule
Traditional 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined through:
1.  **Background Color Shifts:** Use `surface-container-low` for large section blocks against the `surface` background.
2.  **Tonal Transitions:** Use subtle shifts in luminance to separate the sidebar from the main content.

### Surface Hierarchy & Nesting
Instead of flat boxes, treat the UI as stacked layers of frosted glass:
*   **Level 0 (Base):** `surface` (#131313) - The main workspace.
*   **Level 1 (Sections):** `surface-container-low` (#1C1B1B) - Large content areas.
*   **Level 2 (Cards):** `surface-container-high` (#2A2A2A) - Interactive cards.
*   **Level 3 (Floating):** `surface-bright` (#3A3939) - Tooltips and active popovers.

### The "Glass & Gradient" Rule
To achieve a signature premium feel, main CTAs and "Winner" cards must use a gradient transition from `primary` (#F4FFF3) to `primary-container` (#00FF9D). Use `backdrop-blur` (12px to 20px) on cards to allow the background's soul to bleed through the interface.

---

## 3. Typography
We use a dual-font strategy to balance character with precision.

*   **Display & Headlines (Manrope):** Bold, wide, and modern. Used for high-level data like "Total Bank" or section titles. It provides the "Editorial" weight.
*   **Body & Labels (Inter):** The workhorse. Used for transaction details, navigation, and fine print.

**Key Scales:**
*   **Display-LG (3.5rem):** For major financial milestones.
*   **Headline-SM (1.5rem):** For card titles and section headers.
*   **Label-MD (0.75rem):** For metadata, using `on-surface-variant` (#B9CBBC) to reduce visual noise.

---

## 4. Elevation & Depth

### The Layering Principle
Depth is achieved by "stacking" tones. Place a `surface-container-lowest` card on a `surface-container-low` section to create a natural "carved" look.

### Ambient Shadows
Forget heavy black shadows. Use "Glowing Shadows" for active elements.
*   **Primary Glow:** `0px 8px 24px rgba(0, 255, 157, 0.12)` - Used for the main action button or active betting cards.
*   **Neutral Depth:** Large blur (32px), low-opacity (6%) shadows tinted with `on-surface` to mimic soft ambient light.

### The "Ghost Border"
When a container requires a boundary (e.g., input fields), use the "Ghost Border" technique:
*   **Token:** `outline-variant` (#3B4A3F) at **20% opacity**. It should be felt, not seen.

### Glassmorphism
Apply `surface-container-highest` with 60% opacity and a 16px blur to floating dashboard widgets. This ensures the UI feels like a cohesive "environment" rather than a set of disconnected boxes.

---

## 5. Components

### Buttons
*   **Primary:** Gradient fill (`#00FF9D` to `#00D382`), `round-full`, Manrope Bold.
*   **Secondary:** Ghost Border (`outline-variant` 20%) with Neon Green text.
*   **States:** On hover, increase the "Glow Shadow" intensity.

### Cards & Lists
*   **No Dividers:** Prohibit the use of horizontal lines. Use `spacing-6` (1.5rem) to separate list items.
*   **Status Indicators:** High-contrast pills.
    *   *Finalized:* `primary-container` background with `on-primary-container` text.
    *   *Pending:* `tertiary-container` background with `on-tertiary-container` text.

### Input Fields
*   **Style:** `surface-container-highest` background, no border, `round-md`.
*   **Focus State:** A 1px "Glowing Border" using `secondary-container` (#14D1FF).

### Additional Betting Components
*   **The "Live-Pulse" Chip:** A small neon green dot with a recursive scale animation to indicate live events.
*   **The "Odds" Badge:** Use `secondary-fixed-dim` for the value to distinguish it from currency amounts.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical spacing (e.g., larger padding on the left of a card than the top) to create a custom, editorial feel.
*   **Do** use `primary-fixed-dim` for data visualizations (charts/graphs) to keep the vibrance high without being neon-overwhelming.
*   **Do** prioritize "Breathing Room" (Spacing 8 or 10) between major dashboard modules.

### Don't:
*   **Don't** use pure white (#FFFFFF) for text. Use `on-surface` (#E5E2E1) to prevent eye strain on the pitch-black background.
*   **Don't** use standard 1px borders to separate table rows; use subtle alternate row shading with `surface-container-low`.
*   **Don't** use harsh drop shadows with 100% alpha. Shadows in this system should always be "Atmospheric."
