import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GitBranch, AlertCircle, CheckCircle2 } from 'lucide-react';

export function StepDependencies() {
  const dependencies = [
    {
      module: 'Split de Pagamento',
      requires: ['Gestão Financeira'],
      reason: 'O split de pagamento precisa dividir transações financeiras já registradas',
    },
    {
      module: 'Controle de Inadimplência',
      requires: ['Gestão Financeira'],
      reason: 'A cobrança automática monitora contas a receber do módulo financeiro',
    },
    {
      module: 'IA de Análise de Raio-X',
      requires: ['Prontuário Eletrônico (PEP)'],
      reason: 'Os resultados da análise de IA são salvos diretamente no prontuário',
    },
    {
      module: 'Assinatura Digital ICP-Brasil',
      requires: ['Prontuário Eletrônico (PEP)'],
      reason: 'A assinatura digital valida documentos e evoluções do prontuário',
    },
  ];

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Alguns módulos dependem de outros para funcionar corretamente. 
          O sistema não permitirá que você desative um módulo se outro módulo ativo depende dele.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Mapa de Dependências
        </h3>

        <div className="space-y-3">
          {dependencies.map((dep, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{dep.module}</span>
                      <span className="text-muted-foreground">depende de</span>
                      {dep.requires.map((req, i) => (
                        <Badge key={i} variant="secondary">
                          {req}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {dep.reason}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Card className="p-6 bg-amber-500/10 border-amber-500/20">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          Exemplos Práticos
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            ✅ <strong>Pode:</strong> Desativar "Split de Pagamento" a qualquer momento
          </li>
          <li>
            ❌ <strong>Não pode:</strong> Desativar "Financeiro" se "Split de Pagamento" estiver ativo
          </li>
          <li>
            ✅ <strong>Pode:</strong> Ativar "Split de Pagamento" se "Financeiro" já estiver ativo
          </li>
          <li>
            ❌ <strong>Não pode:</strong> Ativar "Split de Pagamento" se "Financeiro" estiver inativo
          </li>
        </ul>
      </Card>

      <Card className="p-6 bg-primary/5 border-primary/20">
        <h3 className="font-semibold mb-3">💡 Dica Pro</h3>
        <p className="text-sm text-muted-foreground">
          O sistema validará automaticamente as dependências antes de ativar ou desativar módulos.
          Se uma ação não for permitida, você receberá uma mensagem clara explicando o motivo
          e quais módulos precisam ser ativados/desativados primeiro.
        </p>
      </Card>
    </div>
  );
}
