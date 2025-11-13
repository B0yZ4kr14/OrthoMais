import { useState, useCallback, memo } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Patient, PatientFilters } from '../types/patient.types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PatientsListProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (id: string) => void;
  onView: (patient: Patient) => void;
  onAdd: () => void;
}

export const PatientsList = memo(function PatientsList({ patients, onEdit, onDelete, onView, onAdd }: PatientsListProps) {
  const [filters, setFilters] = useState<PatientFilters>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, status: value === 'all' ? undefined : value }));
  }, []);

  const handleConvenioChange = useCallback((value: string) => {
    setFilters(prev => ({ 
      ...prev, 
      convenio: value === 'all' ? undefined : value === 'true' 
    }));
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, onDelete]);

  const filteredPatients = patients.filter(patient => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo':
        return 'default';
      case 'Inativo':
        return 'secondary';
      case 'Pendente':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CPF, telefone..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-9"
            />
          </div>
          
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) =>
              setFilters({ ...filters, status: value === 'all' ? undefined : value })
            }
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Inativo">Inativo</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.convenio === undefined ? 'all' : filters.convenio ? 'sim' : 'nao'}
            onValueChange={(value) =>
              setFilters({
                ...filters,
                convenio: value === 'all' ? undefined : value === 'sim',
              })
            }
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Convênio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="sim">Com convênio</SelectItem>
              <SelectItem value="nao">Sem convênio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={onAdd} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Paciente
        </Button>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredPatients.length} paciente(s) encontrado(s)
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Convênio</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum paciente encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.nome}</TableCell>
                  <TableCell>{patient.cpf}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{patient.celular}</div>
                      {patient.email && (
                        <div className="text-muted-foreground text-xs">{patient.email}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {patient.convenio.temConvenio ? (
                      <div className="text-sm">
                        <div className="font-medium">{patient.convenio.nomeConvenio}</div>
                        <div className="text-xs text-muted-foreground">
                          {patient.convenio.numeroCarteira}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Particular</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(patient.status)}>{patient.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(patient)}
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(patient)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(patient.id!)}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});
