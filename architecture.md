# AI Fashion Campaign Evaluation Prototype

> Current implementation (October 2026): two active personas, Aditi Mehra and Devika Shah, evaluate three images (six jobs). Requests are sequential with a 45-second interval; browser retries honor provider cooldowns. Successful jobs are retained for retry within the session, and a winner requires all six results. The ten-persona descriptions below document the original expanded design.

## 1. Product objective

This prototype is a research and pre-evaluation tool for comparing three AI-generated premium clothing or fashion campaign images for the Indian e-commerce market.

It helps the team answer:

> How well does each generated image represent modern Indian fashion, culture, lifestyle, premium/luxury positioning, and commercial suitability for Indian e-commerce?

The system presents three generated images side by side, evaluates them through ten consistent simulated Indian perspectives, and aggregates the structured judgments into a comparative result.

The prototype is intended to make India-specific considerations visible before the required real-human evaluation. It is not intended to make the final product decision on its own.

## 2. Problem statement

Image-generation models can produce visually polished fashion campaign imagery while still missing important expectations of the Indian market. Potential issues include:

- Cultural context that feels generic, stereotypical, or inauthentic.
- Styling, skin tones, body representation, settings, or details that do not feel representative.
- A visual language that appears premium but is not commercially persuasive for Indian shoppers.
- Clothing, accessories, poses, composition, or environments that reduce e-commerce usefulness.
- Differences in model output quality that are difficult to compare consistently without a shared rubric.

The prototype creates a repeatable comparison layer across exactly three images:

1. **Image 1:** GPT-Image-2.5
2. **Image 2:** Nano Banana 2.1
3. **Image 3:** Nano Banana Pro

Each of ten persona agents independently evaluates all three images using the same criteria and produces structured reasoning. An orchestration layer validates and aggregates those outputs for the results UI.

## 3. Evaluation philosophy

### AI personas are simulated perspectives

The ten AI personas are simulated Indian user perspectives created for exploratory analysis. They are not real Indian users, not representative samples, and not evidence of actual consumer behavior.

The personas form an additional pre-evaluation or research layer. They can help identify:

- Repeated strengths and weaknesses.
- India-specific concerns worth investigating.
- Areas of agreement and disagreement.
- Questions to take into the human evaluation.

### Real participants remain required

The assignment still requires evaluation by approximately 8–10 real human participants. Human participants are the final evaluation layer. AI persona results must not be described as a replacement for those participants, a statistically valid survey, or a definitive market verdict.

### Consistency over false precision

Every persona receives the same images, the same rubric, the same score scale, and the same response schema. Aggregated scores are useful for comparison within this prototype, but they should not be interpreted as objective measurements of Indian consumers.

## 4. System architecture

The proposed architecture is a small React and TypeScript application deployed on Netlify:

```text
Browser
  |
  |  Select/upload exactly 3 images
  v
React + TypeScript + Vite frontend
  |
  |  POST multipart evaluation request
  v
Netlify Function / serverless API
  |
  |  Provider adapter (Groq initially)
  v
LLM provider
  |
  |  Ten independent persona evaluations
  v
Orchestration and validation layer
  |
  |  Normalized persona results + aggregates
  v
Frontend results views
```

The first prototype can be stateless. Images and evaluation results may live only for the duration of one evaluation run in the browser and serverless request lifecycle. Persistent storage, authentication, asynchronous job queues, and analytics are future extensions rather than requirements for the initial version.

### Core boundaries

- The frontend owns image selection, setup state, loading state, and rendering.
- The backend owns validation, prompt construction, provider calls, response parsing, normalization, aggregation, and secret handling.
- The initial provider implementation is Groq, but it is accessed through a server-side provider adapter rather than being embedded in orchestration logic.
- The LLM provider is never called directly from browser code.
- Persona definitions and evaluation criteria should be shared as backend-controlled configuration, not user-editable prompt text.
- The server is the source of truth for slot-to-model identity, rubric version, persona set, and aggregation version.

