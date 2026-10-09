# Indian Fashion AI Evaluation UI/UX Specification

> Current implementation (October 2026): two active personas, Aditi Mehra and Devika Shah, evaluate three images (six jobs). Requests are sequential with a 45-second interval; browser retries honor provider cooldowns. Successful jobs are retained for retry within the session, and a winner requires all six results. The ten-persona descriptions below document the original expanded design.

## 1. Product and design intent

This prototype should feel simple, clean, professional, premium, and evaluation-focused. It is not a complex SaaS dashboard, analytics suite, or consumer shopping site.

The interface helps a user:

1. Upload exactly three images into fixed model slots.
2. Understand that ten simulated Indian personas independently evaluate all three images.
3. Inspect individual persona judgments.
4. Compare the three model outputs using aggregated evidence.

The evaluation data is the primary content. Decorative design, navigation, animation, and branding must support comprehension rather than compete with the images, scores, or reasoning.

### Required disclaimer

The setup and results experience should make the following distinction visible:

> AI personas are simulated perspectives used for pre-evaluation. They are not real participants and do not replace the required human evaluation.

This disclaimer may appear as a compact callout on the setup page and as a persistent or repeated label on progress and results pages.

## 2. Global UX principles

- Keep the flow linear and easy to understand.
- Show exactly three model slots throughout the experience.
- Never allow the user to edit or swap a slot's model identity.
- Use plain language for status, errors, scores, and limitations.
- Preserve individual persona reasoning instead of showing only averages.
- Make partial or failed evaluation visible.
- Avoid implying that AI personas are actual Indian users.
- Avoid ranking language that suggests scientific market validation.
- Use visual hierarchy consistently across all pages.
- Prefer whitespace, restrained borders, and clear typography over decorative panels.
- Use accessible labels, keyboard navigation, visible focus states, sufficient contrast, and non-color status indicators.
- Make desktop comparisons efficient without making mobile views unreadable.

## 3. Global layout and visual language

### Layout

- Use a centered responsive content container with a readable maximum width.
- Use a consistent page header containing the product name and current stage.
- Use a compact step indicator:
  1. Setup
  2. Evaluation
  3. Persona Results
  4. Final Results
- The current step should be visually distinct without hiding completed or unavailable steps.
- Keep primary actions in predictable locations.
- Use full-width layouts only when showing the three-image comparison or wide tables.

### Visual style

- Neutral warm or cool background with high-contrast text.
- White or lightly tinted cards for image slots and result sections.
- One restrained accent color associated with action and progress.
- Subtle borders and shadows; avoid heavy glassmorphism, gradients, or dashboard ornament.
- Premium feeling should come from spacing, typography, image presentation, and consistency.
- Use the same model color marker or label treatment everywhere, but never use color as the only model identifier.

### Typography

- Strong, readable page title.
- Clear hierarchy for page headings, model names, scores, criteria, and explanatory text.
- Body text should remain comfortable to read on mobile.
- Numeric scores should use tabular or visually stable numerals where possible.
- Do not use overly stylized display type that reduces readability.

### Score presentation

- Show raw criterion scores as `x / 10`.
- Show aggregate overall scores as `x.xx / 10` or another single documented precision.
- Show five-star ratings as a derived visual summary, not as a separate judgment.
- Pair every important number with a text label.
- Do not use color alone to indicate a high or low score.

## 4. Shared data and state assumptions

The UI consumes the validated backend response described in `architecture.md`, `docs/evaluation-criteria.md`, and `docs/agent-orchestration.md`.

The fixed image slots are:

| Slot | Fixed model |
|---|---|
| Image 1 / `image1` | GPT-Image-2.5 |
| Image 2 / `image2` | Nano Banana 2.1 |
| Image 3 / `image3` | Nano Banana Pro |

The UI must not accept model names from user input or infer model identity from filenames.

The UI should recognize these evaluation states:

- `idle`
- `validating`
- `running`
- `completed`
- `completed_with_warnings`
- `failed`

Persona states are:

