import { useMemo, useState } from 'react';
import type { EvaluationResponse, ImageSlot, PersonaResult, PersonaEvaluation } from './types';
import { ApiError, AGENT_API_PATH, readApiResponse } from './api';
import { aggregateClientResults, criteria as criterionDefinitions } from './client-aggregate';
import { PERSONAS } from '../server/personas';
import { evaluateWithCooldown, REQUEST_SPACING_MS } from './evaluation-queue';

const slots: Omit<ImageSlot, 'file' | 'previewUrl' | 'error'>[] = [
  { imageId: 'image1', slot: 1, modelName: 'GPT-Image-2.5' },
  { imageId: 'image2', slot: 2, modelName: 'Nano Banana 2.1' },
  { imageId: 'image3', slot: 3, modelName: 'Nano Banana Pro' },
];
const criteria = ['Indian Cultural Authenticity', 'Luxury & Premium Appeal', 'Fashion & Styling', 'Prompt Adherence', 'Visual Aesthetics', 'Photorealism & Authenticity', 'Indian Social Context', 'Craftsmanship & Detail', 'Commercial / Brand Readiness', 'AI Artifact Detection'];
const personaMeta = PERSONAS.map((persona) => [persona.personaId, persona.name, persona.city, persona.region] as const);
const TOTAL_JOBS = personaMeta.length * slots.length;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read image'));
    reader.onerror = () => reject(new Error('Could not read image'));
    reader.readAsDataURL(file);
  });
}

