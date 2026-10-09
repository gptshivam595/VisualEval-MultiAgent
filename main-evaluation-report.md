# Indian Fashion AI Evaluation — Main Evaluation Report

**Category:** E-commerce  
**Use case:** Premium Indian fashion and clothing imagery for Indian e-commerce and fashion campaigns  
**Models/images labelled by the prototype:** GPT-Image-2.5, Nano Banana 2.1, Nano Banana Pro  
**Report status:** Preliminary, evidence-based, and limited to one reported run

## How to read this report

This report distinguishes evidence from interpretation and future work:

| Label | Meaning |
|---|---|
| **Implemented** | Supported by repository code, tests, or documented implementation. |
| **Observed** | Supported by the supplied prototype results or participant responses. |
| **Interpretation** | A bounded reading of the observed evidence, not a population-level claim. |
| **Proposed** | A recommendation or future protocol, not completed work. |

The repository contains a working measurement instrument, but it does not contain a stored completed-run export, the three images, a frozen generation brief, or participant records. The prototype results and human responses in this report were supplied for this update. They are not reconstructed from missing files.

## A. Executive summary

The prototype completed **three out of three image evaluations** in the reported run. It produced one valid simulated-persona evaluation for each image, not ten independent persona evaluations. Its reported ranking was:

1. **GPT-Image-2.5 — 8.89/10**
2. **Nano Banana Pro — 8.52/10**
3. **Nano Banana 2.1 — 8.35/10**

The prototype also reported system confidence values of **95%**, **90%**, and **95%**, respectively. These are system-reported confidence values, not statistical confidence intervals or validated probabilities.

Eight adults supplied overall 1–5 ratings and qualitative feedback. Their descriptive mean ratings ranked Image A first (4.50/5), Image C second (3.625/5), and Image B third (3.125/5). The comments repeatedly associated **Image A** with heritage, craftsmanship, festive relevance, premium storytelling, and campaign composition. Several participants preferred **Image B** for everyday wearability, contemporary Indian identity, and product-listing usefulness. **Image C** was described as sophisticated, modern, editorial, and clear in its shopping message, but less distinctly Indian to some participants and less broadly accessible in its setting.

These results are preliminary. There is one image per labelled model, one valid simulated persona per image, a small participant group aged 21–24, no criterion-level human ratings, and an identical P7/P8 response requiring verification. The reported rankings are descriptive results for this run and sample, not universal model rankings.

## B. Research question and evaluation context

### Research question

For a fixed premium Indian fashion/e-commerce use case, which supplied image best balances:

- Indian cultural authenticity without stereotype or generic “India” decoration;
- luxury and premium appeal;
- fashion and styling quality;
- adherence to the intended brief;
- visual quality and photorealism;
- Indian social context;
- visible craftsmanship and garment detail;
- commercial/brand readiness; and
- absence of visible AI artifacts?

The practical decision is not simply “which image looks most beautiful?” It is whether a generation pipeline can support a particular commercial placement, at what level of human supervision and retouching, and with what cultural and brand risks.

### Why this matters for India-focused fashion evaluation

Indian fashion imagery is not a single visual style. Clothing, occasion, setting, styling, and premium conventions vary across regions, communities, generations, and price points. A generic aesthetic benchmark can miss whether a garment, setting, styling, and social context form a credible whole. A market-scoped rubric makes those dimensions visible and gives a product team a way to discuss a specific failure rather than only a global quality score.

This is relevant to AI model developers because a general benchmark may not reveal:

- culturally incoherent combinations that still look polished;
- textile, drape, embroidery, or garment-construction defects;
- attractive images that are not shoppable or campaign-ready;
- the difference between contemporary Indian styling and decorative stereotyping; or
- artifact severity in a customer-facing fashion context.

The evaluation therefore treats cultural authenticity, premium credibility, wearability, and commercial usability as distinct constructs. That is a design rationale, not evidence that one model is generally better.

## C. Methodology and evidence layers

The evaluation has three separate evidence layers.

