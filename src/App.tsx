import { useMemo, useState } from 'react';
import type { EvaluationResponse, ImageSlot } from './types';

const slots: Omit<ImageSlot, 'file' | 'previewUrl' | 'error'>[] = [
  { imageId: 'image1', slot: 1, modelName: 'GPT-Image-2.5' },
  { imageId: 'image2', slot: 2, modelName: 'Nano Banana 2.1' },
  { imageId: 'image3', slot: 3, modelName: 'Nano Banana Pro' },
];
const criteria = ['Indian Cultural Authenticity', 'Luxury & Premium Appeal', 'Fashion & Styling', 'Prompt Adherence', 'Visual Aesthetics', 'Photorealism & Authenticity', 'Indian Social Context', 'Craftsmanship & Detail', 'Commercial / Brand Readiness', 'AI Artifact Detection'];
const personaMeta = [
  ['north-delhi-brand-strategist', 'Aditi Mehra', 'New Delhi', 'North India'],
  ['north-jaipur-working-parent', 'Raghav Sharma', 'Jaipur', 'North India'],
  ['south-bengaluru-product-designer', 'Nandini Rao', 'Bengaluru', 'South India'],
  ['south-kochi-finance-professional', 'Arjun Mathew', 'Kochi', 'South India'],
  ['south-chennai-student-creator', 'Meera Krishnan', 'Chennai', 'South India'],
  ['west-mumbai-entrepreneur', 'Sana Merchant', 'Mumbai', 'West India'],
  ['west-ahmedabad-textile-professional', 'Devika Shah', 'Ahmedabad', 'West India'],
  ['east-kolkata-creative-professional', 'Ishita Sen', 'Kolkata', 'East India'],
  ['east-bhubaneswar-public-sector-professional', 'Pranav Das', 'Bhubaneswar', 'East India'],
  ['northeast-guwahati-consultant', 'Tashi Deka', 'Guwahati', 'Northeast India'],
] as const;

function App() {
  const [page, setPage] = useState<'setup' | 'progress' | 'personas' | 'results'>('setup');
  const [images, setImages] = useState<ImageSlot[]>(slots.map((slot) => ({ ...slot, file: null, previewUrl: null, error: null })));
  const [result, setResult] = useState<EvaluationResponse | null>(null);
  const [selectedPersona, setSelectedPersona] = useState(0);
  const [error, setError] = useState('');
  const ready = images.every((image) => image.file && !image.error);
  const selectedResult = result?.persona_results[selectedPersona];

  const updateImage = (index: number, file: File | null) => {
    setImages((current) => current.map((image, imageIndex) => {
      if (imageIndex !== index) return image;
      if (!file) return { ...image, file: null, previewUrl: null, error: null };
      const validType = ['image/png', 'image/jpeg', 'image/webp'].includes(file.type);
      const validSize = file.size <= 8 * 1024 * 1024;
      return { ...image, file: validType && validSize ? file : null, previewUrl: validType && validSize ? URL.createObjectURL(file) : null, error: !validType ? 'Use PNG, JPEG, or WebP.' : !validSize ? 'Image must be 8 MB or smaller.' : null };
    }));
  };

  const runEvaluation = async () => {
    if (!ready) return;
    setError('');
    setPage('progress');
    const form = new FormData();
    images.forEach((image) => form.append(image.imageId, image.file!));
    try {
      const response = await fetch('/.netlify/functions/run-evaluation', { method: 'POST', body: form });
      const data = await response.json() as EvaluationResponse | { error?: string };
      if (!response.ok) throw new Error('error' in data && data.error ? data.error : 'Evaluation failed');
      setResult(data as EvaluationResponse);
      setPage('personas');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Evaluation failed');
      setPage('setup');
    }
  };

  const nav = useMemo(() => ['setup', 'progress', 'personas', 'results'] as const, []);
  return <main className="app-shell">
    <header className="topbar"><div><span className="eyebrow">PRE-EVALUATION LAB</span><h1>Indian Fashion AI Evaluation</h1><p>Compare AI-generated fashion imagery through diverse Indian persona perspectives.</p></div><span className="badge">Simulated perspectives, not participants</span></header>
    <nav className="steps" aria-label="Evaluation stages">{nav.map((item, index) => <button key={item} className={page === item ? 'step active' : 'step'} onClick={() => result && setPage(item)} disabled={!result && index > 0}>{index + 1}. {item.replace(/^\w/, (letter) => letter.toUpperCase())}</button>)}</nav>
    {error && <div className="alert error">{error}</div>}
    {page === 'setup' && <section><div className="section-heading"><span className="eyebrow">STEP 1</span><h2>Evaluation setup</h2><p>Upload one image for each fixed model slot. The mapping cannot be changed.</p></div><div className="upload-grid">{images.map((image, index) => <UploadCard key={image.imageId} image={image} onChange={(file) => updateImage(index, file)} />)}</div><button className="primary" disabled={!ready} onClick={runEvaluation}>Run Evaluation</button><p className="muted">10 personas × 3 images = 30 image evaluations.</p></section>}
    {page === 'progress' && <ProgressPage result={result} />}
    {page === 'personas' && result && <PersonaPage selectedPersona={selectedPersona} setSelectedPersona={setSelectedPersona} selectedResult={selectedResult} images={images} />}
    {page === 'results' && result && <ResultsPage result={result} images={images} />}
  </main>;
}

