import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import { Lock, Mail, Loader2, LogIn, UserPlus } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

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
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      {/* Brand panel */}
      <div
        className="hidden md:flex flex-col justify-between text-sidebar-foreground p-10 relative overflow-hidden bg-sidebar bg-cover bg-center"
        style={{ backgroundImage: "url('/login-bg.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-sidebar/90 via-sidebar/75 to-sidebar/95" />
        <div className="absolute inset-0 bg-sidebar/40" />

        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-accent flex items-center justify-center shrink-0">
            <span className="text-accent-foreground font-bold text-[11px] tracking-tight">P2P</span>
          </div>
          <span className="text-sm font-bold text-white tracking-tight">Guia de Parceiros</span>
        </div>

        <div className="relative max-w-sm">
          <h2 className="text-3xl font-semibold text-white leading-snug">
            Guia de Parceiros de Turismo Esportivo Internacional
          </h2>
          <p className="text-sidebar-foreground/70 text-sm mt-4 leading-relaxed">
            Consulte, classifique e gerencie a rede de agências e entidades esportivas parceiras em um único lugar.
          </p>
        </div>

        <p className="relative text-[11px] text-sidebar-foreground/45">© {new Date().getFullYear()} Mais Corporativo. Todos os direitos reservados.</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 relative">
        <div className="absolute top-5 right-5">
          <ThemeToggle className="text-muted-foreground hover:text-foreground hover:bg-muted" />
        </div>

        <div className="max-w-sm w-full">
          <div className="mb-8 md:hidden flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-accent flex items-center justify-center shrink-0">
              <span className="text-accent-foreground font-bold text-[11px] tracking-tight">P2P</span>
            </div>
            <span className="text-sm font-bold text-foreground tracking-tight">Guia de Parceiros</span>
          </div>

          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {isSignUp ? 'Criar conta' : 'Bem-vindo de volta'}
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm mb-8">
            {isSignUp ? 'Solicite acesso ao sistema de parceiros.' : 'Entre com suas credenciais para continuar.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/25 text-destructive text-sm font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">E-mail corporativo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  className="input pl-10"
                  placeholder="voce@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  className="input pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-sm mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isSignUp ? (
                <>Criar conta <UserPlus className="w-4 h-4" /></>
              ) : (
                <>Entrar no sistema <LogIn className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">
              {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem acesso?'}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-accent font-semibold ml-2 hover:opacity-80 transition-opacity"
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
