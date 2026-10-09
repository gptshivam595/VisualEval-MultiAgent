# Evaluation Criteria Framework

> Current implementation (October 2026): one active persona, Aditi Mehra, evaluates three images (three jobs). Requests are sequential with a 45-second interval; browser retries honor provider cooldowns. Successful jobs are retained for retry within the session, and a winner requires all three results. The ten-persona descriptions below document the original expanded design.

## Purpose

This framework defines the single scoring rubric used by all ten simulated Indian AI evaluation personas for all three fashion campaign images.

The product question is:

> How well does each generated image represent modern Indian fashion, culture, lifestyle, premium/luxury positioning, and commercial suitability for Indian e-commerce?

The framework is specifically for **premium AI-generated clothing and fashion campaign imagery for the Indian market**. It is not a generic image-quality rubric.

Every persona evaluates:

- The same three images.
- The same ten criteria.
- The same 0–10 raw score scale.
- The same criterion weights.
- The same evidence requirements.

Persona background may influence what the persona notices and how it explains the score. It must not change the criteria, weights, score anchors, or aggregation formula.

## Scoring rules

### Raw score scale

Each criterion receives one integer score from **0 to 10**:

- **0:** No usable evidence, completely fails the criterion, or the image is actively incompatible with the criterion.
- **1:** Very poor; the criterion is substantially absent or contradicted.
- **5:** Mixed or adequate; some evidence is present, but important weaknesses remain.
- **10:** Exceptional; the criterion is strongly and consistently satisfied with no material issue visible for this use case.

Agents should use the full range when justified. A score of 5 is not automatically “average quality”; it means the image has meaningful strengths and weaknesses for that specific criterion.

Agents must score the visible image, not the reputation of the generating model. If the image does not provide enough evidence, the agent should state the uncertainty in its reasoning rather than inventing context.

### Criterion weights

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

The weights are fixed for every persona and image. They must not be changed based on persona preferences, image quality, model identity, or perceived target customer.

## Criterion scoring cards

## 1. Indian Cultural Authenticity — 15%

### Purpose

Measures whether the image presents Indian cultural references, styling, clothing, people, and environments in a credible, respectful, and non-generic way.

This criterion concerns cultural specificity and respectful representation. It is not a test of whether the image contains visible traditional symbols.

### What the agent should look for

- Whether Indian cultural details appear coherent with one another.
- Whether clothing, accessories, setting, posture, grooming, and occasion make sense together.
- Whether the image can feel Indian without relying on obvious decorative markers.
- Whether regional or community-specific cues are used carefully rather than blended into an inaccurate “pan-Indian” collage.
- Whether the image avoids exoticizing, tokenizing, or reducing Indian identity to stereotypes.
- Whether modern Indian identity is represented as diverse and contemporary.

### Score anchors

- **1/10:** Cultural cues are absent when the brief clearly requires Indian relevance, or the visible cues are contradictory, stereotyped, appropriated, or obviously pasted on. The image feels like a generic global campaign with superficial Indian decoration.
- **5/10:** Some Indian cultural relevance is plausible, but the image is generic, incomplete, or ambiguous. The clothing and setting mostly work together, but regional or social details may feel simplified or under-observed.
- **10/10:** Indian cultural relevance is specific, coherent, respectful, and contemporary. Details support one another without becoming costume, stereotype, or token representation. The image feels credible for its implied context while acknowledging that no single image represents all of India.

### Positive evidence

- Contemporary Indian clothing styled naturally for the implied occasion.
- Regional textile or accessory references used coherently and without false claims.
- A believable relationship between clothing, setting, gesture, grooming, and social context.
- Indian representation that is neither artificially “exotic” nor culturally empty.
- Subtle cultural cues that support the story without overwhelming the product.

### Negative evidence

- Random combinations of regional motifs, garments, architecture, or rituals.
- Sacred or culturally meaningful objects used only as luxury props.
- Costume-like styling that treats Indian identity as a visual theme.
- Stereotyped poses, skin presentation, facial styling, or domestic settings.
- A claim of Indian relevance supported only by a palace, festival color, or ornamental object.

