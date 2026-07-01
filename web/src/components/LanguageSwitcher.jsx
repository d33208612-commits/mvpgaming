import { useEffect, useRef, useState } from 'react';
import { useLang, LANGS } from '../i18n.jsx';
import { haptic } from '../telegram.js';

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGS.find((l) => l.value === lang) || LANGS[0];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', onDoc);
    return () => document.removeEventListener('pointerdown', onDoc);
  }, [open]);

  return (
    <div className="lang-wrap" ref={ref}>
      <button className={open ? 'lang-btn open' : 'lang-btn'} onClick={() => { haptic(); setOpen((o) => !o); }}>
        <span>{current.short}</span>
        <svg className="chev" viewBox="0 0 24 24" width="16" height="16" fill="none"
          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="lang-menu">
          {LANGS.map((l) => (
            <button key={l.value} className={l.value === lang ? 'lang-item active' : 'lang-item'}
              onClick={() => { setLang(l.value); setOpen(false); haptic(); }}>
              <span>{l.label}</span>
              {l.value === lang && (
                <svg className="check" viewBox="0 0 24 24" width="18" height="18" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
