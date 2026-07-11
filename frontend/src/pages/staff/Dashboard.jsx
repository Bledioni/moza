import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffLayout from '../../components/layout/StaffLayout';
import api from '../../api/axios';
import { resolvePhotoUrl } from '../../config';
import '../../styles/components/Fustane.css';
import '../../styles/components/Dashboard.css';

const MUAJT = [
  'Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor',
  'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor',
];

function formatDate(value) {
  if (!value) return '—';
  const key = String(value).slice(0, 10);
  const [y, m, d] = key.split('-').map(Number);
  if (!y || !m || !d) return '—';
  return `${d} ${MUAJT[m - 1].slice(0, 3)} ${y}`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/staff/dashboard');
        setStats(res.data);
      } catch (err) {
        setError('Statistikat nuk u ngarkuan dot.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <StaffLayout>
        <h2 className="page-header__title" style={{ marginBottom: 'var(--space-6)' }}>
          Paneli Kryesor
        </h2>
        <p className="dashboard__status">Duke ngarkuar statistikat...</p>
      </StaffLayout>
    );
  }

  if (error || !stats) {
    return (
      <StaffLayout>
        <h2 className="page-header__title" style={{ marginBottom: 'var(--space-6)' }}>
          Paneli Kryesor
        </h2>
        <p className="dashboard__status">{error || 'S\'ka të dhëna.'}</p>
      </StaffLayout>
    );
  }

  const maxMonthCount = Math.max(1, ...stats.reservations_per_month.map((m) => m.count));
  const mostReservedDress = stats.most_reserved?.dress;
  const mostReservedPhoto = mostReservedDress ? resolvePhotoUrl(mostReservedDress.foto) : null;

  return (
    <StaffLayout>
      <div className="page-header">
        <div>
          <p className="eyebrow">Përmbledhje</p>
          <h2 className="page-header__title">Paneli Kryesor</h2>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-card__label">Fustane Gjithsej</span>
          <span className="stat-card__value">{stats.total_fustane}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Rezervime Gjithsej</span>
          <span className="stat-card__value">{stats.total_reservations}</span>
        </div>
        <div className="stat-card stat-card--gold">
          <span className="stat-card__label">Rezervime Aktive Sot</span>
          <span className="stat-card__value">{stats.active_reservations}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Kategori</span>
          <span className="stat-card__value">{stats.total_categories}</span>
        </div>
        <div className="stat-card stat-card--emerald">
          <span className="stat-card__label">Të Ardhurat Gjithsej</span>
          <span className="stat-card__value">{stats.total_revenue.toFixed(2)} €</span>
        </div>
      </div>

      <div className="dashboard-columns">
        <div className="dashboard-panel">
          <h3 className="dashboard-panel__title">Rezervimet për 6 Muajt e Fundit</h3>
          <div className="bar-chart">
            {stats.reservations_per_month.map((m) => (
              <div className="bar-chart__col" key={m.label}>
                <span className="bar-chart__count">{m.count}</span>
                <div className="bar-chart__track">
                  <div
                    className="bar-chart__bar"
                    style={{ height: `${(m.count / maxMonthCount) * 100}%` }}
                  />
                </div>
                <span className="bar-chart__label">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-panel">
          <h3 className="dashboard-panel__title">Fustani Më i Rezervuari</h3>
          {mostReservedDress ? (
            <button
              className="most-reserved"
              onClick={() => navigate(`/staff/fustane/${mostReservedDress.id}`)}
            >
              <div className="most-reserved__photo">
                {mostReservedPhoto ? (
                  <img src={mostReservedPhoto} alt={mostReservedDress.emri} />
                ) : (
                  <div className="most-reserved__photo-empty">—</div>
                )}
              </div>
              <div className="most-reserved__info">
                <span className="most-reserved__name">{mostReservedDress.emri}</span>
                <span className="most-reserved__meta">
                  {stats.most_reserved.total_reservations} rezervime
                </span>
              </div>
            </button>
          ) : (
            <p className="dashboard__status">Ende s'ka rezervime.</p>
          )}
        </div>
      </div>

      <div className="dashboard-panel">
        <h3 className="dashboard-panel__title">
          Rezervime këtë Javë
          <span className="dashboard-panel__count">{stats.upcoming_this_week.length}</span>
        </h3>

        {stats.upcoming_this_week.length === 0 ? (
          <p className="dashboard__status">S'ka rezervime të planifikuara për 7 ditët e ardhshme.</p>
        ) : (
          <div className="fustane-table-wrap">
            <table className="fustane-table">
              <thead>
                <tr>
                  <th>Klienti</th>
                  <th>Fustani</th>
                  <th>Nga</th>
                  <th>Deri</th>
                </tr>
              </thead>
              <tbody>
                {stats.upcoming_this_week.map((r) => (
                  <tr
                    key={r.id}
                    className="fustane-table__row--clickable"
                    onClick={() => navigate(`/staff/fustane/${r.fustan_id}`)}
                  >
                    <td data-label="Klienti" className="fustane-table__name">{r.client_name}</td>
                    <td data-label="Fustani">{r.dress?.emri ?? '—'}</td>
                    <td data-label="Nga">{formatDate(r.start_date)}</td>
                    <td data-label="Deri">{formatDate(r.end_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </StaffLayout>
  );
}