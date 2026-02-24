import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="not-found">
      <h2>404 — Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn-primary">Go Home</Link>
    </div>
  );
}
