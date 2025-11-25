import React from 'react';
import { ServiceRecord, ServiceType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, CheckCircle2, MapPin, Activity } from 'lucide-react';

interface DashboardProps {
  records: ServiceRecord[];
  types: ServiceType[];
}

export const Dashboard: React.FC<DashboardProps> = ({ records, types }) => {
  // Stats calculation
  const totalServices = records.length;
  const today = new Date().toISOString().split('T')[0];
  const servicesToday = records.filter(r => r.dateTime.startsWith(today)).length;
  const uniqueLocations = new Set(records.map(r => r.location)).size;

  // Chart Data Preparation
  const data = types.map(type => {
    const count = records.filter(r => r.serviceTypeId === type.id).length;
    return {
      name: type.name,
      count: count,
      color: type.color
    };
  }).filter(d => d.count > 0);

  // Helper to map tailwind color names to hex for Recharts
  const getColorHex = (colorName: string) => {
    const colors: Record<string, string> = {
      blue: '#2563eb',
      amber: '#d97706',
      cyan: '#0891b2',
      green: '#16a34a',
      yellow: '#ca8a04',
      stone: '#57534e',
      slate: '#475569',
      indigo: '#4f46e5'
    };
    return colors[colorName] || '#475569';
  };

  const StatCard = ({ icon, label, value, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
      <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Visão Geral</h2>
        <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
          Atualizado: {new Date().toLocaleTimeString()}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Activity />} 
          label="Total de Serviços" 
          value={totalServices} 
          color="blue" 
        />
        <StatCard 
          icon={<Calendar />} 
          label="Realizados Hoje" 
          value={servicesToday} 
          color="green" 
        />
        <StatCard 
          icon={<MapPin />} 
          label="Locais Atendidos" 
          value={uniqueLocations} 
          color="amber" 
        />
        <StatCard 
          icon={<CheckCircle2 />} 
          label="Eficiência" 
          value="98%" 
          color="indigo" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Serviços por Categoria</h3>
          <div className="h-80 w-full">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: 40, right: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={150} tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    cursor={{fill: '#f1f5f9'}}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                     {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getColorHex(entry.color)} />
                      ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                Nenhum dado registrado ainda.
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Atividade Recente</h3>
          <div className="space-y-4">
            {records.slice(0, 5).map((record) => {
              const type = types.find(t => t.id === record.serviceTypeId);
              return (
                <div key={record.id} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0">
                  <div className={`mt-1 w-2 h-2 rounded-full bg-${type?.color || 'slate'}-500`} />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{type?.name}</p>
                    <p className="text-xs text-slate-500 truncate max-w-[200px]">{record.location}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(record.dateTime).toLocaleDateString('pt-BR')} às {new Date(record.dateTime).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              );
            })}
            {records.length === 0 && (
              <p className="text-sm text-slate-400 italic">Sem atividades recentes.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
