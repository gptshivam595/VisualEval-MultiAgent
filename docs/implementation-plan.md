# Implementation Plan

> Current implementation (October 2026): two active personas, Aditi Mehra and Devika Shah, evaluate three images (six jobs). Requests are sequential with a 45-second interval; browser retries honor provider cooldowns. Successful jobs are retained for retry within the session, and a winner requires all six results. The ten-persona descriptions below document the original expanded design.

## Plan scope

This plan turns the existing architecture, persona specification, evaluation framework, orchestration design, and UI specification into a practical prototype implementation.

The plan intentionally keeps the system simple:

- React + TypeScript + Vite frontend.
- Netlify Functions backend.
- Groq as the initial provider behind a provider adapter.
- No persistent database for the first version.
- Images and results held temporarily during one evaluation run.
- One synchronous evaluation endpoint if Netlify and provider limits support it.
- Exactly three fixed image slots.
- Exactly ten persona agents.
- Every persona evaluates all three images.

The target workload is:

```text
10 personas × 3 images = 30 image evaluations
```

The frontend must never call Groq and must never receive `GROQ_API_KEY`.

## Cross-phase invariants

These rules apply throughout implementation:

1. `image1` is permanently associated with GPT-Image-2.5.
2. `image2` is permanently associated with Nano Banana 2.1.
3. `image3` is permanently associated with Nano Banana Pro.
4. There are exactly ten configured personas.
5. Every persona evaluates all three images independently.
6. Every persona uses the same ten criteria, 0–10 score scale, and weights.
7. The frontend displays backend results; it does not invent, repair, or aggregate scores.
8. Groq access exists only in server-side Netlify Function code.
9. Invalid persona output never contributes to aggregate scores.
10. Partial evaluation is visible and includes the valid-persona denominator.
11. AI personas are simulated perspectives and are not presented as real participants.
12. No persistent database is required for the initial prototype.

## Phase 0 — Repository inspection and architecture

### Objective

Confirm the starting workspace, identify existing files and constraints, and translate the documentation into an implementation-ready technical baseline before writing application code.

### Files/components involved

- `architecture.md`
- `docs/personas.md`
- `docs/evaluation-criteria.md`
- `docs/agent-orchestration.md`
- `docs/ui-spec.md`
- Intended future files:
  - `package.json`
  - `src/`
  - `netlify/functions/`
  - `server/`

### Backend work

- Confirm Netlify Functions runtime and TypeScript strategy.
- Confirm whether the selected Groq model supports multimodal image input.
- Confirm provider request limits, response format support, timeout behavior, and rate limits.
- Decide the initial synchronous versus asynchronous boundary based on measured constraints.
- Define the server/client boundary before adding provider code.

### Frontend work

- Confirm whether the workspace is empty or contains an existing app.
- Confirm the preferred routing approach; use simple application state if multiple route dependencies are unnecessary.
- Map each required page to a small component tree.

### Dependencies

- Existing project state.
- Node.js and package manager availability.
- Netlify deployment assumptions.
- Groq account/key availability for later phases.

### Expected output

- Implementation-ready repository baseline.
- Confirmed runtime and dependency choices.
- No application behavior yet.
- Any unresolved provider or Netlify constraints recorded before integration.

### Validation/checklist

- [ ] Existing files inspected.
- [ ] No architecture requirement conflicts with implementation choices.
- [ ] Netlify Function limits and provider multimodal capability identified.
- [ ] Fixed model-slot mapping confirmed.
- [ ] Exactly ten persona IDs confirmed.
- [ ] No database introduced without a demonstrated requirement.

## Phase 1 — Frontend foundation

### Objective

Create the minimal React, TypeScript, and Vite application shell with the shared layout and page-state foundation.

### Files/components involved

- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `index.html`
- `src/main.tsx`
- `src/App.tsx`
- `src/types/`
- `src/components/AppShell/`
- `src/components/StepIndicator/`
- `src/components/Disclaimer/`
- `src/styles/`

### Backend work

- None beyond defining the API contract types shared conceptually with the frontend.
- Do not add provider or evaluation logic yet.

### Frontend work

