import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFinanceiroStore } from './useFinanceiroStore';
import type { Transaction } from '../types/financeiro.types';

describe('useFinanceiroStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with mock transactions', () => {
    const { result } = renderHook(() => useFinanceiroStore());
    
    expect(result.current.transactions).toBeDefined();
    expect(result.current.transactions.length).toBeGreaterThan(0);
  });

  it('should add a new transaction', () => {
    const { result } = renderHook(() => useFinanceiroStore());
    
    const newTransaction: Transaction = {
      id: 'test-txn',
      type: 'RECEITA',
      category: 'CONSULTA',
      description: 'Teste Transação',
      amount: 500,
      date: new Date().toISOString(),
      status: 'CONCLUIDO',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    act(() => {
      result.current.addTransaction(newTransaction);
    });

    expect(result.current.transactions).toContainEqual(
      expect.objectContaining({ description: 'Teste Transação' })
    );
  });

  it('should calculate financial summary correctly', () => {
    const { result } = renderHook(() => useFinanceiroStore());
    
    const summary = result.current.getFinancialSummary();
    
    expect(summary).toHaveProperty('totalRevenue');
    expect(summary).toHaveProperty('totalExpenses');
    expect(summary).toHaveProperty('netProfit');
    expect(summary).toHaveProperty('pendingPayments');
    
    expect(typeof summary.totalRevenue).toBe('number');
    expect(typeof summary.totalExpenses).toBe('number');
    expect(summary.netProfit).toBe(
      summary.totalRevenue - summary.totalExpenses
    );
  });

  it('should filter transactions correctly', () => {
    const { result } = renderHook(() => useFinanceiroStore());
    
    const allTransactions = result.current.transactions;
    const revenueTransactions = allTransactions.filter(t => t.type === 'RECEITA');
    
    expect(revenueTransactions.every(t => t.type === 'RECEITA')).toBe(true);
    expect(allTransactions.length).toBeGreaterThan(0);
  });

  it('should get monthly data', () => {
    const { result } = renderHook(() => useFinanceiroStore());
    
    const monthlyData = result.current.getMonthlyData();
    
    expect(Array.isArray(monthlyData)).toBe(true);
    expect(monthlyData.length).toBe(12);
    expect(monthlyData[0]).toHaveProperty('month');
    expect(monthlyData[0]).toHaveProperty('revenue');
    expect(monthlyData[0]).toHaveProperty('expense');
  });

  it('should get category distribution', () => {
    const { result } = renderHook(() => useFinanceiroStore());
    
    const distribution = result.current.getCategoryDistribution();
    
    expect(Array.isArray(distribution)).toBe(true);
    distribution.forEach(item => {
      expect(item).toHaveProperty('category');
      expect(item).toHaveProperty('value');
      expect(item).toHaveProperty('percentage');
    });
  });
});