- `Waiting`
- `Evaluating`
- `Completed`
- `Failed`

The frontend renders backend-provided status and results. It must not calculate, repair, or invent scores.

## 5. Page 1 — Evaluation Setup

### Purpose

Let the user select exactly one image for each fixed model slot and start an evaluation only when all three images pass validation.

### Header content

**Title:**

> Indian Fashion AI Evaluation

**Subtitle:**

> Compare AI-generated fashion imagery through diverse Indian persona perspectives.

Below the subtitle, show a concise disclaimer:

> This is an AI-persona pre-evaluation. The personas are simulated perspectives, not real participants, and do not replace human evaluation.

### Upload-card layout

Show exactly three upload cards in a three-column desktop layout:

1. **GPT-Image-2.5**
2. **Nano Banana 2.1**
3. **Nano Banana Pro**

On narrow screens, stack the same three cards vertically in the fixed order. Do not allow adding a fourth card or removing a model slot.

### Required card contents

Each card must contain:

- Fixed model name.
- Slot identifier, such as `Image 1 of 3`.
- Image upload area.
- Supported file and size guidance.
- Image preview after selection.
- Replace action.
- Remove action.
- Validation message when relevant.
- Accessible input label.

The model name must be read-only and visually prominent. The card may show a short line such as:

> This slot is permanently associated with GPT-Image-2.5.

### Empty upload state

The empty area should communicate:

- Click or tap to upload.
- Drag and drop may be supported on desktop, but must not be required.
- Accepted file types.
- Maximum file size.

The empty state should not imply that the user can select a model.

### Preview state

After upload:

- Show the image within a consistent aspect-ratio frame.
- Preserve the image's visual content without stretching.
- Show the fixed model name above or adjacent to the preview.
- Provide `Replace` and `Remove` actions.
- Keep the original slot identity even if the file is replaced.
- Provide a clear invalid-preview fallback if the browser cannot render the file.

### Upload validation

Validate on the client for immediate feedback and repeat validation on the backend.

Client-side validation should cover:

- Exactly one file for the slot.
- Supported image MIME types.
- Maximum per-file size.
- Readable image dimensions where available.
- Preview creation failure.

The backend must additionally reject:

- Missing slots.
- Extra or unexpected fields.
- Duplicate fields or ambiguous multipart payloads.
- Unsupported MIME types or excessive sizes.
- Client-supplied model labels or slot remapping.

Validation messages should explain how to recover, for example:

- `Upload an image for this model.`
- `This file type is not supported. Use PNG, JPEG, or WebP.`
- `This image is too large. Choose a smaller file.`
- `We could not preview this image. Choose another file.`

### Run Evaluation action

Show the primary button:

> Run Evaluation

Behavior:

- Disabled until all three slots contain valid images.
- Disabled while validation or evaluation is running.
- Shows a progress or busy state after activation.
- Prevents accidental duplicate submissions.
- Sends the three files in fixed fields `image1`, `image2`, and `image3`.

Optional supporting text:

> 10 personas × 3 images = 30 image evaluations.

### Setup error states

- Missing image: keep the button disabled and mark the missing card.
- Invalid file: keep the invalid card in an error state; do not submit.
- Request-size failure: identify that the combined upload is too large.
- Backend validation failure: preserve valid local previews and allow correction.
- Network failure: show a retry action without losing selected files where possible.

## 6. Page 2 — Evaluation Progress

### Purpose

Show that the system is processing ten independent simulated persona evaluations, each covering all three images.

### Header content

**Title:**

> Evaluating 10 Indian Personas

Supporting text:

> Each persona independently evaluates all 3 images using the same 10 criteria.

Show the prominent progress statement:

> `17 / 30 image evaluations completed`

The number must be based on completed valid image-level judgments, not merely completed network requests. If a persona fails, show the failed count separately.

### Persona progress list

Display all ten personas in a responsive list or two-column grid on desktop and a single-column list on mobile.

Each persona row/card contains:

- Avatar, initials, or neutral generated placeholder.
- Persona name.
- City.
- Region.
- Optional occupation or short descriptor.
- Status:
  - `Waiting`
  - `Evaluating`
  - `Completed`
  - `Failed`
- Optional per-persona count, such as `2 / 3 images`.

The avatar must not imply a real person or use a photorealistic synthetic face. Use initials, a simple abstract mark, or an explicitly neutral illustration.

### Progress states

#### Waiting

The persona has not started. Show a neutral indicator and no implied judgment.

#### Evaluating

The persona call is active. Show a subtle non-distracting activity indicator and, where available, `n / 3 images`.

#### Completed

All three image judgments for the persona are valid. Show a completion indicator and `3 / 3 images`.

#### Failed

The persona could not produce a complete valid result after the configured retry policy. Show:

- `Failed`
- A safe failure reason or error code translated into user-facing language.
- Whether the failure affects result completeness.

Do not show missing scores as zero.

### Progress behavior

- The interface should update as persona results arrive.
- Completion order may differ from persona order.
- Persona rows remain in stable persona order for scanability.
- Do not reveal one persona's judgments to another agent; this is a backend concern, but the UI should not imply cross-persona interaction.
- If the synchronous request cannot stream progress, show an honest indeterminate or stage-based progress state rather than fabricating exact progress.

### Progress failure and timeout

If the overall request times out:

- Stop the active state.
- Explain that evaluation did not finish.
- Preserve any returned partial data only if the API contract supports it.
- Do not show incomplete results as complete.
- Offer retry.

If the backend returns `completed_with_warnings`, transition to results with a prominent partial-evaluation warning rather than treating it as a normal completion.

## 7. Page 3 — Persona Results

### Purpose

Let the user inspect the judgments of each simulated persona without losing the underlying evidence or confusing persona-level scores with aggregate model scores.

### Persona navigation

Use a left sidebar or compact selector on desktop and a dropdown or horizontally scrollable selector on mobile.

The selector shows for every persona:

- Avatar or initials.
- Name.
- City.
- Region.
- Status.

Allow the user to switch personas without changing the selected evaluation run.

### Persona identity header

For the selected persona, show:

- Persona name.
- Persona ID only where useful for technical transparency.
- City and state.
- Region.
- Occupation.
- Education/background summary.
- Short persona description.
- Explicit label:

  > Simulated perspective — not a real participant.

Do not present the persona as a verified demographic representative.

### Three-image evaluation view

For the selected persona, show exactly three image evaluation panels in fixed model order:

1. GPT-Image-2.5
2. Nano Banana 2.1
3. Nano Banana Pro

Each panel contains:

- Image preview.
- Fixed model name.
- Persona weighted score for that image, displayed as `x.xx / 10`.
- Derived five-star visual summary if included in the response contract.
- Evaluation status.
- Criterion score table.
- Criterion reasoning.
- Strengths.
- Weaknesses or concerns.
- India-specific observations.
- Confidence.

### Criterion comparison

Provide a mode that lets the user compare the selected persona's three image scores criterion by criterion.

Recommended structure:

- Rows: the ten fixed criteria.
- Columns: the three fixed model slots.
- Each cell: score, with an expandable or adjacent reasoning detail.

Do not calculate or alter scores in the browser. This is a display comparison of backend-provided values.

### Reasoning presentation

- Show concise reasoning by default.
- Allow expansion for full criterion reasoning.
- Preserve the distinction between observation and interpretation.
- Render text safely; do not interpret persona text as HTML or executable content.
- Show uncertainty when provided.

### Failed persona state

If the selected persona failed:

- Show its identity and failure status.
- Show the safe failure message and retry/completeness information.
- Do not render empty scores as zeros.
- Allow the user to switch to other personas.
- Keep the page usable when some, but not all, personas failed.

## 8. Page 4 — Final Results

### Purpose

Provide the main side-by-side comparison of the three generated images and the deterministic aggregation of valid persona judgments.

### Page status banner

At the top, show one of:

- `Completed — 10 of 10 personas valid`
- `Partial evaluation — n of 10 personas valid`
- `Evaluation failed — no reliable aggregate is available`