- Initialize Vite and React with TypeScript.
- Add the four-stage application shell:
  - Setup
  - Progress
  - Persona Results
  - Final Results
- Add page-level state for the active run.
- Add shared disclaimer and fixed stage indicator.
- Add responsive container, typography, spacing, cards, buttons, status badges, and accessible focus states.
- Keep pages as placeholders until their implementation phases.

### Dependencies

- React.
- React DOM.
- TypeScript.
- Vite.
- A minimal styling approach consistent with the repository; avoid adding a large UI framework unless necessary.

### Expected output

- The application starts locally.
- The shell renders cleanly on desktop and mobile widths.
- Navigation/state boundaries exist without evaluation behavior.

### Validation/checklist

- [ ] `npm run dev` starts successfully.
- [ ] `npm run build` succeeds.
- [ ] TypeScript checks pass.
- [ ] No provider key or server-only import exists in `src/`.
- [ ] Layout is readable at desktop and mobile widths.

## Phase 2 — Image upload system

### Objective

Implement exactly three fixed upload cards with validation, previews, replacement, removal, and immutable model associations.

### Files/components involved

- `src/pages/SetupPage.tsx`
- `src/components/ImageUploadGrid/`
- `src/components/ImageUploadCard/`
- `src/types/image.ts`
- `src/services/imageValidation.ts`
- `src/state/evaluationSetup.ts`

### Backend work

- Define the server-side expected multipart fields:
  - `image1`
  - `image2`
  - `image3`
- Define per-file and total upload limits.
- Define supported MIME types.
- Do not trust client model labels or filenames.

### Frontend work

- Render exactly three cards in fixed order.
- Associate each card with a constant slot and model name.
- Support file picker and optional drag/drop.
- Validate type, size, previewability, and one-file-per-slot.
- Show preview, replace, remove, and recoverable errors.
- Disable `Run Evaluation` until all three slots are valid.
- Preserve slot identity when replacing a file.
- Revoke object URLs when files are removed or replaced.

### Dependencies

- Phase 1 shell.
- Browser File and URL APIs.
- Final upload-size decisions from Phase 0.

### Expected output

- A complete setup page that produces a valid three-file evaluation input.
- No application call to Groq.

### Validation/checklist

- [ ] Exactly three cards are rendered.
- [ ] Model names cannot be edited or swapped.
- [ ] `image1`, `image2`, and `image3` remain stable.
- [ ] Invalid type and oversized files are rejected.
- [ ] Preview, replace, and remove work.
- [ ] Submit remains disabled until all three files are valid.
- [ ] Keyboard and screen-reader labels are present.

## Phase 3 — Persona data system

### Objective

Represent the ten documented personas as typed, immutable server-controlled configuration and expose safe metadata to the frontend.

### Files/components involved

- `server/personas.ts`
- `server/types/persona.ts`
- `src/types/persona.ts`
- `src/components/PersonaProgressList/`
- `src/components/PersonaSelector/`

### Backend work

- Encode all ten personas from `docs/personas.md`.
- Preserve stable IDs and exact persona-to-agent mapping.
- Keep persona prompts and full server-side context out of browser bundles.
- Add validation that exactly ten unique persona IDs exist.
- Add safe display metadata for UI use.

### Frontend work

- Add typed persona metadata for progress and selector displays.
- Render name, city, region, occupation/descriptor, and neutral initials/avatar.
- Ensure UI language says simulated persona or simulated perspective.

### Dependencies

- Phase 1 frontend types.
- `docs/personas.md`.
- Server-side module boundary.

### Expected output

- One authoritative list of exactly ten server personas.
- Stable persona order and identity across evaluation, progress, and results.

### Validation/checklist

- [ ] Ten and only ten persona configurations load.
- [ ] IDs are unique and stable.
- [ ] Every persona has required specification fields.
- [ ] No city or region is treated as a behavioral rule.
- [ ] Full persona prompts are not bundled into client assets.

## Phase 4 — Evaluation criteria and schemas

### Objective

Create the typed and runtime-validated contracts for criteria, persona outputs, orchestration responses, errors, and statuses.

