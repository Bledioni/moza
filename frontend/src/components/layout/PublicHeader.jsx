import { NavLink } from 'react-router-dom';
import '../../styles/components/PublicSite.css';

export default function PublicHeader() {
  return (
    <header className="public-header">
      <div className="public-header__inner">
        <NavLink to="/" className="public-header__brand">
          <div className="public-header__monogram">ME</div>
          <h1 className="public-header__logo">
            Moza<span className="public-header__logo-accent">Elegance</span>
          </h1>
        </NavLink>

        <nav className="public-header__nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? 'public-header__link public-header__link--active' : 'public-header__link'
            }
          >
            Ballina
          </NavLink>
          <NavLink
            to="/fustanet"
            className={({ isActive }) =>
              isActive ? 'public-header__link public-header__link--active' : 'public-header__link'
            }
          >
            Fustanet
          </NavLink>
          <NavLink
  to="/statusi"
  className={({ isActive }) =>
    isActive ? 'public-header__link public-header__link--active' : 'public-header__link'
  }
>
  Statusi
</NavLink>
        </nav>
      </div>
    </header>
  );
}