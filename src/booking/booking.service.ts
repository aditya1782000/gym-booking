import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto, UpdateBookingDto } from './dto/booking.dto';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async createBooking(userId: string, dto: CreateBookingDto) {
    // Check if slot exists and is available
    const slot = await this.prisma.slot.findUnique({
      where: { id: dto.slotId },
      include: {
        booking: true,
      },
    });

    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    if (slot.status !== 'OPEN') {
      throw new BadRequestException('Slot is not available for booking');
    }

    if (slot.booking) {
      throw new BadRequestException('Slot is already booked');
    }

    // Check if slot is in the future
    if (new Date(slot.startTime) < new Date()) {
      throw new BadRequestException('Cannot book slots in the past');
    }

    // Create booking and update slot status
    const booking = await this.prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          slotId: dto.slotId,
          clientId: userId,
          notes: dto.notes,
          status: 'CONFIRMED',
        },
        include: {
          slot: {
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
          },
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              picture: true,
            },
          },
        },
      });

      await tx.slot.update({
        where: { id: dto.slotId },
        data: { status: 'BOOKED' },
      });

      return newBooking;
    });

    return booking;
  }

  async getAllBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: {
        clientId: userId,
      },
      include: {
        slot: {
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
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getBookingById(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        slot: {
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
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            picture: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.clientId !== userId && booking.slot.trainerId !== userId) {
      throw new ForbiddenException('You do not have access to this booking');
    }

    return booking;
  }

  async updateBooking(userId: string, bookingId: string, dto: UpdateBookingDto) {
    const booking = await this.getBookingById(userId, bookingId);

    // Only allow the client to update their own bookings
    if (booking.clientId !== userId) {
      throw new ForbiddenException('You can only update your own bookings');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        notes: dto.notes,
        ...(dto.status && { status: dto.status }),
      },
      include: {
        slot: {
          include: {
            trainer: {
              select: {
                id: true,
                name: true,
                email: true,
                picture: true,
              },
            },
          },
        },
      },
    });
  }

  async cancelBooking(userId: string, bookingId: string) {
    const booking = await this.getBookingById(userId, bookingId);

    // Only allow the client to cancel their own bookings
    if (booking.clientId !== userId) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }

    // Update booking status and slot status
    await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
      });

      await tx.slot.update({
        where: { id: booking.slotId },
        data: { status: 'OPEN' },
      });
    });

    return { message: 'Booking cancelled successfully' };
  }

  // For trainers to view all bookings for their slots
  async getTrainerBookings(trainerId: string) {
    return this.prisma.booking.findMany({
      where: {
        slot: {
          trainerId,
        },
      },
      include: {
        slot: {
          include: {
            availability: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            picture: true,
          },
        },
      },
      orderBy: {
        slot: {
          startTime: 'asc',
        },
      },
    });
  }
}
