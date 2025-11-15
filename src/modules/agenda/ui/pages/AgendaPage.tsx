import { useState } from 'react';
import { Calendar, Clock, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgendaProvider } from '../../presentation/contexts/AgendaContext';
import { useAppointments } from '../../presentation/hooks/useAppointments';
import { useDentistSchedules } from '../../presentation/hooks/useDentistSchedules';
import { useBlockedTimes } from '../../presentation/hooks/useBlockedTimes';
import { useAuth } from '@/contexts/AuthContext';
import { WeekCalendar } from '../components/WeekCalendar';
import { AppointmentForm } from '../components/AppointmentForm';
import { AppointmentCard } from '../components/AppointmentCard';
import { DentistScheduleForm } from '../components/DentistScheduleForm';
import { BlockedTimeForm } from '../components/BlockedTimeForm';

function AgendaContent() {
  const { clinicId } = useAuth();
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);

  const {
    appointments,
    isLoading: isLoadingAppointments,
    createAppointment,
    confirmAppointment,
    cancelAppointment,
    isCreating,
  } = useAppointments({
    clinicId: clinicId || undefined,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const {
    schedules,
    createSchedule,
    isCreating: isCreatingSchedule,
  } = useDentistSchedules({
    clinicId: clinicId || undefined,
  });

  const {
    createBlockedTime,
    isCreating: isCreatingBlock,
  } = useBlockedTimes({
    clinicId: clinicId || undefined,
  });

  const handleCreateAppointment = (data: any) => {
    createAppointment(
      {
        ...data,
        clinicId: clinicId || '',
      },
      {
        onSuccess: () => {
          setIsAppointmentDialogOpen(false);
        },
      }
    );
  };

  const handleCreateSchedule = (data: any) => {
    createSchedule(
      {
        ...data,
        clinicId: clinicId || '',
      },
      {
        onSuccess: () => {
          setIsScheduleDialogOpen(false);
        },
      }
    );
  };

  const handleCreateBlock = (data: any) => {
    createBlockedTime(
      {
        ...data,
        clinicId: clinicId || '',
      },
      {
        onSuccess: () => {
          setIsBlockDialogOpen(false);
        },
      }
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agenda</h1>
          <p className="text-muted-foreground">
            Gerencie agendamentos, horários e bloqueios
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Horários
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurar Horário</DialogTitle>
              </DialogHeader>
              <DentistScheduleForm
                onSubmit={handleCreateSchedule}
                isLoading={isCreatingSchedule}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Clock className="mr-2 h-4 w-4" />
                Bloquear
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bloquear Horário</DialogTitle>
              </DialogHeader>
              <BlockedTimeForm
                onSubmit={handleCreateBlock}
                isLoading={isCreatingBlock}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isAppointmentDialogOpen} onOpenChange={setIsAppointmentDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Novo Agendamento</DialogTitle>
              </DialogHeader>
              <AppointmentForm
                onSubmit={handleCreateAppointment}
                isLoading={isCreating}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList>
          <TabsTrigger value="calendar">
            <Calendar className="mr-2 h-4 w-4" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <WeekCalendar
            appointments={appointments}
            onAppointmentClick={(apt) => console.log('Clicked:', apt)}
          />
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          {isLoadingAppointments ? (
            <p>Carregando...</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onConfirm={() => confirmAppointment(appointment.id)}
                  onCancel={() => cancelAppointment({ appointmentId: appointment.id })}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function AgendaPage() {
  return (
    <AgendaProvider>
      <AgendaContent />
    </AgendaProvider>
  );
}
