import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { RTL, type Story as StoryData } from '../../../../packages/content/schema';
import { getStory } from '../lib/content';
import '../components/story/story.css';

function Reader({ story }: { story: StoryData }) {
  const [index, setIndex] = useState(0);
  const [gloss, setGloss] = useState(false);
  const [review, setReview] = useState(false);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const rtl = RTL.includes(story.lang);
  const direction = rtl ? 'rtl' : 'ltr';
  const scene = story.scenes[index];
  const last = index === story.scenes.length - 1;
  useEffect(() => {
    if (last) setReview(true);
  }, [last]);
  const move = useCallback((delta: number) => {
    setIndex(current => Math.max(0, Math.min(story.scenes.length - 1, current + delta)));
  }, [story.scenes.length]);

  useEffect(() => {
    const navigate = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && target.closest('input, textarea, select, [contenteditable="true"], [role="slider"]')) return;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      move((event.key === 'ArrowRight' ? 1 : -1) * (rtl ? -1 : 1));
    };
    window.addEventListener('keydown', navigate);
    return () => window.removeEventListener('keydown', navigate);
  }, [move, rtl]);

  if (!scene) return <main className="story-reader"><h1>Story coming soon</h1><Link to="/">Explore MiraVerse</Link></main>;

  return (
    <main className="story-reader" dir="ltr">
      <header>
        <h1 lang={story.lang} dir={direction}>{story.title}</h1>
        <p className="story-english-title" lang="en">{story.title_en}</p>
        <ul className="story-characters" aria-label="Story characters">
          {story.characters.map((character, position) => (
            <li key={`${character.name}-${position}`}>
              <bdi lang={story.lang}>{character.name}</bdi>
              <span>{character.role.replace(/_/g, ' ')}</span>
              {character.note && <span dir="auto">{character.note}</span>}
            </li>
          ))}
        </ul>
      </header>

      <article aria-label="Current scene"
        onTouchStart={event => {
          const point = event.touches[0];
          touch.current = event.touches.length === 1 ? { x: point.clientX, y: point.clientY } : null;
        }}
        onTouchCancel={() => { touch.current = null; }}
        onTouchEnd={event => {
          const start = touch.current;
          touch.current = null;
          const end = event.changedTouches[0];
          if (!start || !end || event.touches.length) return;
          const dx = end.clientX - start.x;
          const dy = end.clientY - start.y;
          if (Math.abs(dx) >= 60 && Math.abs(dx) > Math.abs(dy) * 1.5) move((dx < 0 ? 1 : -1) * (rtl ? -1 : 1));
        }}>
        <p className="story-counter" role="status" aria-live="polite" aria-atomic="true">Scene {index + 1} / {story.scenes.length}</p>
        <img key={`${story.country}-${scene.id}`} className="story-illustration"
          src={`/art/${story.country}/${scene.id}.svg`} alt="" width="960" height="540"
          onError={event => {
            const image = event.currentTarget;
            if (image.dataset.fallback) {
              image.hidden = true;
              return;
            }
            image.dataset.fallback = 'true';
            image.src = `/art/${story.country}/cover.svg`;
          }} />
        <div lang={story.lang} dir={direction}>
          <h2>{scene.title}</h2>
          <p className="story-text">{scene.text}</p>
        </div>
        <button type="button" aria-expanded={gloss} aria-controls="story-gloss" onClick={() => setGloss(value => !value)}>
          {gloss ? 'Hide English gloss' : 'Show English gloss'}
        </button>
        <div id="story-gloss" hidden={!gloss} lang="en" dir="ltr">
          <p className="story-text">{scene.gloss_en?.trim() || 'An English gloss is not available for this scene yet. You can explore the vocabulary below.'}</p>
        </div>
      </article>

      <nav className="story-navigation" aria-label="Scene navigation" dir={direction}>
        <button type="button" disabled={index === 0} onClick={() => move(-1)}>
          <span aria-hidden="true">{rtl ? '→' : '←'}</span> Previous
        </button>
        <button type="button" disabled={last} onClick={() => move(1)}>
          Next <span aria-hidden="true">{rtl ? '←' : '→'}</span>
        </button>
      </nav>

      <section className="story-review" aria-label="Vocabulary review">
        <details open={review} onToggle={event => setReview(event.currentTarget.open)}>
          <summary>Review {Math.min(10, story.vocab.length)} words</summary>
          <ul className="story-vocab">
            {story.vocab.slice(0, 10).map((entry, position) => (
              <li key={`${entry.word}-${position}`}>
                <strong lang={story.lang} dir={direction}>{entry.word}</strong>
                <span lang="en" dir="ltr">{entry.translit}</span>
                <span lang="en" dir="ltr">{entry.en}</span>
              </li>
            ))}
          </ul>
        </details>
        <Link className="story-play" to={`/play/${story.country}`}>Play and explore {story.country} <span aria-hidden="true">→</span></Link>
      </section>
    </main>
  );
}

export default function Story() {
  const { lang } = useParams<{ lang: string }>();
  const story = lang ? getStory(lang) : undefined;
  if (!story) return <main className="story-reader"><h1>Story not found</h1><p>Choose a story to begin your adventure.</p><Link to="/">Explore MiraVerse</Link></main>;
  return <Reader key={story.lang} story={story} />;
}
