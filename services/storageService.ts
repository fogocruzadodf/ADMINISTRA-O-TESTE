
import { ServiceRecord, ServiceType, Team } from '../types';

const RECORDS_KEY = 'service_records';
const TYPES_KEY = 'service_types';
const TEAMS_KEY = 'service_teams';

// Helper to generate IDs compatible with all browsers/environments
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// Default Service Types
const DEFAULT_TYPES: ServiceType[] = [
  { id: '1', name: 'Limpeza de Boca de Lobo', icon: 'Rat', color: 'blue' },
  { id: '2', name: 'Recolhimento de Entulho', icon: 'Truck', color: 'amber' },
  { id: '3', name: 'Lavagem de Espaços', icon: 'Droplets', color: 'cyan' },
  { id: '4', name: 'Poda de Árvores', icon: 'Trees', color: 'green' },
  { id: '5', name: 'Iluminação Pública', icon: 'Lightbulb', color: 'yellow' },
  { id: '6', name: 'Tapa-Buraco', icon: 'Pickaxe', color: 'stone' },
];

const DEFAULT_TEAMS: Team[] = [
  { id: 't1', name: 'Equipe Alpha - Manhã' },
  { id: 't2', name: 'Equipe Beta - Tarde' },
  { id: 't3', name: 'Equipe Noturna' },
];

export const getServiceTypes = (): ServiceType[] => {
  const stored = localStorage.getItem(TYPES_KEY);
  if (!stored) {
    localStorage.setItem(TYPES_KEY, JSON.stringify(DEFAULT_TYPES));
    return DEFAULT_TYPES;
  }
  return JSON.parse(stored);
};

export const saveServiceType = (type: ServiceType): void => {
  const types = getServiceTypes();
  const newTypes = [...types, type];
  localStorage.setItem(TYPES_KEY, JSON.stringify(newTypes));
};

export const deleteServiceType = (id: string): void => {
  const types = getServiceTypes();
  // Force string comparison for robust deletion
  const targetId = String(id);
  const newTypes = types.filter(t => String(t.id) !== targetId);
  localStorage.setItem(TYPES_KEY, JSON.stringify(newTypes));
};

export const getTeams = (): Team[] => {
  const stored = localStorage.getItem(TEAMS_KEY);
  if (!stored) {
    localStorage.setItem(TEAMS_KEY, JSON.stringify(DEFAULT_TEAMS));
    return DEFAULT_TEAMS;
  }
  return JSON.parse(stored);
};

export const saveTeam = (team: Team): void => {
  const teams = getTeams();
  // Ensure we don't duplicate IDs just in case
  const newTeams = [...teams.filter(t => t.id !== team.id), team];
  localStorage.setItem(TEAMS_KEY, JSON.stringify(newTeams));
};

export const deleteTeam = (id: string): void => {
  const teams = getTeams();
  const targetId = String(id);
  const newTeams = teams.filter(t => String(t.id) !== targetId);
  localStorage.setItem(TEAMS_KEY, JSON.stringify(newTeams));
};

export const getServiceRecords = (): ServiceRecord[] => {
  const stored = localStorage.getItem(RECORDS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveServiceRecord = (record: ServiceRecord): void => {
  const records = getServiceRecords();
  const newRecords = [record, ...records];
  localStorage.setItem(RECORDS_KEY, JSON.stringify(newRecords));
};

export const deleteServiceRecord = (id: string): void => {
  const records = getServiceRecords();
  const targetId = String(id);
  const newRecords = records.filter(r => String(r.id) !== targetId);
  localStorage.setItem(RECORDS_KEY, JSON.stringify(newRecords));
};

// Seed some data for visualization if empty
export const seedInitialData = () => {
  const records = getServiceRecords();
  if (records.length === 0) {
    const types = getServiceTypes();
    const teams = getTeams();
    const now = new Date();
    // Only seed if we have types
    if (types.length > 0 && teams.length > 0) {
        const dummyRecords: ServiceRecord[] = [
        {
            id: generateId(),
            serviceTypeId: types[1]?.id || types[0].id,
            dateTime: new Date(now.getTime() - 86400000 * 1).toISOString(),
            location: 'Rua das Flores, 123 - Centro',
            notes: 'Grande quantidade de restos de obra.',
            team: teams[0].name,
            photos: [],
            createdAt: Date.now()
        },
        {
            id: generateId(),
            serviceTypeId: types[0]?.id || types[0].id,
            dateTime: new Date(now.getTime() - 86400000 * 2).toISOString(),
            location: 'Av. Principal, próx. ao Mercado',
            notes: 'Desobstrução completa realizada.',
            team: teams[1].name,
            photos: [],
            createdAt: Date.now()
        }
        ];
        localStorage.setItem(RECORDS_KEY, JSON.stringify(dummyRecords));
    }
  }
};