| Layer | Role | Evidence status in this report |
|---|---|---|
| **1. Submitted images and setup** | Three externally generated images are placed into fixed prototype slots. | **Observed as supplied; provenance and original brief still require verification.** |
| **2. Simulated evaluator/persona** | One model-based evaluator, conditioned as a persona, scores each image against the ten-criterion rubric. | **Observed:** three valid image evaluations were reported. |
| **3. Human evaluation** | Eight adult participants provide overall 1–5 ratings and free-text reactions to the same labelled images. | **Observed:** eight overall-rating records and eight responses were supplied; criterion-level ratings were not supplied. |

The simulated evaluator is not a real human opinion and should not be described as a participant. Human comments and AI-generated evaluation outputs are reported separately and are not pooled into one score.

### Implemented prototype workflow

Repository evidence shows that the current implementation:

- accepts exactly three uploaded images;
- maps fixed slots `image1`, `image2`, and `image3` to fixed model labels;
- defines one active persona, Aditi Mehra, a 29-year-old New Delhi brand strategist;
- sends one persona-image evaluation per request;
- validates all ten criterion scores and reasoning fields;
- recomputes weighted scores deterministically;
- retains successful results and represents failures explicitly; and
- declares a winner only when all three configured image evaluations succeed.

Thus, the implemented workload is **one persona × three images = three evaluations**. The ten-persona panel described in some design documents is planned/original expanded design, not the observed execution.

### Important setup caveats

The prototype evaluates supplied images; it does not independently generate or authenticate them. The model attribution is therefore an operator-supplied provenance assumption. The confirmed mapping used in this report is **Image A — GPT-Image-2.5**, **Image B — Nano Banana 2.1**, and **Image C — Nano Banana Pro**. Participant quotations retain their supplied wording, including their original model references.

The current evaluator request includes the image, persona context, and rubric text, but repository inspection did not find a generation brief being supplied to the evaluator. Prompt Adherence is consequently a required criterion without a verified external brief in the reported run.

## D. Rubric and scoring

### Ten criteria and weights

| # | Criterion | Weight |
|---:|---|---:|
| 1 | Indian Cultural Authenticity | 15% |
| 2 | Luxury & Premium Appeal | 15% |
| 3 | Fashion & Styling | 12% |
| 4 | Prompt Adherence | 12% |
| 5 | Visual Aesthetics | 10% |
| 6 | Photorealism & Authenticity | 10% |
| 7 | Indian Social Context | 8% |
| 8 | Craftsmanship & Detail | 7% |
| 9 | Commercial / Brand Readiness | 6% |
| 10 | AI Artifact Detection | 5% |
|  | **Total** | **100%** |

The full criterion cards and anchors are documented in the repository's evaluation criteria document. Each criterion uses an integer **0–10** scale: 0 indicates no usable evidence or active incompatibility, 5 indicates mixed/adequate performance with meaningful weaknesses, and 10 indicates exceptional satisfaction for this use case.

The implemented weighted formula is:

```text
overall score = Σ(criterion score × criterion weight) / 100
```

The weights total 100%, so the result remains on a 0–10 scale. The prototype also derives a five-star display from the score; that display is not an additional measurement.

### Reported criterion scores

The following table reproduces the supplied prototype results. Because the prototype reported one valid persona per image, each image's criterion score is the sole valid persona contribution for that image in this run.

| Criterion | Weight | GPT-Image-2.5 (A) | Nano Banana 2.1 (B) | Nano Banana Pro (C) |
|---|---:|---:|---:|---:|
| Indian Cultural Authenticity | 15% | 9 | 9 | 8 |
| Luxury & Premium Appeal | 15% | 9 | 8 | 9 |
| Fashion & Styling | 12% | 9 | 9 | 8 |
| Prompt Adherence | 12% | 10 | 9 | 10 |
| Visual Aesthetics | 10% | 9 | 8 | 9 |
| Photorealism & Authenticity | 10% | 8 | 7 | 8 |
| Indian Social Context | 8% | 8 | 8 | 7 |
| Craftsmanship & Detail | 7% | 9 | 8 | 8 |
| Commercial / Brand Readiness | 6% | 9 | 9 | 9 |
| AI Artifact Detection | 5% | 8 | 8 | 9 |
| **Reported weighted overall** | **100%** | **8.89/10** | **8.35/10** | **8.52/10** |

