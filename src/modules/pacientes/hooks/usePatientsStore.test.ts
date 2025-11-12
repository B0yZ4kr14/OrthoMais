import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePatientsStore } from './usePatientsStore';
import type { Patient } from '../types/patient.types';

describe('usePatientsStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with mock patients', () => {
    const { result } = renderHook(() => usePatientsStore());
    
    expect(result.current.patients).toBeDefined();
    expect(result.current.patients.length).toBeGreaterThan(0);
    expect(result.current.loading).toBe(false);
  });

  it('should add a new patient', () => {
    const { result } = renderHook(() => usePatientsStore());
    
    const newPatient: Patient = {
      id: 'test-id',
      nome: 'Paciente Teste',
      cpf: '123.456.789-00',
      dataNascimento: '1990-01-01',
      sexo: 'M',
      telefone: '(11) 98765-4321',
      celular: '(11) 98765-4321',
      email: 'teste@email.com',
      endereco: {
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        numero: '1000',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP',
      },
      convenio: {
        temConvenio: false,
      },
      status: 'Ativo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    act(() => {
      result.current.addPatient(newPatient);
    });

    expect(result.current.patients).toContainEqual(
      expect.objectContaining({ nome: 'Paciente Teste' })
    );
  });

  it('should update an existing patient', () => {
    const { result } = renderHook(() => usePatientsStore());
    
    const firstPatient = result.current.patients[0];
    
    act(() => {
      result.current.updatePatient(firstPatient.id, { 
        nome: 'Nome Atualizado' 
      });
    });

    const updatedPatient = result.current.patients.find(
      p => p.id === firstPatient.id
    );
    expect(updatedPatient?.nome).toBe('Nome Atualizado');
  });

  it('should delete a patient', () => {
    const { result } = renderHook(() => usePatientsStore());
    
    const firstPatient = result.current.patients[0];
    const initialLength = result.current.patients.length;
    
    act(() => {
      result.current.deletePatient(firstPatient.id);
    });

    expect(result.current.patients.length).toBe(initialLength - 1);
    expect(
      result.current.patients.find(p => p.id === firstPatient.id)
    ).toBeUndefined();
  });

  it('should filter patients by search term', () => {
    const { result } = renderHook(() => usePatientsStore());
    
    const searchTerm = result.current.patients[0].nome.substring(0, 5);
    
    const filtered = result.current.filterPatients({ search: searchTerm });
    
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every(p => 
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cpf.includes(searchTerm)
    )).toBe(true);
  });

  it('should persist data to localStorage', () => {
    const { result } = renderHook(() => usePatientsStore());
    
    const newPatient: Patient = {
      id: 'persist-test',
      nome: 'Persistência Teste',
      cpf: '111.111.111-11',
      dataNascimento: '1995-05-05',
      sexo: 'F',
      telefone: '(11) 99999-9999',
      celular: '(11) 99999-9999',
      email: 'persist@test.com',
      endereco: {
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        numero: '2000',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP',
      },
      convenio: {
        temConvenio: false,
      },
      status: 'Ativo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    act(() => {
      result.current.addPatient(newPatient);
    });

    const stored = localStorage.getItem('ortho-patients');
    expect(stored).toBeDefined();
    
    const parsed = JSON.parse(stored!);
    expect(parsed).toContainEqual(
      expect.objectContaining({ nome: 'Persistência Teste' })
    );
  });
});
