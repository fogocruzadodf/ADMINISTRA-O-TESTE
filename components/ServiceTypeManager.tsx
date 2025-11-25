
import React, { useState, useEffect } from 'react';
import { ServiceType } from '../types';
import { getServiceTypes, saveServiceType, deleteServiceType, generateId, getServiceRecords } from '../services/storageService';
import { Plus, Trash2, Settings, Rat, Trash2 as TrashIcon, Droplets, Trees, Lightbulb, Pickaxe, Briefcase, AlertTriangle } from 'lucide-react';

interface ServiceTypeManagerProps {
    onUpdate: () => void;
}

export const ServiceTypeManager: React.FC<ServiceTypeManagerProps> = ({ onUpdate }) => {
  const [types, setTypes] = useState<ServiceType[]>([]);
  const [recordCounts, setRecordCounts] = useState<Record<string, number>>({});
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('Briefcase');
  const [newColor, setNewColor] = useState('blue');

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = () => {
    const allTypes = getServiceTypes();
    setTypes(allTypes);

    // Count records for each type to warn user before deleting
    const allRecords = getServiceRecords();
    const counts: Record<string, number> = {};
    allTypes.forEach(t => {
        counts[t.id] = allRecords.filter(r => String(r.serviceTypeId) === String(t.id)).length;
    });
    setRecordCounts(counts);
  };

  const handleAddType = () => {
    if (!newName.trim()) return;

    const newType: ServiceType = {
      id: generateId(),
      name: newName.trim(),
      icon: newIcon,
      color: newColor
    };

    saveServiceType(newType);
    setNewName('');
    setNewIcon('Briefcase');
    setNewColor('blue');
    loadTypes();
    onUpdate(); // Update sidebar
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    // Parar propagação IMEDIATAMENTE
    e.stopPropagation();
    e.preventDefault();

    const count = recordCounts[id] || 0;
    let message = 'Tem certeza que deseja excluir esta categoria?';
    
    if (count > 0) {
        message = `ATENÇÃO: Existem ${count} registros vinculados a esta categoria.\n\nSe excluir, eles ficarão sem categoria.\n\nDeseja confirmar a exclusão?`;
    }

    // Usar timeout pequeno para garantir que a UI processou o clique antes do alert travar a thread
    setTimeout(() => {
        if (window.confirm(message)) {
            performDeletion(id);
        }
    }, 50);
  };

  const performDeletion = (id: string) => {
      // 1. Excluir do armazenamento
      deleteServiceType(id);
      
      // 2. Atualizar estado local imediatamente (filtro visual)
      setTypes(prev => prev.filter(t => String(t.id) !== String(id)));
      
      // 3. Notificar o App principal para atualizar Sidebar
      onUpdate();
  };

  const icons = [
    { value: 'Truck', label: 'Caminhão (Lixo)', component: <TrashIcon size={18} /> },
    { value: 'Rat', label: 'Rato (Boca de Lobo)', component: <Rat size={18} /> },
    { value: 'Droplets', label: 'Água (Lavagem)', component: <Droplets size={18} /> },
    { value: 'Trees', label: 'Árvore (Poda)', component: <Trees size={18} /> },
    { value: 'Lightbulb', label: 'Luz (Iluminação)', component: <Lightbulb size={18} /> },
    { value: 'Pickaxe', label: 'Picareta (Obras)', component: <Pickaxe size={18} /> },
    { value: 'Briefcase', label: 'Maleta (Geral)', component: <Briefcase size={18} /> },
  ];

  const colors = [
    { value: 'blue', label: 'Azul', bg: 'bg-blue-500' },
    { value: 'amber', label: 'Laranja', bg: 'bg-amber-500' },
    { value: 'green', label: 'Verde', bg: 'bg-green-500' },
    { value: 'cyan', label: 'Ciano', bg: 'bg-cyan-500' },
    { value: 'red', label: 'Vermelho', bg: 'bg-red-500' },
    { value: 'purple', label: 'Roxo', bg: 'bg-purple-500' },
    { value: 'indigo', label: 'Índigo', bg: 'bg-indigo-500' },
    { value: 'stone', label: 'Cinza', bg: 'bg-stone-500' },
  ];

  const getIconComponent = (iconName: string) => {
    const icon = icons.find(i => i.value === iconName);
    return icon ? icon.component : <Briefcase size={18} />;
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Settings className="text-slate-600" /> Configuração de Categorias
            </h2>
            <p className="text-slate-500 text-sm mt-1">Crie e gerencie os tipos de serviços disponíveis no menu.</p>
        </div>
      </div>

      {/* Add Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-700 mb-4">Adicionar Nova Categoria</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
             <label className="block text-sm font-medium text-slate-600 mb-1">Nome do Serviço</label>
             <input 
                type="text" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Pintura de Meio-Fio"
                className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
             />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Ícone</label>
            <div className="relative">
                <select 
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer"
                >
                    {icons.map(i => (
                        <option key={i.value} value={i.value}>{i.label}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-slate-500">
                    {getIconComponent(newIcon)}
                </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Cor do Tema</label>
            <div className="relative">
                <select 
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer pl-10"
                >
                    {colors.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                </select>
                <div className={`absolute left-3 top-3.5 w-4 h-4 rounded-full ${colors.find(c => c.value === newColor)?.bg}`}></div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
             <button 
                onClick={handleAddType}
                disabled={!newName.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
             >
                <Plus size={20} />
                Adicionar Categoria
             </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700">
            Categorias Ativas ({types.length})
        </div>
        <ul className="divide-y divide-slate-100">
            {types.length === 0 ? (
                <li className="p-8 text-center text-slate-400 italic">
                    Nenhuma categoria cadastrada.
                </li>
            ) : (
                types.map((type) => (
                    <li key={type.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors relative group">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg bg-${type.color}-100 text-${type.color}-600 flex items-center justify-center flex-shrink-0`}>
                                {getIconComponent(type.icon)}
                            </div>
                            <div>
                                <span className="font-bold text-slate-800 block">{type.name}</span>
                                {recordCounts[type.id] ? (
                                    <span className="text-xs text-amber-600 font-medium flex items-center gap-1 mt-1">
                                        <AlertTriangle size={10} /> {recordCounts[type.id]} registros vinculados
                                    </span>
                                ) : (
                                    <span className="text-xs text-green-600">Sem registros vinculados</span>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex items-center mt-2 sm:mt-0">
                             <button 
                                type="button"
                                onClick={(e) => handleDeleteClick(e, type.id)}
                                className="relative z-50 flex items-center justify-center gap-2 bg-white text-red-500 hover:bg-red-50 hover:text-red-700 hover:border-red-300 px-4 py-2 rounded-lg transition-all text-sm font-bold border border-red-100 shadow-sm cursor-pointer w-full sm:w-auto"
                                title="Excluir Categoria"
                            >
                                <Trash2 size={16} /> 
                                <span>Excluir</span>
                            </button>
                        </div>
                    </li>
                ))
            )}
        </ul>
      </div>
    </div>
  );
};