The displayed totals are arithmetically consistent with the supplied criterion scores and weights. They are reported outputs, not proof of general model quality. The rubric weights are designed product judgements, not empirically validated importance; a different weighting could change the ranking.

## E. Simulated persona findings

### Scope and provenance

**Observed:** the prototype completed three valid persona-image evaluations, one for each image. The active configured persona is Aditi Mehra, a New Delhi brand strategist. The repository contains the evaluator schema and aggregation code but no stored raw JSON export from the reported run. The observations below are therefore reproduced from the supplied prototype result, not presented as a raw-file citation.

No ten-persona result exists in the available evidence. No claim of persona agreement, disagreement, or consensus is warranted: with one valid persona per image, inter-persona variance cannot be measured.

### Image A — prototype label: GPT-Image-2.5

**Reported strengths**

- Exceptional premium brand coherence and visual storytelling.
- Authentic representation of modern Indian heritage fashion.
- High-quality craftsmanship details in textile patterns.

**Reported concerns**

- Background architecture lacks specific regional identity.
- Slight softness in fabric textures reduces hyper-realism.

### Image B — prototype label: Nano Banana 2.1

**Reported strengths**

- Strong alignment with a premium, culturally curious brand persona.
- Excellent colour coordination that enhances the garment's appeal.
- High commercial readiness for brand marketing materials.

**Reported concerns**

- Slight AI artifacts in skin and hair texture.
- Background is pleasant but somewhat generic.
- Even lighting may lack the dynamic range of a high-end professional photoshoot.

### Image C — prototype label: Nano Banana Pro

**Reported strengths**

- Strong premium brand identity and sophisticated typography/layout.
- Modern Indian fashion representation in an urban setting.
- High-quality visual execution, lighting, and colour grading.

**Reported concerns**

- Setting may feel too exclusive for a broader mass-market audience.
- Static pose may lack dynamic energy for some campaigns.

### Aggregate observations

The prototype aggregate output identified GPT-Image-2.5 as the highest-scoring image in this run and highlighted modern Indian heritage fashion, premium storytelling, and textile craftsmanship. Recurring concerns included generic regional context, slightly soft fabric detail, possible skin/hair artifacts, and overly even lighting.

The aggregate output contains repeated citation-like suffixes such as “(1) (1).” These are evaluator-output formatting/count markers, not external citations, and are not treated as independent corroboration here. Likewise, its agreement/disagreement fields are not evidence of cross-persona agreement because only one valid persona contributed per image.

### Confidence values

The supplied prototype result reports **95% for A, 90% for B, and 95% for C**. The implementation exposes a confidence field, but the evidence does not establish statistical calibration. These values should be read as the evaluator's or system's reported confidence only.

## F. Human evaluation findings

### Participant evidence and consent

The researcher supplied the following participant records for this assignment. The records include names, institutional email addresses, ages, ratings, qualitative responses, and the same consent statement for all eight participants:

“I confirm that I am 18 years or older. I voluntarily participated in this evaluation. I consent to my name, email, and responses/ratings being included in this assignment submission for hiring evaluation purposes.”

The participant details and ratings are documented as supplied/reported by the researcher and were not independently audited. Consent status does not establish response independence, sample representativeness, or data quality.

### Participant details, star ratings, and consent

Each participant rated all three images on a 1–5 star scale. The consolidated records below preserve the supplied participant information and rating order.

| Participant ID | Name | Email | Age | Image A rating | Image B rating | Image C rating | Consent |
|---|---|---|---:|---:|---:|---:|---|
| P1 | Prashant Seth | btech10347.22@bitmesra.ac.in | 24 | 5/5 | 3/5 | 4/5 | Confirmed — statement supplied |
| P2 | Aryan Rai | btech10244.22@bitmesra.ac.in | 23 | 4/5 | 2/5 | 3/5 | Confirmed — statement supplied |
| P3 | Manish Kumar Choudhary | btech10168.22@bitmesra.ac.in | 21 | 5/5 | 3/5 | 4/5 | Confirmed — statement supplied |
| P4 | Atul Oraon | btech10152.22@bitmesra.ac.in | 22 | 4/5 | 4/5 | 4/5 | Confirmed — statement supplied |
| P5 | Agnibha Chowdhary | btech10243.22@bitmesra.ac.in | 22 | 4/5 | 2/5 | 3/5 | Confirmed — statement supplied |
| P6 | Vivek Kumar | btech10974.22@bitmesra.ac.in | 22 | 4/5 | 4/5 | 3/5 | Confirmed — statement supplied |
| P7 | P. Anand Verma | btech10238.22@bitmesra.ac.in | 23 | 5/5 | 3/5 | 4/5 | Confirmed — statement supplied |
| P8 | Sahil Sajid | btech10248.22@bitmesra.ac.in | 22 | 5/5 | 4/5 | 4/5 | Confirmed — statement supplied |

