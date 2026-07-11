import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StaffLayout from '../../components/layout/StaffLayout';
import Button from '../../components/ui/Button';
import api from '../../api/axios';
import { resolvePhotoUrl } from '../../config';
import '../../styles/components/Fustane.css';
import '../../styles/components/DressProfile.css';

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

function isUpcomingOrOngoing(reservation) {
  const todayKey = new Date().toISOString().slice(0, 10);
  return String(reservation.end_date).slice(0, 10) >= todayKey;
}

export default function FustanProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fustan, setFustan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrBlobUrl, setQrBlobUrl] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

  const loadFustan = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/staff/fustane/${id}`);
      setFustan(res.data);
    } catch (err) {
      setError('Ky fustan nuk u gjet ose ndodhi një gabim.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFustan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    let objectUrl = null;

    const loadQr = async () => {
      setQrLoading(true);
      try {
        const res = await api.get(`/staff/fustane/${id}/qr`, { responseType: 'blob' });
        objectUrl = URL.createObjectURL(res.data);
        setQrBlobUrl(objectUrl);
      } catch (err) {
        console.error(err);
      } finally {
        setQrLoading(false);
      }
    };

    loadQr();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);

  const reservations = useMemo(() => {
    if (!fustan?.reservations) return [];
    return [...fustan.reservations].sort((a, b) => (a.start_date < b.start_date ? 1 : -1));
  }, [fustan]);

  const upcomingReservations = reservations.filter(isUpcomingOrOngoing);
  const pastReservations = reservations.filter((r) => !isUpcomingOrOngoing(r));

  if (loading) {
    return (
      <StaffLayout>
        <p className="fustane-table__empty">Duke ngarkuar...</p>
      </StaffLayout>
    );
  }

  if (error || !fustan) {
    return (
      <StaffLayout>
        <p className="fustane-table__empty">{error || 'Fustani nuk u gjet.'}</p>
        <Button variant="outline" onClick={() => navigate('/staff/fustane')}>
          Kthehu te Fustanet
        </Button>
      </StaffLayout>
    );
  }

  const photoUrl = resolvePhotoUrl(fustan.foto);

  return (
    <StaffLayout>
      <button className="profile-back" onClick={() => navigate('/staff/fustane')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Kthehu te Fustanet
      </button>

      <div className="profile-header">
        <div className="profile-header__photo">
          {photoUrl ? (
            <img src={photoUrl} alt={fustan.emri} />
          ) : (
            <div className="profile-header__photo-empty">—</div>
          )}
        </div>

        <div className="profile-header__info">
          <p className="eyebrow">{fustan.code ?? 'Pa kod'}</p>
          <h2 className="profile-header__title">{fustan.emri}</h2>

          <div className="profile-header__meta">
            <div className="profile-header__meta-item">
              <span className="profile-header__meta-label">Madhësia</span>
              <span className="fustane-table__badge">{fustan.madhesia}</span>
            </div>
            <div className="profile-header__meta-item">
              <span className="profile-header__meta-label">Ngjyra</span>
              <span>{fustan.ngjyra}</span>
            </div>
            <div className="profile-header__meta-item">
              <span className="profile-header__meta-label">Kategoria</span>
              <span>{fustan.category?.emri ?? '—'}</span>
            </div>
            <div className="profile-header__meta-item">
              <span className="profile-header__meta-label">Çmimi Qirasë</span>
              <span className="fustane-table__price">{fustan.cmimi_qirase} €</span>
            </div>
            <div className="profile-header__meta-item">
              <span className="profile-header__meta-label">Sasia</span>
              <span>{fustan.sasia}</span>
            </div>
          </div>
        </div>

        <div className="profile-header__qr">
          {qrLoading ? (
            <p className="profile-header__qr-loading">Duke ngarkuar...</p>
          ) : qrBlobUrl ? (
            <img src={qrBlobUrl} alt={`Kodi QR për ${fustan.emri}`} />
          ) : (
            <p className="profile-header__qr-loading">Pa kod QR</p>
          )}
        </div>
      </div>

      <div className="profile-section">
        <h3 className="profile-section__title">
          Rezervime të Ardhshme / Aktive
          <span className="profile-section__count">{upcomingReservations.length}</span>
        </h3>

        {upcomingReservations.length === 0 ? (
          <p className="fustane-table__empty">Ky fustan s'ka rezervime të ardhshme aktualisht.</p>
        ) : (
          <div className="fustane-table-wrap">
            <table className="fustane-table">
              <thead>
                <tr>
                  <th>Klienti</th>
                  <th>Telefoni</th>
                  <th>Nga</th>
                  <th>Deri</th>
                </tr>
              </thead>
              <tbody>
                {upcomingReservations.map((r) => (
                  <tr key={r.id}>
                    <td data-label="Klienti" className="fustane-table__name">{r.client_name}</td>
                    <td data-label="Telefoni">{r.client_phone}</td>
                    <td data-label="Nga">{formatDate(r.start_date)}</td>
                    <td data-label="Deri">{formatDate(r.end_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="profile-section">
        <h3 className="profile-section__title">
          Historiku i Rezervimeve
          <span className="profile-section__count">{pastReservations.length}</span>
        </h3>

        {pastReservations.length === 0 ? (
          <p className="fustane-table__empty">Ende s'ka rezervime të kaluara për këtë fustan.</p>
        ) : (
          <div className="fustane-table-wrap">
            <table className="fustane-table">
              <thead>
                <tr>
                  <th>Klienti</th>
                  <th>Telefoni</th>
                  <th>Nga</th>
                  <th>Deri</th>
                </tr>
              </thead>
              <tbody>
                {pastReservations.map((r) => (
                  <tr key={r.id}>
                    <td data-label="Klienti" className="fustane-table__name">{r.client_name}</td>
                    <td data-label="Telefoni">{r.client_phone}</td>
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