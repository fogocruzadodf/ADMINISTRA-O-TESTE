
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ServiceManager } from './components/ServiceManager';
import { Reports } from './components/Reports';
import { TeamManager } from './components/TeamManager';
import { ServiceTypeManager } from './components/ServiceTypeManager';
import { ServiceType, ServiceRecord, ViewState } from './types';
import { getServiceTypes, getServiceRecords, seedInitialData } from './services/storageService';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [currentServiceId, setCurrentServiceId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Data State
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [records, setRecords] = useState<ServiceRecord[]>([]);

  useEffect(() => {
    // Initial Load
    seedInitialData();
    setServiceTypes(getServiceTypes());
    setRecords(getServiceRecords());
  }, []);

  const refreshRecords = () => {
    // Re-fetch from storage to ensure we have latest data after any update
    setRecords(getServiceRecords());
  };

  const refreshServiceTypes = () => {
    setServiceTypes(getServiceTypes());
  };

  const handleNavigate = (view: ViewState, serviceId?: string) => {
    setCurrentView(view);
    if (serviceId) setCurrentServiceId(serviceId);
    else setCurrentServiceId(null);
    setIsSidebarOpen(false); // Close mobile sidebar on nav
    refreshRecords(); // Ensure data is fresh when navigating
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard records={records} types={serviceTypes} />;
      
      case ViewState.SERVICE_LIST:
        const activeType = serviceTypes.find(t => t.id === currentServiceId);
        if (!activeType) return <div className="p-10 text-center">Selecione um serviço</div>;
        return <ServiceManager serviceType={activeType} records={records} onRecordChange={refreshRecords} />;
      
      case ViewState.REPORTS:
        return <Reports records={records} types={serviceTypes} />;

      case ViewState.TEAMS:
        return <TeamManager />;

      case ViewState.SERVICE_TYPES_MANAGE:
        return <ServiceTypeManager onUpdate={refreshServiceTypes} />;
        
      default:
        return <Dashboard records={records} types={serviceTypes} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar (Desktop) */}
      <Sidebar 
        currentView={currentView}
        currentServiceId={currentServiceId}
        serviceTypes={serviceTypes}
        onNavigate={handleNavigate}
      />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-64 bg-white z-50 overflow-y-auto">
               <Sidebar 
                  currentView={currentView}
                  currentServiceId={currentServiceId}
                  serviceTypes={serviceTypes}
                  onNavigate={handleNavigate}
                />
            </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
           <div className="flex items-center gap-3">
             <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                <Menu size={24} />
             </button>
             <h1 className="font-bold text-slate-800">Gestão Urbana</h1>
           </div>
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
             ADM
           </div>
        </div>

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
