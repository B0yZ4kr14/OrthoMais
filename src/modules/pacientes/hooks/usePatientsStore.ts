import { useState, useEffect } from 'react';
import { Patient, PatientFilters } from '../types/patient.types';
import { toast } from 'sonner';

const STORAGE_KEY = 'orthoplus_patients';

// Mock data for demonstration
const mockPatients: Patient[] = [
  {
    id: '1',
    nome: 'Maria Silva Santos',
    cpf: '123.456.789-00',
    rg: '12.345.678-9',
    dataNascimento: '1985-03-15',
    sexo: 'F',
    telefone: '(11) 3456-7890',
    celular: '(11) 98765-4321',
    email: 'maria.silva@email.com',
    endereco: {
      cep: '01234-567',
      logradouro: 'Rua das Flores',
      numero: '123',
      complemento: 'Apto 45',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
    },
    convenio: {
      temConvenio: true,
      nomeConvenio: 'Unimed',
      numeroCarteira: '123456789',
      validade: '2025-12-31',
    },
    observacoes: 'Alergia a anestésicos com epinefrina',
    status: 'Ativo',
    createdAt: '2024-01-15T10:30:00',
    updatedAt: '2024-01-15T10:30:00',
  },
  {
    id: '2',
    nome: 'João Pedro Oliveira',
    cpf: '987.654.321-00',
    dataNascimento: '1990-07-22',
    sexo: 'M',
    telefone: '(11) 2345-6789',
    celular: '(11) 97654-3210',
    email: 'joao.pedro@email.com',
    endereco: {
      cep: '04567-890',
      logradouro: 'Av. Paulista',
      numero: '1000',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
    },
    convenio: {
      temConvenio: false,
    },
    status: 'Ativo',
    createdAt: '2024-02-10T14:20:00',
    updatedAt: '2024-02-10T14:20:00',
  },
];

export function usePatientsStore() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // Load patients from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPatients(JSON.parse(stored));
      } else {
        // Initialize with mock data
        setPatients(mockPatients);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockPatients));
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      toast.error('Erro ao carregar pacientes');
    } finally {
      setLoading(false);
    }
  }, []);

  const savePatients = (updatedPatients: Patient[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPatients));
      setPatients(updatedPatients);
    } catch (error) {
      console.error('Error saving patients:', error);
      toast.error('Erro ao salvar pacientes');
      throw error;
    }
  };

  const addPatient = (patient: Patient) => {
    const newPatient = {
      ...patient,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    savePatients([...patients, newPatient]);
    toast.success('Paciente cadastrado com sucesso');
    return newPatient;
  };

  const updatePatient = (id: string, patient: Partial<Patient>) => {
    const updated = patients.map(p =>
      p.id === id ? { ...p, ...patient, updatedAt: new Date().toISOString() } : p
    );
    savePatients(updated);
    toast.success('Paciente atualizado com sucesso');
  };

  const deletePatient = (id: string) => {
    const updated = patients.filter(p => p.id !== id);
    savePatients(updated);
    toast.success('Paciente removido com sucesso');
  };

  const getPatient = (id: string) => {
    return patients.find(p => p.id === id);
  };

  const filterPatients = (filters: PatientFilters) => {
    return patients.filter(patient => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !patient.nome.toLowerCase().includes(searchLower) &&
          !patient.cpf.includes(filters.search) &&
          !patient.telefone.includes(filters.search) &&
          !patient.celular.includes(filters.search)
        ) {
          return false;
        }
      }
      if (filters.status && patient.status !== filters.status) {
        return false;
      }
      if (filters.convenio !== undefined) {
        if (filters.convenio !== patient.convenio.temConvenio) {
          return false;
        }
      }
      return true;
    });
  };

  return {
    patients,
    loading,
    addPatient,
    updatePatient,
    deletePatient,
    getPatient,
    filterPatients,
  };
}
