/**
 * MÓDULO INVENTÁRIO - Repositório PostgreSQL de Produtos
 */

import { IDatabaseConnection } from '@/infrastructure/database/IDatabaseConnection';
import { IProdutoRepository, ProdutoFilters } from '../../domain/repositories/IProdutoRepository';
import { Produto, ProdutoProps } from '../../domain/entities/Produto';

export class ProdutoRepositoryPostgres implements IProdutoRepository {
  constructor(private db: IDatabaseConnection) {}

  async findById(id: string): Promise<Produto | null> {
    const result = await this.db.query(
      `SELECT * FROM inventario.produtos WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) return null;
    return this.mapToDomain(result.rows[0]);
  }

  async findByCodigo(codigo: string, clinicId: string): Promise<Produto | null> {
    const result = await this.db.query(
      `SELECT * FROM inventario.produtos WHERE codigo = $1 AND clinic_id = $2`,
      [codigo, clinicId]
    );

    if (result.rows.length === 0) return null;
    return this.mapToDomain(result.rows[0]);
  }

  async findByClinic(clinicId: string, filters?: ProdutoFilters): Promise<Produto[]> {
    let query = `SELECT * FROM inventario.produtos WHERE clinic_id = $1`;
    const params: any[] = [clinicId];
    let paramIndex = 2;

    if (filters?.categoriaId) {
      query += ` AND categoria_id = $${paramIndex}`;
      params.push(filters.categoriaId);
      paramIndex++;
    }

    if (filters?.fornecedorId) {
      query += ` AND fornecedor_id = $${paramIndex}`;
      params.push(filters.fornecedorId);
      paramIndex++;
    }

    if (filters?.ativo !== undefined) {
      query += ` AND ativo = $${paramIndex}`;
      params.push(filters.ativo);
      paramIndex++;
    }

    if (filters?.estoqueBaixo) {
      query += ` AND quantidade_estoque <= quantidade_minima`;
    }

    if (filters?.search) {
      query += ` AND (nome ILIKE $${paramIndex} OR codigo ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    query += ` ORDER BY nome`;

    const result = await this.db.query(query, params);
    return result.rows.map(row => this.mapToDomain(row));
  }

  async save(produto: Produto): Promise<void> {
    const props = produto.toObject();
    await this.db.query(
      `INSERT INTO inventario.produtos (
        id, clinic_id, codigo, nome, descricao, categoria_id, fornecedor_id,
        unidade_medida, quantidade_estoque, quantidade_minima, preco_custo,
        preco_venda, margem_lucro, tem_nfe, ativo, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [
        props.id, props.clinicId, props.codigo, props.nome, props.descricao,
        props.categoriaId, props.fornecedorId, props.unidadeMedida,
        props.quantidadeEstoque, props.quantidadeMinima, props.precoCusto,
        props.precoVenda, props.margemLucro, props.temNfe, props.ativo,
        props.createdAt, props.updatedAt
      ]
    );
  }

  async update(produto: Produto): Promise<void> {
    const props = produto.toObject();
    await this.db.query(
      `UPDATE inventario.produtos SET
        nome = $1, descricao = $2, categoria_id = $3, fornecedor_id = $4,
        unidade_medida = $5, quantidade_estoque = $6, quantidade_minima = $7,
        preco_custo = $8, preco_venda = $9, margem_lucro = $10, tem_nfe = $11,
        ativo = $12, updated_at = $13
      WHERE id = $14`,
      [
        props.nome, props.descricao, props.categoriaId, props.fornecedorId,
        props.unidadeMedida, props.quantidadeEstoque, props.quantidadeMinima,
        props.precoCusto, props.precoVenda, props.margemLucro, props.temNfe,
        props.ativo, props.updatedAt, props.id
      ]
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.query(`DELETE FROM inventario.produtos WHERE id = $1`, [id]);
  }

  async count(clinicId: string, filters?: ProdutoFilters): Promise<number> {
    let query = `SELECT COUNT(*) FROM inventario.produtos WHERE clinic_id = $1`;
    const params: any[] = [clinicId];
    let paramIndex = 2;

    if (filters?.ativo !== undefined) {
      query += ` AND ativo = $${paramIndex}`;
      params.push(filters.ativo);
    }

    const result = await this.db.query(query, params);
    return parseInt(result.rows[0].count);
  }

  private mapToDomain(row: any): Produto {
    const props: ProdutoProps = {
      id: row.id,
      clinicId: row.clinic_id,
      codigo: row.codigo,
      nome: row.nome,
      descricao: row.descricao,
      categoriaId: row.categoria_id,
      fornecedorId: row.fornecedor_id,
      unidadeMedida: row.unidade_medida,
      quantidadeEstoque: parseFloat(row.quantidade_estoque),
      quantidadeMinima: parseFloat(row.quantidade_minima),
      precoCusto: row.preco_custo ? parseFloat(row.preco_custo) : undefined,
      precoVenda: row.preco_venda ? parseFloat(row.preco_venda) : undefined,
      margemLucro: row.margem_lucro ? parseFloat(row.margem_lucro) : undefined,
      temNfe: row.tem_nfe,
      ativo: row.ativo,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    return Produto.restore(props);
  }
}