The confirmed human-study mapping is:

- A = ChatGPT Image 2.5 / GPT-Image-2.5;
- B = Nano Banana 2.1;
- C = Nano Banana Pro.

The participant quotations below preserve the wording supplied by the researcher, including any informal model names within quotation marks.

### Human overall-rating data

Each participant rated all three images on an overall **1–5 scale**. These are overall image ratings, not criterion-level ratings. The star ratings in this subsection correspond to the consolidated participant-details table above.

| Participant | A: GPT-Image-2.5 | B: Nano Banana 2.1 | C: Nano Banana Pro |
|---|---:|---:|---:|
| P1 | 5 | 3 | 4 |
| P2 | 4 | 2 | 3 |
| P3 | 5 | 3 | 4 |
| P4 | 4 | 4 | 4 |
| P5 | 4 | 2 | 3 |
| P6 | 4 | 4 | 3 |
| P7 | 5 | 3 | 4 |
| P8 | 5 | 4 | 4 |
| **Total points** | **36** | **25** | **29** |

| Image/model | Total points | Maximum points | Mean human rating | Normalized display score | Descriptive rank |
|---|---:|---:|---:|---:|---:|
| A — GPT-Image-2.5 | 36 | 40 | **4.50/5** | **9.00/10** | 1 |
| C — Nano Banana Pro | 29 | 40 | **3.625/5** | **7.25/10** | 2 |
| B — Nano Banana 2.1 | 25 | 40 | **3.125/5** | **6.25/10** | 3 |

The normalized display score is the descriptive conversion `mean human rating × 2`, used only to put the 1–5 ratings beside the prototype's 0–10 display. It is not equivalent to the AI evaluator's ten-criterion weighted score and is not a statistically validated model-quality measure. No criterion-level human ratings were supplied, so no human scores are reported for cultural authenticity, premium appeal, photorealism, or any other individual criterion. No p-values, inferential statistics, confidence intervals, or population preference percentages are calculated.

### Themes in the supplied responses

**Image A:** heritage, architecture, traditional silhouettes, coordinated styling, craftsmanship, festive/wedding relevance, premium positioning, and strong campaign structure. Participants also described it as more expensive, editorial, or less routine-wearable than B.

**Image B:** everyday wearability, contemporary Indian identity, colour coordination, workplace/family/festival versatility, understated aesthetic, product-listing usefulness, and potential commercial readiness. One participant wanted a closer view of the fabric.

**Image C:** sophistication, graceful modern styling, editorial appeal, typography, and a clear shopping message. Some comments described the setting and palette as less distinctly Indian; the supplied AI observation additionally raised exclusivity and static-pose concerns.

These are themes in eight supplied qualitative comments, not population-level conclusions. The overall-rating table is descriptive only; it does not provide criterion-level human evidence or a validated measure of model quality.

### Human and AI comparison

The simulated evaluator ranked the prototype-labelled GPT-Image-2.5 image first. Human overall ratings also ranked Image A first, followed by C and B. This is descriptive agreement in ranking for this run and sample, not proof of statistical agreement, evaluation validity, or general model superiority. Human comments also highlighted Image A for heritage, craftsmanship, premium storytelling, and campaign use. At the same time, some participants explicitly preferred Image B for everyday wearability and practical use.

This is consistent with a use-case trade-off: a single aggregate score can favour a premium campaign image while a different buyer or placement may favour an image that feels more wearable or product-listing-ready. The identical P7/P8 wording remains an unresolved data-quality issue and limits claims about independent qualitative corroboration.