## 5. Frontend architecture

The frontend should be a clean component-based React application written in TypeScript and built with Vite.

### Main screens

#### Landing / Evaluation Setup

Responsibilities:

- Explain the purpose and limitations of the prototype.
- Provide exactly three image slots.
- Display the fixed model identity for each slot.
- Allow the user to select or upload one image per slot.
- Validate that all three slots contain supported images.
- Start evaluation only when the setup is complete.

The slot labels must remain fixed:

| Slot | Model identity |
|---|---|
| Image 1 | GPT-Image-2.5 |
| Image 2 | Nano Banana 2.1 |
| Image 3 | Nano Banana Pro |

#### Evaluation Progress

Responsibilities:

- Show that evaluation is running.
- Communicate that ten simulated persona perspectives are being processed.
- Prevent accidental duplicate submissions where practical.
- Show clear error and retry states.

The UI should not imply that the personas are real participants.

#### Persona Judgments

Responsibilities:

- Display each persona's judgment for all three images.
- Show criterion-level scores and structured reasoning.
- Show persona-level strengths, weaknesses, concerns, and confidence if included in the response contract.
- Make agreement and disagreement understandable without hiding the individual outputs.

#### Final Results

Responsibilities:

- Compare all three images side by side.
- Show each image's overall score and five-star visual rating.
- Show criterion-level aggregate scores.
- Show strengths, weaknesses, and common concerns.
- Show persona-level agreement and disagreement.
- Show the overall ranking.
- Clearly label the output as AI-persona pre-evaluation rather than human research.

### Suggested frontend state

The frontend can use local React state or a small state module for:

- `setup`: the three selected image files/previews.
- `status`: idle, validating, running, succeeded, or failed.
- `results`: normalized API response.
- `error`: safe user-facing error information.

The frontend should not store or expose the provider key, raw provider credentials, or server-only prompts.

### Image handling

Images are selected in the browser and converted to data URLs for individual job requests. The browser sends one image, one persona ID, and one fixed model identity to the agent endpoint for each job. The backend validates the persona and immutable image/model mapping before calling Groq. This keeps each request short enough to complete within a serverless invocation; production size limits must remain aligned with Netlify request limits.

## 6. Backend/serverless architecture

Netlify Functions provide the server-side API surface. The prototype uses one short-lived evaluation endpoint per job:

```text
POST /.netlify/functions/evaluate-agent
```

The function should:

1. Parse one JSON job request.
2. Confirm the persona ID and image ID are known.
3. Assign and verify the immutable slot mapping on the server.
4. Validate the image data URL and request size.
5. Load the fixed persona definition and rubric.
6. Send exactly one image through the server-side provider adapter.
7. Validate one structured evaluation response.
8. Return JSON for that one job, or a JSON error without exposing secrets.

The browser creates the 30 jobs, sends at most two concurrently, tracks progress, and performs deterministic aggregation after all jobs settle. The legacy `run-evaluation` function is no longer in the frontend execution path and must not be used for a full run.
9. Validate and normalize each output.
10. Calculate aggregates, ratings, ranking, agreement, disagreement, and common concerns.
11. Return one typed response to the frontend.

### Server-side provider requirement

All provider API calls must occur inside Netlify Functions or another server-side execution environment. The browser must never receive a provider key.

The initial provider is Groq and the application should use:

```text
GROQ_API_KEY=
```

The user may refer to the key locally as “sub agent eval,” but the application should consistently use `GROQ_API_KEY`. No key should be hardcoded or committed.

The provider integration should expose an internal interface such as:

```text
evaluatePersona(context, persona) -> Promise<RawPersonaResponse>
```

The orchestration layer depends on this interface, not on Groq SDK types. The Groq adapter owns authentication, model selection, request formatting, provider timeouts, and provider-specific response extraction. A later provider can implement the same interface without changing frontend contracts, persona definitions, validation, or aggregation. The selected provider model must support image/multimodal input; this is a deployment configuration assumption to verify before implementation.