### Files/components involved

- `server/rubric.ts`
- `server/schemas/evaluationSchema.ts`
- `server/schemas/providerResponseSchema.ts`
- `server/types/evaluation.ts`
- `src/types/evaluation.ts`
- `src/types/api.ts`

### Backend work

- Encode exactly the ten criteria and required weights from `docs/evaluation-criteria.md`.
- Verify weights total exactly 100%.
- Define stable criterion IDs and version.
- Define:
  - raw criterion score: integer 0–10
  - criterion reasoning
  - weighted persona score
  - strengths
  - concerns
  - India-specific observations
  - confidence
- Define the strict per-agent response contract:
  - `persona_id`
  - `persona_name`
  - `image_id`
  - `model_name`
  - `criterion_scores`
  - `criterion_reasoning`
  - `weighted_score`
  - `strengths`
  - `concerns`
  - `india_specific_observations`
  - `confidence`
- Define aggregate response statuses:
  - `completed`
  - `completed_with_warnings`
  - `failed`
- Define safe error codes and failed-persona entries.

### Frontend work

- Add types for rendering validated results.
- Add type guards only for defensive rendering; do not duplicate server aggregation.

### Dependencies

- `docs/evaluation-criteria.md`.
- `docs/agent-orchestration.md`.
- Runtime schema library selected during implementation, or a small explicit validator if dependencies must remain minimal.

### Expected output

- One authoritative rubric and schema contract.
- Compile-time and runtime protection against malformed results.

### Validation/checklist

- [ ] Exactly ten criterion IDs exist.
- [ ] Weights total exactly 100%.
- [ ] Scores are limited to integer 0–10.
- [ ] Agent output is one image evaluation object with all required fields.
- [ ] All three image IDs and fixed model names are enforceable.
- [ ] Missing, duplicate, unknown, or extra criteria fail validation.
- [ ] Confidence has a documented range or enum.
- [ ] JSON examples contain no markdown requirement for provider output.

## Phase 5 — Groq backend/serverless integration

### Objective

Add a secure provider adapter and a Netlify Function endpoint without exposing credentials or coupling orchestration to Groq-specific types.

### Files/components involved

- `netlify/functions/run-evaluation.ts`
- `server/provider/provider.ts`
- `server/provider/groq.ts`
- `server/provider/providerTypes.ts`
- `server/config/env.ts`
- `netlify.toml`
- `.env.example`
- `.gitignore`

### Backend work

- Read `GROQ_API_KEY` only in server-side code.
- Fail clearly at startup/request time if the key is missing.
- Implement a provider interface such as:
  - `evaluatePersona(context, persona) -> Promise<RawPersonaResponse>`
- Configure the selected Groq multimodal model through server environment/configuration.
- Send images and prompt context through the provider adapter.
- Request strict machine-readable JSON.
- Set provider timeout and bounded retry behavior.
- Normalize provider-specific response envelopes into raw persona output.
- Return safe HTTP errors without keys, prompts, stack traces, or image payloads.

### Frontend work

- Add `src/services/evaluationApi.ts`.
- Submit `FormData` with exactly `image1`, `image2`, and `image3`.
- Handle typed success, partial, and failure responses.
- Never import server provider modules or environment secrets.

### Dependencies

- Phase 2 upload state.
- Phase 4 schemas.
- Groq SDK or secure HTTP client.
- Netlify Functions runtime.
- A confirmed multimodal Groq model.

### Expected output

- A secure endpoint capable of receiving and validating the three images.
- A provider adapter that can later be replaced without changing orchestration or UI contracts.

### Validation/checklist

- [ ] `GROQ_API_KEY` is absent from client bundles.
- [ ] `.env.example` contains only `GROQ_API_KEY=`.
- [ ] Missing key produces an explicit server error.
- [ ] Endpoint accepts exactly three expected file fields.
- [ ] Model labels are assigned server-side.
- [ ] Provider request is server-side and multimodal.
- [ ] Provider timeout and retry limits are bounded.
- [ ] Provider errors map to safe API errors.

## Phase 6 — 10 persona evaluation agents

### Objective