function UploadCard({ image, onChange }: { image: ImageSlot; onChange: (file: File | null) => void }) {
  return <article className="upload-card"><div className="card-title"><span className="eyebrow">IMAGE {image.slot} OF 3</span><h3>{image.modelName}</h3></div>{image.previewUrl ? <img className="preview" src={image.previewUrl} alt={`${image.modelName} upload preview`} /> : <label className="dropzone">Choose image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => onChange(event.target.files?.[0] ?? null)} /></label>}{image.error && <p className="field-error">{image.error}</p>}{image.previewUrl && <div className="card-actions"><label className="text-button">Replace<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => onChange(event.target.files?.[0] ?? null)} /></label><button className="text-button" onClick={() => onChange(null)}>Remove</button></div>}</article>;
}

function ProgressPage({ result }: { result: EvaluationResponse | null }) {
  const completed = result?.completed_image_evaluations ?? 0;
  return <section><div className="section-heading"><span className="eyebrow">STEP 2</span><h2>Evaluating 10 Indian Personas</h2><p>Each persona independently evaluates all 3 images using the same 10 criteria.</p></div><div className="progress-number">{completed} / 30 <span>image evaluations completed</span></div><div className="persona-list">{personaMeta.map(([id, name, city, region]) => { const status = result?.persona_results.find((item) => item.persona_id === id)?.status; return <div className="persona-row" key={id}><span className="avatar">{name.split(' ').map((part) => part[0]).join('')}</span><div><strong>{name}</strong><small>{city} · {region}</small></div><span className={`status ${status ?? 'waiting'}`}>{status === 'valid' ? 'Completed' : status === 'failed' ? 'Failed' : result ? 'Evaluating' : 'Waiting'}</span></div>; })}</div>{!result && <p className="muted">The server is processing all 30 image evaluations. This prototype updates the full progress summary when the request completes.</p>}</section>;
}