### Request lifecycle

The initial prototype can process the entire evaluation synchronously if the expected runtime, request size, provider latency, and Netlify Function limits fit together. Ten provider calls should use bounded concurrency and explicit per-call and overall deadlines. The implementation must verify these limits rather than assuming that ten unrestricted concurrent calls will fit. If the operation becomes too slow or large, the same boundary can evolve into:

- A create-evaluation endpoint.
- A background job or queue.
- A status endpoint.
- A results endpoint.

That scalability path should not be implemented prematurely.

For Netlify compatibility, the function entry point should use a multipart parser supported by the chosen Netlify Functions runtime, enforce limits before forwarding image bytes, and avoid relying on a request body format that exceeds the platform's payload limit. The implementation should verify the selected function plan's timeout and payload limits with a small integration test before enabling production-sized images.

## 7. Persona-agent architecture

There are exactly ten persona agents. Each agent represents one simulated Indian perspective and independently evaluates all three images.

### Persona definition

Each persona should be represented by configuration containing:

- Stable persona ID.
- Display name.
- Short description.
- Relevant perspective or context.
- System-level evaluation instructions.
- Optional focus areas, without changing the shared scoring rubric.

Persona descriptions should avoid claiming that the persona is a real demographic participant. They are authored analytical lenses.

### Independence

Each persona must:

- Receive all three images.
- Evaluate all three images.
- Use the same criteria and scale.
- Produce a separate result.
- Avoid seeing the judgments of other personas before submitting its own judgment.

The implementation uses 30 independent persona-image jobs: one persona and one image per job. The browser orchestrator runs a bounded queue of two jobs concurrently, so all exactly ten personas still evaluate all three images without keeping one serverless request open for the full run. Each job receives only its assigned image and cannot compare images during its evaluation.

### Shared evaluation rubric

The exact rubric can be finalized during implementation, but the architecture expects criterion-level scores covering the product question. A suitable initial rubric includes:

1. Modern Indian fashion relevance.
2. Cultural sensitivity and authenticity.
3. Lifestyle and contextual relevance.
4. Premium or luxury perception.
5. Visual quality and polish.
6. Representation and inclusivity.
7. E-commerce and commercial suitability.
8. Product clarity and fashion communication.

Each criterion should use one documented numeric scale from 1–5 with clear anchors. The rubric must be identical for every persona and every image. The rubric must be versioned, and its criterion IDs must be stable because they are used by validation and aggregation. A persona response must provide a score and a reasoning string for every criterion for every image; reasoning is not optional merely because the score is present.

## 8. Orchestration architecture

The orchestration layer is a backend module responsible for coordinating the ten independent evaluations and converting provider responses into a stable application response.

### Orchestration steps

1. Create the immutable evaluation context:
   - Three images.
   - Fixed model identities.
   - Rubric.
   - Ten persona definitions.
   - Evaluation run ID.
2. Dispatch one evaluation request per persona.
3. Collect successful and failed results with persona IDs.
4. Parse provider output.
5. Validate it against the response schema.
6. Normalize numeric values, labels, and text fields.
7. Apply the failure policy for invalid or missing persona results.
8. Aggregate valid judgments per image and criterion.
9. Derive overall scores, five-star ratings, ranking, common concerns, and agreement/disagreement.
10. Return a typed result with metadata about completion and any partial failures.

### Aggregation principles

For each image:

- Calculate a criterion average from valid persona scores.
- Calculate an overall score from the documented criterion weighting. The initial weighting should be equal across criteria unless a later rubric version explicitly defines different weights.
- Keep the raw average at a consistent precision, then round only for display.
- Convert the overall 1–5 score to a five-star visual rating using a fixed documented mapping. For an initial 1–5 rubric, the star rating may equal the rounded overall score, with half-stars omitted unless the UI and contract explicitly support them.
- Rank the three images using a deterministic tie-break rule: higher overall score first, then higher commercial-suitability score, then higher premium-perception score, then fixed slot order (`image1`, `image2`, `image3`).

