import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import '../../styles/components/Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/staff/dashboard');
    } catch (err) {
      setError('Email ose fjalëkalimi janë të gabuara.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__brand">
        <div className="login-page__monogram">ME</div>
        <div className="login-page__brand-body">
          <h1 className="login-page__brand-title">Moza<em>Elegance</em></h1>
          <p className="login-page__brand-tagline">
            Çdo fustan tregon një histori. Paneli i stafit ju ndihmon ta ruani,
            ta gjeni dhe ta jepni me qira pa vështirësi.
          </p>
        </div>
        <div className="login-page__brand-footer">Panel i Brendshëm · Vetëm për Staf</div>
      </div>

      <div className="login-page__form-side">
        <form className="login-card" onSubmit={handleSubmit}>
          <p className="eyebrow login-card__eyebrow">Qasje e Stafit</p>
          <h2 className="login-card__title">Mirë se erdhët</h2>
          <p className="login-card__subtitle">Kyçuni me kredencialet tuaja për të vazhduar.</p>

          {error && <div className="login-card__error">{error}</div>}

          <Input label="Email" type="email" placeholder="emri@mozaelegance.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Fjalëkalimi" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <div className="login-card__submit">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Duke u kyçur...' : 'Kyçu'}
            </Button>
          </div>

          <p className="login-card__foot-note">MozaElegance © {new Date().getFullYear()}</p>
        </form>
      </div>
    </div>
  );
}