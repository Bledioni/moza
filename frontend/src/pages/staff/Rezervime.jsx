import { useEffect, useMemo, useState } from 'react';
import StaffLayout from '../../components/layout/StaffLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../api/axios';
import '../../styles/components/Fustane.css';
import '../../styles/components/Rezervime.css';

const emptyForm = {
  fustan_id: '',
  client_name: '',
  client_phone: '',
  start_date: '',
  end_date: '',
};

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

export default function Rezervime() {
  const [reservations, setReservations] = useState([]);
  const [fustane, setFustane] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [isDressPickerOpen, setIsDressPickerOpen] = useState(false);

  const loadReservations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff/reservations');
      setReservations(res.data.data ?? res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadFustane = async () => {
    try {
      const res = await api.get('/staff/fustane');
      setFustane(res.data.data ?? res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadReservations();
    loadFustane();
  }, []);

  const selectedDress = useMemo(
    () => fustane.find((f) => String(f.id) === String(form.fustan_id)) ?? null,
    [fustane, form.fustan_id]
  );

  const busyRangesForSelectedDress = useMemo(() => {
    if (!form.fustan_id) return [];
    return reservations
      .filter((r) => String(r.fustan_id) === String(form.fustan_id))
      .map((r) => ({
        start: r.start_date,
        end: r.end_date,
      }));
  }, [reservations, form.fustan_id]);

  const busyDateKeys = useMemo(() => {
    const set = new Set();
    busyRangesForSelectedDress.forEach(({ start, end }) => {
      let cur = parseDateKey(start);
      const last = parseDateKey(end);
      while (cur <= last) {
        set.add(toDateKey(cur));
        cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
      }
    });
    return set;
  }, [busyRangesForSelectedDress]);

  const resetForm = () => {
    setForm(emptyForm);
    setError('');
    setIsDressPickerOpen(false);
  };

  const openAddModal = () => {
    resetForm();
    const now = new Date();
    setViewMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleFustanSelect = (dressId) => {
    setForm({ ...form, fustan_id: String(dressId), start_date: '', end_date: '' });
    setIsDressPickerOpen(false);
  };

  const handleTextChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDayClick = (dateKey) => {
    if (busyDateKeys.has(dateKey)) return;

    if (!form.start_date || (form.start_date && form.end_date)) {
      setForm({ ...form, start_date: dateKey, end_date: '' });
      return;
    }

    if (dateKey < form.start_date) {
      setForm({ ...form, start_date: dateKey, end_date: '' });
      return;
    }

    let cur = parseDateKey(form.start_date);
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
      setForm({ ...form, start_date: dateKey, end_date: '' });
      return;
    }

    setForm({ ...form, end_date: dateKey });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.fustan_id) {
      setError('Zgjedh një fustan.');
      return;
    }
    if (!form.start_date || !form.end_date) {
      setError('Zgjedh datën e fillimit dhe të mbarimit në kalendar.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/staff/reservations', form);
      closeModal();
      loadReservations();
    } catch (err) {
      const message =
        err.response?.data?.errors?.start_date?.[0] ||
        err.response?.data?.message ||
        'Diçka shkoi keq. Kontrollo fushat dhe provo përsëri.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('A je i sigurt që do ta fshish këtë rezervim?')) return;
    try {
      await api.delete(`/staff/reservations/${id}`);
      loadReservations();
    } catch (err) {
      console.error(err);
    }
  };

  const goToPrevMonth = () => {
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  };

  const calendarDays = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const leadingBlank = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < leadingBlank; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [viewMonth]);

  const todayKey = toDateKey(new Date());

  return (
    <StaffLayout>
      <div className="page-header">
        <div>
          <p className="eyebrow">Inventari</p>
          <h2 className="page-header__title">Rezervimet</h2>
        </div>
        <Button variant="gold" onClick={openAddModal}>
          + Shto Rezervim
        </Button>
      </div>

      <div className="fustane-table-wrap">
        <table className="fustane-table">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Klienti</th>
              <th>Telefoni</th>
              <th>Fustani</th>
              <th>Nga</th>
              <th>Deri</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="fustane-table__empty">
                  Duke ngarkuar...
                </td>
              </tr>
            ) : reservations.length === 0 ? (
              <tr>
                <td colSpan="7" className="fustane-table__empty">
                  Ende s'ka rezervime të shtuara. Shto të parën me butonin sipër.
                </td>
              </tr>
            ) : (
              reservations
                .slice()
                .sort((a, b) => (a.start_date < b.start_date ? -1 : 1))
                .map((r) => (
                  <tr key={r.id}>
                    <td data-label="Foto">
                      {r.dress?.foto_url ? (
                        <img
                          src={r.dress.foto_url}
                          alt={r.dress.emri}
                          className="fustane-table__thumb"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="fustane-table__thumb fustane-table__thumb--empty"
                        style={{ display: r.dress?.foto_url ? 'none' : 'flex' }}
                      >
                        —
                      </div>
                    </td>
                    <td data-label="Klienti" className="fustane-table__name">
                      {r.client_name}
                    </td>
                    <td data-label="Telefoni">{r.client_phone}</td>
                    <td data-label="Fustani">{r.dress?.emri ?? '—'}</td>
                    <td data-label="Nga">{formatDisplayDate(r.start_date)}</td>
                    <td data-label="Deri">{formatDisplayDate(r.end_date)}</td>
                    <td data-label="" className="fustane-table__actions">
                      <button
                        className="fustane-table__action-btn fustane-table__action-btn--danger"
                        onClick={() => handleDelete(r.id)}
                        data-tooltip="Fshi"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal__title">Shto Rezervim të Ri</h3>
            {error && <div className="modal__error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label className="field__label">Fustani</label>
                <div className="dress-picker">
                  <button
                    type="button"
                    className="dress-picker__trigger"
                    onClick={() => setIsDressPickerOpen((open) => !open)}
                  >
                    {selectedDress ? (
                      <span className="dress-picker__trigger-selected">
                        {selectedDress.foto_url ? (
                          <img
                            src={selectedDress.foto_url}
                            alt={selectedDress.emri}
                            className="dress-picker__trigger-thumb"
                          />
                        ) : (
                          <span className="dress-picker__trigger-thumb dress-picker__trigger-thumb--empty">—</span>
                        )}
                        <span className="dress-picker__trigger-name">{selectedDress.emri}</span>
                      </span>
                    ) : (
                      <span className="dress-picker__trigger-placeholder">Zgjedh një fustan</span>
                    )}
                    <svg
                      className="dress-picker__trigger-arrow"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  {isDressPickerOpen && (
                    <>
                      <div
                        className="dress-picker__backdrop"
                        onClick={() => setIsDressPickerOpen(false)}
                      />
                      <div className="dress-picker__panel">
                        {fustane.length === 0 ? (
                          <p className="dress-picker__empty">Ende s'ka fustane të shtuara.</p>
                        ) : (
                          fustane.map((f) => (
                            <button
                              type="button"
                              key={f.id}
                              className={
                                String(f.id) === String(form.fustan_id)
                                  ? 'dress-picker__row dress-picker__row--active'
                                  : 'dress-picker__row'
                              }
                              onClick={() => handleFustanSelect(f.id)}
                            >
                              {f.foto_url ? (
                                <img src={f.foto_url} alt={f.emri} className="dress-picker__row-thumb" />
                              ) : (
                                <span className="dress-picker__row-thumb dress-picker__row-thumb--empty">—</span>
                              )}
                              <span className="dress-picker__row-info">
                                <span className="dress-picker__row-name">{f.emri}</span>
                                <span className="dress-picker__row-meta">
                                  {f.madhesia} · {f.ngjyra} · {f.cmimi_qirase} €
                                </span>
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="modal__row">
                <Input
                  variant="boxed"
                  label="Emri i Klientes"
                  name="client_name"
                  value={form.client_name}
                  onChange={handleTextChange}
                  required
                />
                <Input
                  variant="boxed"
                  label="Telefoni"
                  name="client_phone"
                  value={form.client_phone}
                  onChange={handleTextChange}
                  required
                />
              </div>

              {form.fustan_id && (
                <div className="field">
                  <label className="field__label">
                    Zgjedh datat {form.start_date && !form.end_date && '(zgjedh datën e mbarimit)'}
                  </label>

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
                        const isStart = key === form.start_date;
                        const isEnd = key === form.end_date;
                        const isInRange =
                          form.start_date &&
                          form.end_date &&
                          key > form.start_date &&
                          key < form.end_date;

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

                  {form.start_date && (
                    <p className="rezervim-calendar__summary">
                      {formatDisplayDate(form.start_date)}
                      {form.end_date ? ` — ${formatDisplayDate(form.end_date)}` : ''}
                    </p>
                  )}
                </div>
              )}

              <div className="modal__actions">
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? 'Duke ruajtur...' : 'Ruaj Rezervimin'}
                </Button>
                <Button type="button" variant="outline" onClick={closeModal}>
                  Anulo
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}