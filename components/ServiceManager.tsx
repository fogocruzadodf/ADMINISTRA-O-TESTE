
import React, { useState, useRef, useEffect } from 'react';
import { ServiceRecord, ServiceType, Team } from '../types';
import { Camera, MapPin, Plus, Save, Sparkles, X, User as UserIcon, Calendar, Clock, Image as ImageIcon, FileText, Trash2 } from 'lucide-react';
import { analyzeServiceImage } from '../services/geminiService';
import { saveServiceRecord, deleteServiceRecord, getTeams, generateId } from '../services/storageService';

interface ServiceManagerProps {
  serviceType: ServiceType;
  records: ServiceRecord[];
  onRecordChange: () => void;
}

export const ServiceManager: React.FC<ServiceManagerProps> = ({ serviceType, records, onRecordChange }) => {
  const [showForm, setShowForm] = useState(false);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  
  // Form State
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [team, setTeam] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingGeo, setLoadingGeo] = useState(false);

  // Initialize Data
  useEffect(() => {
    const teams = getTeams();
    setAvailableTeams(teams);
    if (teams.length > 0) {
        setTeam(teams[0].name);
    }
  }, []);

  // Initialize Date/Time when form opens
  useEffect(() => {
    if (showForm) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setDateTime(now.toISOString().slice(0, 16));
    }
  }, [showForm]);

  const handleGeolocation = () => {
    setLoadingGeo(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude.toFixed(4);
        const lng = position.coords.longitude.toFixed(4);
        setLocation(`Coord: ${lat}, ${lng} (Localização GPS)`);
        setLoadingGeo(false);
      }, (error) => {
        alert("Erro ao obter localização: " + error.message);
        setLoadingGeo(false);
      });
    } else {
      alert("Geolocalização não suportada.");
      setLoadingGeo(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setPhotos(prev => [...prev, base64]);

        if (photos.length === 0) {
            setIsAnalyzing(true);
            const description = await analyzeServiceImage(base64);
            if (notes === '') {
                setNotes(description);
            } else {
                setNotes(prev => prev + `\n[IA]: ${description}`);
            }
            setIsAnalyzing(false);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!location || !dateTime) {
      alert("Por favor, preencha o local e a data.");
      return;
    }

    const newRecord: ServiceRecord = {
      id: generateId(),
      serviceTypeId: serviceType.id,
      dateTime: dateTime,
      location,
      notes,
      team: team || 'Equipe não informada',
      photos,
      createdAt: Date.now()
    };

    saveServiceRecord(newRecord);
    onRecordChange();
    resetForm();
    setShowForm(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    e.preventDefault();
    
    // Pequeno timeout para garantir que a UI não trave antes do alert
    setTimeout(() => {
        if(window.confirm('Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.')) {
            deleteServiceRecord(id);
            onRecordChange();
        }
    }, 50);
  };

  const resetForm = () => {
    setLocation('');
    setNotes('');
    setPhotos([]);
    if (availableTeams.length > 0) setTeam(availableTeams[0].name);
  };

  const currentRecords = records.filter(r => r.serviceTypeId === serviceType.id).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      
      {/* Header with Add Button */}
      <div className="flex justify-between items-end bg-white p-6 rounded-xl shadow-sm border border-slate-100 sticky top-0 z-10">
        <div>
          <h2 className={`text-2xl font-bold text-${serviceType.color}-600 flex items-center gap-2`}>
             {serviceType.name}
          </h2>
          <p className="text-slate-500 text-sm mt-1">Gerencie os registros deste serviço</p>
        </div>
        {!showForm && (
            <button 
                onClick={() => setShowForm(true)}
                className={`flex items-center gap-2 bg-${serviceType.color}-600 hover:bg-${serviceType.color}-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md transition-all active:scale-95`}
            >
                <Plus size={20} />
                Novo Registro
            </button>
        )}
      </div>

      {/* Entry Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-fade-in-up">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-lg">Novo Registro de Serviço</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-red-500">
                <X size={24} />
            </button>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Details */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data e Hora</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Clock size={16} />
                        </div>
                        <input 
                            type="datetime-local" 
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-700"
                            value={dateTime}
                            onChange={e => setDateTime(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Local</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <MapPin size={16} />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Endereço ou referência..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={handleGeolocation}
                            disabled={loadingGeo}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-lg border border-slate-300 transition-colors"
                            title="Usar GPS"
                        >
                           <MapPin size={20} className={loadingGeo ? 'animate-pulse' : ''} />
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Equipe Responsável</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <UserIcon size={16} />
                        </div>
                        {availableTeams.length > 0 ? (
                            <select
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                value={team}
                                onChange={e => setTeam(e.target.value)}
                            >
                                {availableTeams.map(t => (
                                    <option key={t.id} value={t.name}>{t.name}</option>
                                ))}
                            </select>
                        ) : (
                            <input 
                                type="text" 
                                placeholder="Nome da equipe"
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={team}
                                onChange={e => setTeam(e.target.value)}
                            />
                        )}
                        {availableTeams.length === 0 && (
                            <p className="text-xs text-amber-600 mt-1">Nenhuma equipe cadastrada. Digite manualmente ou cadastre no menu Equipes.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column: Photos & Notes */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between">
                        <span>Fotos do Serviço</span>
                        <span className="text-xs text-slate-400">{photos.length} adicionada(s)</span>
                    </label>
                    
                    <div className="flex items-center gap-4 overflow-x-auto pb-2">
                        <label className="flex-shrink-0 w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors group">
                            <Camera className="text-slate-400 group-hover:text-blue-500 mb-1" size={24} />
                            <span className="text-xs text-slate-500 font-medium">Adicionar</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                        </label>
                        
                        {photos.map((photo, idx) => (
                            <div key={idx} className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-slate-200 shadow-sm group">
                                <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => setPhotos(prev => prev.filter((_, i) => i !== idx))}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative">
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between items-center">
                        Observações
                        {isAnalyzing && (
                             <span className="text-xs text-blue-600 flex items-center animate-pulse">
                                <Sparkles size={12} className="mr-1" /> Analisando imagem...
                             </span>
                        )}
                    </label>
                    <textarea 
                        rows={4}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        placeholder="Descreva o serviço realizado..."
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                    />
                     <div className="absolute bottom-3 right-3 text-xs text-slate-400 pointer-events-none">
                        Dica: A IA preenche isso automaticamente ao enviar foto.
                     </div>
                </div>
            </div>
          </div>
          
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button 
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
            >
                Cancelar
            </button>
            <button 
                onClick={handleSave}
                className={`px-6 py-2 bg-${serviceType.color}-600 hover:bg-${serviceType.color}-700 text-white rounded-lg font-medium shadow-md flex items-center gap-2`}
            >
                <Save size={18} />
                Salvar Registro
            </button>
          </div>
        </div>
      )}

      {/* Records List */}
      <div className="space-y-4">
        {currentRecords.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-100 border-dashed">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
                    <FileText size={32} />
                </div>
                <h3 className="text-lg font-medium text-slate-800">Nenhum registro encontrado</h3>
                <p className="text-slate-500 mt-1">Clique em "Novo Registro" para começar.</p>
            </div>
        ) : (
            currentRecords.map((record) => (
                <div key={record.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow relative group">
                    <div className="p-4 md:p-5 flex flex-col md:flex-row gap-4">
                        
                        {/* Record Image Thumbnail */}
                        <div className="flex-shrink-0">
                            {record.photos.length > 0 ? (
                                <img 
                                    src={record.photos[0]} 
                                    alt="Service" 
                                    className="w-full md:w-32 h-32 object-cover rounded-lg border border-slate-100"
                                />
                            ) : (
                                <div className="w-full md:w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200">
                                    <ImageIcon size={24} />
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                                        <Calendar size={14} />
                                        <span>{new Date(record.dateTime).toLocaleDateString('pt-BR')}</span>
                                        <Clock size={14} className="ml-2" />
                                        <span>{new Date(record.dateTime).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-lg">{record.location}</h4>
                                </div>
                                <div className={`px-2 py-1 rounded text-xs font-bold uppercase bg-${serviceType.color}-100 text-${serviceType.color}-700`}>
                                    {serviceType.name}
                                </div>
                            </div>

                            <p className="text-slate-600 text-sm leading-relaxed border-l-2 border-slate-200 pl-3">
                                {record.notes || <span className="italic text-slate-400">Sem observações.</span>}
                            </p>

                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50">
                                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                    <UserIcon size={12} /> {record.team}
                                </span>
                                <button 
                                    onClick={(e) => handleDelete(e, record.id)}
                                    className="flex items-center gap-1 bg-white text-red-500 hover:bg-red-50 hover:text-red-700 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold border border-red-100 shadow-sm cursor-pointer z-20 relative"
                                    title="Excluir Registro"
                                    type="button"
                                >
                                    <Trash2 size={14} /> Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};