The system should preserve the individual scores rather than returning only averages. Averages can hide disagreement, which is itself an important research signal.

### Partial-result policy

The response must distinguish `completed`, `completed_with_warnings`, and `failed`. A persona result is valid only when that persona has valid judgments for all three images and all rubric criteria. Invalid or timed-out persona calls are not silently replaced with averages or invented values.

The prototype should return `completed` only when all ten persona results are valid. If at least one persona fails but the minimum threshold for a useful comparison is met, the backend may return `completed_with_warnings` with the valid persona results, failed persona IDs, and an explicit warning that the result is partial. The minimum threshold must be a documented configuration constant chosen before implementation; if the threshold is not met, return `failed` and do not calculate a misleading ranking. Aggregates must include the valid-persona count and denominator.

### Agreement and disagreement

Agreement can be represented using measures such as score spread, the proportion of personas selecting similar ratings, or the number of personas identifying the same concern. Disagreement should surface criteria with high score variance and conflicting written judgments.

For the initial implementation, use deterministic, explainable measures: criterion mean, population standard deviation, score range, and valid-persona count. Flag a criterion as high-disagreement when its configured standard-deviation threshold is exceeded. Common concerns should be derived from normalized concern tags or categories, not only free-form text. The method, thresholds, and rubric/aggregation versions should be documented in code and exposed as response metadata so the UI copy remains interpretable.

## 9. Image flow

1. The user selects one image in each of the three fixed slots.
2. The frontend creates local previews and validates file type and size.
3. The frontend submits the three images in a single evaluation request.
4. The backend assigns model identity from the server-side slot mapping, not from untrusted client-provided labels.
5. The backend includes each image with its fixed identity in every persona evaluation.
6. Each persona evaluates all three images.
7. The backend retains the image-to-model mapping in the normalized response.
8. The results UI renders the same three images alongside their model identities.

The model identity is metadata for comparison. It should not be passed as a claim that the model itself is being judged independently of the visible image; the persona evaluates the image while the system groups results by its source model.

## 10. Evaluation flow

```text
User opens setup
  -> selects Image 1, Image 2, Image 3
  -> frontend validates exactly three images
  -> user clicks Run Evaluation
  -> Netlify Function validates request
  -> ten persona evaluations are dispatched
  -> every persona evaluates all three images
  -> outputs are parsed and schema-validated
  -> invalid outputs are recorded and handled
  -> valid outputs are normalized
  -> criterion and overall aggregates are calculated
  -> final response is returned
  -> UI shows persona judgments
  -> UI shows side-by-side comparison and ranking
```

The frontend should treat the response as untrusted data and render only fields that pass backend validation. It should render the ten persona result cards or rows by stable persona ID, including each persona's three image judgments, criterion scores, reasoning, and validity status. It should also render failed-persona warnings without presenting missing judgments as zeroes.

## 11. Data flow

### Input data

- Three image files in the fixed multipart fields `image1`, `image2`, and `image3`.
- Fixed server-side model identities.
- Evaluation run metadata.

### Internal data

- Persona configuration.
- Rubric and score anchors.
- Per-persona, per-image judgments.
- Validation errors and completion status.

### Output data

- Run status.
- Image metadata and model identity.
- Ten persona result objects.
- Criterion-level aggregates.
- Overall scores.
- Five-star ratings.
- Strengths.
- Weaknesses.
- Common concerns.
- Agreement/disagreement indicators.
- Overall ranking.
- Optional partial-failure metadata.

The API should return structured JSON rather than requiring the frontend to parse model-generated prose.

## 12. API flow

### Evaluation request

```text
POST /api/evaluate-agent
Content-Type: application/json
```

The request contains one fixed persona-image job:

```json
{
  "personaId": "north-delhi-brand-strategist",
  "imageId": "image1",
  "modelName": "GPT-Image-2.5",
  "mimeType": "image/jpeg",
  "dataUrl": "data:image/jpeg;base64,..."
}
```

The JSON above is a conceptual representation of multipart fields, not a JSON request body.

The client should not be able to override:

- Persona count.
- Persona definitions.
- Model identities.
- Rubric.
- Aggregation method.
- Groq configuration.

### Evaluation response

The response should use a versioned shape similar to:

```json
{
  "schemaVersion": "1.0",
  "runId": "generated-server-id",
  "status": "completed",
  "rubricVersion": "1.0",
  "aggregationVersion": "1.0",
  "validPersonaCount": 10,
  "expectedPersonaCount": 10,
  "images": [
    {
      "slot": 1,
      "model": "GPT-Image-2.5",
      "overallScore": null,
      "starRating": null,
      "criterionScores": {},
      "strengths": [],
      "weaknesses": [],
      "commonConcerns": []
    }
  ],
  "personaJudgments": [
    {
      "personaId": "stable-persona-id",
      "status": "valid",
      "judgments": [
        {
          "slot": 1,
          "criterionScores": {},
          "overallScore": null,
          "reasoning": {
            "modernIndianFashion": "reason for the score",
            "culturalAuthenticity": "reason for the score",
            "lifestyleRelevance": "reason for the score",
            "premiumPerception": "reason for the score",
            "visualQuality": "reason for the score",
            "representation": "reason for the score",
            "commercialSuitability": "reason for the score",
            "productClarity": "reason for the score"
          },
          "strengths": [],
          "weaknesses": [],
          "concerns": []
        }
      ],
      "errorCode": null
    }
  ],
  "ranking": [],
  "agreement": {},
  "disagreement": {},
  "warnings": []
}
```

This is a contract shape, not fake output; `null` values in this documentation example represent fields that are populated only after successful aggregation and must not be used as success-shaped output. The implementation must populate it only from actual validated evaluation responses. The production response must contain exactly ten persona entries, one for every configured persona ID. A valid persona must contain judgments for all three slots; a failed persona entry must contain its stable ID, failure status, and safe error code. The backend, not the frontend, calculates all aggregate values.

### Persona provider-output contract

Each provider call must request JSON-only structured output matching a schema equivalent to:

```json
{
  "personaId": "stable-persona-id",
  "judgments": [
    {
      "slot": 1,
      "criterionScores": {
        "modernIndianFashion": 1,
        "culturalAuthenticity": 1,
        "lifestyleRelevance": 1,
        "premiumPerception": 1,
        "visualQuality": 1,
        "representation": 1,
        "commercialSuitability": 1,
        "productClarity": 1
      },
      "overallScore": 1,
      "reasoning": {
        "modernIndianFashion": "reason",
        "culturalAuthenticity": "reason",
        "lifestyleRelevance": "reason",
        "premiumPerception": "reason",
        "visualQuality": "reason",
        "representation": "reason",
        "commercialSuitability": "reason",
        "productClarity": "reason"
      },
      "strengths": ["tag-or-short-point"],
      "weaknesses": ["tag-or-short-point"],
      "concerns": ["tag-or-short-point"]
    }
  ]
}
```

The implementation must require exactly three unique slots and every criterion for each slot. If the provider returns malformed JSON, fenced JSON, missing fields, unknown fields, invalid scores, duplicate slots, or incomplete judgments, the adapter may perform one bounded repair/retry using the same schema. If validation still fails, the persona is marked invalid with a safe error code; malformed content is never passed to aggregation and is never shown as a valid judgment.

### HTTP errors

- `400`: malformed request, wrong image count, unsupported type, or oversized payload.
- `413`: request exceeds configured size limits.
- `422`: request shape is valid but cannot be processed under the evaluation contract.
- `429`: provider or function rate limit.
- `500`: unexpected server-side failure.
- `502` or `503`: provider failure or temporary unavailability.