## G. Product implications

The evidence supports use-case-specific interpretation rather than one universal winner:

### Premium festive or wedding campaign creative

Image A appears promising for a premium heritage-led campaign based on the supplied comments and prototype observations: it communicates coordinated styling, craftsmanship, architecture, and festive storytelling. Its generic regional identity and slightly soft fabric texture should be checked before publication.

### Everyday ethnic-wear product listings

Image B may be more suitable for an everyday or work-to-festival product context because participants described it as wearable, contemporary, and useful for a product listing. Fabric detail and skin/hair artifacts require closer inspection.

### Contemporary editorial and brand-awareness creative

Image C may suit a sophisticated editorial or urban brand-awareness placement because of its typography, layout, lighting, and modern styling. The target audience, setting accessibility, cultural specificity, and pose energy should be tested for the intended campaign.

These are placement hypotheses, not adoption decisions. Different placements can justify different weights for wearability, heritage, premium appeal, product legibility, and conversion readiness.

## H. Scaling recommendations

The current evidence supports a staged expansion rather than an immediate benchmark claim:

### Stage 1 — Make the reported run auditable

Freeze the exact generation brief, retain the three source images, record model/version/prompt/settings/timestamps, and preserve raw evaluator JSON. Pass the brief to the evaluator so Prompt Adherence has an external referent. Keep the current deterministic aggregation and explicit partial/failure states.

### Stage 2 — Complete structured human evaluation

If quantitative human comparison is required, collect criterion-level 0–10 ratings, overall preference, placement-specific judgements, presentation order, and open-ended comments. Blind participants to model identity where feasible, randomize presentation order, and verify the P7/P8 records before analysis. Report qualitative themes separately from numerical summaries.

### Stage 3 — Test reliability and use-case sensitivity

Evaluate multiple images per model from controlled briefs and relevant placements. Measure criterion-level spread only when multiple evaluators contribute. Test sensitivity to alternate weights and report whether rankings persist. Compare premium campaign, product-listing, and editorial objectives rather than forcing one universal score.

### Stage 4 — Build a reusable India-specific benchmark

Expand across garment categories, occasions, styling registers, regions, and price tiers with structured sampling and per-stratum reporting. Version prompts, model settings, rubric revisions, images, evaluator outputs, and human protocols. Treat any single “India score” as insufficient for a culturally diverse market.

## I. Limitations and evidence gaps

The following limitations materially constrain interpretation:

1. **Only three images were evaluated:** one submitted image for each labelled model. This cannot establish model-level superiority across prompts or generations.
2. **One valid simulated persona evaluation per image:** the run does not support inter-persona agreement or disagreement.
3. **Small human sample:** eight participants, ages 21–24, with representativeness not established.
4. **Overall human ratings are limited:** eight overall 1–5 ratings were supplied, but no criterion-level numerical human ratings were supplied. The descriptive overall-rating comparison should not be treated as a full rubric-based human evaluation.
5. **Duplicate wording:** P7 and P8 are exactly identical. The researcher should verify whether these were independently submitted or whether a copying error occurred. They must not be treated as independent corroboration without qualification.
6. **Model provenance is not independently verified:** the confirmed A/B/C mapping is used consistently, but the prototype maps uploads to labels and does not authenticate generation history.
7. **Prompt adherence is not fully validated:** the evaluator did not receive a verified original image-generation brief in the repository implementation.
8. **Confidence is not calibrated:** reported confidence values are not statistical confidence intervals or validated probabilities.
9. **Rubric weights are normative:** they encode a product hypothesis about importance and may influence the ranking.
10. **Criteria overlap:** cultural authenticity/social context, premium appeal/craftsmanship, aesthetics/premium appeal, and photorealism/artifact detection can partly measure related visible evidence.
11. **Human and AI evidence are different constructs:** qualitative comments, overall 1–5 ratings, and model-based rubric scores should not be merged into one number.
12. **No commercial outcome test:** no conversion experiment or other commercial outcome test has been conducted.
13. **Run reproducibility is incomplete:** the original images, prompt, generation settings, timestamp, raw evaluator output, and provenance record were not found in the repository snapshot.
14. **Historical design documents differ from implementation:** the expanded ten-persona design should not be reported as the current execution.