function App() {
  const [page, setPage] = useState<'setup' | 'progress' | 'personas' | 'results'>('setup');
  const [images, setImages] = useState<ImageSlot[]>(slots.map((slot) => ({ ...slot, file: null, previewUrl: null, error: null })));
  const [result, setResult] = useState<EvaluationResponse | null>(null);
  const [selectedPersona, setSelectedPersona] = useState(0);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  const [queueMessage, setQueueMessage] = useState('');
  const [jobStatuses, setJobStatuses] = useState<Record<string, 'Waiting' | 'Evaluating' | 'Completed' | 'Failed'>>({});
  const ready = images.every((image) => image.file && !image.error);
  const selectedResult = result?.persona_results[selectedPersona];

  const updateImage = (index: number, file: File | null) => {
    setResult(null);
    setImages((current) => current.map((image, imageIndex) => {
      if (imageIndex !== index) return image;
      if (!file) return { ...image, file: null, previewUrl: null, error: null };
      const validType = ['image/png', 'image/jpeg', 'image/webp'].includes(file.type);
      const validSize = file.size <= 8 * 1024 * 1024;
      return { ...image, file: validType && validSize ? file : null, previewUrl: validType && validSize ? URL.createObjectURL(file) : null, error: !validType ? 'Use PNG, JPEG, or WebP.' : !validSize ? 'Image must be 8 MB or smaller.' : null };
    }));
  };

  const runEvaluation = async (resume = false) => {
    if (!ready || running) return;
    setError('');
    setPage('progress');
    setRunning(true);
    const previousResult = result;
    const savedEvaluations = resume ? result?.persona_results.flatMap((persona) => persona.evaluations) ?? [] : [];
    setResult(null);
    try {
      const dataUrls = await Promise.all(images.map(async (image) => ({ ...image, dataUrl: await fileToDataUrl(image.file!) })));
      const jobs = personaMeta.flatMap(([personaId]) => images.map((image) => ({ personaId, image, dataUrl: dataUrls.find((item) => item.imageId === image.imageId)!.dataUrl })));
      const evaluations: PersonaEvaluation[] = [...savedEvaluations];
      const failures = new Map<string, { image_id: 'image1' | 'image2' | 'image3'; model_name: string; error_code: string; attempts: number }>();
      const statuses: Record<string, 'Waiting' | 'Evaluating' | 'Completed' | 'Failed'> = {};
      jobs.forEach((job) => { statuses[`${job.personaId}:${job.image.imageId}`] = evaluations.some((item) => item.persona_id === job.personaId && item.image_id === job.image.imageId) ? 'Completed' : 'Waiting'; });
      setJobStatuses({ ...statuses });
      let cursor = 0;
      let stopReason: string | null = null;
      let sentRequest = false;
      const worker = async () => {
        while (cursor < jobs.length) {
          const job = jobs[cursor];
          cursor += 1;
          const key = `${job.personaId}:${job.image.imageId}`;
          if (statuses[key] === 'Completed') continue;
          if (stopReason) {
            failures.set(key, { image_id: job.image.imageId, model_name: job.image.modelName, error_code: stopReason, attempts: 0 });
            statuses[key] = 'Failed';
            continue;
          }
          if (sentRequest) {
            setQueueMessage('Waiting 45 seconds between requests to reduce token-limit pressure.');
            await new Promise((resolve) => setTimeout(resolve, REQUEST_SPACING_MS));
          }
          sentRequest = true;
          setQueueMessage('Evaluating one image at a time.');
          statuses[key] = 'Evaluating';
          setJobStatuses({ ...statuses });
          try {
            const payload = await evaluateWithCooldown(async () => {
              const response = await fetch(AGENT_API_PATH, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ personaId: job.personaId, imageId: job.image.imageId, modelName: job.image.modelName, mimeType: job.image.file!.type, dataUrl: job.dataUrl }),
            });
              return readApiResponse<{ success: true; evaluation: PersonaEvaluation }>(response, AGENT_API_PATH);
            }, (milliseconds) => setQueueMessage(`Provider rate limit reached. Waiting ${Math.ceil(milliseconds / 1000)} seconds before retrying.`));
            evaluations.push(payload.evaluation);
            statuses[key] = 'Completed';
          } catch (caught) {
            const code = caught instanceof ApiError ? caught.code : caught instanceof Error ? caught.message.slice(0, 180) : 'evaluation_failed';
            if (caught instanceof ApiError && (caught.status === 429 || code === 'provider_authentication_failed' || code === 'server_provider_configuration_missing' || code === 'provider_model_unavailable')) stopReason = code;
            if (caught instanceof ApiError && caught.status === 429) {
              const cooldown = Math.ceil((caught.retryAfterMs ?? 60_000) / 1000);
              setError(`Provider quota reached. Successful evaluations are saved in this session. Wait at least ${cooldown} seconds before retrying incomplete evaluations; a daily quota may require waiting for its reset.`);
            }
            failures.set(key, { image_id: job.image.imageId, model_name: job.image.modelName, error_code: code, attempts: 1 });
            statuses[key] = 'Failed';
          }
          setJobStatuses({ ...statuses });
        }
      };
      await worker();
      setJobStatuses({ ...statuses });
      const personaResults: PersonaResult[] = personaMeta.map(([personaId, personaName]) => {
        const personaEvaluations = evaluations.filter((item) => item.persona_id === personaId);
        const failedEvaluations = jobs.filter((job) => job.personaId === personaId).map((job) => failures.get(`${personaId}:${job.image.imageId}`)).filter((failure): failure is NonNullable<typeof failure> => Boolean(failure));
        return { persona_id: personaId, persona_name: personaName, status: personaEvaluations.length === 3 ? 'valid' : personaEvaluations.length ? 'partial' : 'failed', evaluations: personaEvaluations, failed_evaluations: failedEvaluations, error_code: failedEvaluations[0]?.error_code ?? null };
      });
      setResult(aggregateClientResults(personaResults));
      setPage('personas');
    } catch (caught) {
      if (resume) setResult(previousResult);
      setError(caught instanceof Error ? caught.message : 'Evaluation failed');
      setPage('setup');
    } finally {
      setRunning(false);
      setQueueMessage('');
    }
  };

  const nav = useMemo(() => ['setup', 'progress', 'personas', 'results'] as const, []);
  return <main className="app-shell">
    <header className="topbar"><div><span className="eyebrow">PRE-EVALUATION LAB</span><h1>Indian Fashion AI Evaluation</h1><p>Compare AI-generated fashion imagery through diverse Indian persona perspectives.</p></div><span className="badge">Simulated perspectives, not participants</span></header>
    <nav className="steps" aria-label="Evaluation stages">{nav.map((item, index) => <button key={item} className={page === item ? 'step active' : 'step'} onClick={() => result && setPage(item)} disabled={!result && index > 0}>{index + 1}. {item.replace(/^\w/, (letter) => letter.toUpperCase())}</button>)}</nav>
    {result && result.completed_image_evaluations < TOTAL_JOBS && !running && <button className="primary" onClick={() => runEvaluation(true)}>Retry incomplete evaluations</button>}
    {queueMessage && <p role="status">{queueMessage}</p>}
    {error && <div className="alert error">{error}</div>}
    {page === 'setup' && <section><div className="section-heading"><span className="eyebrow">STEP 1</span><h2>Evaluation setup</h2><p>Upload one image for each fixed model slot. The mapping cannot be changed.</p></div><div className="upload-grid">{images.map((image, index) => <UploadCard key={image.imageId} image={image} onChange={(file) => updateImage(index, file)} />)}</div><button className="primary" disabled={!ready} onClick={() => runEvaluation()}>Run Evaluation</button><p className="muted">{personaMeta.length} personas × 3 images = {TOTAL_JOBS} image evaluations.</p></section>}
    {page === 'progress' && <ProgressPage result={result} jobStatuses={jobStatuses} />}
    {page === 'personas' && result && <PersonaPage selectedPersona={selectedPersona} setSelectedPersona={setSelectedPersona} selectedResult={selectedResult} images={images} />}
    {page === 'results' && result && <ResultsPage result={result} images={images} />}
  </main>;
}

