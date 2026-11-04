import { useEffect, useRef } from 'react';
import { HashRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { UI_LANGS, type Lang } from '../../../packages/content/schema';
import { I18nProvider, useI18n } from './i18n';
import { CinematicLandingPage } from './landing/ui/index';
import { MinecraftCompanionPage } from './launch/RobloxLaunchPage';
import {
  AdventuresCatalogPage,
  CharactersShowcasePage,
  ExploreAtlasPage,
  ExploreCountryDetailPage,
} from './marketing/worlds-v06/ExploreAtlasPages';
import About from './pages/About';
import Passport from './pages/Passport';
import Play from './pages/Play';
import Story from './pages/Story';
import { ParentPortalPage } from './parent/index';
import { AdultStorefront } from './storefront/index';

const languageNames: Record<Lang, string> = {
  en: 'English',
  fr: 'Français',
  'ar-LB': 'العربية · لبنان',
  'ar-EG': 'العربية · مصر',
  'ar-IQ': 'العربية · العراق',
  ko: '한국어',
};

// Synchronize direct path navigation (e.g. /play/FR or /parents/shop) into HashRouter on initial load
if (
  typeof window !== 'undefined' &&
  window.location.pathname !== '/' &&
  window.location.pathname !== '/index.html' &&
  !window.location.hash
) {
  window.history.replaceState(
    null,
    '',
    `/#${window.location.pathname}${window.location.search}`
  );
}

function Shell() {
  const { lang, setLang, t } = useI18n();
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);
  const previousPath = useRef(pathname);

  useEffect(() => {
    if (previousPath.current !== pathname) {
      main.current?.focus({ preventScroll: true });
      previousPath.current = pathname;
    }
  }, [pathname]);

  const isFullBleed = !pathname.startsWith('/story/');

  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          main.current?.focus();
        }}
      >
        {t('nav.skip', 'Skip to content')}
      </a>
      <header className="site-header" data-testid="unified-site-header">
        <Link className="brand" to="/" aria-label="MiraVerse Home">
          <img
            src="/art/v08/brand-crest.svg"
            alt=""
            width={34}
            height={34}
            style={{ borderRadius: '8px', flexShrink: 0 }}
          />
          <span>{t('app.title', 'MiraVerse')}</span>
        </Link>

        <nav aria-label={t('nav.label', 'Main navigation')}>
          <NavLink to="/" end>
            {t('nav.home', 'Home')}
          </NavLink>
          <NavLink to="/explore">
            Explore Worlds
          </NavLink>
          <NavLink to="/adventures">
            Adventures
          </NavLink>
          <NavLink to="/passport">
            {t('nav.passport', 'Passport')}
          </NavLink>
          <NavLink to="/gifts">
            Gifts (18+)
          </NavLink>
          <NavLink to="/parents">
            For Parents
          </NavLink>
          <NavLink to="/play/LB" className="nav-cta-roblox" data-testid="header-cta-play-roblox">
            ▶ Play on Roblox
          </NavLink>
        </nav>

        <label className="language-picker" htmlFor="ui-language">
          <span>{t('nav.language', 'Language')}</span>
          <select
            id="ui-language"
            value={lang}
            onChange={(event) => setLang(event.target.value as Lang)}
            style={{
              background: '#131F38',
              color: '#FFF8EE',
              border: '1px solid rgba(244, 162, 97, 0.5)',
              minBlockSize: '36px',
              padding: '4px 8px',
              borderRadius: '8px',
            }}
          >
            {UI_LANGS.map((locale) => (
              <option key={locale} value={locale} lang={locale}>
                {languageNames[locale]}
              </option>
            ))}
          </select>
        </label>
      </header>
      <main
        id="main-content"
        className="site-main"
        ref={main}
        tabIndex={-1}
        style={
          isFullBleed
            ? { maxInlineSize: '100%', width: '100%', margin: 0, padding: 0 }
            : undefined
        }
      >
        <Routes>
          <Route path="/" element={<CinematicLandingPage />} />
          <Route path="/explore" element={<ExploreAtlasPage />} />
          <Route path="/explore/:country" element={<ExploreCountryDetailPage />} />
          <Route path="/adventures" element={<AdventuresCatalogPage />} />
          <Route path="/characters" element={<CharactersShowcasePage />} />
          <Route path="/play" element={<Play />} />
          <Route path="/play/:country" element={<Play />} />
          <Route path="/legacy-game" element={<Play />} />
          <Route path="/minecraft" element={<MinecraftCompanionPage />} />
          <Route path="/story/:lang" element={<Story />} />
          <Route path="/passport" element={<Passport />} />
          <Route path="/about" element={<About />} />
          <Route path="/shop" element={<AdultStorefront />} />
          <Route path="/gifts" element={<ParentPortalPage section="gifts" />} />
          <Route path="/gifts/redeem" element={<ParentPortalPage section="redeem" />} />
          <Route path="/parents" element={<ParentPortalPage section="overview" />} />
          <Route path="/parents/sign-in" element={<ParentPortalPage section="sign-in" />} />
          <Route path="/parent/dashboard" element={<ParentPortalPage section="dashboard" />} />
          <Route path="/parents/dashboard" element={<ParentPortalPage section="dashboard" />} />
          <Route path="/parents/shop" element={<AdultStorefront />} />
          <Route path="/parents/gifts" element={<ParentPortalPage section="gifts" />} />
          <Route path="/parents/gifts/redeem" element={<ParentPortalPage section="redeem" />} />
          <Route path="/parents/orders" element={<ParentPortalPage section="orders" />} />
          <Route path="/account" element={<ParentPortalPage section="settings" />} />
          <Route path="/parents/settings" element={<ParentPortalPage section="settings" />} />
          <Route path="/legal/privacy" element={<ParentPortalPage section="privacy" />} />
          <Route path="/privacy" element={<ParentPortalPage section="privacy" />} />
          <Route path="/legal/terms" element={<ParentPortalPage section="terms" />} />
          <Route path="/terms" element={<ParentPortalPage section="terms" />} />
          <Route path="/refunds" element={<ParentPortalPage section="refunds" />} />
          <Route path="/help" element={<ParentPortalPage section="support" />} />
          <Route path="/support" element={<ParentPortalPage section="support" />} />
          <Route
            path="*"
            element={
              <section style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                <h1>{t('route.notFound', 'Page not found')}</h1>
                <Link to="/">{t('nav.home', 'Return Home')}</Link>
              </section>
            }
          />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <HashRouter>
        <Shell />
      </HashRouter>
    </I18nProvider>
  );
}