### What the agent must NOT assume

- That a city, state, religion, language, or community has one uniform fashion identity.
- That visible traditional clothing is automatically authentic.
- That Western or minimalist styling is not Indian.
- That the agent can identify every textile, ritual, ornament, or regional reference with certainty.
- That one persona's cultural reading represents India.

### Common false positives

- Attractive architecture or jewelry being mistaken for cultural authenticity.
- A model with Indian-looking features being treated as sufficient evidence.
- A familiar motif being assumed to be used correctly.
- High production value being mistaken for respectful cultural treatment.

### Common false negatives

- Penalizing contemporary or globally influenced Indian styling for not looking traditional.
- Treating a culturally subtle image as generic without considering behavior, material, or styling context.
- Rejecting an image because it does not represent the evaluator's own region.

## 2. Luxury & Premium Appeal — 15%

### Purpose

Measures whether the image communicates a credible premium or luxury position appropriate for an Indian fashion brand and e-commerce audience.

### What the agent should look for

- Perceived quality and exclusivity.
- Art direction, lighting, composition, styling, and environment.
- Whether premium signals support the garment rather than distract from it.
- Whether the image justifies a higher price through visible quality or thoughtful presentation.
- Whether the brand impression feels intentional, contemporary, and commercially plausible.

### Score anchors

- **1/10:** The image feels low-quality, generic, incoherent, mass-produced, or visibly artificial. Luxury cues are absent or undermine the product.
- **5/10:** The image has some premium signals, but they are inconsistent, familiar, or unsupported by garment quality. It may look polished without feeling genuinely luxurious.
- **10/10:** The image communicates refined, credible, and distinctive premium positioning. Styling, material impression, composition, and environment work together, and the luxury feeling remains relevant to Indian fashion commerce.

### Positive evidence

- Controlled lighting and composition that reveal garment quality.
- Refined styling with restraint and a clear brand point of view.
- Convincing material, texture, fit, and finishing.
- Premium environment that supports rather than competes with the clothing.
- A strong image hierarchy suitable for a luxury product page or campaign.

### Negative evidence

- Decorative “luxury” props with weak clothing quality.
- Excessive gold, marble, drama, or glamour used as a substitute for design.
- Generic international luxury imitation with no Indian brand identity.
- Cheap-looking textures, inconsistent lighting, or awkward styling.
- A premium scene that makes the product inaccessible, unclear, or implausible.

### What the agent must NOT assume

- That expensive-looking surroundings prove a premium garment.
- That minimalism is always more luxurious than ornament.
- That luxury must mean exclusivity, wealth display, or Western styling.
- That a high score should be given because the image is visually attractive overall.

### Common false positives

- Mistaking dramatic lighting for material quality.
- Mistaking a celebrity-like model or grand location for brand value.
- Rewarding heavily embellished clothing even when construction is unclear.

### Common false negatives

- Penalizing understated premium styling because it is not visually loud.
- Treating practical or climate-appropriate clothing as less luxurious.
- Rejecting culturally specific luxury codes because they are unfamiliar.

## 3. Fashion & Styling — 12%

### Purpose

Measures the quality, coherence, relevance, and contemporary appeal of the clothing, styling, silhouette, accessories, grooming, and overall fashion direction.

### What the agent should look for

- Silhouette, proportion, layering, color, texture, and balance.
- Whether accessories support the outfit.
- Whether the styling is current without being trend-dependent or derivative.
- Whether the look suits the implied wearer, occasion, setting, and Indian climate where visible.
- Whether the garment remains the visual focus.

### Score anchors