function UploadCard({ image, onChange }: { image: ImageSlot; onChange: (file: File | null) => void }) {
  return <article className="upload-card"><div className="card-title"><span className="eyebrow">IMAGE {image.slot} OF 3</span><h3>{image.modelName}</h3></div>{image.previewUrl ? <img className="preview" src={image.previewUrl} alt={`${image.modelName} upload preview`} /> : <label className="dropzone">Choose image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => onChange(event.target.files?.[0] ?? null)} /></label>}{image.error && <p className="field-error">{image.error}</p>}{image.previewUrl && <div className="card-actions"><label className="text-button">Replace<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => onChange(event.target.files?.[0] ?? null)} /></label><button className="text-button" onClick={() => onChange(null)}>Remove</button></div>}</article>;
}

function ProgressPage({ result, jobStatuses }: { result: EvaluationResponse | null; jobStatuses: Record<string, 'Waiting' | 'Evaluating' | 'Completed' | 'Failed'> }) {
  const completed = result?.completed_image_evaluations ?? Object.values(jobStatuses).filter((status) => status === 'Completed').length;
  return <section><div className="section-heading"><span className="eyebrow">STEP 2</span><h2>Evaluating {personaMeta.length} Indian Personas</h2><p>Each persona independently evaluates all 3 images using the same 10 criteria.</p></div><div className="progress-number">{completed} / {TOTAL_JOBS} <span>image evaluations completed</span></div><div className="persona-list">{personaMeta.map(([id, name, city, region]) => { const personaStatuses = Object.entries(jobStatuses).filter(([key]) => key.startsWith(`${id}:`)).map(([, status]) => status); const status = result?.persona_results.find((item) => item.persona_id === id)?.status; const display = status === 'valid' ? 'Completed' : status === 'partial' ? 'Partial' : status === 'failed' ? 'Failed' : personaStatuses.includes('Failed') ? 'Failed' : personaStatuses.includes('Evaluating') ? 'Evaluating' : personaStatuses.includes('Completed') ? 'Evaluating' : 'Waiting'; return <div className="persona-row" key={id}><span className="avatar">{name.split(' ').map((part) => part[0]).join('')}</span><div><strong>{name}</strong><small>{city} · {region}</small></div><span className={`status ${display.toLowerCase()}`}>{display}</span></div>; })}</div><p className="muted">The browser queues {TOTAL_JOBS} independent jobs and sends one at a time. Failed jobs are retained without fabricated scores.</p></section>;
}

function PersonaPage({ selectedPersona, setSelectedPersona, selectedResult, images }: { selectedPersona: number; setSelectedPersona: (value: number) => void; selectedResult: EvaluationResponse['persona_results'][number] | undefined; images: ImageSlot[] }) {
  return <section><div className="section-heading"><span className="eyebrow">STEP 3</span><h2>Persona results</h2><p>Inspect each simulated perspective without treating it as a real participant.</p></div><div className="persona-tabs">{personaMeta.map(([id, name], index) => <button className={selectedPersona === index ? 'tab active' : 'tab'} key={id} onClick={() => setSelectedPersona(index)}>{name}</button>)}</div>{selectedResult?.status === 'failed' && selectedResult.evaluations.length === 0 ? <div className="alert error">{selectedResult.persona_name} failed: {friendlyError(selectedResult.error_code)}</div> : <div className="result-grid">{selectedResult?.evaluations.map((evaluation) => { const image = images.find((item) => item.imageId === evaluation.image_id); return <article className="result-card" key={evaluation.image_id}><img className="result-image" src={image?.previewUrl ?? ''} alt={`${evaluation.model_name} evaluated image`} /><h3>{evaluation.model_name}</h3><div className="score-large">{evaluation.weighted_score.toFixed(2)}<span>/10</span></div><p className="muted">Confidence: {Math.round(evaluation.confidence * 100)}%</p><div className="criterion-list">{criteria.map((criterion, index) => <div className="criterion" key={criterion}><span>{criterion}</span><strong>{evaluation.criterion_scores[criterionDefinitions[index][0]] ?? '—'}/10</strong></div>)}</div><details><summary>Reasoning and observations</summary><div className="details-copy">{Object.entries(evaluation.criterion_reasoning).map(([key, value]) => <p key={key}><strong>{key}</strong>: {value}</p>)}<h4>Strengths</h4><p>{evaluation.strengths.join(' · ') || 'None provided'}</p><h4>Concerns</h4><p>{evaluation.concerns.join(' · ') || 'None provided'}</p><h4>India-specific observations</h4><p>{evaluation.india_specific_observations.join(' · ') || 'None provided'}</p></div></details></article>; })}{selectedResult?.failed_evaluations.map((failure) => <div className="alert error" key={failure.image_id}>{selectedResult.persona_name} / {failure.model_name} failed: {friendlyError(failure.error_code)}</div>)}</div>}</section>;
}

