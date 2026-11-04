import { useEffect, useRef } from 'react';
import { HashRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { UI_LANGS, type Lang } from '../../../packages/content/schema';
import { I18nProvider, useI18n } from './i18n';
import Home from './pages/Home';
import Story from './pages/Story';
import Play from './pages/Play';
import Passport from './pages/Passport';
import About from './pages/About';

const languageNames: Record<Lang, string> = {
  en: 'English', fr: 'Français', 'ar-LB': 'العربية · لبنان',
  'ar-EG': 'العربية · مصر', 'ar-IQ': 'العربية · العراق', ko: '한국어',
};

function Shell() {
  const { lang, setLang, t } = useI18n();
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);
  const previousPath = useRef(pathname);
  useEffect(() => {
    if (previousPath.current !== pathname) {
      main.current?.focus();
      previousPath.current = pathname;
    }
  }, [pathname]);
  return (
    <>
      <a className="skip-link" href="#main-content" onClick={(event) => {
        event.preventDefault();
        main.current?.focus();
      }}>{t('nav.skip', 'Skip to content')}</a>
      <header className="site-header">
        <Link className="brand" to="/">{t('app.title')}</Link>
        <nav aria-label={t('nav.label', 'Main navigation')}>
          <NavLink to="/" end>{t('nav.home')}</NavLink>
          <NavLink to="/passport">{t('nav.passport')}</NavLink>
          <NavLink to="/about">{t('nav.about')}</NavLink>
        </nav>
        <label className="language-picker" htmlFor="ui-language">
          <span>{t('nav.language')}</span>
          <select id="ui-language" value={lang} onChange={(event) => setLang(event.target.value as Lang)}>
            {UI_LANGS.map((locale) => (
              <option key={locale} value={locale} lang={locale}>{languageNames[locale]}</option>
            ))}
          </select>
        </label>
      </header>
      <main id="main-content" className="site-main" ref={main} tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/story/:lang" element={<Story />} />
          <Route path="/play/:country" element={<Play />} />
          <Route path="/passport" element={<Passport />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<section><h1>{t('route.notFound', 'Page not found')}</h1><Link to="/">{t('nav.home')}</Link></section>} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return <I18nProvider><HashRouter><Shell /></HashRouter></I18nProvider>;
}
