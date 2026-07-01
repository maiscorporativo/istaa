import { useState } from 'react';
import { X, Sparkles, Copy, Check, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import type { Organization } from '../types';

interface QuoteGeneratorModalProps {
  organization: Organization;
  onClose: () => void;
}

export function QuoteGeneratorModal({ organization, onClose }: QuoteGeneratorModalProps) {
  // Main states
  const [language, setLanguage] = useState('Inglês');
  const [customLanguage, setCustomLanguage] = useState('');

  const [contactName, setContactName] = useState(organization.contacts?.[0]?.name || '');
  const [customContact, setCustomContact] = useState('');

  const [event, setEvent] = useState(organization.tags?.[0]?.name || '');
  const [customEvent, setCustomEvent] = useState('');

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pax, setPax] = useState('');
  
  const [accommodation, setAccommodation] = useState('Nenhuma');
  const [customAccommodation, setCustomAccommodation] = useState('');

  const [tickets, setTickets] = useState('Nenhum');
  const [customTickets, setCustomTickets] = useState('');

  const [transfer, setTransfer] = useState(false);

  // Status states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedText('');
    setCopied(false);

    // Resolve final values based on "Outros" selection
    const finalLanguage = language === 'Outros' ? customLanguage : language;
    const finalContact = contactName === 'Outros' ? customContact : contactName;
    const finalEvent = event === 'Outros' || event === '' ? customEvent : event;
    const finalAccommodation = accommodation === 'Outros' ? customAccommodation : accommodation;
    const finalTickets = tickets === 'Outros' ? customTickets : tickets;

    if (!finalEvent) {
      alert("Por favor, preencha o evento de interesse.");
      setIsGenerating(false);
      return;
    }

    try {
      const response = await api.post('/quotes/generate', {
        language: finalLanguage,
        contactName: finalContact,
        orgName: organization.name,
        event: finalEvent,
        dateFrom,
        dateTo,
        pax,
        accommodation: finalAccommodation,
        tickets: finalTickets,
        transfer
      });

      setGeneratedText(response.text);
    } catch (err: any) {
      alert(`Erro ao gerar cotação: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="card w-full max-w-4xl animate-in fade-in zoom-in-95 duration-200 border-brand-500/20 flex flex-col md:flex-row my-8 relative overflow-hidden">
        
        {/* Left Side: Form */}
        <div className="w-full md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-white/5 space-y-5 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-400" />
                Criar Cotação (IA)
              </h3>
              <p className="text-xs text-slate-400 mt-1">Para {organization.name}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form id="quote-form" onSubmit={handleGenerate} className="space-y-4 pb-4">
            {/* Language & Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Idioma</label>
                <select className="input-dark w-full text-sm" value={language} onChange={e => setLanguage(e.target.value)}>
                  <option value="Inglês">Inglês (EN)</option>
                  <option value="Espanhol">Espanhol (ES)</option>
                  <option value="Alemão">Alemão (DE)</option>
                  <option value="Francês">Francês (FR)</option>
                  <option value="Português">Português (PT)</option>
                  <option value="Outros">Outro...</option>
                </select>
                {language === 'Outros' && (
                  <input type="text" className="input-dark w-full text-sm mt-2" placeholder="Ex: Italiano" value={customLanguage} onChange={e => setCustomLanguage(e.target.value)} required />
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Contato Destino</label>
                <select className="input-dark w-full text-sm" value={contactName} onChange={e => setContactName(e.target.value)}>
                  <option value="">Equipe Geral</option>
                  {organization.contacts?.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                  <option value="Outros">Outro...</option>
                </select>
                {contactName === 'Outros' && (
                  <input type="text" className="input-dark w-full text-sm mt-2" placeholder="Nome do contato" value={customContact} onChange={e => setCustomContact(e.target.value)} required />
                )}
              </div>
            </div>

            {/* Event */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Evento / Esporte (Interesse)</label>
              {organization.tags && organization.tags.length > 0 ? (
                <select className="input-dark w-full text-sm" value={event} onChange={e => setEvent(e.target.value)} required>
                  <option value="">Selecione um evento listado...</option>
                  {organization.tags.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                  <option value="Outros">Outro (Digitar manualmente)...</option>
                </select>
              ) : null}
              
              {(event === 'Outros' || !organization.tags || organization.tags.length === 0) && (
                <input 
                  type="text" 
                  className={`input-dark w-full text-sm ${organization.tags && organization.tags.length > 0 ? 'mt-2' : ''}`} 
                  placeholder="Ex: Formula 1 Monaco" 
                  value={customEvent} 
                  onChange={e => setCustomEvent(e.target.value)} 
                  required 
                />
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Data Início</label>
                <input type="date" className="input-dark w-full text-sm" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Data Fim</label>
                <input type="date" className="input-dark w-full text-sm" value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </div>
            </div>

            {/* Pax & Accommodation */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Nº Pax</label>
                <input type="number" min="1" className="input-dark w-full text-sm" placeholder="Ex: 2" value={pax} onChange={e => setPax(e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Hospedagem</label>
                <select className="input-dark w-full text-sm" value={accommodation} onChange={e => setAccommodation(e.target.value)}>
                  <option value="Nenhuma">Nenhuma</option>
                  <option value="Hotel 3 Estrelas">Hotel 3 Estrelas</option>
                  <option value="Hotel 4 Estrelas">Hotel 4 Estrelas</option>
                  <option value="Hotel 5 Estrelas">Hotel 5 Estrelas</option>
                  <option value="Outros">Outro (Especificar)...</option>
                </select>
                {accommodation === 'Outros' && (
                  <input type="text" className="input-dark w-full text-sm mt-2" placeholder="Ex: Resort 5 Estrelas" value={customAccommodation} onChange={e => setCustomAccommodation(e.target.value)} required />
                )}
              </div>
            </div>

            {/* Tickets & Transfer */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Ingressos</label>
                <select className="input-dark w-full text-sm" value={tickets} onChange={e => setTickets(e.target.value)}>
                  <option value="Nenhum">Nenhum</option>
                  <option value="Standard / Arquibancada">Standard / Arquibancada</option>
                  <option value="VIP / Hospitality">VIP / Hospitality</option>
                  <option value="Outros">Outro (Especificar)...</option>
                </select>
                {tickets === 'Outros' && (
                  <input type="text" className="input-dark w-full text-sm mt-2" placeholder="Ex: Paddock Club" value={customTickets} onChange={e => setCustomTickets(e.target.value)} required />
                )}
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                  <input type="checkbox" checked={transfer} onChange={e => setTransfer(e.target.checked)} className="rounded border-white/10 bg-white/5 text-brand-500 focus:ring-brand-500 focus:ring-offset-surface-900" />
                  Incluir Transfer
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Right Side: Result */}
        <div className="w-full md:w-1/2 bg-surface-800/50 p-6 flex flex-col relative min-h-[400px]">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors hidden md:block"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex-1 flex flex-col">
            <h4 className="text-sm font-semibold text-slate-300 mb-4">Resultado Gerado</h4>
            
            <div className="flex-1 bg-surface-900 rounded-xl border border-white/5 p-4 relative group flex flex-col">
              {isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <span className="text-sm font-medium animate-pulse">A Inteligência Artificial está redigindo...</span>
                </div>
              ) : generatedText ? (
                <>
                  <textarea 
                    className="flex-1 w-full bg-transparent border-none outline-none text-sm text-slate-200 resize-none font-mono custom-scrollbar"
                    value={generatedText}
                    onChange={(e) => setGeneratedText(e.target.value)}
                  />
                  <button
                    onClick={handleCopy}
                    className="absolute top-4 right-4 p-2 bg-surface-800 border border-white/10 rounded-lg text-slate-300 hover:text-white hover:border-brand-500 transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span className="text-xs font-medium">{copied ? 'Copiado!' : 'Copiar Texto'}</span>
                  </button>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-sm text-center px-8">
                  <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                  <p>Preencha os dados ao lado e clique no botão abaixo para gerar uma cotação impecável usando IA.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <button
              form="quote-form"
              type="submit"
              disabled={isGenerating}
              className="btn-primary w-full justify-center h-12 text-base font-semibold"
            >
              {isGenerating ? 'Gerando...' : 'Gerar Cotação com IA'}
            </button>
            <p className="text-center text-[10px] text-slate-500 mt-3">
              Alimentado por Groq Llama-3. Você pode editar o texto antes de copiar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
