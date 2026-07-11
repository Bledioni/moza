import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import StaffLayout from '../../components/layout/StaffLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../api/axios';
import { resolvePhotoUrl } from '../../config';
import '../../styles/components/Fustane.css';

const emptyForm = {
  emri: '',
  madhesia: '',
  ngjyra: '',
  kategoria_id: '',
  cmimi_qirase: '',
  sasia: '',
  code_display: '',
};

export default function Fustane() {
  const navigate = useNavigate();
  const [fustane, setFustane] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = duke shtuar, id = duke edituar
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Kërkimi sipas kodit (F-001 etj.), për kërkim manual ose skanim.
  const [searchCode, setSearchCode] = useState('');
  const [highlightedId, setHighlightedId] = useState(null);
  const [searchError, setSearchError] = useState('');

  // Skanimi me kamerë i kodit QR.
  const [showScanner, setShowScanner] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanFrameRef = useRef(null);

  // Popup-i i kodit QR për një rresht të caktuar në tabelë.
  const [qrDress, setQrDress] = useState(null);
  const [qrBlobUrl, setQrBlobUrl] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

  // QR-i i shfaqur brenda modalit të editimit (i ndryshëm nga popup-i i tabelës).
  const [editQrBlobUrl, setEditQrBlobUrl] = useState(null);

  const loadFustane = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff/fustane');
      setFustane(res.data.data ?? res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.get('/staff/categories');
      setCategories(res.data.data ?? res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadFustane();
    loadCategories();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setPhoto(null);
    setPhotoPreview(null);
    setEditingId(null);
    setError('');
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = async (fustan) => {
    setEditingId(fustan.id);
    setForm({
      emri: fustan.emri,
      madhesia: fustan.madhesia,
      ngjyra: fustan.ngjyra,
      kategoria_id: fustan.kategoria_id ?? '',
      cmimi_qirase: fustan.cmimi_qirase,
      sasia: fustan.sasia,
      code_display: fustan.code ?? '',
    });
    setPhoto(null);
    setPhotoPreview(resolvePhotoUrl(fustan.foto));
    setError('');
    setShowModal(true);

    setEditQrBlobUrl(null);
    if (fustan.code) {
      try {
        const res = await api.get(`/staff/fustane/${fustan.id}/qr`, {
          responseType: 'blob',
        });
        setEditQrBlobUrl(URL.createObjectURL(res.data));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const closeModal = () => {
    if (editQrBlobUrl) URL.revokeObjectURL(editQrBlobUrl);
    setEditQrBlobUrl(null);
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'code_display') return; // vetëm për shfaqje, s'duhet dërguar
        data.append(key, value);
      });
      if (photo) data.append('foto', photo);

      if (editingId) {
        // Laravel method-spoofing: PUT me file upload s'punon direkt me axios,
        // prandaj dërgojmë POST + _method=PUT
        data.append('_method', 'PUT');
        await api.post(`/staff/fustane/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/staff/fustane', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      closeModal();
      loadFustane();
    } catch (err) {
      setError('Diçka shkoi keq. Kontrollo fushat dhe provo përsëri.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('A je i sigurt që do ta fshish këtë fustan?')) return;
    try {
      await api.delete(`/staff/fustane/${id}`);
      loadFustane();
    } catch (err) {
      const message = err.response?.data?.message;
      if (message) {
        alert(message);
      } else {
        console.error(err);
      }
    }
  };

  // Kërkon një fustan sipas kodit (kërkim manual ose skanim) dhe kalon
  // direkt te profili i tij nëse gjendet.
  const lookupByCode = async (code) => {
    setSearchError('');
    setHighlightedId(null);

    const trimmed = code.trim();
    if (!trimmed) return false;

    try {
      const res = await api.post('/staff/fustane/search-by-code', { code: trimmed });
      const found = res.data;
      navigate(`/staff/fustane/${found.id}`);
      return true;
    } catch (err) {
      setSearchError(err.response?.data?.message ?? 'Nuk u gjet asnjë fustan me këtë kod.');
      return false;
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    await lookupByCode(searchCode);
  };

  const clearSearch = () => {
    setSearchCode('');
    setSearchError('');
    setHighlightedId(null);
  };

  // ---------- Skanimi me kamerë ----------

  const stopScanner = () => {
    if (scanFrameRef.current) {
      cancelAnimationFrame(scanFrameRef.current);
      scanFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowScanner(false);
  };

  const openScanner = async () => {
    setScannerError('');
    setShowScanner(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      scanLoop();
    } catch (err) {
      console.error(err);
      setScannerError(
        'S\'u arrit të hapet kamera. Kontrollo që i ke dhënë lejen shfletuesit dhe provo përsëri.'
      );
    }
  };

  const scanLoop = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      scanFrameRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const result = jsQR(imageData.data, imageData.width, imageData.height);

    if (result?.data) {
      // Gjetëm një kod — ndalojmë kamerën dhe kërkojmë fustanin.
      stopScanner();
      setSearchCode(result.data);
      lookupByCode(result.data);
      return;
    }

    scanFrameRef.current = requestAnimationFrame(scanLoop);
  };

  useEffect(() => {
    // Siguresa: nëse komponenti çmontohet ndërkohë që kamera është hapur, e ndalim.
    return () => {
      if (scanFrameRef.current) cancelAnimationFrame(scanFrameRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const openQrPopup = async (fustan) => {
    setQrDress(fustan);
    setQrLoading(true);
    setQrBlobUrl(null);
    try {
      // Kërkojmë si blob përmes axios (jo <img src> direkt), sepse
      // ky endpoint kërkon autentikim me token dhe një <img> i thjeshtë
      // s'mund të dërgojë header-in Authorization.
      const res = await api.get(`/staff/fustane/${fustan.id}/qr`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(res.data);
      setQrBlobUrl(url);
    } catch (err) {
      console.error(err);
    } finally {
      setQrLoading(false);
    }
  };

  const closeQrPopup = () => {
    if (qrBlobUrl) URL.revokeObjectURL(qrBlobUrl);
    setQrDress(null);
    setQrBlobUrl(null);
  };

  return (
    <StaffLayout>
      <div className="page-header">
        <div>
          <p className="eyebrow">Inventari</p>
          <h2 className="page-header__title">Fustanet</h2>
        </div>
        <Button variant="gold" onClick={openAddModal}>
          + Shto Fustan
        </Button>
      </div>

      <form className="fustan-search" onSubmit={handleSearchSubmit}>
        <div className="fustan-search__input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="fustan-search__icon">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            className="fustan-search__input"
            placeholder="Kërko me kod (p.sh. F-001)"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
          />
        </div>
        <Button type="submit" variant="outline">
          Kërko
        </Button>
        <button
          type="button"
          className="fustan-search__scan-btn"
          onClick={openScanner}
          data-tooltip="Skano me kamerë"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 8V6a2 2 0 0 1 2-2h2" />
            <path d="M4 16v2a2 2 0 0 0 2 2h2" />
            <path d="M20 8V6a2 2 0 0 0-2-2h-2" />
            <path d="M20 16v2a2 2 0 0 1-2 2h-2" />
            <rect x="8" y="8" width="8" height="8" rx="1" />
          </svg>
        </button>
        {(searchCode || highlightedId) && (
          <Button type="button" variant="outline" onClick={clearSearch}>
            Pastro
          </Button>
        )}
      </form>
      {searchError && <p className="fustan-search__error">{searchError}</p>}

      <div className="fustane-table-wrap">
        <table className="fustane-table">
          <colgroup>
            <col className="col-photo" />
            <col className="col-name" />
            <col className="col-size" />
            <col className="col-color" />
            <col className="col-category" />
            <col className="col-price" />
            <col className="col-qty" />
            <col className="col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th>Foto</th>
              <th>Emri</th>
              <th>Madhësia</th>
              <th>Ngjyra</th>
              <th className="col-category">Kategoria</th>
              <th>Çmimi Qirasë</th>
              <th>Sasia</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="fustane-table__empty">
                  Duke ngarkuar...
                </td>
              </tr>
            ) : fustane.length === 0 ? (
              <tr>
                <td colSpan="8" className="fustane-table__empty">
                  Ende s'ka fustane të shtuar. Shto të parin me butonin sipër.
                </td>
              </tr>
            ) : (
              fustane.map((f) => {
                const photoUrl = resolvePhotoUrl(f.foto);
                const isHighlighted = highlightedId === f.id;
                return (
                  <tr
                    key={f.id}
                    id={`fustan-row-${f.id}`}
                    className={
                      isHighlighted
                        ? 'fustane-table__row--highlighted fustane-table__row--clickable'
                        : 'fustane-table__row--clickable'
                    }
                    onClick={() => navigate(`/staff/fustane/${f.id}`)}
                  >
                    <td data-label="Foto">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={f.emri}
                          className="fustane-table__thumb"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="fustane-table__thumb fustane-table__thumb--empty"
                        style={{ display: photoUrl ? 'none' : 'flex' }}
                      >
                        —
                      </div>
                    </td>
                    <td data-label="Emri" className="fustane-table__name">
                      {f.emri}
                      {f.code && <span className="fustane-table__code">{f.code}</span>}
                    </td>
                    <td data-label="Madhësia">
                      <span className="fustane-table__badge">{f.madhesia}</span>
                    </td>
                    <td data-label="Ngjyra">{f.ngjyra}</td>
                    <td data-label="Kategoria" className="col-category">
                      {f.category?.emri ?? '—'}
                    </td>
                    <td data-label="Çmimi" className="fustane-table__price">
                      {f.cmimi_qirase} €
                    </td>
                    <td data-label="Sasia">{f.sasia}</td>
                    <td data-label="" className="fustane-table__actions">
                      <button
                        className="fustane-table__action-btn"
                        onClick={(e) => { e.stopPropagation(); openQrPopup(f); }}
                        data-tooltip="Kodi QR"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="7" height="7" />
                          <rect x="14" y="3" width="7" height="7" />
                          <rect x="3" y="14" width="7" height="7" />
                          <path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20v.01" />
                        </svg>
                      </button>
                      <button
                        className="fustane-table__action-btn"
                        onClick={(e) => { e.stopPropagation(); openEditModal(f); }}
                        data-tooltip="Ndrysho"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      </button>
                      <button
                        className="fustane-table__action-btn fustane-table__action-btn--danger"
                        onClick={(e) => { e.stopPropagation(); handleDelete(f.id); }}
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
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal__title">{editingId ? 'Ndrysho Fustanin' : 'Shto Fustan të Ri'}</h3>
            {error && <div className="modal__error">{error}</div>}

            {editingId && form.code_display && editQrBlobUrl && (
              <div className="modal__qr-inline">
                <img
                  src={editQrBlobUrl}
                  alt="Kodi QR"
                  className="modal__qr-inline-img"
                />
                <span className="modal__qr-inline-code">{form.code_display}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label className="field__label">Foto e Fustanit</label>
                <label className="photo-drop">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Parapamje" className="photo-drop__preview" />
                  ) : (
                    <span className="photo-drop__placeholder">Kliko për të ngarkuar foto</span>
                  )}
                  <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
                </label>
              </div>

              <Input
                variant="boxed"
                label="Emri"
                name="emri"
                value={form.emri}
                onChange={handleChange}
                required
              />

              <div className="modal__row">
                <Input
                  variant="boxed"
                  label="Madhësia"
                  name="madhesia"
                  value={form.madhesia}
                  onChange={handleChange}
                  required
                />
                <Input
                  variant="boxed"
                  label="Ngjyra"
                  name="ngjyra"
                  value={form.ngjyra}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label className="field__label">Kategoria</label>
                <div className="field__select-wrap">
                  <select
                    className="field__select"
                    name="kategoria_id"
                    value={form.kategoria_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Zgjedh një kategori</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.emri}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal__row">
                <Input
                  variant="boxed"
                  label="Çmimi Qirasë (€)"
                  name="cmimi_qirase"
                  type="number"
                  value={form.cmimi_qirase}
                  onChange={handleChange}
                  required
                />
                <Input
                  variant="boxed"
                  label="Sasia"
                  name="sasia"
                  type="number"
                  value={form.sasia}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="modal__actions">
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? 'Duke ruajtur...' : editingId ? 'Ruaj Ndryshimet' : 'Ruaj Fustanin'}
                </Button>
                <Button type="button" variant="outline" onClick={closeModal}>
                  Anulo
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {qrDress && (
        <div className="modal-backdrop" onClick={closeQrPopup}>
          <div className="modal modal--qr" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal__title">{qrDress.emri}</h3>
            <div className="qr-popup">
              {qrLoading ? (
                <p>Duke ngarkuar kodin QR...</p>
              ) : qrBlobUrl ? (
                <img src={qrBlobUrl} alt={`Kodi QR për ${qrDress.emri}`} className="qr-popup__img" />
              ) : (
                <p>Kodi QR s'u ngarkua dot.</p>
              )}
              <span className="qr-popup__code">{qrDress.code}</span>
            </div>
            <div className="modal__actions">
              <Button
                type="button"
                variant="primary"
                disabled={!qrBlobUrl}
                onClick={() => window.open(`/staff/fustane/${qrDress.id}/etikete`, '_blank')}
              >
                Printo Etiketën
              </Button>
              <Button type="button" variant="outline" onClick={closeQrPopup}>
                Mbyll
              </Button>
            </div>
          </div>
        </div>
      )}

      {showScanner && (
        <div className="modal-backdrop" onClick={stopScanner}>
          <div className="modal modal--scanner" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal__title">Skano Kodin QR</h3>
            {scannerError ? (
              <p className="fustan-search__error">{scannerError}</p>
            ) : (
              <div className="scanner-frame">
                <video ref={videoRef} className="scanner-frame__video" playsInline muted />
                <div className="scanner-frame__guide" />
              </div>
            )}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <p className="scanner-hint">Vendos kodin QR brenda kornizës.</p>
            <div className="modal__actions">
              <Button type="button" variant="outline" onClick={stopScanner}>
                Anulo
              </Button>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}