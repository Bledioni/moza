import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicHeader from '../../components/layout/PublicHeader';
import publicApi from '../../api/publicApi';
import '../../styles/components/PublicSite.css';

export default function Fustanet() {
  const navigate = useNavigate();
  const [fustane, setFustane] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);

  const [kategoriaId, setKategoriaId] = useState('');
  const [madhesia, setMadhesia] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const res = await publicApi.get('/public/fustane/filter-options');
        setCategories(res.data.categories ?? []);
        setSizes(res.data.sizes ?? []);
      } catch (err) {
        console.error(err);
      }
    };
    loadFilterOptions();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (kategoriaId) params.kategoria_id = kategoriaId;
        if (madhesia) params.madhesia = madhesia;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;

        const res = await publicApi.get('/public/fustane', { params });
        setFustane(res.data.data ?? res.data);
      } catch (err) {
        setError('Fustanet nuk u ngarkuan dot. Provo përsëri më vonë.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Vonesë e vogël (debounce) për fushat e çmimit, që të mos bëjmë
    // një kërkesë të re me çdo shtypje shifre.
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [kategoriaId, madhesia, minPrice, maxPrice]);

  const hasActiveFilters = kategoriaId || madhesia || minPrice || maxPrice;

  const clearFilters = () => {
    setKategoriaId('');
    setMadhesia('');
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <div className="public-page">
      <PublicHeader />

      <main className="public-main">
        <div className="public-intro">
          <p className="eyebrow">Koleksioni</p>
          <h2 className="public-intro__title">Fustanet Tona</h2>
          <p className="public-intro__text">
            Zbulo koleksionin tonë dhe kërko një fustan për ditën tënde të veçantë.
          </p>
        </div>

        <div className="catalog-filters">
          <div className="catalog-filters__row">
            <select
              className="catalog-filters__select"
              value={kategoriaId}
              onChange={(e) => setKategoriaId(e.target.value)}
            >
              <option value="">Të Gjitha Kategoritë</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emri}
                </option>
              ))}
            </select>

            <select
              className="catalog-filters__select"
              value={madhesia}
              onChange={(e) => setMadhesia(e.target.value)}
            >
              <option value="">Të Gjitha Madhësitë</option>
              {sizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="0"
              placeholder="Çmimi Min (€)"
              className="catalog-filters__input"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />

            <input
              type="number"
              min="0"
              placeholder="Çmimi Max (€)"
              className="catalog-filters__input"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />

            {hasActiveFilters && (
              <button className="catalog-filters__clear" onClick={clearFilters}>
                Pastro Filtrat
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <p className="public-status">Duke ngarkuar...</p>
        ) : error ? (
          <p className="public-status public-status--error">{error}</p>
        ) : fustane.length === 0 ? (
          <p className="public-status">
            {hasActiveFilters
              ? 'Asnjë fustan nuk përputhet me filtrat e zgjedhur.'
              : "Ende s'ka fustane të disponueshme."}
          </p>
        ) : (
          <div className="public-grid">
            {fustane.map((f) => (
              <button
                key={f.id}
                className="public-card"
                onClick={() => navigate(`/fustanet/${f.id}`)}
              >
                <div className="public-card__photo">
                  {f.foto_url ? (
                    <img src={f.foto_url} alt={f.emri} />
                  ) : (
                    <div className="public-card__photo-empty">—</div>
                  )}
                </div>
                <div className="public-card__info">
                  <span className="public-card__name">{f.emri}</span>
                  <span className="public-card__meta">
                    {f.madhesia} · {f.ngjyra}
                  </span>
                  {f.kategoria && <span className="public-card__category">{f.kategoria}</span>}
                  <span className="public-card__price">{f.cmimi_qirase} €</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}