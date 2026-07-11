import { useEffect, useState } from 'react';
import StaffLayout from '../../components/layout/StaffLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../api/axios';
import '../../styles/components/Fustane.css';

export default function Kategorite() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = duke shtuar, id = duke edituar
  const [emri, setEmri] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff/categories');
      setCategories(res.data.data ?? res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setEmri('');
    setEditingId(null);
    setError('');
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingId(category.id);
    setEmri(category.emri);
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/staff/categories/${editingId}`, { emri });
      } else {
        await api.post('/staff/categories', { emri });
      }

      closeModal();
      loadCategories();
    } catch (err) {
      setError('Diçka shkoi keq. Kontrollo fushën dhe provo përsëri.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('A je i sigurt që do ta fshish këtë kategori?')) return;
    try {
      await api.delete(`/staff/categories/${id}`);
      loadCategories();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <StaffLayout>
      <div className="page-header">
        <div>
          <p className="eyebrow">Inventari</p>
          <h2 className="page-header__title">Kategoritë</h2>
        </div>
        <Button variant="gold" onClick={openAddModal}>
          + Shto Kategori
        </Button>
      </div>

      <div className="fustane-table-wrap">
        <table className="fustane-table">
          <thead>
            <tr>
              <th>Emri</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="2" className="fustane-table__empty">
                  Duke ngarkuar...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="2" className="fustane-table__empty">
                  Ende s'ka kategori të shtuara. Shto të parën me butonin sipër.
                </td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id}>
                  <td data-label="Emri" className="fustane-table__name">
                    {c.emri}
                  </td>
                  <td data-label="" className="fustane-table__actions">
                    <button
                      className="fustane-table__action-btn"
                      onClick={() => openEditModal(c)}
                      data-tooltip="Ndrysho"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                    </button>
                    <button
                      className="fustane-table__action-btn fustane-table__action-btn--danger"
                      onClick={() => handleDelete(c.id)}
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal__title">
              {editingId ? 'Ndrysho Kategorinë' : 'Shto Kategori të Re'}
            </h3>
            {error && <div className="modal__error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <Input
                variant="boxed"
                label="Emri"
                name="emri"
                value={emri}
                onChange={(e) => setEmri(e.target.value)}
                required
              />

              <div className="modal__actions">
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? 'Duke ruajtur...' : editingId ? 'Ruaj Ndryshimet' : 'Ruaj Kategorinë'}
                </Button>
                <Button variant="outline" onClick={closeModal}>
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