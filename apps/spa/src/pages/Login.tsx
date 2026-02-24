import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { signIn, loading, error } = useAuth();

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>ERP Login</h1>
        <p>Sign in with your @twinstarsgroup.com Google account.</p>
        {error && <p className="error-message">{error}</p>}
        <button onClick={signIn} disabled={loading} className="btn btn-primary btn-google">
          {loading ? 'Signing in…' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  );
}
