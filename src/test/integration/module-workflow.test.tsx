import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePatientsStore } from '@/modules/pacientes/hooks/usePatientsStore';
import { useOdontogramaStore } from '@/modules/pep/hooks/useOdontogramaStore';
import { useFinanceiroStore } from '@/modules/financeiro/hooks/useFinanceiroStore';
import type { Patient } from '@/modules/pacientes/types/patient.types';
import type { Transaction } from '@/modules/financeiro/types/financeiro.types';

describe('Module Integration Workflow', () => {
  const testProntuarioId = 'integration-test-prontuario';

  it('should integrate patient creation with PEP workflow', async () => {
    // Step 1: Create a new patient
    const { result: patientsResult } = renderHook(() => usePatientsStore());
    
    const newPatient: Patient = {
      id: 'patient-integration-test',
      nome: 'Paciente Integração',
      cpf: '999.999.999-99',
      dataNascimento: '1985-05-15',
      sexo: 'M',
      telefone: '(11) 91234-5678',
      celular: '(11) 91234-5678',
      email: 'integracao@test.com',
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
      patientsResult.current.addPatient(newPatient);
    });

    expect(patientsResult.current.patients).toContainEqual(
      expect.objectContaining({ nome: 'Paciente Integração' })
    );

    // Step 2: Create odontograma for the patient
    const { result: odontogramaResult } = renderHook(() => 
      useOdontogramaStore(testProntuarioId)
    );

    // Step 3: Mark some teeth as problematic
    act(() => {
      odontogramaResult.current.updateToothStatus(11, 'cariado', false);
      odontogramaResult.current.updateToothStatus(12, 'cariado', false);
    });

    expect(odontogramaResult.current.getStatusCount('cariado')).toBe(2);

    // Step 4: This would trigger treatment suggestions and financial transactions
    const treatmentValue = 500; // Mock treatment cost
    
    const { result: financeiroResult } = renderHook(() => useFinanceiroStore());
    
    const treatmentTransaction: Transaction = {
      id: 'treatment-txn',
      type: 'RECEITA',
      category: 'TRATAMENTO',
      description: `Tratamento - ${newPatient.nome}`,
      amount: treatmentValue,
      date: new Date().toISOString(),
      status: 'PENDENTE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    act(() => {
      financeiroResult.current.addTransaction(treatmentTransaction);
    });

    expect(financeiroResult.current.transactions).toContainEqual(
      expect.objectContaining({ 
        description: `Tratamento - ${newPatient.nome}`,
        amount: treatmentValue 
      })
    );
  });

  it('should maintain data consistency across modules', async () => {
    const { result: patientsResult } = renderHook(() => usePatientsStore());
    const { result: financeiroResult } = renderHook(() => useFinanceiroStore());

    const patient = patientsResult.current.patients[0];
    
    // Create financial transaction for patient
    const consultTransaction: Transaction = {
      id: 'consistency-test',
      type: 'RECEITA',
      category: 'CONSULTA',
      description: `Consulta - ${patient.nome}`,
      amount: 200,
      date: new Date().toISOString(),
      status: 'CONCLUIDO',
      patientName: patient.nome,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    act(() => {
      financeiroResult.current.addTransaction(consultTransaction);
    });

    // Update patient status
    act(() => {
      patientsResult.current.updatePatient(patient.id, {
        status: 'Inativo',
      });
    });

    // Verify both modules reflect the changes
    const updatedPatient = patientsResult.current.patients.find(
      p => p.id === patient.id
    );
    expect(updatedPatient?.status).toBe('Inativo');

    const transaction = financeiroResult.current.transactions.find(
      t => t.patientName === patient.nome
    );
    expect(transaction).toBeDefined();
    expect(transaction?.status).toBe('CONCLUIDO');
  });

  it('should handle cross-module data filtering', () => {
    const { result: patientsResult } = renderHook(() => usePatientsStore());
    const { result: financeiroResult } = renderHook(() => useFinanceiroStore());

    // Filter active patients
    const activePatients = patientsResult.current.filterPatients({ 
      status: 'Ativo' 
    });
    expect(activePatients.every(p => p.status === 'Ativo')).toBe(true);

    // Get transactions
    const allTransactions = financeiroResult.current.transactions;
    const completedTransactions = allTransactions.filter(t => t.status === 'CONCLUIDO');
    expect(completedTransactions.every(t => t.status === 'CONCLUIDO')).toBe(true);

    // Verify data consistency
    expect(activePatients.length).toBeGreaterThan(0);
    expect(allTransactions.length).toBeGreaterThan(0);
  });

  it('should calculate aggregate metrics across modules', () => {
    const { result: patientsResult } = renderHook(() => usePatientsStore());
    const { result: financeiroResult } = renderHook(() => useFinanceiroStore());

    const totalPatients = patientsResult.current.patients.length;
    const activePatients = patientsResult.current.filterPatients({ 
      status: 'Ativo' 
    }).length;

    const financialSummary = financeiroResult.current.getFinancialSummary();

    // Verify metrics are calculated correctly
    expect(totalPatients).toBeGreaterThan(0);
    expect(activePatients).toBeLessThanOrEqual(totalPatients);
    expect(financialSummary.totalRevenue).toBeGreaterThanOrEqual(0);
    expect(financialSummary.totalExpenses).toBeGreaterThanOrEqual(0);
    expect(financialSummary.netProfit).toBe(
      financialSummary.totalRevenue - financialSummary.totalExpenses
    );
  });
});
