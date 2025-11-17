/**
 * NFe Entity (Faturamento Module)
 * Aggregate Root para Notas Fiscais Eletrônicas
 */

export interface NFeProps {
  id: string;
  clinicId: string;
  vendaId?: string;
  tipoNota: 'NFE' | 'NFCE' | 'NFSE';
  numero: number;
  serie: number;
  chaveAcesso: string;
  protocoloAutorizacao?: string;
  xmlNota?: string;
  status: 'PENDENTE' | 'AUTORIZADA' | 'REJEITADA' | 'CANCELADA' | 'INUTILIZADA';
  motivoRejeicao?: string;
  motivoCancelamento?: string;
  dataEmissao: Date;
  dataAutorizacao?: Date;
  dataCancelamento?: Date;
  valorTotal: number;
  createdAt: Date;
  updatedAt: Date;
}

export class NFe {
  private props: NFeProps;

  private constructor(props: NFeProps) {
    this.props = props;
  }

  static create(props: Omit<NFeProps, 'id' | 'status' | 'createdAt' | 'updatedAt'>): NFe {
    return new NFe({
      ...props,
      id: crypto.randomUUID(),
      status: 'PENDENTE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: NFeProps): NFe {
    return new NFe(props);
  }

  // Getters
  get id(): string { return this.props.id; }
  get clinicId(): string { return this.props.clinicId; }
  get chaveAcesso(): string { return this.props.chaveAcesso; }
  get status(): string { return this.props.status; }

  // Domain methods
  autorizar(protocolo: string, xml: string): void {
    if (this.props.status !== 'PENDENTE') {
      throw new Error('Apenas notas pendentes podem ser autorizadas');
    }

    this.props.status = 'AUTORIZADA';
    this.props.protocoloAutorizacao = protocolo;
    this.props.xmlNota = xml;
    this.props.dataAutorizacao = new Date();
    this.props.updatedAt = new Date();
  }

  rejeitar(motivo: string): void {
    if (this.props.status !== 'PENDENTE') {
      throw new Error('Apenas notas pendentes podem ser rejeitadas');
    }

    this.props.status = 'REJEITADA';
    this.props.motivoRejeicao = motivo;
    this.props.updatedAt = new Date();
  }

  cancelar(motivo: string): void {
    if (this.props.status !== 'AUTORIZADA') {
      throw new Error('Apenas notas autorizadas podem ser canceladas');
    }

    this.props.status = 'CANCELADA';
    this.props.motivoCancelamento = motivo;
    this.props.dataCancelamento = new Date();
    this.props.updatedAt = new Date();
  }

  inutilizar(): void {
    if (this.props.status === 'AUTORIZADA') {
      throw new Error('Não é possível inutilizar nota autorizada');
    }

    this.props.status = 'INUTILIZADA';
    this.props.updatedAt = new Date();
  }

  toObject(): NFeProps {
    return { ...this.props };
  }
}