Implement the ten independent persona evaluation calls so every configured persona evaluates all three images using the same rubric.

### Files/components involved

- `server/agents/evaluatePersona.ts`
- `server/prompts/personaPrompt.ts`
- `server/prompts/evaluationInstructions.ts`
- `server/types/agentResult.ts`
- `server/validation/parseAgentResponse.ts`

### Backend work

- Create exactly one logical evaluation agent per persona configuration.
- Give every agent:
  - Its own persona context.
  - All three images.
  - Fixed slot/model metadata.
  - The same ten criteria and weights.
  - The same JSON schema and evidence instructions.
- Instruct each agent to evaluate images independently, not rank or compare them.
- Require for each image:
  - All ten criterion scores.
  - Criterion reasoning.
  - Weighted score.
  - Strengths.
  - Concerns.
  - India-specific observations.
  - Confidence.
- Validate that `image_id`, `model_name`, and `persona_id` match the server context.
- Use one bounded repair/retry for malformed JSON where appropriate.
- Mark a persona invalid if any of its three image evaluations remains incomplete or invalid.
- Do not convert malformed output into fabricated scores.

### Frontend work

- None beyond consuming status/result contracts.

### Dependencies

- Phases 3–5.
- Fixed persona data.
- Fixed rubric and runtime schemas.
- Provider multimodal capability.

### Expected output

- Up to ten validated persona result groups, each containing exactly three image evaluations.
- Explicit failure records for personas that cannot produce complete valid output.

### Validation/checklist

- [ ] Exactly ten persona tasks are scheduled.
- [ ] Each task receives all three images.
- [ ] No task receives another persona's output.
- [ ] Each valid persona has exactly three image evaluations.
- [ ] Each image evaluation has all ten criteria and reasoning.
- [ ] Weighted score is recomputable from raw scores and weights.
- [ ] Malformed output is retried only within a bounded policy.
- [ ] Failed personas do not contribute scores.

## Phase 7 — Orchestration and aggregation

### Objective

Coordinate the ten persona evaluations efficiently, validate and normalize results, and derive deterministic image-level outputs.

### Files/components involved

- `server/orchestrator.ts`
- `server/aggregation/aggregateResults.ts`
- `server/aggregation/agreement.ts`
- `server/aggregation/insights.ts`
- `server/normalization/normalizeAgentResult.ts`
- `server/types/aggregateResult.ts`

### Backend work

- Receive exactly three validated image inputs.
- Load exactly ten personas and the fixed rubric.
- Schedule ten tasks with bounded concurrency.
- Track task state and image-evaluation completion.
- Collect success and failure records.
- Validate and normalize every result.
- Recompute weighted scores from criterion scores rather than trusting provider arithmetic.
- Calculate per-image, per-criterion means over valid personas.
- Calculate aggregate weighted overall score.
- Calculate confidence summaries from valid persona confidence values without treating confidence as a score weight unless explicitly specified.
- Calculate agreement using documented score spread, population standard deviation, score range, and valid-persona count.
- Calculate disagreement flags from configured thresholds.
- Normalize and count recurring strengths, weaknesses, concerns, and India-specific observations.
- Rank the three images deterministically using:
  1. Aggregate overall score.
  2. Commercial / Brand Readiness aggregate.
  3. Luxury & Premium Appeal aggregate.
  4. Fixed slot order.
- Derive five-star ratings from aggregate weighted scores.
- Produce final UI response with status and warnings.

### Frontend work

- None beyond consuming the aggregate contract.

### Dependencies

- Phase 6 validated agent groups.
- `docs/evaluation-criteria.md` weighted formula.
- Configured partial-result threshold and disagreement thresholds.

### Expected output

- A deterministic result for exactly three image/model slots.
- Individual persona results preserved.
- Aggregate scores, ranking, stars, agreement, disagreement, recurring insights, warnings, and valid-persona denominator.

### Validation/checklist