Error responses should contain a stable machine-readable code and a safe user-facing message. They must not expose API keys, prompts containing secrets, stack traces, or raw provider internals.

## 13. Security model

### Secrets

- Store `GROQ_API_KEY` in Netlify environment variables for deployed environments.
- Use a local `.env` file only for development.
- Commit `.env.example` with an empty placeholder:

  ```text
  GROQ_API_KEY=
  ```

- Add `.env` and other secret-bearing files to `.gitignore`.
- Never place the key in React source, Vite client-exposed variables, HTML, or uploaded assets.

### Input protection

- Accept only supported image MIME types.
- Enforce maximum file size and request size.
- Reject requests that do not contain exactly three images.
- Ignore client-supplied persona, model, rubric, or aggregation overrides.
- Avoid logging image contents or sensitive payloads.
- Use request IDs/run IDs for diagnostics rather than raw prompt data.

### Provider and prompt safety

- Keep system prompts and persona configuration server-side.
- Treat uploaded images and any model-returned text as untrusted input.
- Validate and constrain model output before using it in aggregation or UI rendering.
- Escape or safely render text in the frontend.

### Privacy

The prototype should tell users whether uploaded images are transient. Unless persistence is explicitly added, the system should avoid retaining image bytes or detailed prompts after the request completes. Logging should be minimal and should not contain secrets.

## 14. Netlify deployment architecture

The repository should be organized for a standard Netlify deployment:

- Build command: `npm run build`.
- Publish directory: `dist`.
- Functions directory: `netlify/functions`.
- Frontend routing fallback configured if client-side routes are added.
- `GROQ_API_KEY` configured in Netlify site environment variables.

The frontend is static output generated by Vite. Netlify serves the static assets and invokes the serverless function for evaluation requests.

The deployment should include:

- A `netlify.toml` only if configuration is needed beyond Netlify defaults.
- A `.env.example` with no secret value.
- A `.gitignore` excluding local environment files and build output.
- TypeScript build checks before deployment.

No long-lived server process should be required for the initial prototype.

## 15. Error handling

Errors should be explicit, observable, and recoverable where possible.

### Setup errors

- Missing image slot: disable submission and identify the missing slot.
- Unsupported file: show the accepted formats.
- Oversized file: show the configured limit.
- Invalid image preview: reject the file and allow replacement.

### Evaluation errors

- Provider unavailable: show that the evaluation could not be completed and provide retry behavior.
- Timeout: stop waiting, show a clear incomplete state, and avoid presenting partial results as complete.
- Individual persona failure: record the persona failure and follow a documented policy. The UI must distinguish complete evaluation from partial evaluation.
- Invalid persona response: do not silently coerce arbitrary prose into a score. Mark the result invalid, optionally retry within a bounded policy, and include a warning.
- Aggregation failure: return an explicit server error rather than a success-shaped empty result.

### Logging

Server logs may include request/run IDs, timing, persona IDs, validation error codes, and provider status codes. They should not include secrets, full image payloads, or unnecessary user content.

## 16. Response validation

The backend should validate provider responses against a runtime schema before aggregation. A TypeScript type alone is insufficient because provider output is external data.

Validation should verify:

- Exactly ten persona identities are expected.
- Each persona result has the expected stable persona ID.
- Each persona has judgments for all three image slots.
- Every criterion is present.
- Scores are numeric and within the defined range.
- Required reasoning fields are strings with sensible length limits.
- Lists such as strengths and weaknesses have bounded lengths.
- No duplicate or unknown image slots are accepted.
- The response has the expected schema version.

Normalization may:

- Clamp or reject out-of-range values according to a documented policy.
- Convert known formatting variants into canonical labels.
- Trim excessive whitespace.
- Deduplicate repeated concerns.

Normalization must not invent missing judgments or silently turn invalid content into valid scores.

## 17. Folder structure

The following is the intended structure once implementation begins. It is documented here only; application files are intentionally not being created in this step.