- **1/10:** Styling is incoherent, dated for the intended brief, poorly proportioned, or visibly mismatched. Clothing and accessories compete or make the look implausible.
- **5/10:** The outfit is serviceable and mostly coherent, but lacks distinction, has some mismatched elements, or does not fully communicate the intended fashion position.
- **10/10:** Styling is highly coherent, contemporary, distinctive, and appropriate to the garment, wearer, occasion, and Indian market context. Every major element contributes to the look.

### Positive evidence

- A clear silhouette and intentional styling choices.
- Contemporary Indian or globally influenced styling that feels naturally integrated.
- Accessories and grooming that support rather than overpower the garment.
- Clothing that appears wearable in the implied social context.
- Strong balance between editorial interest and product clarity.

### Negative evidence

- Random accessory combinations or conflicting dress codes.
- Garment proportions that appear physically or socially implausible.
- Styling that hides the product or makes the wearer look uncomfortable.
- Cultural styling used as costume or trend decoration.
- Fashion references copied without adapting them to the Indian market or garment.

### What the agent must NOT assume

- That personal taste equals poor styling.
- That traditional, experimental, modest, expressive, or minimalist fashion is inherently better.
- That a garment is badly styled merely because it is not the agent's preferred silhouette.
- That a trend is current without enough visual evidence.

### Common false positives

- Confusing novelty with good styling.
- Rewarding expensive accessories even when the outfit lacks coherence.
- Mistaking model attractiveness for fashion quality.

### Common false negatives

- Penalizing culturally unfamiliar styling that is internally coherent.
- Penalizing practical clothing for not being editorial.
- Treating a simple outfit as weak when its proportion and material are well resolved.

## 4. Prompt Adherence — 12%

### Purpose

Measures whether the image fulfills the known image-generation brief and the required campaign intent.

This criterion must be scored only against the actual prompt or brief supplied to the evaluation system. It must not be inferred from the model name or from assumptions about what the image was supposed to contain.

### What the agent should look for

- Required clothing type, garment attributes, color, styling, model direction, setting, mood, composition, and commercial purpose.
- Whether important requested elements are present and visible.
- Whether the image violates explicit constraints.
- Whether the image maintains the intended premium Indian fashion and e-commerce use case.

### Score anchors

- **1/10:** The image substantially misses or contradicts the brief. Required elements are absent, replaced, or unusable.
- **5/10:** The image satisfies some important requirements but misses, weakens, or ambiguously represents others. It may be visually strong while still being only partially compliant.
- **10/10:** The image satisfies the known brief comprehensively and clearly, with the requested garment, styling, mood, context, and commercial intent visible and coherent.

### Positive evidence

- The requested garment and key attributes are clearly visible.
- Composition and setting match the stated campaign direction.
- The image preserves required Indian-market, premium, and e-commerce intent.
- Constraints such as modesty, color, pose, or product visibility are respected.

### Negative evidence

- Wrong garment, color, setting, audience, or mood.
- Required details hidden by cropping, pose, props, or lighting.
- An image that is attractive but belongs to a different campaign brief.
- Prompt elements included as disconnected visual tokens.

### What the agent must NOT assume

- That a prompt was followed if the agent has not received the prompt or a reliable brief summary.
- That the source model's advertised capability proves adherence.
- That visual beauty compensates for missing required elements.
- That unspecified details are failures.

### Common false positives

- Giving a high score because the image looks premium despite missing the brief.
- Treating any Indian-looking styling as proof that Indian-specific prompt requirements were met.
- Assuming a partially visible garment contains requested details.

### Common false negatives

- Penalizing a creative interpretation that satisfies the brief without literal duplication.
- Penalizing an unspecified background or accessory.
- Treating minor unrequested differences as major non-adherence.

## 5. Visual Aesthetics — 10%

### Purpose

Measures the image's overall visual composition and sensory appeal as a fashion campaign image, separate from cultural authenticity and technical photorealism.

### What the agent should look for

- Composition, framing, balance, color harmony, lighting, contrast, depth, rhythm, and visual hierarchy.
- Whether the image attracts attention appropriate to premium fashion.
- Whether the aesthetic supports the garment and intended campaign mood.
- Whether the image remains readable at typical e-commerce thumbnail and product-page sizes.