- [ ] No score is invented by orchestration.
- [ ] Every aggregate can be traced to valid agent outputs.
- [ ] Failed personas contribute no score.
- [ ] Full completion requires all ten valid personas.
- [ ] Partial completion is explicitly marked.
- [ ] Below-threshold validity returns `failed` with no misleading ranking.
- [ ] Aggregates use unrounded values for ranking.
- [ ] Five-star output is derived deterministically.
- [ ] Recurring insight counts identify their valid-persona basis.

## Phase 8 — Persona results UI

### Objective

Implement the individual persona inspection experience described in `docs/ui-spec.md`.

### Files/components involved

- `src/pages/PersonaResultsPage.tsx`
- `src/components/PersonaSelector/`
- `src/components/PersonaIdentityHeader/`
- `src/components/PersonaImageEvaluationCard/`
- `src/components/PersonaCriterionComparison/`
- `src/components/ReasoningDisclosure/`
- `src/components/FailureNotice/`

### Backend work

- Confirm aggregate response includes all valid and failed persona entries.
- Include persona metadata needed for display without exposing private prompts or secrets.

### Frontend work

- Add stable persona selector.
- Display identity, city, region, occupation, description, and simulated-persona label.
- Display exactly three image evaluations per selected valid persona.
- Display criterion scores, reasoning, weighted score, strengths, concerns, India-specific observations, and confidence.
- Add criterion-by-model comparison for the selected persona.
- Show failed persona details without zero placeholders.
- Keep backend score values unchanged.

### Dependencies

- Phases 3, 4, 7.
- Final API response contract.

### Expected output

- Users can inspect every valid persona independently.
- Users can compare one persona's judgments across all three models.

### Validation/checklist

- [ ] All ten personas can be selected.
- [ ] Stable persona identity is visible.
- [ ] Exactly three model panels appear per valid persona.
- [ ] All ten criteria and reasoning are visible or expandable.
- [ ] Failed persona state is explicit.
- [ ] No client-side recalculation or invented text occurs.

## Phase 9 — Final comparison/leaderboard UI

### Objective

Implement the final evidence-focused comparison and ranking page.

### Files/components involved

- `src/pages/FinalResultsPage.tsx`
- `src/components/ModelComparisonGrid/`
- `src/components/ModelResultCard/`
- `src/components/StarRating/`
- `src/components/OverallWinner/`
- `src/components/WhySummary/`
- `src/components/InsightSections/`
- `src/components/AgreementDisagreement/`

### Backend work

- Ensure response contains all final aggregate fields:
  - scores
  - stars
  - ranks
  - criterion breakdown
  - strengths
  - weaknesses/concerns
  - common strengths
  - common concerns
  - India-specific insights
  - agreement/disagreement
  - status and valid denominator

### Frontend work

- Display exactly three images side by side on desktop.
- Display star rating at the top of each card.
- Display model, score, rank, valid-persona count, criteria, strengths, and weaknesses.
- Show Overall Winner and Why summary.
- Show required insight sections.
- Show partial status prominently.
- Provide a readable mobile stack or horizontal comparison treatment.

### Dependencies

- Phase 7 aggregate response.
- Phase 8 shared result patterns.

### Expected output

- A clear final comparison that preserves individual evidence while making the ranking easy to understand.

### Validation/checklist

- [ ] Exactly three result cards render.
- [ ] Fixed model names remain visible.
- [ ] Stars derive from backend aggregate score.
- [ ] Rank uses backend deterministic ranking.
- [ ] Winner is omitted when no reliable aggregate exists.
- [ ] Partial results show denominator and warning.
- [ ] Required insight sections are present.
- [ ] Mobile layout remains readable.

## Phase 10 — Error handling and validation

### Objective

Make all invalid-input, malformed-output, timeout, provider, and partial-evaluation paths explicit and recoverable.

### Files/components involved

- `server/errors.ts`
- `server/validation/`
- `netlify/functions/run-evaluation.ts`
- `src/components/ErrorBanner/`
- `src/components/StatusBanner/`
- `src/services/evaluationApi.ts`

### Backend work

- Validate request method and content type.
- Validate exactly three files and fixed mappings.
- Enforce file and total request limits.
- Add per-provider-call and overall deadlines.
- Add bounded retry only for appropriate transient or malformed-response cases.
- Record safe failure codes per persona.
- Return `completed`, `completed_with_warnings`, or `failed`.
- Apply the configured minimum valid-persona threshold.
- Never return success-shaped empty aggregates.

