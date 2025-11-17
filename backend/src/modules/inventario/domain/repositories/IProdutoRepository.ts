/**
 * MÓDULO INVENTÁRIO - Interface do Repositório de Produtos
 */

import { Produto } from '../entities/Produto';

export interface ProdutoFilters {
  categoriaId?: string;
  fornecedorId?: string;
  ativo?: boolean;
  estoqueBaixo?: boolean;
  search?: string;
}

export interface IProdutoRepository {
  findById(id: string): Promise<Produto | null>;
  findByCodigo(codigo: string, clinicId: string): Promise<Produto | null>;
  findByClinic(clinicId: string, filters?: ProdutoFilters): Promise<Produto[]>;
  save(produto: Produto): Promise<void>;
  update(produto: Produto): Promise<void>;
  delete(id: string): Promise<void>;
  count(clinicId: string, filters?: ProdutoFilters): Promise<number>;
}
