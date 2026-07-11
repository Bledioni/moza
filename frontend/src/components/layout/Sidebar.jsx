import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/components/Sidebar.css';

const icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  fustane: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3.5c0 1.2.9 2 2 2h2c1.1 0 2-.8 2-2" />
      <path d="M9 3.5 5 8l2 2-1.5 10.5a1 1 0 0 0 1 1.5h11a1 1 0 0 0 1-1.5L17 10l2-2-4-4.5" />
    </svg>
  ),
  kategorite: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </svg>
  ),
  rezervime: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M3 9.5h18" />
      <path d="M8 2.5v4M16 2.5v4" />
      <path d="M8 14l2.2 2.2L15.5 11" />
    </svg>
  ),
  kerkesat: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
      <path d="M8 9h8M8 13h5" />
    </svg>
  ),
};

const sections = [
  {
    label: 'Kryesore',
    links: [{ to: '/staff/dashboard', label: 'Paneli', icon: 'dashboard' }],
  },
  {
    label: 'Menaxhim',
    links: [
      { to: '/staff/fustane', label: 'Fustanet', icon: 'fustane' },
      { to: '/staff/categories', label: 'Kategoritë', icon: 'kategorite' },
      { to: '/staff/rezervime', label: 'Rezervimet', icon: 'rezervime' },
    ],
  },
  {
    label: 'Publiku',
    links: [{ to: '/staff/kerkesat', label: 'Kërkesat', icon: 'kerkesat' }],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={isOpen ? 'sidebar sidebar--open' : 'sidebar'}>
        <button className="sidebar__close" onClick={onClose} aria-label="Mbyll menynë">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>

        <div className="sidebar__scroll">
          {sections.map((section) => (
            <div className="sidebar__section" key={section.label}>
              <p className="eyebrow sidebar__section-label">{section.label}</p>
              <ul className="sidebar__nav">
                {section.links.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        isActive ? 'sidebar__link sidebar__link--active' : 'sidebar__link'
                      }
                    >
                      <span className="sidebar__icon">{icons[link.icon]}</span>
                      <span>{link.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {user && (
          <div className="sidebar__profile">
            <div className="sidebar__avatar">{initials}</div>
            <div className="sidebar__profile-info">
              <span className="sidebar__profile-name">{user.name}</span>
              <span className="sidebar__profile-role">{user.role}</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}