### Frontend work

- Handle invalid upload, backend validation, network, timeout, provider, partial, and total failure states.
- Preserve local setup where possible.
- Keep failed personas visible.
- Explain retry behavior.
- Avoid displaying missing values as zeros.

### Dependencies

- Phases 2, 5, 6, and 7.
- Final error/status contract.

### Expected output

- Predictable behavior for failures without silent fallbacks.

### Validation/checklist

- [ ] Invalid images cannot start evaluation.
- [ ] Malformed persona JSON cannot reach aggregation.
- [ ] One failed persona does not crash the run.
- [ ] All failed personas produce no ranking.
- [ ] Timeout is visible and retryable.
- [ ] Provider errors are safe and actionable.
- [ ] Partial status appears on all relevant result views.

## Phase 11 — Security/environment variables

### Objective

Secure credentials, server-only logic, uploaded image handling, and diagnostic output for local development and Netlify.

### Files/components involved

- `.env.example`
- `.gitignore`
- `netlify.toml`
- `server/config/env.ts`
- `server/logging.ts`
- `README.md` or deployment documentation if created later

### Backend work

- Read `GROQ_API_KEY` only in Netlify Functions.
- Validate required environment variables.
- Keep provider prompts, persona context, and raw provider responses server-side.
- Avoid logging image bytes, full prompts, keys, or raw sensitive payloads.
- Use request/run IDs and safe error codes.
- Restrict accepted MIME types and payload sizes.
- Do not persist uploaded images or results unless a later requirement adds storage.

### Frontend work

- Use only public, client-safe environment variables if any are needed.
- Confirm no `VITE_GROQ_API_KEY` or equivalent is used.
- Do not expose server configuration in rendered diagnostics.

### Dependencies

- Phase 5 provider integration.
- Netlify environment-variable configuration.

### Expected output

- Safe local and deployed configuration with no committed secrets.

### Validation/checklist

- [ ] `.env.example` has an empty `GROQ_API_KEY=`.
- [ ] `.env` is ignored.
- [ ] Secret search finds no committed key.
- [ ] Production key is configured only in Netlify.
- [ ] Client bundle contains no provider credential or server-only prompt.
- [ ] Logs contain no image payloads or secrets.

## Phase 12 — Testing

### Objective

Verify the core product contract, deterministic calculations, UI behavior, and failure handling before deployment.

### Files/components involved

- `server/**/*.test.ts`
- `src/**/*.test.tsx`
- `tests/fixtures/`
- `tests/integration/`
- Test configuration files appropriate to the selected runner.

### Backend work

Add focused tests for:

- Ten-persona configuration count and stable IDs.
- Fixed three-slot model mapping.
- Criterion IDs and exact 100% weight total.
- Weighted score calculations.
- Star conversion.
- Deterministic ranking and tie-breaks.
- Complete, partial, and failed status transitions.
- Runtime schema rejection of malformed JSON.
- Duplicate, missing, unknown, and extra fields.
- Failed persona exclusion from aggregates.
- Minimum valid-persona threshold.
- Provider adapter mocking without real Groq calls.
- Request-size and MIME validation.
- Secret absence from errors and logs.

### Frontend work

Add tests for:

- Three fixed upload cards.
- Disabled/enabled Run Evaluation state.
- Replacement/removal and preview validation.
- Progress counts up to 30 image evaluations.
- Four persona statuses.
- Persona result rendering.
- Side-by-side final result rendering.
- Partial and total failure banners.
- Responsive/accessible interaction behavior where practical.

### Dependencies

- All implementation phases.
- Test runner and browser/component testing tools selected during implementation.

### Expected output

- Repeatable automated confidence in the fixed product contract.
- A small set of fixtures for valid, malformed, partial, and failed runs.

### Validation/checklist

