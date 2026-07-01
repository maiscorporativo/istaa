import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useAuth } from '../store/useAuth';
import { TagChip } from '../components/TagChip';
import { QuoteGeneratorModal } from '../components/QuoteGeneratorModal';
import { Save, Trash2, ArrowLeft, Building2, User, Mail, Phone, Sparkles } from 'lucide-react';
import type { Tag, Organization } from '../types';

export function OrganizationForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { tags, organizations, addOrganization, updateOrganization, deleteOrganization } = useStore();
  const { profile } = useAuth();
  
  const isEditing = !!id;
  const isEditor = profile?.role === 'editor' || profile?.role === 'superadmin';
  const isReadOnly = !isEditor;

  const [formData, setFormData] = useState<Partial<Organization>>({
    name: '',
    site: '',
    country: '',
    description: '',
    status: 'Em análise',
    contacts: [],
    tags: []
  });

  const [showQuoteModal, setShowQuoteModal] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      const existing = organizations.find(o => o.id === id);
      if (existing) setFormData(existing);
    }
  }, [id, isEditing, organizations]);

  const [tagQuery, setTagQuery] = useState('');

  // Sugestões de tags (simulando IA / Busca rápida)
  const availableTags = tags.filter(t => 
    !formData.tags?.some(st => st.id === t.id) &&
    (t.name.toLowerCase().includes(tagQuery.toLowerCase()) || 
     t.category.toLowerCase().includes(tagQuery.toLowerCase()))
  ).slice(0, 8);

  const toggleTag = (tag: Tag) => {
    if (isReadOnly) return;
    const currentTags = formData.tags || [];
    if (currentTags.some(t => t.id === tag.id)) {
      setFormData({ ...formData, tags: currentTags.filter(t => t.id !== tag.id) });
    } else {
      setFormData({ ...formData, tags: [...currentTags, tag] });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!formData.name) return;
    
    if (isEditing && id) {
      updateOrganization(id, formData);
    } else {
      addOrganization(formData as any);
    }
    navigate('/');
  };

  const handleDelete = () => {
    if (isReadOnly) return;
    if (window.confirm('Tem certeza que deseja excluir esta organização?')) {
      if (id) deleteOrganization(id);
      navigate('/');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-brand-500" />
            {isReadOnly ? 'Visualizar Organização' : (isEditing ? 'Editar Organização' : 'Nova Organização')}
          </h1>
          <p className="text-slate-400 text-sm">
            {isReadOnly ? 'Você está no modo de visualização.' : (isEditing ? 'Atualize os dados e as classificações.' : 'Cadastre uma nova entidade e classifique-a.')}
          </p>
        </div>
        <div className="ml-auto">
          {isEditing && (
            <button 
              onClick={() => setShowQuoteModal(true)}
              className="btn-primary animate-pulse-glow"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Criar Cotação
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-2">Dados Principais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Nome da Entidade *</label>
              <input required disabled={isReadOnly} type="text" className="input-dark disabled:opacity-60" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Website</label>
              <input type="url" disabled={isReadOnly} className="input-dark disabled:opacity-60" value={formData.site} onChange={e => setFormData({ ...formData, site: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">País</label>
              <input type="text" disabled={isReadOnly} className="input-dark disabled:opacity-60" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Descrição Curta</label>
              <textarea disabled={isReadOnly} className="input-dark h-24 resize-none disabled:opacity-60" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Contato Principal */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-2 flex items-center gap-2">
            <User className="w-5 h-5 text-brand-400" />
            Contato Principal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Nome do Contato</label>
              <input
                type="text"
                disabled={isReadOnly}
                className="input-dark disabled:opacity-60"
                placeholder="Ex: João Silva"
                value={formData.contacts?.[0]?.name || ''}
                onChange={e => {
                  const contacts = [...(formData.contacts || [])];
                  contacts[0] = { ...contacts[0], id: contacts[0]?.id || '', name: e.target.value };
                  setFormData({ ...formData, contacts });
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3" /> E-mail
              </label>
              <input
                type="email"
                disabled={isReadOnly}
                className="input-dark disabled:opacity-60"
                placeholder="contato@entidade.com"
                value={formData.contacts?.[0]?.email || ''}
                onChange={e => {
                  const contacts = [...(formData.contacts || [])];
                  contacts[0] = { ...contacts[0], id: contacts[0]?.id || '', name: contacts[0]?.name || '', email: e.target.value };
                  setFormData({ ...formData, contacts });
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3" /> Telefone
              </label>
              <input
                type="tel"
                disabled={isReadOnly}
                className="input-dark disabled:opacity-60"
                placeholder="+55 11 99999-9999"
                value={formData.contacts?.[0]?.phone || ''}
                onChange={e => {
                  const contacts = [...(formData.contacts || [])];
                  contacts[0] = { ...contacts[0], id: contacts[0]?.id || '', name: contacts[0]?.name || '', phone: e.target.value };
                  setFormData({ ...formData, contacts });
                }}
              />
            </div>
          </div>
        </div>

        <div className="card space-y-4 border border-brand-500/20">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div>
              <h2 className="text-lg font-semibold text-white">Classificação (Smart Tags)</h2>
              <p className="text-[10px] text-slate-400">O motor de busca usará essas tags.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {!isReadOnly && (
              <div>
                <input 
                  type="text" 
                  className="input-dark mb-3" 
                  placeholder="Busque tags para adicionar..." 
                  value={tagQuery} onChange={e => setTagQuery(e.target.value)}
                />
                {availableTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <button key={tag.id} type="button" onClick={() => toggleTag(tag)} className="hover:-translate-y-0.5 transition-transform">
                        <TagChip tag={tag} />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Nenhuma tag encontrada. Crie novas tags no menu correspondente.</p>
                )}
              </div>
            )}

            <div className="p-4 rounded-xl bg-surface-900 border border-white/5 min-h-[100px]">
              <p className="text-xs font-medium text-slate-500 mb-3">Tags Selecionadas:</p>
              <div className="flex flex-wrap gap-2">
                {formData.tags?.length === 0 && <span className="text-sm text-slate-600">Nenhuma tag selecionada.</span>}
                {formData.tags?.map(tag => (
                  <TagChip key={tag.id} tag={tag} onRemove={isReadOnly ? undefined : () => toggleTag(tag)} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <div>
            {!isReadOnly && isEditing && (
              <button type="button" onClick={handleDelete} className="btn-danger">
                <Trash2 className="w-4 h-4" /> Excluir
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-ghost">{isReadOnly ? 'Voltar' : 'Cancelar'}</button>
            {!isReadOnly && (
              <button type="submit" className="btn-primary"><Save className="w-4 h-4" /> {isEditing ? 'Salvar Alterações' : 'Criar Entidade'}</button>
            )}
          </div>
        </div>
      </form>

      {showQuoteModal && isEditing && (
        <QuoteGeneratorModal 
          organization={formData as Organization} 
          onClose={() => setShowQuoteModal(false)} 
        />
      )}
    </div>
  );
}