## J. Conclusion and next steps

The reported run shows that the prototype can produce a criterion-level comparison and surface meaningful commercial trade-offs. In this run, the prototype-labelled GPT-Image-2.5 image received the highest aggregate score, and the eight-participant overall-rating means also ranked A first, while human comments distinguished between premium heritage storytelling (A), practical wearability (B), and sophisticated editorial communication (C).

The conclusion must remain measured: these are preliminary results from three images and one valid simulated persona per image, supplemented by eight small-sample qualitative responses. They do not validate general model superiority or a reusable India-wide benchmark.

Priority next steps are:

1. **Verify image provenance** against the confirmed A/B/C mapping and original generation records.
2. **Verify the P7/P8 duplication** against the original response records.
3. **Preserve the exact generation brief**, including model version, prompt, settings, and timestamps.
4. **Collect criterion-level human ratings** if the assignment requires quantitative rubric-based human comparison.
5. **Test multiple images per model** under controlled prompts before making model-level claims.
6. **Run a use-case-specific conversion or product test** for the relevant placement.
7. **Improve persona coverage and agreement analysis** only in a future experiment; the present report does not imply that the prototype was changed.

## K. Evidence appendix

### K1. Complete score table

| Criterion | Weight | A: GPT-Image-2.5 | B: Nano Banana 2.1 | C: Nano Banana Pro |
|---|---:|---:|---:|---:|
| Indian Cultural Authenticity | 15% | 9 | 9 | 8 |
| Luxury & Premium Appeal | 15% | 9 | 8 | 9 |
| Fashion & Styling | 12% | 9 | 9 | 8 |
| Prompt Adherence | 12% | 10 | 9 | 10 |
| Visual Aesthetics | 10% | 9 | 8 | 9 |
| Photorealism & Authenticity | 10% | 8 | 7 | 8 |
| Indian Social Context | 8% | 8 | 8 | 7 |
| Craftsmanship & Detail | 7% | 9 | 8 | 8 |
| Commercial / Brand Readiness | 6% | 9 | 9 | 9 |
| AI Artifact Detection | 5% | 8 | 8 | 9 |
| **Weighted overall** | **100%** | **8.89/10** | **8.35/10** | **8.52/10** |

**Prototype rank:** 1. A / GPT-Image-2.5; 2. C / Nano Banana Pro; 3. B / Nano Banana 2.1.  
**System-reported confidence:** A 95%; B 90%; C 95%.

### K2. Individual persona evidence available

| Image | Prototype model label | Valid persona evaluations | Status | Available evidence |
|---|---|---:|---|---|
| A | GPT-Image-2.5 | 1 | Completed | Criterion scores, reported confidence, strengths, concerns, aggregate observations supplied for this report |
| B | Nano Banana 2.1 | 1 | Completed | Criterion scores, reported confidence, strengths, concerns, aggregate observations supplied for this report |
| C | Nano Banana Pro | 1 | Completed | Criterion scores, reported confidence, strengths, concerns, aggregate observations supplied for this report |

Raw criterion reasoning and raw JSON were not present in the repository snapshot. No additional valid persona outputs were found there. The displayed aggregate scores equal the sole valid persona contribution per image; they are not averages across ten personas.

### K3. Human overall-rating appendix

| Participant | A: GPT-Image-2.5 | B: Nano Banana 2.1 | C: Nano Banana Pro |
|---|---:|---:|---:|
| P1 | 5 | 3 | 4 |
| P2 | 4 | 2 | 3 |
| P3 | 5 | 3 | 4 |
| P4 | 4 | 4 | 4 |
| P5 | 4 | 2 | 3 |
| P6 | 4 | 4 | 3 |
| P7 | 5 | 3 | 4 |
| P8 | 5 | 4 | 4 |
| **Total** | **36** | **25** | **29** |
| **Mean** | **4.50/5** | **3.125/5** | **3.625/5** |
| **Normalized display score** | **9.00/10** | **6.25/10** | **7.25/10** |

### K4. Human responses

The following preserves the supplied participant wording and associates each response with the supplied participant ID and name.