- [ ] Unit tests pass.
- [ ] Schema and aggregation tests pass.
- [ ] Frontend interaction tests pass.
- [ ] No test requires a live Groq key by default.
- [ ] At least one end-to-end or function-level test covers upload through aggregate response using mocked provider calls.
- [ ] A manual real-provider smoke test is isolated and never runs in ordinary CI.

## Phase 13 — Netlify deployment

### Objective

Deploy the static frontend and Netlify Function reliably without introducing a database or long-lived server.

### Files/components involved

- `netlify.toml`
- `package.json`
- `vite.config.ts`
- `netlify/functions/run-evaluation.ts`
- `.env.example`
- `.gitignore`

### Backend work

- Confirm function bundling includes server-only dependencies.
- Confirm multipart parsing works in deployed Netlify runtime.
- Configure function path and any redirects.
- Configure production `GROQ_API_KEY` in Netlify settings.
- Set practical function timeout and payload assumptions.
- Verify server logs and safe error responses.

### Frontend work

- Configure build output:
  - Build command: `npm run build`
  - Publish directory: `dist`
- Configure client-side fallback only if routing requires it.
- Verify production API path and CORS behavior under the same Netlify site.

### Dependencies

- Passing tests.
- Netlify site/project.
- Groq key and confirmed provider model.
- Verified image-size and runtime limits.

### Expected output

- A deployable Netlify prototype with static frontend and serverless evaluation endpoint.
- No database, persistent worker, or separate backend server required.

### Validation/checklist

- [ ] Production build succeeds.
- [ ] Static assets load on Netlify.
- [ ] Function is reachable at the expected path.
- [ ] Environment variable is available server-side only.
- [ ] Three-image multipart request succeeds within configured limits.
- [ ] A mocked or controlled smoke evaluation completes.
- [ ] Provider failure and timeout responses remain safe.
- [ ] No secrets appear in browser network payloads or assets.

## Phase 14 — Final polish

### Objective

Improve clarity, trust, accessibility, visual consistency, and evaluation readability without expanding prototype scope.

### Files/components involved

- All `src/components/`
- `src/styles/`
- `docs/ui-spec.md`
- Deployment or README documentation if needed.

### Backend work

- Confirm response metadata exposes rubric, aggregation, status, and valid-persona counts.
- Confirm warning text is concise and user-safe.
- Confirm logging is useful without retaining sensitive inputs.
- Remove temporary debugging and provider traces.

### Frontend work

- Refine spacing, responsive breakpoints, card alignment, and typography.
- Improve loading indicators without distracting animation.
- Ensure scores, stars, criteria, and warnings are visually consistent.
- Add accessible labels and keyboard states.
- Ensure disclaimers remain visible at decision points.
- Confirm persona and model names remain fixed and unambiguous.
- Remove unnecessary dashboard elements or decorative charts.

### Dependencies

- All previous phases.
- Manual review on desktop and mobile.
- Final deployment smoke test.

### Expected output

- A polished, restrained, evaluation-focused prototype ready for demonstration and human-evaluation planning.

### Validation/checklist

- [ ] Setup-to-results flow is understandable without explanation.
- [ ] No screen feels like a complex SaaS dashboard.
- [ ] AI-persona limitations are clear.
- [ ] Individual judgments remain inspectable.
- [ ] Aggregate results are traceable to valid persona outputs.
- [ ] Partial and failed evaluations are honest.
- [ ] Desktop and mobile layouts are usable.
- [ ] Accessibility and performance issues are addressed.
- [ ] Final Netlify smoke test passes.

## Recommended implementation order and stopping points

The prototype can be built and validated incrementally:

1. Complete Phases 0–4 and validate the contracts before adding provider calls.
2. Complete Phase 5 with a mocked provider response before using a real Groq key.
3. Complete Phases 6–7 with deterministic fixtures and mocked provider calls.
4. Complete Phases 8–9 using fixture responses before connecting the live endpoint.
5. Complete Phase 10 and Phase 12 before deployment.
6. Complete Phases 11 and 13 with a test key/configuration.
7. Complete Phase 14 only after the end-to-end flow works.

At every stopping point, the application should either show a truthful supported state or fail explicitly. It should never display fabricated evaluation results to make an incomplete phase appear complete.
