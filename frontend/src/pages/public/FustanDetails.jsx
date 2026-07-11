import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PublicHeader from '../../components/layout/PublicHeader';
import publicApi from '../../api/publicApi';
import '../../styles/components/Fustane.css';
import '../../styles/components/Rezervime.css';
import '../../styles/components/PublicSite.css';

const MUAJT = [
  'Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor',
  'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor',
];

const DITET_JAVES = ['Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht', 'Die'];

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDateKey(key) {
  const [y, m, d] = String(key).slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDisplayDate(key) {
  if (!key) return '';
  const date = parseDateKey(key);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getDate()} ${MUAJT[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`;
}

export default function FustanDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fustan, setFustan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [selectedStart, setSelectedStart] = useState('');
  const [selectedEnd, setSelectedEnd] = useState('');

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await publicApi.get(`/public/fustane/${id}`);
        setFustan(res.data);
      } catch (err) {
        setError('Ky fustan nuk u gjet.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const busyDateKeys = useMemo(() => {
    const set = new Set();
    (fustan?.zene ?? []).forEach(({ start_date, end_date }) => {
      let cur = parseDateKey(start_date);
      const last = parseDateKey(end_date);
      while (cur <= last) {
        set.add(toDateKey(cur));
        cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
      }
    });
    return set;
  }, [fustan]);

  const todayKey = toDateKey(new Date());

  const calendarDays = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const leadingBlank = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < leadingBlank; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    return days;
  }, [viewMonth]);

  const nights = useMemo(() => {
    if (!selectedStart || !selectedEnd) return 0;
    const start = parseDateKey(selectedStart);
    const end = parseDateKey(selectedEnd);
    const diffMs = end.getTime() - start.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }, [selectedStart, selectedEnd]);

  const totalPrice = useMemo(() => {
    if (!nights || !fustan?.cmimi_qirase) return 0;
    return nights * Number(fustan.cmimi_qirase);
  }, [nights, fustan]);

  const goToPrevMonth = () => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const goToNextMonth = () => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  const handleDayClick = (dateKey) => {
    if (busyDateKeys.has(dateKey) || dateKey < todayKey) return;

    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(dateKey);
      setSelectedEnd('');
      return;
    }

    if (dateKey < selectedStart) {
      setSelectedStart(dateKey);
      setSelectedEnd('');
      return;
    }

    let cur = parseDateKey(selectedStart);
    const last = parseDateKey(dateKey);
    let hasConflict = false;
    while (cur <= last) {
      if (busyDateKeys.has(toDateKey(cur))) {
        hasConflict = true;
        break;
      }
      cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
    }

    if (hasConflict) {
      setSelectedStart(dateKey);
      setSelectedEnd('');
      return;
    }

    setSelectedEnd(dateKey);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!selectedStart || !selectedEnd) {
      setSubmitError('Zgjedh datën e fillimit dhe të mbarimit në kalendar.');
      return;
    }
    if (!clientName.trim() || !clientPhone.trim()) {
      setSubmitError('Plotëso emrin dhe telefonin.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await publicApi.post('/public/reservation-requests', {
        fustan_id: fustan.id,
        client_name: clientName.trim(),
        client_phone: clientPhone.trim(),
        start_date: selectedStart,
        end_date: selectedEnd,
      });
      setSubmitSuccess(res.data.message ?? 'Kërkesa u dërgua me sukses.');
      setSelectedStart('');
      setSelectedEnd('');
      setClientName('');
      setClientPhone('');
    } catch (err) {
      setSubmitError(
        err.response?.data?.errors?.start_date?.[0] ||
          err.response?.data?.message ||
          'Diçka shkoi keq. Provo përsëri.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="public-page">
        <p className="public-status">Duke ngarkuar...</p>
      </div>
    );
  }

  if (error || !fustan) {
    return (
      <div className="public-page">
        <p className="public-status public-status--error">{error || 'Fustani nuk u gjet.'}</p>
        <button className="public-back" onClick={() => navigate('/fustanet')}>
          Kthehu te Fustanet
        </button>
      </div>
    );
  }

  return (
    <div className="public-page">
      <PublicHeader />

      <main className="public-main">
        <button className="public-back" onClick={() => navigate('/fustanet')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Kthehu te Fustanet
        </button>

        <div className="details-layout">
          <div className="details-photo">
            {fustan.foto_url ? (
              <img src={fustan.foto_url} alt={fustan.emri} />
            ) : (
              <div className="details-photo__empty">—</div>
            )}
          </div>

          <div className="details-info">
            <p className="eyebrow">{fustan.kategoria ?? 'Fustan'}</p>
            <h2 className="details-info__title">{fustan.emri}</h2>
            <div className="details-info__meta">
              <span className="fustane-table__badge">{fustan.madhesia}</span>
              <span>{fustan.ngjyra}</span>
            </div>
            <p className="details-info__price">{fustan.cmimi_qirase} € / qira</p>

            <h3 className="details-section-title">Zgjedh Datat</h3>
            <div className="rezervim-calendar">
              <div className="rezervim-calendar__header">
                <button type="button" className="rezervim-calendar__nav" onClick={goToPrevMonth}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <span className="rezervim-calendar__month">
                  {MUAJT[viewMonth.getMonth()]} {viewMonth.getFullYear()}
                </span>
                <button type="button" className="rezervim-calendar__nav" onClick={goToNextMonth}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>

              <div className="rezervim-calendar__weekdays">
                {DITET_JAVES.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>

              <div className="rezervim-calendar__grid">
                {calendarDays.map((date, i) => {
                  if (!date) {
                    return <span key={`blank-${i}`} className="rezervim-calendar__day rezervim-calendar__day--blank" />;
                  }

                  const key = toDateKey(date);
                  const isBusy = busyDateKeys.has(key);
                  const isPast = key < todayKey;
                  const isStart = key === selectedStart;
                  const isEnd = key === selectedEnd;
                  const isInRange = selectedStart && selectedEnd && key > selectedStart && key < selectedEnd;

                  const classes = ['rezervim-calendar__day'];
                  if (isBusy) classes.push('rezervim-calendar__day--busy');
                  if (isPast && !isBusy) classes.push('rezervim-calendar__day--past');
                  if (isStart || isEnd) classes.push('rezervim-calendar__day--selected');
                  if (isInRange) classes.push('rezervim-calendar__day--in-range');

                  return (
                    <button
                      type="button"
                      key={key}
                      className={classes.join(' ')}
                      disabled={isBusy || isPast}
                      onClick={() => handleDayClick(key)}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className="rezervim-calendar__legend">
                <span><i className="rezervim-calendar__dot rezervim-calendar__dot--busy" /> E zënë</span>
                <span><i className="rezervim-calendar__dot rezervim-calendar__dot--selected" /> E zgjedhur</span>
              </div>
            </div>

            {selectedStart && (
              <p className="rezervim-calendar__summary">
                {formatDisplayDate(selectedStart)}
                {selectedEnd ? ` — ${formatDisplayDate(selectedEnd)}` : ''}
              </p>
            )}

            {selectedStart && selectedEnd && nights > 0 && (
              <div className="price-estimate">
                <div className="price-estimate__row">
                  <span>{nights} {nights === 1 ? 'natë' : 'netë'} × {fustan.cmimi_qirase} €</span>
                  <span>{totalPrice.toFixed(2)} €</span>
                </div>
                <div className="price-estimate__total">
                  <span>Totali</span>
                  <span>{totalPrice.toFixed(2)} €</span>
                </div>
              </div>
            )}

            <h3 className="details-section-title">Kërko Rezervim</h3>
            {submitSuccess ? (
              <p className="public-status public-status--success">{submitSuccess}</p>
            ) : (
              <form className="public-form" onSubmit={handleSubmit}>
                {submitError && <p className="public-status public-status--error">{submitError}</p>}
                <div className="public-form__row">
                  <input
                    type="text"
                    placeholder="Emri juaj"
                    className="public-form__input"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Telefoni"
                    className="public-form__input"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="public-form__submit" disabled={submitting}>
                  {submitting ? 'Duke dërguar...' : 'Dërgo Kërkesën'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}