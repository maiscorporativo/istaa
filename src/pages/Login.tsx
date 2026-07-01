import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import { Lock, Mail, Loader2, LogIn, UserPlus } from 'lucide-react';

export function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      const res = await signUp(email, password);
      if (res.error) {
        setError(res.error.message);
      } else {
        alert('Conta criada! Verifique sua caixa de entrada e clique no link para confirmar seu e-mail antes de entrar.');
        setIsSignUp(false);
      }
    } else {
      const res = await signIn(email, password);
      if (res.error) {
        if (res.error.message.includes('Email not confirmed')) {
          setError('Você precisa confirmar seu e-mail antes de entrar. Verifique sua caixa de entrada.');
        } else {
          setError('Credenciais inválidas. Verifique seu e-mail e senha.');
        }
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 p-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto shadow-lg shadow-brand-600/30 mb-6">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {isSignUp ? 'Criar Conta' : 'Bem-vindo de volta'}
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Sistema de Inteligência e Mapeamento
          </p>
        </div>

        {/* Form Card */}
        <div className="card border-brand-500/20 p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-500 to-purple-500"></div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">E-mail Corporativo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  className="input-dark pl-10"
                  placeholder="voce@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  className="input-dark pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2 py-2.5 text-base"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isSignUp ? (
                <>Criar Conta <UserPlus className="w-4 h-4 ml-2" /></>
              ) : (
                <>Entrar no Sistema <LogIn className="w-4 h-4 ml-2" /></>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center border-t border-white/5 pt-6">
            <p className="text-sm text-slate-400">
              {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem acesso?'}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-brand-400 font-medium ml-2 hover:text-brand-300 transition-colors"
              >
                {isSignUp ? 'Fazer login' : 'Criar conta de acesso'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
