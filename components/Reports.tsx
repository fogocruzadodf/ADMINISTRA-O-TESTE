import React, { useState, useEffect } from 'react';
import { ServiceRecord, ServiceType } from '../types';
import { FileText, Download, Share2, Filter, Table } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ReportsProps {
  records: ServiceRecord[];
  types: ServiceType[];
}

export const Reports: React.FC<ReportsProps> = ({ records, types }) => {
  const [filteredRecords, setFilteredRecords] = useState<ServiceRecord[]>([]);
  
  // Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  useEffect(() => {
    // Set default dates (start of month to today)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(now.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    // Apply filters
    let result = records;

    if (startDate) {
      result = result.filter(r => r.dateTime.split('T')[0] >= startDate);
    }
    if (endDate) {
      result = result.filter(r => r.dateTime.split('T')[0] <= endDate);
    }
    if (selectedType !== 'ALL') {
      result = result.filter(r => r.serviceTypeId === selectedType);
    }

    setFilteredRecords(result);
  }, [records, startDate, endDate, selectedType]);

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text('Relatório de Serviços - Administração Regional', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Período: ${new Date(startDate).toLocaleDateString('pt-BR')} a ${new Date(endDate).toLocaleDateString('pt-BR')}`, 14, 28);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 33);

    const tableColumn = ["Data", "Hora", "Tipo", "Local", "Equipe", "Obs"];
    const tableRows = filteredRecords.map(record => {
      const type = types.find(t => t.id === record.serviceTypeId)?.name || 'N/A';
      const dateObj = new Date(record.dateTime);
      return [
        dateObj.toLocaleDateString('pt-BR'),
        dateObj.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}),
        type,
        record.location,
        record.team,
        record.notes.substring(0, 50) + (record.notes.length > 50 ? '...' : '')
      ];
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] } // Blue header
    });

    doc.save(`Relatorio_Servicos_${startDate}_${endDate}.pdf`);
  };

  const generateExcel = () => {
    const data = filteredRecords.map(record => {
       const type = types.find(t => t.id === record.serviceTypeId)?.name || 'N/A';
       return {
         'Data': new Date(record.dateTime).toLocaleDateString('pt-BR'),
         'Hora': new Date(record.dateTime).toLocaleTimeString('pt-BR'),
         'Tipo de Serviço': type,
         'Local': record.location,
         'Equipe': record.team,
         'Observações': record.notes
       };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Serviços");
    XLSX.writeFile(workbook, `Relatorio_Servicos_${startDate}_${endDate}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Relatórios de Atividades</h2>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Data Inicial</label>
            <input 
              type="date" 
              className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Data Final</label>
            <input 
              type="date" 
              className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Serviço</label>
            <select 
              className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="ALL">Todos os Tipos</option>
              {types.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <button 
            className="flex items-center justify-center gap-2 bg-slate-800 text-white p-2 rounded-lg hover:bg-slate-900 transition-colors"
            onClick={() => {/* Trigger re-filter explicitly if needed, but useEffect handles it */}}
          >
            <Filter size={18} />
            Atualizar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <Table size={18} />
            Resultados: {filteredRecords.length}
          </h3>
          <div className="flex gap-2">
             <button 
                onClick={generatePDF}
                disabled={filteredRecords.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors text-sm font-medium"
             >
                <FileText size={16} />
                PDF
             </button>
             <button 
                onClick={generateExcel}
                disabled={filteredRecords.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50 transition-colors text-sm font-medium"
             >
                <Download size={16} />
                Excel
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Data/Hora</th>
                <th className="px-6 py-3">Serviço</th>
                <th className="px-6 py-3">Local</th>
                <th className="px-6 py-3">Equipe</th>
                <th className="px-6 py-3 text-center">Fotos</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => {
                  const type = types.find(t => t.id === record.serviceTypeId);
                  return (
                    <tr key={record.id} className="bg-white border-b hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                        {new Date(record.dateTime).toLocaleDateString('pt-BR')} <br/>
                        <span className="text-slate-400 font-normal">{new Date(record.dateTime).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${type?.color || 'slate'}-100 text-${type?.color || 'slate'}-800`}>
                           {type?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 truncate max-w-xs" title={record.location}>
                        {record.location}
                      </td>
                      <td className="px-6 py-4">
                        {record.team}
                      </td>
                      <td className="px-6 py-4 text-center">
                         {record.photos.length > 0 ? (
                           <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">
                             {record.photos.length}
                           </span>
                         ) : (
                           <span className="text-slate-300">-</span>
                         )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                   <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                     Nenhum registro encontrado para este filtro.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
