import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicHeader from '../../components/layout/PublicHeader';
import publicApi from '../../api/publicApi';
import '../../styles/components/PublicSite.css';
import video from './assets/19237274-hd_1920_1080_25fps.mp4';

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Shfleto Koleksionin',
    text: 'Zgjedh fustanin që të pëlqen nga koleksioni ynë i gjerë, i përditësuar vazhdimisht.',
  },
  {
    step: '02',
    title: 'Kontrollo Datat',
    text: 'Shiko kalendarin e disponueshmërisë dhe zgjedh ditët që të duhen për ngjarjen tënde.',
  },
  {
    step: '03',
    title: 'Dërgo Kërkesën',
    text: 'Plotëso emrin dhe telefonin, dhe ne do të të kontaktojmë brenda 24 orëve për konfirmim.',
  },
  {
    step: '04',
    title: 'Merr Fustanin',
    text: 'Merr fustanin në datën e caktuar, shijo ngjarjen tënde, dhe na e kthe pas përdorimit.',
  },
];

const GALLERY_PHOTOS = [
  { src: '/gallery/gallery-1.jpg', alt: 'Fustan dasme në butikun MozaElegance' },
  { src: '/gallery/gallery-2.jpg', alt: 'Detaje qëndismash në fustan' },
  { src: '/gallery/gallery-3.jpg', alt: 'Klientja duke provuar fustan' },
  { src: '/gallery/gallery-4.jpg', alt: 'Koleksioni i butikut' },
  { src: '/gallery/gallery-5.jpg', alt: 'Fustan gala i ngjyrës bordo' },
];

const TESTIMONIALS = [
  {
    name: 'Arta M.',
    text: 'Fustani ishte pikërisht ashtu siç e prisja nga fotot. Stafi shumë i sjellshëm dhe procesi shumë i thjeshtë.',
  },
  {
    name: 'Blerina K.',
    text: 'Gjeta fustanin perfekt për dasmën e kushërirës sime. Çmimi ishte i arsyeshëm dhe cilësia e shkëlqyer.',
  },
  {
    name: 'Fjolla R.',
    text: 'Rezervimi online ishte shumë i lehtë. Rekomandoj me plot gojën për këdo që kërkon fustan për ndonjë ceremoni.',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await publicApi.get('/public/fustane');
        const all = res.data.data ?? res.data;
        setFeatured(all.slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="public-page">
      <PublicHeader />

      {/* ---------- Hero (video background) ---------- */}
      <section className="hero hero--video">
        <video
          className="hero__video"
          autoPlay
          muted
          loop
          playsInline
          poster="/hero-poster.jpg"
        >
          <source src={video} type="video/mp4" />
        </video>
        <div className="hero__overlay" />

        <div className="hero__inner">
          <p className="eyebrow">Qira Fustanesh Elegante</p>
          <h2 className="hero__title">Gjej Fustanin e Ëndrrave Tua</h2>
          <p className="hero__text">
            Koleksion i kuruar me kujdes për ditën tënde më të veçantë — dasma, ceremoni,
            dhe raste festive.
          </p>
          <button className="hero__cta" onClick={() => navigate('/fustanet')}>
            Shiko Koleksionin
          </button>
        </div>
      </section>

      {/* ---------- Featured dresses ---------- */}
      <main className="public-main">
        {!loading && featured.length > 0 && (
          <>
            <div className="public-intro">
              <p className="eyebrow">Të Zgjedhura</p>
              <h2 className="public-intro__title">Fustane të Populluara</h2>
            </div>

            <div className="public-grid">
              {featured.map((f) => (
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
                    <span className="public-card__price">{f.cmimi_qirase} €</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="hero__more">
              <button className="public-back-cta" onClick={() => navigate('/fustanet')}>
                Shiko të Gjitha Fustanet →
              </button>
            </div>
          </>
        )}
      </main>

      {/* ---------- About us ---------- */}
      <section className="about-section">
        <div className="about-section__inner">
          <div className="about-section__text">
            <p className="eyebrow">Kush Jemi</p>
            <h2 className="section-title">Rreth MozaElegance</h2>
            <p className="about-section__paragraph">
              MozaElegance është një butik i specializuar në qira fustanesh për dasma, fejesa,
              ceremoni dhe çdo rast tjetër festiv. Prej vitesh, ndihmojmë klientët tanë të
              ndihen të veçantë duke ofruar një koleksion të kuruar me kujdes, cilësi të lartë,
              dhe një shërbim personal e miqësor.
            </p>
            <p className="about-section__paragraph">
              Besojmë se çdo grua meriton të ndihet mbretëreshë në ditën e saj të veçantë —
              pa nevojën për të shpenzuar një pasuri në një fustan që do të përdoret vetëm një
              herë. Ne jemi këtu për ta bërë atë ëndërr të realizueshme.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="steps-section">
        <div className="public-intro">
          <p className="eyebrow">Procesi</p>
          <h2 className="public-intro__title">Si Funksionon</h2>
        </div>

        <div className="steps-grid">
          {HOW_IT_WORKS.map((s) => (
            <div className="step-card" key={s.step}>
              <span className="step-card__number">{s.step}</span>
              <h3 className="step-card__title">{s.title}</h3>
              <p className="step-card__text">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Photo gallery ---------- */}
      <section className="gallery-section">
        <div className="public-intro">
          <p className="eyebrow">Nga Butiku Ynë</p>
          <h2 className="public-intro__title">Momente të Veçanta</h2>
        </div>

        <div className="gallery-strip">
          {GALLERY_PHOTOS.map((photo) => (
            <div className="gallery-strip__item" key={photo.src}>
              {/* Zëvendëso path-in me foton reale kur ta kesh gati. */}
              <img src={photo.src} alt={photo.alt} loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Testimonials ---------- */}
      <section className="testimonials-section">
        <div className="public-intro">
          <p className="eyebrow">Klientët Tanë</p>
          <h2 className="public-intro__title">Çfarë Thonë Ata</h2>
        </div>

        <div className="testimonials-grid">
          {TESTIMONIALS.map((t) => (
            <div className="testimonial-card" key={t.name}>
              <svg className="testimonial-card__quote" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.17 6A5.17 5.17 0 0 0 2 11.17V18h6.83v-6.83H4.5a2.67 2.67 0 0 1 2.67-2.67V6ZM17.17 6A5.17 5.17 0 0 0 12 11.17V18h6.83v-6.83H14.5a2.67 2.67 0 0 1 2.67-2.67V6Z" />
              </svg>
              <p className="testimonial-card__text">{t.text}</p>
              <span className="testimonial-card__name">{t.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Contact ---------- */}
      <section className="contact-section">
        <div className="contact-section__inner">
          <div className="public-intro">
            <p className="eyebrow">Na Kontaktoni</p>
            <h2 className="public-intro__title">Jemi Këtu për Ty</h2>
          </div>

          <div className="contact-grid">
            <a href="tel:+38344000000" className="contact-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
              </svg>
              <span>+383 44 000 000</span>
            </a>

            <a
              href="https://www.google.com/maps"
              target="_blank"
              rel="noreferrer"
              className="contact-item"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Rr. Kryesore, Prishtinë</span>
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="contact-item"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
                <path d="M17.5 6.5h.01" />
              </svg>
              <span>@mozaelegance</span>
            </a>

            <div className="contact-item contact-item--static">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span>Hën–Sht: 09:00–19:00</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="public-footer">
        <p>&copy; {new Date().getFullYear()} MozaElegance. Të gjitha të drejtat e rezervuara.</p>
      </footer>
    </div>
  );
}