### Score anchors

- **1/10:** Composition is confusing, flat, cluttered, poorly lit, or visually unpleasant. The garment and campaign message are difficult to read.
- **5/10:** The image is visually acceptable with some appealing elements, but has imbalance, generic treatment, weak hierarchy, or inconsistent aesthetic decisions.
- **10/10:** The image is exceptionally composed, visually coherent, memorable, and well suited to premium fashion communication and e-commerce viewing.

### Positive evidence

- Clear focal point on the garment or relevant fashion story.
- Balanced negative space and strong visual hierarchy.
- Lighting and color that reveal texture and support mood.
- A distinctive but controlled campaign aesthetic.
- Good readability on both large and small screens.

### Negative evidence

- Props, background, or effects overpowering the garment.
- Flat lighting that removes material definition.
- Distracting crops, awkward empty space, or unbalanced framing.
- Color combinations that undermine garment visibility.
- A visually beautiful scene that does not communicate a product.

### What the agent must NOT assume

- That aesthetic preference is objective.
- That maximal detail is better than restraint.
- That an image is commercially good merely because it is artistic.
- That cultural familiarity is required for visual quality.

### Common false positives

- Mistaking high contrast, saturation, or drama for strong composition.
- Rewarding a photorealistic image that has weak hierarchy.
- Confusing expensive-looking props with aesthetic coherence.

### Common false negatives

- Penalizing quiet, minimal, or understated art direction.
- Penalizing unusual composition when it remains intentional and legible.
- Treating a culturally unfamiliar palette as poor color harmony.

## 6. Photorealism & Authenticity — 10%

### Purpose

Measures whether people, garments, materials, lighting, perspective, and physical interactions appear believable enough for a premium fashion campaign.

This criterion concerns perceptual and physical realism. It is distinct from Indian Cultural Authenticity, which concerns cultural credibility.

### What the agent should look for

- Anatomical plausibility, facial consistency, hands, fingers, eyes, teeth, hair, and body proportions.
- Garment drape, seams, closures, folds, layering, shadows, and contact with the body.
- Material behavior under light.
- Perspective, reflections, depth, and object relationships.
- Whether the image could plausibly have been photographed or produced for a professional campaign.

### Score anchors

- **1/10:** Multiple obvious physical or rendering failures make the image unusable or clearly synthetic.
- **5/10:** The image is broadly believable at a glance but contains noticeable inconsistencies or weak areas that reduce trust on closer inspection.
- **10/10:** People, garments, materials, lighting, perspective, and interactions are consistently convincing at campaign viewing distance and reasonable inspection.

### Positive evidence

- Natural anatomy and expression.
- Believable fabric folds, weight, texture, and garment fit.
- Consistent light direction and contact shadows.
- Correct perspective and plausible object scale.
- Details that remain coherent when inspected closely.

### Negative evidence

- Extra or fused fingers, malformed jewelry, asymmetrical eyes, or distorted facial features.
- Fabric patterns that float, melt, or ignore folds.
- Garments intersecting bodies or accessories.
- Impossible shadows, reflections, anatomy, or perspective.
- Plastic skin or texture that undermines photographic credibility.

### What the agent must NOT assume

- That a visually polished image is physically realistic.
- That every small blur or compression artifact is AI-generated.
- That a photographic style must look documentary-realistic.
- That cultural unfamiliarity indicates lack of photorealism.

### Common false positives

- Mistaking intentional retouching or shallow depth of field for AI artifacts.
- Penalizing stylized lighting or editorial color grading as unrealistic.
- Treating unusual but physically possible clothing construction as an error.

### Common false negatives

- Missing subtle hand, textile, reflection, or perspective errors because the overall image is attractive.
- Accepting familiar beauty conventions as proof of anatomical realism.
- Failing to inspect garment edges and accessory interactions.

## 7. Indian Social Context — 8%