For partial evaluation, explain that all displayed aggregates use only valid persona results and include the denominator.

### Three-image comparison

Display exactly three image result cards in fixed slot order on desktop:

1. GPT-Image-2.5
2. Nano Banana 2.1
3. Nano Banana Pro

On mobile, use a vertical stack or a horizontally scrollable comparison region. Avoid shrinking images and tables so far that the scores become unreadable.

At the top of each image card, show:

- Five-star rating derived from the aggregate weighted score.
- Rank badge where applicable.

Under the image, show:

- Model name.
- Aggregate overall score, formatted as `x.xx / 10`.
- Textual star value where accessible, such as `4 of 5 stars`.
- Rank.
- Valid persona count, such as `9 / 10 personas`.
- Criterion breakdown for all ten criteria.
- Major strengths.
- Major weaknesses or common concerns.

The fixed model name must remain visible even when the image is enlarged.

### Overall Winner

Show the section:

> Overall Winner

Display the winning model and image only when a reliable aggregate exists. If the status is `failed`, show that no winner is available. If the status is partial, label the winner as:

> Current leader based on valid persona evaluations

### Why?

Show:

> Why?

Provide a concise backend-generated aggregation summary based only on validated persona evidence. The summary should explain:

- The leading model's strongest criteria.
- Relevant strengths that recur across personas.
- Material weaknesses or trade-offs.
- The valid-persona denominator and partial status where applicable.

The frontend displays this summary; it does not generate a new explanation.

### Required insight sections

Show the following sections:

#### India-specific insights

Recurring India-specific observations grounded in persona outputs, with frequency or valid-persona counts where possible.

#### Common strengths

Strengths that recur across valid personas for an image or across the comparison. Distinguish image-specific strengths from panel-wide observations.

#### Common concerns

Recurring concerns, including the number of valid personas or images associated with each concern where available.

#### Persona agreement

Show criteria or observations where valid personas cluster closely. Include a clear definition, such as low score spread or high proportion of similar ratings.

#### Persona disagreement

Show criteria or observations with high score spread, divergent concerns, or materially different interpretations. Do not hide disagreement behind a single average.

### Results disclaimers

Keep a visible note near the aggregate:

> These results summarize simulated AI perspectives for pre-evaluation. They do not represent a statistically valid sample or replace real human participants.

## 9. Responsive behavior

### Desktop

- Setup: three upload cards in a row.
- Progress: compact two-column persona list where space allows.
- Persona Results: persona selector plus three evaluation panels; criterion comparison can use a table.
- Final Results: three result cards in a row with aligned score sections.

### Tablet

- Setup: two cards per row with the third below or a compact three-column layout if readable.
- Results: allow horizontal scrolling for three-image comparisons.
- Keep model names, scores, and status visible while scrolling.

### Mobile

- Stack setup cards in fixed order.
- Stack or use a compact list for persona progress.
- Use a persona dropdown or horizontal selector.
- Stack persona image panels or use an explicitly labeled horizontal carousel.
- Stack final result cards; do not rely on side-by-side text columns.
- Use expandable criterion sections to control page length.
- Preserve full labels; do not abbreviate criteria into unexplained initials.
- Keep primary actions full width where appropriate.

## 10. Accessibility and interaction requirements

- Every upload control has an accessible label naming its fixed model.
- Drag-and-drop, if implemented, has a keyboard-accessible equivalent.
- All buttons have clear text labels, not icon-only controls.
- Focus order follows the page's evaluation flow.
- Status is conveyed by text and icon/shape, not color alone.
- Star ratings include accessible text.
- Tables have proper headers and responsive alternatives.
- Expandable reasoning sections expose expanded/collapsed state to assistive technology.
- Error messages are associated with the relevant upload or result component.
- Motion is subtle and respects reduced-motion preferences.
- Images include meaningful alt text such as model name and result status; decorative avatars use empty alt text.

## 11. Component and information architecture

Suggested component boundaries:

