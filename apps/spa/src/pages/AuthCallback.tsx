import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase processes the hash/code automatically via onAuthStateChange.
    navigate('/', { replace: true });
  }, [navigate]);

  return <p>Completing sign-in…</p>;
}