### Purpose

Measures whether the image fits a believable contemporary Indian social and lifestyle context for its implied audience, occasion, and setting.

This criterion is about lived context and relatability, not whether the image includes explicit cultural symbols.

### What the agent should look for

- Plausibility of the social occasion, location, climate, behavior, dress code, and interactions.
- Whether the image reflects contemporary Indian lifestyles without treating one lifestyle as universal.
- Whether the clothing would make sense for the implied use case.
- Whether the campaign is relatable or aspirational in a credible way.
- Whether social status and premium positioning are communicated without caricature.

### Score anchors

- **1/10:** The social context is implausible, contradictory, demeaning, or disconnected from the garment and intended Indian audience.
- **5/10:** The context is plausible but generic, narrow, or only partly relatable. Some details work while others feel imported, exaggerated, or underdeveloped.
- **10/10:** The image presents a coherent, contemporary, and credible Indian social context. It is specific enough to feel lived-in without claiming to represent everyone.

### Positive evidence

- Clothing, body language, setting, and occasion align.
- A believable balance of aspiration and everyday social reality.
- Climate and practical movement appear plausible where visible.
- A modern Indian lifestyle is shown without forcing a single regional template.

### Negative evidence

- A luxury environment disconnected from the clothing or social situation.
- Performative “Indian-ness” with no believable occasion.
- Social roles, gender behavior, or family dynamics presented as universal facts.
- Clothing inappropriate for the implied climate or activity.

### What the agent must NOT assume

- That one city, class, family type, or lifestyle represents Indian society.
- That aspiration must look either ordinary or traditionally Indian.
- That a persona's own social norms are universal.
- That the absence of a familiar social cue means the scene is inauthentic.

### Common false positives

- Treating a grand setting as evidence of credible Indian social context.
- Confusing a recognizable festival or venue with a complete lifestyle story.
- Rewarding stereotypes because they are immediately legible.

### Common false negatives

- Penalizing a modern, individualistic, or globally influenced lifestyle as “not Indian.”
- Rejecting an aspirational context simply because it is not personally relatable.
- Treating a quiet or ambiguous scene as socially implausible without evidence.

## 8. Craftsmanship & Detail — 7%

### Purpose

Measures whether the garment and accessories communicate careful construction, material quality, finishing, and attention to detail.

### What the agent should look for

- Seam placement, hems, closures, embroidery, prints, textures, trims, drape, tailoring, and finishing.
- Whether details are consistent across the garment.
- Whether craft or textile references appear materially plausible.
- Whether accessories support the garment and appear well made.
- Whether image resolution allows a fair judgment.

### Score anchors

- **1/10:** Construction is visibly broken, generic, malformed, or inconsistent. Details appear pasted on or impossible.
- **5/10:** Some details look convincing, but others are vague, repetitive, physically inconsistent, or insufficiently visible to support a premium claim.
- **10/10:** Construction, material behavior, finishing, and details appear deliberate, coherent, and high quality at the available image resolution.

### Positive evidence

- Consistent seams, hems, fastenings, pleats, embroidery, and surface texture.
- Fabric folds that correspond to garment structure and movement.
- Fine details that reinforce rather than distract from the design.
- Craft references presented with material and construction credibility.

### Negative evidence

- Broken patterns, melted embellishment, floating buttons, or impossible seams.
- Repeated decorative detail with no relationship to garment structure.
- Texture that looks printed over the entire image.
- Accessories that merge with the garment or body.

### What the agent must NOT assume

- That a low-resolution image proves poor craftsmanship.
- That ornate decoration automatically indicates skilled craft.
- That a simple garment lacks craftsmanship.
- That the agent can identify a specific craft tradition from appearance alone.

### Common false positives

- Mistaking sharp rendering for real construction.
- Assuming dense embroidery equals quality.
- Treating a brand logo or ornament as evidence of craftsmanship.

### Common false negatives

