/**
 * Transaction Entity (Financeiro Module)
 * Aggregate Root para transações financeiras (receitas e despesas)
 */

export interface TransactionProps {
  id: string;
  clinicId: string;
  type: 'RECEITA' | 'DESPESA';
  amount: number;
  description: string;
  categoryId?: string;
  dueDate: Date;
  paidDate?: Date;
  status: 'PENDENTE' | 'PAGO' | 'ATRASADO' | 'CANCELADO';
  paymentMethod?: string;
  notes?: string;
  relatedEntityType?: string; // Ex: 'VENDA', 'ORCAMENTO'
  relatedEntityId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Transaction {
  private props: TransactionProps;

  private constructor(props: TransactionProps) {
    this.props = props;
  }

  static create(props: Omit<TransactionProps, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Transaction {
    return new Transaction({
      ...props,
      id: crypto.randomUUID(),
      status: 'PENDENTE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: TransactionProps): Transaction {
    return new Transaction(props);
  }

  // Getters
  get id(): string { return this.props.id; }
  get clinicId(): string { return this.props.clinicId; }
  get type(): string { return this.props.type; }
  get amount(): number { return this.props.amount; }
  get status(): string { return this.props.status; }
  get dueDate(): Date { return this.props.dueDate; }

  // Domain methods
  markAsPaid(paidDate: Date, paymentMethod?: string): void {
    if (this.props.status === 'PAGO') {
      throw new Error('Transação já está paga');
    }

    if (this.props.status === 'CANCELADO') {
      throw new Error('Não é possível pagar uma transação cancelada');
    }

    this.props.status = 'PAGO';
    this.props.paidDate = paidDate;
    if (paymentMethod) {
      this.props.paymentMethod = paymentMethod;
    }
    this.props.updatedAt = new Date();
  }

  cancel(reason: string): void {
    if (this.props.status === 'CANCELADO') {
      throw new Error('Transação já está cancelada');
    }

    if (this.props.status === 'PAGO') {
      throw new Error('Não é possível cancelar uma transação já paga');
    }

    this.props.status = 'CANCELADO';
    this.props.notes = `CANCELADO: ${reason}`;
    this.props.updatedAt = new Date();
  }

  updateDueDate(newDueDate: Date): void {
    if (this.props.status === 'PAGO') {
      throw new Error('Não é possível alterar vencimento de transação paga');
    }

    this.props.dueDate = newDueDate;
    this.props.updatedAt = new Date();
  }

  checkOverdue(): void {
    if (this.props.status === 'PENDENTE' && this.props.dueDate < new Date()) {
      this.props.status = 'ATRASADO';
      this.props.updatedAt = new Date();
    }
  }

  toObject(): TransactionProps {
    return { ...this.props };
  }
}