**P1 — Prashant Seth**  
“Image Nano Banana 2.1 feels the most wearable for my age. The green kurta looks modern without losing its Indian identity. Image A is beautiful, but feels more like a wedding or luxury campaign than something I would shop for regularly.”

**P2 — Aryan Rai**  
“Image ChatGPT image 2.5 has the strongest premium positioning. The coordinated outfits, architectural setting, and warm lighting create a luxury Indian fashion story. Image C is sophisticated too, but its campaign text and composition feel less polished to me.”

**P3 — Manish Kumar Choudhary**  
“Image ChatGPT image 2.5 immediately reminds me of Indian weddings and festive occasions. The men's waistcoat and kurta combination is particularly strong. B and C are good for women's ethnic collections, but A tells a more complete cultural story.”

**P4 — Atul Oraon**  
“I would choose nano banana 2.1 because it looks like an outfit I could actually wear to work, a family gathering, or a festival. The cream trousers and dupatta complement the green kurta. A looks expensive, while Nano banana pro feels more like a fashion editorial.”

**P5 — Agnibha Chowdhary**  
“Image A communicates craftsmanship best because the embroidered kurta, waistcoat, and richly detailed lehenga work together. B has a nice understated aesthetic, but I would want a closer view of its fabric. C has an elegant silhouette, though the grey outfit communicates less festive richness.”

**P6 — Vivek Kumar**  
“Image A has the best overall campaign structure. The models occupy the left and lower portions, leaving negative space for the brand message. B is useful for a product listing, but C has a clear headline and shopping message. For an actual conversion test, I would test both A and B against C.”

**P7 — P. Anand Verma**  
“Image A feels most connected to Indian heritage because of its architecture, traditional silhouettes, and coordinated styling. I also like the simplicity of B. C is graceful and modern, but its setting and colour palette make it feel less distinctly Indian to me.”

**P8 — Sahil Sajid**  
“Image A feels most connected to Indian heritage because of its architecture, traditional silhouettes, and coordinated styling. I also like the simplicity of B. C is graceful and modern, but its setting and colour palette make it feel less distinctly Indian to me.”

**Data-quality note:** P7 and P8 are exactly identical in the supplied dataset. The original records must establish whether they were independent submissions or a copying error.

### K5. Evidence-status checklist

| Evidence item | Status |
|---|---|
| Three prototype image evaluations completed | **Completed as supplied:** 3/3 |
| One valid persona evaluation per image | **Completed as supplied:** 3 total |
| Ten-criterion scores and weighted totals | **Completed as supplied** |
| Prototype ranking | **Completed as supplied** |
| System-reported confidence values | **Completed as supplied; calibration outstanding** |
| Prototype strengths, concerns, and aggregate observations | **Completed as supplied** |
| Eight participants' overall numerical ratings | **Completed as supplied** |
| Human aggregate totals, means, and normalized display scores | **Calculated from supplied ratings** |
| Eight qualitative human responses | **Completed as supplied; P7/P8 duplication flagged** |
| Reported consent for participation and response use | **Completed as reported by the researcher** |
| Human criterion-level numerical ratings | **Unavailable** |
| Human inferential statistics or population preference percentages | **Unavailable and not inferred** |
| Ten independent simulated persona evaluations | **Not completed in observed run** |
| Independent model-provenance records | **Outstanding** |
| P7/P8 independence or copying-error verification | **Outstanding** |
| Original image-generation brief | **Outstanding** |
| Image provenance and generation settings | **Outstanding** |
| Raw completed-run export in repository | **Unavailable in inspected snapshot** |
| General model superiority claim | **Unsupported by this evidence** |

## L. Integrity and privacy statement

Participant names, institutional email addresses, ages, consent wording, overall ratings, and qualitative responses are included because they were supplied for this assignment together with statements consenting to their inclusion. The report does not claim independent identity or consent verification. No participant locations, genders, professions, shopping habits, or regional identities have been inferred. The supplied overall ratings and qualitative responses are reported without fabricating criterion-level human scores, model outputs, participants, or consent statements.

This documentation update changes the report only. It does not rerun the prototype, call any model API, consume API credits, or change the working application.
