import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Shield, ShieldAlert, ShieldCheck, UserCog, KeyRound, Plus, X, Loader2 } from 'lucide-react';
import type { Profile, UserRole } from '../store/useAuth';

export function UsersManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('viewer');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const data = await api.get('/users');
      setProfiles(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const updateRole = async (id: string, newRole: UserRole) => {
    try {
      await api.put(`/users/${id}`, { role: newRole });
      setProfiles(profiles.map(p => p.id === id ? { ...p, role: newRole } : p));
    } catch (err: any) {
      alert(`Erro ao atualizar nível de acesso: ${err.message}`);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const newUser = await api.post('/users', {
        email: newEmail,
        password: newPassword,
        role: newRole
      });

      setProfiles([{
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        created_at: new Date().toISOString()
      }, ...profiles]);

      setShowAddModal(false);
      setNewEmail('');
      setNewPassword('');
      setNewRole('viewer');
    } catch (err: any) {
      alert(`Erro ao criar usuário: ${err.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  const resetPassword = async (_profile: Profile) => {
    alert('A redefinição de senha por e-mail no MySQL será implementada em uma próxima atualização com envio de SMTP.');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-md bg-accent/10 flex items-center justify-center text-accent">
            <UserCog className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Gestão de acessos</h1>
            <p className="text-muted-foreground mt-1 text-sm">Gerencie os níveis de permissão dos usuários do sistema.</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Adicionar usuário
        </button>
      </div>

      <div className="card overflow-hidden !p-0">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Carregando usuários...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-muted-foreground text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-3.5">Usuário (e-mail)</th>
                <th className="px-6 py-3.5">Data de entrada</th>
                <th className="px-6 py-3.5">Nível de acesso</th>
                <th className="px-6 py-3.5">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {profiles.map(profile => (
                <tr key={profile.id} className="hover:bg-muted/60 transition-colors">
                  <td className="px-6 py-3.5">
                    <span className="font-medium text-foreground">{profile.email}</span>
                  </td>
                  <td className="px-6 py-3.5 text-muted-foreground">
                    {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-3.5">
                    <select
                      value={profile.role}
                      onChange={(e) => updateRole(profile.id, e.target.value as UserRole)}
                      className="input py-1.5 px-3 text-xs min-w-[140px]"
                    >
                      <option value="viewer">Viewer (apenas leitura)</option>
                      <option value="editor">Editor (pode editar dados)</option>
                      <option value="superadmin">Superadmin (acesso total)</option>
                    </select>
                  </td>
                  <td className="px-6 py-3.5">
                    <button
                      onClick={() => resetPassword(profile)}
                      title="Enviar e-mail de redefinição de senha"
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-warning/10 text-warning border border-warning/25 hover:bg-warning/15 transition-colors opacity-60"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      Resetar senha
                    </button>
                  </td>
                </tr>
              ))}
              {profiles.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 flex gap-3">
          <ShieldAlert className="w-5 h-5 text-muted-foreground shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-foreground">Viewer</h4>
            <p className="text-xs text-muted-foreground mt-1">Só pode consultar, buscar e visualizar detalhes. Não consegue criar, editar ou excluir.</p>
          </div>
        </div>
        <div className="card p-4 flex gap-3">
          <ShieldCheck className="w-5 h-5 text-success shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-foreground">Editor</h4>
            <p className="text-xs text-muted-foreground mt-1">Pode criar, editar e excluir Organizações e Descritores/Tags livremente.</p>
          </div>
        </div>
        <div className="card p-4 flex gap-3">
          <Shield className="w-5 h-5 text-accent shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-foreground">Superadmin</h4>
            <p className="text-xs text-muted-foreground mt-1">Tem todos os poderes do Editor e ainda pode alterar o cargo de outros usuários.</p>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40">
          <div className="card w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-foreground">Adicionar usuário</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">E-mail</label>
                <input
                  type="email"
                  required
                  className="input w-full"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="usuario@empresa.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Senha de acesso</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="input w-full"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Nível de acesso</label>
                <select
                  className="input w-full"
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as UserRole)}
                >
                  <option value="viewer">Viewer (apenas leitura)</option>
                  <option value="editor">Editor (pode editar dados)</option>
                  <option value="superadmin">Superadmin (acesso total)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="btn-primary flex-1"
                >
                  {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
