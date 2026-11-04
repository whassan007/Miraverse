import React from 'react';

export interface HeroMentorGreetingBannerProps {
  activeCountry: 'LB' | 'IQ' | 'EG' | 'FR' | 'KR';
  storyLang: 'ar-LB' | 'ar-IQ' | 'ar-EG' | 'fr' | 'ko';
  mentorName: string;
  mentorTitle: string;
  mentorPortraitUrl: string;
  mentorGreetingNative: string;
  mentorGreetingEn: string;
  primaryColorHex: string;
  accentColorHex: string;
}

const SCRIPT_BADGE_MAP: Record<HeroMentorGreetingBannerProps['storyLang'], string> = {
  'ar-LB': 'العربية اللبنانية · AR-LB',
  'ar-IQ': 'العربية العراقية · AR-IQ',
  'ar-EG': 'العربية المصرية · AR-EG',
  'fr': 'Français · FR',
  'ko': '한국어 · KO',
};

export const HeroMentorGreetingBanner: React.FC<HeroMentorGreetingBannerProps> = ({
  activeCountry,
  storyLang,
  mentorName,
  mentorTitle,
  mentorPortraitUrl,
  mentorGreetingNative,
  mentorGreetingEn,
  primaryColorHex,
  accentColorHex,
}) => {
  const isRtl = storyLang.startsWith('ar');

  return (
    <div
      data-testid="hero-mentor-greeting-banner"
      data-country={activeCountry}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '14px',
        border: `1px solid ${accentColorHex}66`,
        background: 'rgba(15, 23, 42, 0.88)',
        padding: '10px 14px',
        boxShadow: `0 8px 24px -10px ${primaryColorHex}40`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <img
          src={mentorPortraitUrl}
          alt={`${mentorName} — ${mentorTitle}`}
          width={36}
          height={36}
          style={{
            borderRadius: '50%',
            border: `2px solid ${accentColorHex}`,
            objectFit: 'cover',
            flexShrink: 0,
          }}
        />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '6px',
              marginBottom: '2px',
            }}
          >
            <strong style={{ fontSize: '12px', color: '#FEF08A' }}>
              {mentorName} · {mentorTitle}
            </strong>
            <span
              style={{
                borderRadius: '999px',
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: 800,
                backgroundColor: `${primaryColorHex}44`,
                border: `1px solid ${accentColorHex}66`,
                color: '#FFF8EE',
              }}
            >
              {SCRIPT_BADGE_MAP[storyLang]}
            </span>
          </div>

          <div
            data-testid="hero-mentor-greeting-native"
            lang={storyLang}
            dir={isRtl ? 'rtl' : 'ltr'}
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#A7F3D0',
              textAlign: isRtl ? 'right' : 'left',
              marginBottom: '2px',
            }}
          >
            {mentorGreetingNative}
          </div>

          <div
            data-testid="hero-mentor-greeting-en"
            lang="en"
            dir="ltr"
            style={{
              fontSize: '11.5px',
              fontStyle: 'italic',
              color: '#CBD5E1',
            }}
          >
            &ldquo;{mentorGreetingEn}&rdquo;
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroMentorGreetingBanner;