function PersonaPage({ selectedPersona, setSelectedPersona, selectedResult, images }: { selectedPersona: number; setSelectedPersona: (value: number) => void; selectedResult: EvaluationResponse['persona_results'][number] | undefined; images: ImageSlot[] }) {
  return <section><div className="section-heading"><span className="eyebrow">STEP 3</span><h2>Persona results</h2><p>Inspect each simulated perspective without treating it as a real participant.</p></div><div className="persona-tabs">{personaMeta.map(([id, name], index) => <button className={selectedPersona === index ? 'tab active' : 'tab'} key={id} onClick={() => setSelectedPersona(index)}>{name}</button>)}</div>{selectedResult?.status === 'failed' ? <div className="alert error">{selectedResult.persona_name} failed: {friendlyError(selectedResult.error_code)}</div> : <div className="result-grid">{selectedResult?.evaluations.map((evaluation) => { const image = images.find((item) => item.imageId === evaluation.image_id); return <article className="result-card" key={evaluation.image_id}><img className="result-image" src={image?.previewUrl ?? ''} alt={`${evaluation.model_name} evaluated image`} /><h3>{evaluation.model_name}</h3><div className="score-large">{evaluation.weighted_score.toFixed(2)}<span>/10</span></div><p className="muted">Confidence: {Math.round(evaluation.confidence * 100)}%</p><div className="criterion-list">{criteria.map((criterion, index) => <div className="criterion" key={criterion}><span>{criterion}</span><strong>{Object.values(evaluation.criterion_scores)[index] ?? '—'}/10</strong></div>)}</div><details><summary>Reasoning and observations</summary><div className="details-copy">{Object.entries(evaluation.criterion_reasoning).map(([key, value]) => <p key={key}><strong>{key}</strong>: {value}</p>)}<h4>Strengths</h4><p>{evaluation.strengths.join(' · ') || 'None provided'}</p><h4>Concerns</h4><p>{evaluation.concerns.join(' · ') || 'None provided'}</p><h4>India-specific observations</h4><p>{evaluation.india_specific_observations.join(' · ') || 'None provided'}</p></div></details></article>; })}</div>}</section>;
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
  return <section><div className="section-heading"><span className="eyebrow">STEP 4</span><h2>Final results</h2><p className="disclaimer">{result.status === 'completed' ? 'Completed — 10 of 10 personas valid.' : result.status === 'completed_with_warnings' ? `Partial evaluation — ${result.valid_persona_count} of 10 personas valid.` : 'Evaluation failed — no reliable aggregate is available.'}</p></div><div className="result-grid final-grid">{result.images.map((item) => { const image = images.find((candidate) => candidate.imageId === item.image_id); return <article className="result-card" key={item.image_id}><div className="stars" aria-label={`${item.star_rating ?? 0} of 5 stars`}>{'★'.repeat(item.star_rating ?? 0)}<span>{'★'.repeat(5 - (item.star_rating ?? 0))}</span></div><img className="result-image" src={image?.previewUrl ?? ''} alt={`${item.model_name} final result`} /><h3>{item.model_name}</h3><div className="score-large">{item.overall_score?.toFixed(2) ?? '—'}<span>/10</span></div><p>Rank: {item.rank ?? '—'} · {item.valid_persona_count}/10 personas</p><div className="criterion-list">{Object.entries(item.criterion_scores).map(([key, value]) => <div className="criterion" key={key}><span>{key}</span><strong>{value}/10</strong></div>)}</div><h4>Strengths</h4><p>{item.strengths.join(' · ') || 'Not available'}</p><h4>Concerns</h4><p>{item.concerns.join(' · ') || 'Not available'}</p></article>; })}</div><div className="insight-grid"><article className="insight"><h3>Overall Winner</h3><p>{result.overall_winner ? result.images.find((image) => image.image_id === result.overall_winner)?.model_name : 'No reliable winner'}</p></article><article className="insight"><h3>Why?</h3><p>{result.why}</p></article><article className="insight"><h3>India-specific insights</h3><p>{result.india_specific_insights.join(' · ') || 'None available'}</p></article><article className="insight"><h3>Common strengths</h3><p>{result.common_strengths.join(' · ') || 'None available'}</p></article><article className="insight"><h3>Common concerns</h3><p>{result.common_concerns.join(' · ') || 'None available'}</p></article><article className="insight"><h3>Persona agreement</h3><p>{result.agreement.join(' · ') || 'Review individual scores.'}</p></article><article className="insight"><h3>Persona disagreement</h3><p>{result.disagreement.join(' · ') || 'Review individual scores.'}</p></article></div></section>;
}

export default App;
