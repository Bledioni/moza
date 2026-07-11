import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import '../../styles/components/DressTicket.css';

export default function FustanTicket() {
  const { id } = useParams();
  const [fustan, setFustan] = useState(null);
  const [qrBlobUrl, setQrBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let qrObjectUrl = null;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/staff/fustane/${id}`);
        setFustan(res.data);

        const qrRes = await api.get(`/staff/fustane/${id}/qr`, { responseType: 'blob' });
        qrObjectUrl = URL.createObjectURL(qrRes.data);
        setQrBlobUrl(qrObjectUrl);
      } catch (err) {
        setError('Ky fustan nuk u gjet ose ndodhi një gabim.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();

    return () => {
      if (qrObjectUrl) URL.revokeObjectURL(qrObjectUrl);
    };
  }, [id]);

  useEffect(() => {
    if (fustan && qrBlobUrl) {
      // Hap dritaren e printimit automatikisht sapo të jetë gati etiketa.
      const timer = setTimeout(() => window.print(), 300);
      return () => clearTimeout(timer);
    }
  }, [fustan, qrBlobUrl]);

  if (loading) {
    return <p className="ticket-page__status">Duke ngarkuar...</p>;
  }

  if (error || !fustan) {
    return <p className="ticket-page__status">{error || 'Fustani nuk u gjet.'}</p>;
  }

  return (
    <div className="ticket-page">
      <div className="ticket">
        <div className="ticket__qr">
          {qrBlobUrl && <img src={qrBlobUrl} alt={`Kodi QR për ${fustan.emri}`} />}
        </div>
        <div className="ticket__info">
          <span className="ticket__code">{fustan.code}</span>
          <span className="ticket__name">{fustan.emri}</span>
          <span className="ticket__meta">
            {fustan.madhesia} · {fustan.ngjyra}
          </span>
        </div>
      </div>

      <button className="ticket-page__print-btn no-print" onClick={() => window.print()}>
        Printo
      </button>
    </div>
  );
}