```text
.
├── architecture.md
├── .env.example
├── .gitignore
├── netlify.toml
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── EvaluationSetup/
│   │   ├── ImageSlot/
│   │   ├── EvaluationProgress/
│   │   ├── PersonaJudgments/
│   │   ├── ComparisonResults/
│   │   └── Disclaimer/
│   ├── pages/
│   │   ├── SetupPage.tsx
│   │   ├── PersonaResultsPage.tsx
│   │   └── FinalResultsPage.tsx
│   ├── services/
│   │   └── evaluationApi.ts
│   ├── types/
│   │   └── evaluation.ts
│   └── styles/
│       └── ...
├── netlify/
│   └── functions/
│       ├── evaluate-agent.ts
│       ├── health.ts
│       └── run-evaluation.ts
└── server/
    ├── personas.ts
    ├── rubric.ts
    ├── prompts.ts
    ├── orchestrator.ts
    ├── provider/
    │   └── groq.ts
    ├── validation/
    │   └── evaluationSchema.ts
    └── aggregation/
        └── aggregateResults.ts
```

The exact naming can change during implementation, but the separation between browser code, serverless entry points, provider access, validation, persona configuration, and aggregation should remain.

## 18. Future scalability

The architecture can grow without changing the product contract:

- Move from synchronous functions to asynchronous evaluation jobs.
- Add persistent storage for evaluation runs and result history.
- Add authentication and role-based access.
- Add an evaluation-run dashboard and comparison history.
- Add configurable rubrics while retaining versioned rubric IDs.
- Add bounded retries and provider fallback.
- Add observability for latency, token usage, failure rate, and per-persona validity.
- Add human-evaluation capture so AI-persona findings can be compared with real participant feedback.
- Add export to JSON, CSV, or a research report.
- Add experiment versioning for persona prompts and aggregation rules.
- Support more model slots in a future version while preserving the fixed three-image contract for this assignment prototype.

Any expansion should preserve the distinction between simulated AI perspectives and real human research.

## 19. Important design decisions

1. **Exactly three images:** The prototype is designed around a controlled comparison of the three provided model outputs.
2. **Fixed model identity per slot:** Image-to-model mapping is server-controlled and cannot be changed by the browser.
3. **Exactly ten personas:** The persona count is part of the evaluation contract, not a user-configurable setting.
4. **Every persona evaluates every image:** This prevents uneven coverage and supports direct comparison.
5. **One shared rubric:** Consistent criteria make persona outputs comparable.
6. **Independent persona judgments:** Personas do not see one another's responses before submitting.
7. **Structured output:** Scores and reasoning are returned as validated fields rather than unstructured text only.
8. **Individual results are preserved:** Aggregates do not replace the underlying judgments.
9. **Server-side provider access:** Provider credentials and prompts remain outside the browser; Groq is only the initial provider.
10. **Netlify-first deployment:** Static Vite hosting plus Netlify Functions keeps the prototype simple to deploy.
11. **Explicit partial-failure handling:** Invalid or missing persona results must be visible and must not be presented as a complete evaluation.
12. **Human evaluation remains authoritative:** AI-persona output informs research but does not satisfy the real-participant requirement.

## 20. What this prototype does NOT claim

This prototype does not claim that:

- AI personas are real Indian users.
- Ten simulated agents statistically represent India.
- The aggregate score is a market forecast or consumer-truth measurement.
- The winning image is objectively the best campaign image.
- AI-persona judgments replace the required 8–10 real human participants.
- The output establishes cultural authenticity for every Indian audience or region.
- The score is free from model bias, prompt bias, or persona-design bias.
- A five-star rating has an externally validated commercial meaning.
- The system evaluates legal compliance, trademark safety, factual product claims, or production readiness unless those checks are explicitly added.
- A successful API response means that every persona response was valid; completion and validity must be reported separately.

The intended claim is narrower: the system provides a structured, comparable AI-assisted pre-evaluation layer that can surface questions and patterns for subsequent human evaluation.
