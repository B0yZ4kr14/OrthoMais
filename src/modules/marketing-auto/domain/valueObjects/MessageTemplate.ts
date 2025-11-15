/**
 * Value Object: MessageTemplate
 * Representa um template de mensagem com variáveis dinâmicas
 */

export class MessageTemplate {
  private readonly template: string;
  private readonly availableVariables: string[];

  constructor(template: string) {
    this.validate(template);
    this.template = template;
    this.availableVariables = this.extractVariables(template);
  }

  private validate(template: string): void {
    if (!template || template.trim().length === 0) {
      throw new Error('Template de mensagem não pode ser vazio');
    }

    if (template.length > 1000) {
      throw new Error('Template de mensagem não pode ter mais de 1000 caracteres');
    }
  }

  private extractVariables(template: string): string[] {
    const regex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = regex.exec(template)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  }

  /**
   * Renderiza o template substituindo as variáveis pelos valores fornecidos
   */
  render(variables: Record<string, string>): string {
    let rendered = this.template;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      rendered = rendered.replace(regex, value || '');
    }

    // Remover variáveis não substituídas
    rendered = rendered.replace(/\{\{\w+\}\}/g, '');

    return rendered.trim();
  }

  getTemplate(): string {
    return this.template;
  }

  getAvailableVariables(): string[] {
    return [...this.availableVariables];
  }

  /**
   * Variáveis padrão disponíveis para todos os templates
   */
  static getDefaultVariables(): string[] {
    return [
      'nomePaciente',
      'nomeClinica',
      'nomeDentista',
      'dataConsulta',
      'horaConsulta',
      'procedimento',
      'dataAniversario',
      'idade',
      'telefone',
      'email'
    ];
  }

  /**
   * Templates pré-definidos para uso rápido
   */
  static createRecallTemplate(): MessageTemplate {
    return new MessageTemplate(
      'Olá {{nomePaciente}}! 👋\n\n' +
      'É hora de agendar sua consulta de retorno na {{nomeClinica}}.\n\n' +
      'Entre em contato conosco pelo telefone {{telefone}} para marcar seu horário.\n\n' +
      'Cuidar do seu sorriso é nossa prioridade! 😊'
    );
  }

  static createPosConsultaTemplate(): MessageTemplate {
    return new MessageTemplate(
      'Olá {{nomePaciente}}! 😊\n\n' +
      'Como você está se sentindo após o procedimento de {{procedimento}}?\n\n' +
      'Se tiver alguma dúvida ou desconforto, não hesite em nos contatar.\n\n' +
      'Equipe {{nomeClinica}}'
    );
  }

  static createAniversarioTemplate(): MessageTemplate {
    return new MessageTemplate(
      '🎉 Parabéns {{nomePaciente}}! 🎂\n\n' +
      'A equipe da {{nomeClinica}} deseja um feliz aniversário!\n\n' +
      'Que este novo ano seja repleto de sorrisos! 😄'
    );
  }

  equals(other: MessageTemplate): boolean {
    return this.template === other.template;
  }

  toString(): string {
    return this.template;
  }
}
