import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvailabilityDto, UpdateAvailabilityDto } from './dto/availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  async createAvailability(userId: string, dto: CreateAvailabilityDto) {
    // Validate time format
    this.validateTimeFormat(dto.startTime, dto.endTime);

    // Create availability
    const availability = await this.prisma.availability.create({
      data: {
        date: new Date(dto.date),
        startTime: dto.startTime,
        endTime: dto.endTime,
        isRecurring: dto.isRecurring || false,
        dayOfWeek: dto.dayOfWeek,
        userId,
      },
    });

    // Generate slots (e.g., 1-hour slots)
    await this.generateSlots(availability.id, userId, dto.date, dto.startTime, dto.endTime);

    return this.prisma.availability.findUnique({
      where: { id: availability.id },
      include: {
        slots: true,
      },
    });
  }

  private async generateSlots(
    availabilityId: string,
    trainerId: string,
    date: string,
    startTime: string,
    endTime: string,
  ) {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const baseDate = new Date(date);
    const slots = [];

    let currentHour = startHour;
    let currentMinute = startMinute;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMinute < endMinute)
    ) {
      const slotStart = new Date(baseDate);
      slotStart.setHours(currentHour, currentMinute, 0, 0);

      // Add 1 hour to get end time
      const slotEnd = new Date(slotStart);
      slotEnd.setHours(slotEnd.getHours() + 1);

      // Only create slot if it doesn't exceed the availability end time
      const slotEndHour = slotEnd.getHours();
      const slotEndMinute = slotEnd.getMinutes();

      if (
        slotEndHour < endHour ||
        (slotEndHour === endHour && slotEndMinute <= endMinute)
      ) {
        slots.push({
          startTime: slotStart,
          endTime: slotEnd,
          availabilityId,
          trainerId,
          status: 'OPEN',
        });
      }

      // Move to next hour
      currentHour++;
    }

    if (slots.length > 0) {
      await this.prisma.slot.createMany({
        data: slots,
      });
    }
  }

  private validateTimeFormat(startTime: string, endTime: string) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      throw new BadRequestException('Invalid time format. Use HH:mm');
    }

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    if (
      startHour > endHour ||
      (startHour === endHour && startMinute >= endMinute)
    ) {
      throw new BadRequestException('Start time must be before end time');
    }
  }

  async getAllAvailabilities(userId: string) {
    return this.prisma.availability.findMany({
      where: {
        userId,
      },
      include: {
        slots: {
          include: {
            booking: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async getAvailabilityById(userId: string, availabilityId: string) {
    const availability = await this.prisma.availability.findUnique({
      where: { id: availabilityId },
      include: {
        slots: {
          include: {
            booking: {
              include: {
                client: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    if (availability.userId !== userId) {
      throw new ForbiddenException('You do not have access to this availability');
    }

    return availability;
  }

  async updateAvailability(
    userId: string,
    availabilityId: string,
    dto: UpdateAvailabilityDto,
  ) {
    await this.getAvailabilityById(userId, availabilityId);

    if (dto.startTime && dto.endTime) {
      this.validateTimeFormat(dto.startTime, dto.endTime);
    }

    return this.prisma.availability.update({
      where: { id: availabilityId },
      data: {
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.startTime && { startTime: dto.startTime }),
        ...(dto.endTime && { endTime: dto.endTime }),
        ...(dto.isRecurring !== undefined && { isRecurring: dto.isRecurring }),
        ...(dto.dayOfWeek !== undefined && { dayOfWeek: dto.dayOfWeek }),
      },
      include: {
        slots: true,
      },
    });
  }

  async deleteAvailability(userId: string, availabilityId: string) {
    await this.getAvailabilityById(userId, availabilityId);

    await this.prisma.availability.delete({
      where: { id: availabilityId },
    });

    return { message: 'Availability deleted successfully' };
  }

  // Get all available slots (for clients to book)
  async getAvailableSlots(date?: string) {
    const whereClause: any = {
      status: 'OPEN',
    };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.startTime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else {
      // Only future slots
      whereClause.startTime = {
        gte: new Date(),
      };
    }

    return this.prisma.slot.findMany({
      where: whereClause,
      include: {
        trainer: {
          select: {
            id: true,
            name: true,
            email: true,
            picture: true,
          },
        },
        availability: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }
}