- Penalizing minimal design that depends on cut, fabric, and proportion.
- Missing quality in subtle finishing because the image is not zoomable.
- Treating intentional distressing or irregular craft variation as an error.

## 9. Commercial / Brand Readiness — 6%

### Purpose

Measures whether the image could be used, with reasonable production review, as premium Indian fashion campaign or e-commerce marketing creative.

This is a practical communication criterion, not a prediction of sales.

### What the agent should look for

- Whether the garment is clear enough to support shopping consideration.
- Fit for a product page, campaign banner, social ad, or brand communication.
- Target-customer clarity and brand consistency.
- Whether the image leaves space for commerce needs such as product information or cropping.
- Whether visible defects would require substantial retouching or replacement.

### Score anchors

- **1/10:** The image is not usable for commercial fashion communication without major reconstruction. The product, audience, or brand message is unclear.
- **5/10:** The image could support limited campaign use after meaningful editing, retouching, or additional product views. It communicates some value but leaves commercial uncertainty.
- **10/10:** The image is immediately plausible as premium fashion creative after normal production review. The garment, audience, brand tone, and commerce message are clear without sacrificing visual appeal.

### Positive evidence

- Clear garment visibility and strong first impression.
- A credible target customer and use case.
- Consistent premium brand language.
- Composition that can work across e-commerce and campaign placements.
- Few visible issues requiring manual correction.

### Negative evidence

- Product hidden by pose, crop, props, or effects.
- No clear relationship between image and shopping decision.
- Generic imagery that could belong to any brand.
- Visible artifacts that would damage trust.
- A campaign image that cannot support practical product evaluation.

### What the agent must NOT assume

- That a high aesthetic score guarantees commercial readiness.
- That the image will sell without price, copy, sizing, reviews, and product details.
- That one campaign image can replace catalog photography.
- That personal willingness to buy equals market readiness.

### Common false positives

- Mistaking social-media shareability for product-page usefulness.
- Rewarding luxury atmosphere when the garment is unclear.
- Treating a recognizable brand style as proof of conversion potential.

### Common false negatives

- Penalizing an image intended for a brand campaign rather than a primary product view.
- Requiring catalog-style front/back information from a single hero image.
- Penalizing creative cropping when the garment remains sufficiently legible.

## 10. AI Artifact Detection — 5%

### Purpose

Measures the presence, severity, and commercial impact of visible generation artifacts commonly associated with AI-created imagery.

This criterion is a penalty-oriented quality assessment: a high score means few or no material AI artifacts.

### What the agent should look for

- Anatomical and facial inconsistencies.
- Garment and accessory deformation.
- Text, logos, labels, and symbols that are unreadable or nonsensical.
- Repeated patterns, impossible edges, object merging, and inconsistent geometry.
- Lighting, shadow, reflection, and texture failures.
- Artifacts that would reduce viewer trust or require substantial retouching.

### Score anchors

- **1/10:** Severe or numerous artifacts are immediately visible and make the image commercially unsafe or unusable.
- **5/10:** Some artifacts are visible on inspection but the image remains broadly usable after review or moderate correction.
- **10/10:** No material AI artifacts are visible at the intended viewing size and reasonable inspection; any stylization appears intentional and controlled.

### Positive evidence

- Clean anatomy, garment edges, accessories, text, patterns, and object relationships.
- Consistent geometry and lighting.
- Details remain stable without obvious AI-specific distortions.
- Any imperfections are ordinary photographic or editorial effects rather than generation failures.

### Negative evidence

- Extra fingers, malformed hands, fused jewelry, or inconsistent faces.
- Garment logos, letters, labels, or motifs that collapse into illegible marks.
- Fabric patterns that change without structural reason.
- Objects merging with bodies, clothing, or backgrounds.
- Contradictory shadows, reflections, or repeated elements.

### What the agent must NOT assume

- That every imperfection was caused by AI.
- That an image is artifact-free because artifacts are not visible at thumbnail size.
- That all visual defects have equal commercial severity.
- That a technically clean image is culturally authentic or commercially appropriate.

