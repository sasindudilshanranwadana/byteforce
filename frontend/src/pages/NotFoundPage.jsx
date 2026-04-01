import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-extrabold text-primary-700 mb-4 tracking-tight">
          404
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Page not found</h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="secondary" size="lg" onClick={() => window.history.back()}>
            <ArrowLeft size={16} /> Go Back
          </Button>
          <Button size="lg" as={Link} to="/">
            <Home size={16} /> Home
          </Button>
        </div>
      </div>
    </div>
  );
}
