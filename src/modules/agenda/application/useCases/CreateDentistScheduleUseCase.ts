import { DentistSchedule, DentistScheduleProps } from '../../domain/entities/DentistSchedule';
import { IDentistScheduleRepository } from '../../domain/repositories/IDentistScheduleRepository';

interface CreateDentistScheduleInput {
  clinicId: string;
  dentistId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}

export class CreateDentistScheduleUseCase {
  constructor(private scheduleRepository: IDentistScheduleRepository) {}

  async execute(input: CreateDentistScheduleInput): Promise<DentistSchedule> {
    // Verificar se já existe horário para este dia
    const existing = await this.scheduleRepository.findByDentistAndDayOfWeek(
      input.dentistId,
      input.dayOfWeek
    );

    if (existing) {
      throw new Error('Já existe um horário configurado para este dia da semana');
    }

    const scheduleProps: DentistScheduleProps = {
      id: crypto.randomUUID(),
      clinicId: input.clinicId,
      dentistId: input.dentistId,
      dayOfWeek: input.dayOfWeek,
      startTime: input.startTime,
      endTime: input.endTime,
      breakStart: input.breakStart,
      breakEnd: input.breakEnd,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const schedule = new DentistSchedule(scheduleProps);

    return await this.scheduleRepository.save(schedule);
  }
}