```text
AppShell
├── StepIndicator
├── DisclaimerBanner
├── SetupPage
│   ├── ImageUploadGrid
│   │   └── ImageUploadCard
│   └── RunEvaluationButton
├── ProgressPage
│   ├── EvaluationStatusBanner
│   ├── OverallProgress
│   └── PersonaProgressList
│       └── PersonaProgressItem
├── PersonaResultsPage
│   ├── PersonaSelector
│   ├── PersonaIdentityHeader
│   ├── PersonaImageEvaluationGrid
│   │   └── PersonaImageEvaluationCard
│   └── PersonaCriterionComparison
└── FinalResultsPage
    ├── EvaluationStatusBanner
    ├── ModelComparisonGrid
    │   └── ModelResultCard
    ├── OverallWinner
    ├── WhySummary
    └── InsightSections
```

Components should receive typed validated data and should not contain provider calls, aggregation logic, or prompt construction.

## 12. Navigation and run lifecycle

The intended flow is:

```text
Setup
  -> Run Evaluation
  -> Progress
  -> Persona Results
  -> Final Results
```

The user should be able to move from Persona Results to Final Results after a valid or partial response is available. A direct back navigation to Setup should warn that changing an image starts a new evaluation run.

For the initial stateless prototype:

- Keep the active run in frontend state.
- Do not imply that results are saved permanently.
- Preserve selected images during transient errors where possible.
- On refresh, it is acceptable to lose the current run unless persistence is later added.

## 13. UI error and edge-case behavior

### Invalid image

Show the problem on the affected fixed card, keep other valid previews, and require correction before submission.

### Backend validation error

Explain that the upload set could not be accepted. Do not display evaluation results.

### Provider or server error

Show a clear failure banner, preserve the setup where possible, and provide a retry action. Do not present stale or fabricated scores as a new run.

### Timeout

Show that evaluation did not complete. If the backend returns a partial response, use the response status and warnings; do not infer completion from the number of visible persona rows.

### One or more failed personas

Show partial evaluation clearly on Progress, Persona Results, and Final Results. Aggregates must show the valid-persona denominator. Failed personas must remain visible with failure status but contribute no score.

### All personas fail

Show `Evaluation failed — no reliable aggregate is available`. Do not show a winner, ranking, star ratings, or zero-filled criterion scores.

### Missing optional evidence

If a valid backend result lacks an optional text list, show an explicit `Not provided` or omit that subsection. Do not invent strengths, weaknesses, or India-specific observations in the frontend.

## 14. What the UI must not do

- Do not let users rename, reorder, add, or remove model slots.
- Do not expose `GROQ_API_KEY` or any provider credential.
- Do not call Groq or another provider from browser code.
- Do not create, repair, average, or reinterpret scores in the frontend.
- Do not compare images inside an individual persona view as if the persona performed a ranking; comparison belongs to aggregation and final results.
- Do not present simulated personas as real people.
- Do not show a failed or missing persona as a score of zero.
- Do not imply that the overall winner is a statistically validated market winner.
- Do not use decorative charts that obscure the underlying evidence.

## 15. Implementation acceptance criteria

The UI implementation is acceptable when:

1. Exactly three fixed upload cards are visible on Setup.
2. Each uploaded file remains associated with its fixed model identity.
3. Run Evaluation cannot be activated until all three files pass client validation.
4. The backend receives exactly `image1`, `image2`, and `image3`.
5. Progress communicates `10 personas × 3 images = 30 image evaluations`.
6. All ten personas are visible with the four required statuses.
7. Persona Results can display every valid persona's three image judgments and reasoning.
8. Persona Results clearly identifies failed personas without zero placeholders.
9. Final Results compares exactly three images and shows fixed model names.
10. Aggregate scores, stars, ranks, criteria, strengths, weaknesses, and insight sections are rendered from backend data.
11. Partial evaluation status and valid-persona denominator are visible wherever aggregate results appear.
12. The UI works at desktop and mobile widths without losing model identity or score readability.
13. No provider secret or provider call exists in browser code.
14. No frontend path fabricates or changes evaluation scores.
