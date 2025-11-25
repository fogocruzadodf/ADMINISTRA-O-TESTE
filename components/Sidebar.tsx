
import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Trash2, 
  Droplets, 
  Rat, 
  Trees, 
  Lightbulb, 
  Pickaxe,
  Briefcase,
  Users,
  Settings
} from 'lucide-react';
import { ServiceType, ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  currentServiceId: string | null;
  serviceTypes: ServiceType[];
  onNavigate: (view: ViewState, serviceId?: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  'Rat': <Rat size={20} />,
  'Truck': <Trash2 size={20} />,
  'Droplets': <Droplets size={20} />,
  'Trees': <Trees size={20} />,
  'Lightbulb': <Lightbulb size={20} />,
  'Pickaxe': <Pickaxe size={20} />,
  'Briefcase': <Briefcase size={20} />,
  'default': <Briefcase size={20} />
};

interface NavItemProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color?: string;
}

const NavItem: React.FC<NavItemProps> = ({ 
  active, 
  onClick, 
  icon, 
  label,
  color = "slate"
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 mb-1 ${
      active 
        ? `bg-${color}-100 text-${color}-700 font-semibold shadow-sm border-l-4 border-${color}-500` 
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <span className={active ? `text-${color}-600` : 'text-slate-400'}>
      {icon}
    </span>
    <span>{label}</span>
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  currentServiceId, 
  serviceTypes, 
  onNavigate 
}) => {
  
  const getIcon = (name: string) => iconMap[name] || iconMap['default'];

  return (
    <div className="w-64 bg-white h-screen border-r border-slate-200 flex flex-col fixed left-0 top-0 overflow-y-auto z-10 hidden md:flex">
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <LayoutDashboard size={18} />
          </div>
          Gestão Urbana
        </h1>
        <p className="text-xs text-slate-500 mt-1 pl-10">Adm. Regional</p>
      </div>

      <nav className="flex-1 p-4">
        <div className="mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider pl-2">Geral</div>
        <NavItem 
          active={currentView === ViewState.DASHBOARD} 
          onClick={() => onNavigate(ViewState.DASHBOARD)} 
          icon={<LayoutDashboard size={20} />} 
          label="Painel de Controle"
          color="blue"
        />
        <NavItem 
          active={currentView === ViewState.REPORTS} 
          onClick={() => onNavigate(ViewState.REPORTS)} 
          icon={<FileText size={20} />} 
          label="Relatórios"
          color="indigo"
        />
        <NavItem 
          active={currentView === ViewState.TEAMS} 
          onClick={() => onNavigate(ViewState.TEAMS)} 
          icon={<Users size={20} />} 
          label="Equipes"
          color="emerald"
        />
        <NavItem 
          active={currentView === ViewState.SERVICE_TYPES_MANAGE} 
          onClick={() => onNavigate(ViewState.SERVICE_TYPES_MANAGE)} 
          icon={<Settings size={20} />} 
          label="Tipos de Serviço"
          color="slate"
        />

        <div className="mt-8 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider pl-2">Serviços</div>
        {serviceTypes.map((type) => (
          <NavItem 
            key={type.id}
            active={currentView === ViewState.SERVICE_LIST && currentServiceId === type.id} 
            onClick={() => onNavigate(ViewState.SERVICE_LIST, type.id)} 
            icon={getIcon(type.icon)} 
            label={type.name}
            color={type.color}
          />
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
            AD
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">Administrador</p>
            <p className="text-xs text-slate-500">admin@regional.gov.br</p>
          </div>
        </div>
      </div>
    </div>
  );
};
