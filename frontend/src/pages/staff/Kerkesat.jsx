import { useEffect, useState } from 'react';
import StaffLayout from '../../components/layout/StaffLayout';
import Button from '../../components/ui/Button';
import api from '../../api/axios';
import { resolvePhotoUrl } from '../../config';
import '../../styles/components/Fustane.css';
import '../../styles/components/Kerkesat.css';

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

const STATUS_LABELS = {
  pending: 'Në Pritje',
  approved: 'Aprovuar',
  rejected: 'Refuzuar',
};

export default function Kerkesat() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const params = filter === 'all' ? {} : { status: filter };
      const res = await api.get('/staff/requests', { params });
      setRequests(res.data.data ?? res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleApprove = async (req) => {
    if (!window.confirm(`A je i sigurt që do ta aprovosh kërkesën e ${req.client_name}?`)) return;
    setError('');
    setProcessingId(req.id);
    try {
      await api.post(`/staff/requests/${req.id}/approve`);
      loadRequests();
    } catch (err) {
      setError(err.response?.data?.errors?.start_date?.[0] ?? err.response?.data?.message ?? 'Diçka shkoi keq.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (req) => {
    if (!window.confirm(`A je i sigurt që do ta refuzosh kërkesën e ${req.client_name}?`)) return;
    setError('');
    setProcessingId(req.id);
    try {
      await api.post(`/staff/requests/${req.id}/reject`);
      loadRequests();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Diçka shkoi keq.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <StaffLayout>
      <div className="page-header">
        <div>
          <p className="eyebrow">Publiku</p>
          <h2 className="page-header__title">Kërkesat</h2>
        </div>
      </div>

      <div className="requests-filter">
        {['pending', 'approved', 'rejected', 'all'].map((key) => (
          <button
            key={key}
            className={filter === key ? 'requests-filter__btn requests-filter__btn--active' : 'requests-filter__btn'}
            onClick={() => setFilter(key)}
          >
            {key === 'all' ? 'Të Gjitha' : STATUS_LABELS[key]}
          </button>
        ))}
      </div>

      {error && <div className="modal__error" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}

      <div className="fustane-table-wrap">
        <table className="fustane-table requests-table">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Klienti</th>
              <th>Telefoni</th>
              <th>Fustani</th>
              <th>Nga</th>
              <th>Deri</th>
              <th>Statusi</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="fustane-table__empty">Duke ngarkuar...</td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan="8" className="fustane-table__empty">Ende s'ka kërkesa këtu.</td>
              </tr>
            ) : (
              requests.map((r) => {
                const photoUrl = resolvePhotoUrl(r.dress?.foto);
                return (
                  <tr key={r.id}>
                    <td data-label="Foto">
                      {photoUrl ? (
                        <img src={photoUrl} alt={r.dress?.emri} className="fustane-table__thumb" />
                      ) : (
                        <div className="fustane-table__thumb fustane-table__thumb--empty">—</div>
                      )}
                    </td>
                    <td data-label="Klienti" className="fustane-table__name">{r.client_name}</td>
                    <td data-label="Telefoni">{r.client_phone}</td>
                    <td data-label="Fustani">{r.dress?.emri ?? '—'}</td>
                    <td data-label="Nga">{formatDate(r.start_date)}</td>
                    <td data-label="Deri">{formatDate(r.end_date)}</td>
                    <td data-label="Statusi">
                      <span className={`requests-status requests-status--${r.status}`}>
                        {STATUS_LABELS[r.status]}
                      </span>
                    </td>
                    <td data-label="" className="requests-actions">
                      {r.status === 'pending' ? (
                        <>
                          <Button
                            variant="primary"
                            disabled={processingId === r.id}
                            onClick={() => handleApprove(r)}
                          >
                            Aprovo
                          </Button>
                          <Button
                            variant="outline"
                            disabled={processingId === r.id}
                            onClick={() => handleReject(r)}
                          >
                            Refuzo
                          </Button>
                        </>
                      ) : (
                        <span className="requests-empty-actions">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </StaffLayout>
  );
}