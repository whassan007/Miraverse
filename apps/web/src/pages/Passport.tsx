import { useState, type FormEvent } from 'react';
import { clearStamps, loadStamps, saveStamp, verify } from '../../../../packages/shared/stamp';
import { useI18n } from '../i18n';

const COUNTRIES = [
  { id: 'LB', name: 'Lebanon', colors: ['#c8102e', '#007a3d'] },
  { id: 'EG', name: 'Egypt', colors: ['#ce1126', '#151515'] },
  { id: 'IQ', name: 'Iraq', colors: ['#ce1126', '#007a3d'] },
  { id: 'KR', name: 'South Korea', colors: ['#cd2e3a', '#0047a0'] },
  { id: 'FR', name: 'France', colors: ['#002395', '#ed2939'] },
] as const;

export default function Passport() {
  const { t, dir } = useI18n();
  const [stamps, setStamps] = useState(loadStamps);
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState('');
  const [invalid, setInvalid] = useState(false);
  function redeem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = verify(code);
    setInvalid(!result.valid);
    if (!result.valid) {
      setFeedback(t('passport.invalid', 'That souvenir code is invalid. Check the country, chapter, and every character.'));
      return;
    }
    const current = loadStamps();
    setStamps(current);
    if (current.some(stamp => stamp.country === result.country && stamp.chapter === result.chapter)) {
      setFeedback(t('passport.duplicate', 'You already collected this country and chapter stamp.'));
      return;
    }
    if (!saveStamp(result.code)) {
      setFeedback(t('passport.storageError', 'The stamp could not be saved. Check that browser storage is enabled and try again.'));
      return;
    }
    setStamps(loadStamps());
    setCode('');
    setFeedback(t('passport.saved', 'Souvenir stamp added to your passport!'));
  }
  function reset() {
    if (!clearStamps()) {
      setFeedback(t('passport.resetError', 'The passport could not be cleared. Check browser storage and try again.'));
      return;
    }
    setStamps([]);
    setCode('');
    setInvalid(false);
    setFeedback(t('passport.cleared', 'Your local passport has been cleared.'));
  }
  return (
    <main dir={dir}>
      <h1>{t('passport.title', 'My Passport')}</h1>
      <p>{t('passport.disclosure', 'Stamps are decorative local souvenirs stored only in this browser. They grant no rewards or privileges and are not synced or sent anywhere. Clearing browser data removes them.')}</p>
      <ul aria-label={t('passport.slots', 'Country souvenir stamps')} style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {COUNTRIES.map(country => {
          const stamp = stamps.find(item => item.country === country.id && item.chapter === 1);
          return (
            <li key={country.id} style={{ border: `3px solid ${country.colors[0]}`, borderInlineStart: `12px solid ${country.colors[1]}`, borderRadius: '0.5rem', padding: '1rem' }}>
              <h2>{t(`country.${country.id}`, country.name)}</h2>
              <p>{stamp ? t('passport.earned', 'Earned — Chapter 1') : t('passport.locked', 'Locked — Chapter 1')}</p>
              {stamp && <code dir="ltr" style={{ overflowWrap: 'anywhere' }}>{stamp.code}</code>}
            </li>
          );
        })}
      </ul>
      <form onSubmit={redeem}>
        <label htmlFor="souvenir-code">{t('passport.redeem', 'Redeem Souvenir Code')}</label>
        <p id="souvenir-help">{t('passport.format', 'Enter a code in the format MV-LB1-2345-HBWS. Letter case does not matter.')}</p>
        <input id="souvenir-code" name="souvenir-code" value={code} onChange={event => { setCode(event.target.value); setInvalid(false); }} dir="ltr" autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={80} required aria-invalid={invalid} aria-describedby="souvenir-help passport-feedback" />
        <button type="submit">{t('passport.submit', 'Redeem Code')}</button>
      </form>
      <p id="passport-feedback" role="status" aria-live="polite" aria-atomic="true">{feedback}</p>
      <button type="button" onClick={reset}>{t('passport.reset', 'Clear / Reset Passport')}</button>
    </main>
  );
}
