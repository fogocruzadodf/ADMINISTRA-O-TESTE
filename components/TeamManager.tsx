
import React, { useState, useEffect } from 'react';
import { Team } from '../types';
import { getTeams, saveTeam, deleteTeam, generateId } from '../services/storageService';
import { Plus, Trash2, Users } from 'lucide-react';

export const TeamManager: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState('');

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = () => {
    setTeams(getTeams());
  };

  const handleAddTeam = () => {
    if (!newTeamName.trim()) return;

    const newTeam: Team = {
      id: generateId(),
      name: newTeamName.trim()
    };

    saveTeam(newTeam);
    setNewTeamName('');
    loadTeams();
  };

  const handleDeleteTeam = (id: string) => {
    setTimeout(() => {
        if (window.confirm('Tem certeza que deseja excluir esta equipe?')) {
            deleteTeam(id);
            // Force update locally to ensure UI reflects change immediately
            setTeams(prev => prev.filter(t => t.id !== id));
        }
    }, 50);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Users className="text-emerald-600" /> Gestão de Equipes
            </h2>
            <p className="text-slate-500 text-sm mt-1">Cadastre as equipes que realizam os serviços.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <label className="block text-sm font-medium text-slate-700 mb-2">Adicionar Nova Equipe</label>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="Ex: Equipe de Poda - Setor Sul"
            className="flex-1 p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            onKeyDown={(e) => e.key === 'Enter' && handleAddTeam()}
          />
          <button 
            onClick={handleAddTeam}
            disabled={!newTeamName.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Adicionar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700">
            Equipes Cadastradas ({teams.length})
        </div>
        <ul className="divide-y divide-slate-100">
            {teams.length === 0 ? (
                <li className="p-8 text-center text-slate-400 italic">
                    Nenhuma equipe cadastrada.
                </li>
            ) : (
                teams.map((team) => (
                    <li key={team.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                                {team.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-800">{team.name}</span>
                        </div>
                        <button 
                            type="button"
                            onClick={() => handleDeleteTeam(team.id)}
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all cursor-pointer z-10"
                            title="Excluir equipe"
                        >
                            <Trash2 size={20} />
                        </button>
                    </li>
                ))
            )}
        </ul>
      </div>
    </div>
  );
};
