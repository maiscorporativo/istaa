import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Shield, ShieldAlert, ShieldCheck, UserCog, KeyRound, CheckCircle2, Plus, X, Loader2 } from 'lucide-react';
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
      
      // Automatically refresh the list or inject the new user
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

  const resetPassword = async (profile: Profile) => {
    alert('A redefinição de senha por e-mail no MySQL será implementada em uma próxima atualização com envio de SMTP.');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/20">
            <UserCog className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Gestão de Acessos</h1>
            <p className="text-slate-400 mt-1">Gerencie os níveis de permissão dos usuários do sistema.</p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Usuário
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Carregando usuários...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-800/50 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Usuário (E-mail)</th>
                <th className="px-6 py-4">Data de Entrada</th>
                <th className="px-6 py-4">Nível de Acesso</th>
                <th className="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {profiles.map(profile => (
                <tr key={profile.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-200">{profile.email}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={profile.role}
                      onChange={(e) => updateRole(profile.id, e.target.value as UserRole)}
                      className="input-dark py-1.5 px-3 text-xs min-w-[140px]"
                    >
                      <option value="viewer">Viewer (Apenas Leitura)</option>
                      <option value="editor">Editor (Pode Editar Dados)</option>
                      <option value="superadmin">Superadmin (Acesso Total)</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => resetPassword(profile)}
                      title="Enviar e-mail de redefinição de senha"
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors opacity-50"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      Resetar Senha
                    </button>
                  </td>
                </tr>
              ))}
              {profiles.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-surface-900/50 p-4 flex gap-3">
          <ShieldAlert className="w-5 h-5 text-slate-400 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-white">Viewer</h4>
            <p className="text-xs text-slate-500 mt-1">Só pode consultar, buscar e visualizar detalhes. Não consegue criar, editar ou excluir.</p>
          </div>
        </div>
        <div className="card bg-surface-900/50 p-4 flex gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-white">Editor</h4>
            <p className="text-xs text-slate-500 mt-1">Pode criar, editar e excluir Organizações e Descritores/Tags livremente.</p>
          </div>
        </div>
        <div className="card bg-surface-900/50 p-4 flex gap-3">
          <Shield className="w-5 h-5 text-brand-400 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-white">Superadmin</h4>
            <p className="text-xs text-slate-500 mt-1">Tem todos os poderes do Editor e ainda pode alterar o cargo de outros usuários.</p>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200 border-brand-500/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Adicionar Usuário</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">E-mail</label>
                <input
                  type="email"
                  required
                  className="input-dark w-full"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="usuario@empresa.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Senha de Acesso</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="input-dark w-full"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Nível de Acesso</label>
                <select
                  className="input-dark w-full"
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as UserRole)}
                >
                  <option value="viewer">Viewer (Apenas Leitura)</option>
                  <option value="editor">Editor (Pode Editar Dados)</option>
                  <option value="superadmin">Superadmin (Acesso Total)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/5">
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
                  className="btn-primary flex-1 justify-center"
                >
                  {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
