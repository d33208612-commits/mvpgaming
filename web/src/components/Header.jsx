import { useApp } from '../store.jsx';

export default function Header({ title, subtitle, back, action }) {
  const { navigate } = useApp();
  return (
    <header className="header">
      {back && (
        <button className="icon-btn" onClick={() => navigate(back)} aria-label="Назад">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}
      <div className="header-titles">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
