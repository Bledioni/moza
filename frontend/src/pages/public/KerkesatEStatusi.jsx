import { useState } from 'react';
import PublicHeader from '../../components/layout/PublicHeader';
import publicApi from '../../api/publicApi';
import '../../styles/components/PublicSite.css';
import '../../styles/components/Kerkesat.css';

const MUAJT = [
  'Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor',
  'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor',
];

const STATUS_LABELS = {
  pending: 'Në Pritje',
  approved: 'Aprovuar',
  rejected: 'Refuzuar',
};

function formatDate(value) {
  if (!value) return '—';
  const key = String(value).slice(0, 10);
  const [y, m, d] = key.split('-').map(Number);
  if (!y || !m || !d) return '—';
  return `${d} ${MUAJT[m - 1].slice(0, 3)} ${y}`;
}

export default function KerkesatEStatusi() {
  const [phone, setPhone] = useState('');
  const [requests, setRequests] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setRequests(null);

    if (!phone.trim()) {
      setError('Shkruaj numrin e telefonit.');
      return;
    }

    setLoading(true);
    try {
      const res = await publicApi.post('/public/reservation-requests/lookup', {
        client_phone: phone.trim(),
      });
      setRequests(res.data.data ?? res.data);
    } catch (err) {
      setError('Diçka shkoi keq. Provo përsëri.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-page">
      <PublicHeader />

      <main className="public-main">
        <div className="public-intro">
          <p className="eyebrow">Kontrollo Kërkesën</p>
          <h2 className="public-intro__title">Statusi i Kërkesës Tënde</h2>
          <p className="public-intro__text">
            Shkruaj numrin e telefonit që përdore kur dërgove kërkesën, për të parë statusin.
          </p>
        </div>

        <form className="status-lookup-form" onSubmit={handleSubmit}>
          <input
            type="tel"
            className="public-form__input"
            placeholder="Numri i telefonit"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button type="submit" className="public-form__submit" disabled={loading}>
            {loading ? 'Duke kërkuar...' : 'Kërko'}
          </button>
        </form>

        {error && <p className="public-status public-status--error">{error}</p>}

        {requests && requests.length === 0 && (
          <p className="public-status">S'u gjet asnjë kërkesë me këtë numër telefoni.</p>
        )}

        {requests && requests.length > 0 && (
          <div className="status-results">
            {requests.map((r) => (
              <div className="status-card" key={r.id}>
                <div className="status-card__photo">
                  {r.dress?.foto_url ? (
                    <img src={r.dress.foto_url} alt={r.dress.emri} />
                  ) : (
                    <div className="status-card__photo-empty">—</div>
                  )}
                </div>
                <div className="status-card__info">
                  <span className="status-card__name">{r.dress?.emri ?? '—'}</span>
                  <span className="status-card__dates">
                    {formatDate(r.start_date)} — {formatDate(r.end_date)}
                  </span>
                </div>
                <span className={`requests-status requests-status--${r.status}`}>
                  {STATUS_LABELS[r.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}