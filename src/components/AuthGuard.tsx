import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type UserRole } from '../store/useAuth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireRole?: UserRole[];
}

export function AuthGuard({ children, requireRole }: AuthGuardProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      // Not logged in
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Verificando acesso...</p>
      </div>
    );
  }

  // Check roles if required
  if (requireRole && requireRole.length > 0) {
    if (!requireRole.includes(profile.role)) {
      // User doesn't have required role
      return (
        <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center">
          <div className="card text-center p-8 border-red-500/20 max-w-md">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Acesso Negado</h2>
            <p className="text-slate-400 text-sm mb-6">
              Seu perfil de ({profile.role}) não tem permissão para acessar esta área.
            </p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Voltar ao Início
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
