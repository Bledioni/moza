import { useAuth } from '../../context/AuthContext';
import '../../styles/components/Header.css';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();

  return (
    <header className="staff-header">
      <div className="staff-header__brand">
        <button className="staff-header__burger" onClick={onMenuClick} aria-label="Hap menynë">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18" />
            <path d="M3 12h18" />
            <path d="M3 18h18" />
          </svg>
        </button>
        <div className="staff-header__monogram">ME</div>
        <h1 className="staff-header__logo">
          Moza<span className="staff-header__logo-accent">Elegance</span>
        </h1>
      </div>
      {user && (
        <div className="staff-header__user">
          <span className="staff-header__username">{user.name}</span>
          <button className="staff-header__logout-btn" onClick={logout}>
            Dil
          </button>
        </div>
      )}
    </header>
  );
}