function friendlyError(code: string | null): string {
  const messages: Record<string, string> = {
    provider_model_unavailable: 'The configured Groq vision model is unavailable. Check the deployed GROQ_MODEL value and redeploy.',
    provider_authentication_failed: 'Groq authentication failed. Check the Netlify GROQ_API_KEY configuration.',
    provider_rate_limited: 'Groq temporarily rate-limited this evaluation. Retry after a short wait.',
    provider_temporarily_unavailable: 'Groq is temporarily unavailable. Retry the evaluation.',
    provider_network_error: 'The server could not reach Groq. Retry the evaluation.',
    malformed_provider_json: 'Groq returned an unreadable evaluation response after retry.',
    invalid_persona_response: 'Groq returned an incomplete evaluation after retry.',
    server_provider_configuration_missing: 'The server is missing GROQ_API_KEY.',
  };
  return messages[code ?? ''] ?? 'This persona evaluation could not be completed.';
}

function ResultsPage({ result, images }: { result: EvaluationResponse; images: ImageSlot[] }) {
  return <section><div className="section-heading"><span className="eyebrow">STEP 4</span><h2>Final results</h2><p className="disclaimer">{result.status === 'completed' ? `Completed — ${result.completed_image_evaluations} of ${TOTAL_JOBS} image evaluations succeeded.` : result.status === 'completed_with_warnings' ? `Partial evaluation — ${result.completed_image_evaluations} of ${TOTAL_JOBS} image evaluations succeeded.` : 'Evaluation failed — no reliable aggregate is available.'}</p></div><div className="result-grid final-grid">{result.images.map((item) => { const image = images.find((candidate) => candidate.imageId === item.image_id); return <article className="result-card" key={item.image_id}><div className="stars" aria-label={`${item.star_rating ?? 0} of 5 stars`}>{'★'.repeat(item.star_rating ?? 0)}<span>{'★'.repeat(5 - (item.star_rating ?? 0))}</span></div><img className="result-image" src={image?.previewUrl ?? ''} alt={`${item.model_name} final result`} /><h3>{item.model_name}</h3><div className="score-large">{item.overall_score?.toFixed(2) ?? '—'}<span>/10</span></div><p>Rank: {item.rank ?? '—'} · {item.valid_persona_count}/{personaMeta.length} persona evaluations</p><div className="criterion-list">{Object.entries(item.criterion_scores).map(([key, value]) => <div className="criterion" key={key}><span>{key}</span><strong>{value}/10</strong></div>)}</div><h4>Strengths</h4><p>{item.strengths.join(' · ') || 'Not available'}</p><h4>Concerns</h4><p>{item.concerns.join(' · ') || 'Not available'}</p></article>; })}</div><div className="insight-grid"><article className="insight"><h3>Overall Winner</h3><p>{result.overall_winner ? result.images.find((image) => image.image_id === result.overall_winner)?.model_name : 'No reliable winner'}</p></article><article className="insight"><h3>Why?</h3><p>{result.why}</p></article><article className="insight"><h3>India-specific insights</h3><p>{result.india_specific_insights.join(' · ') || 'None available'}</p></article><article className="insight"><h3>Common strengths</h3><p>{result.common_strengths.join(' · ') || 'None available'}</p></article><article className="insight"><h3>Common concerns</h3><p>{result.common_concerns.join(' · ') || 'None available'}</p></article><article className="insight"><h3>Persona agreement</h3><p>{result.agreement.join(' · ') || 'Review individual scores.'}</p></article><article className="insight"><h3>Persona disagreement</h3><p>{result.disagreement.join(' · ') || 'Review individual scores.'}</p></article></div></section>;
}

export default App;