### Common false positives

- Mistaking compression, intentional blur, film grain, or retouching for AI artifacts.
- Treating asymmetry in handcrafted clothing as an error.
- Penalizing stylized illustration or editorial manipulation when the style is clearly intentional.

### Common false negatives

- Missing subtle garment-edge, typography, jewelry, or finger errors.
- Focusing only on faces and ignoring product details.
- Overlooking artifacts because the overall composition is attractive.

## Weighted overall score

The backend calculates the same deterministic weighted score for every persona result and every image.

Let:

- \(s_i\) be the raw score from 0 to 10 for criterion \(i\).
- \(w_i\) be the criterion weight expressed as a percentage.

The overall score on a 0–10 scale is:

```text
overallScore = Σ(s_i × w_i) / 100
```

Using the required criteria:

```text
overallScore =
  (culturalAuthenticity × 15
  + luxuryPremiumAppeal × 15
  + fashionStyling × 12
  + promptAdherence × 12
  + visualAesthetics × 10
  + photorealismAuthenticity × 10
  + indianSocialContext × 8
  + craftsmanshipDetail × 7
  + commercialBrandReadiness × 6
  + aiArtifactDetection × 5) / 100
```

Because the weights total exactly 100%, the result remains on a 0–10 scale. The backend should retain the unrounded numeric value for ranking and aggregation, and round only for display according to one documented precision rule.

### Persona-level aggregation

For each image and criterion:

1. Collect the valid 0–10 scores from all valid personas.
2. Calculate the arithmetic mean.
3. Retain the valid-persona count and denominator.
4. Calculate the image's overall weighted score from the criterion means using the same formula.

This is equivalent to averaging each valid persona's overall score when every persona scores every criterion and uses the same weights. Criterion-level aggregation should still be performed explicitly so the UI can show how the result was formed.

### Five-star conversion

The initial five-star visual rating is derived from the aggregate overall score, not from an additional AI judgment:

```text
starRating = round(aggregateOverallScore)
```

The result is clamped to 0–5 for display. Because the aggregate overall score is on a 0–10 scale, the implementation must first convert it to a 0–5 scale:

```text
starRating = round(aggregateOverallScore / 2)
```

The UI should display whole stars unless half-stars are explicitly added to the response contract. A score below 1/10 may display zero filled stars; the star display is a visual summary, not an independent evaluation.

### Ranking and ties

Rank the three images by:

1. Higher aggregate overall score.
2. Higher aggregate **Commercial / Brand Readiness** score.
3. Higher aggregate **Luxury & Premium Appeal** score.
4. Fixed slot order: `image1`, then `image2`, then `image3`.

Use unrounded aggregate values for ranking. If the evaluation is partial, display the ranking with a clear warning and include the valid-persona count.

## Required reasoning and evidence discipline

Each persona must provide a short explanation for every criterion and every image. The explanation should:

- Refer to visible evidence.
- Explain why that evidence supports the score.
- Distinguish observation from interpretation.
- Note uncertainty where the image does not establish a fact.
- Avoid claiming that the image represents all Indian consumers.

The persona may use its own context to interpret evidence, but it must not invent a prompt requirement, product specification, cultural origin, price, brand, fabric, or consumer reaction that is not provided or visible.

## Framework limitations

This rubric creates consistency; it does not create objectivity. Scores can be influenced by:

- Persona prompt design.
- Underlying model behavior.
- Training-data and cultural blind spots.
- Image resolution and crop.
- Missing campaign brief or product metadata.
- Ambiguity in regional, cultural, or textile references.

The framework does not validate:

- Actual consumer purchase behavior.
- Legal or trademark compliance.
- Factual claims about textile origin or artisan production.
- Garment durability from a single image.
- Accessibility or fit for every body.
- Market performance or return rates.

The ten simulated personas remain a pre-evaluation layer. Real human participants are still required for the final evaluation.
