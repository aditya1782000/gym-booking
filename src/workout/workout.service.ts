import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkoutPlanDto, UpdateWorkoutPlanDto } from './dto/workout.dto';

@Injectable()
export class WorkoutService {
  constructor(private prisma: PrismaService) {}

  async createWorkoutPlan(userId: string, dto: CreateWorkoutPlanDto) {
    return this.prisma.workoutPlan.create({
      data: {
        name: dto.name,
        description: dto.description,
        duration: dto.duration,
        createdBy: userId,
        exercises: {
          create: dto.exercises.map((exercise, index) => ({
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            notes: exercise.notes,
            order: exercise.order ?? index,
          })),
        },
      },
      include: {
        exercises: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  async getAllWorkoutPlans(userId: string) {
    return this.prisma.workoutPlan.findMany({
      where: {
        createdBy: userId,
      },
      include: {
        exercises: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getWorkoutPlanById(userId: string, planId: string) {
    const plan = await this.prisma.workoutPlan.findUnique({
      where: { id: planId },
      include: {
        exercises: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Workout plan not found');
    }

    if (plan.createdBy !== userId) {
      throw new ForbiddenException('You do not have access to this workout plan');
    }

    return plan;
  }

  async updateWorkoutPlan(userId: string, planId: string, dto: UpdateWorkoutPlanDto) {
    await this.getWorkoutPlanById(userId, planId);

    // Delete existing exercises if new ones are provided
    if (dto.exercises) {
      await this.prisma.exercise.deleteMany({
        where: { workoutPlanId: planId },
      });
    }

    return this.prisma.workoutPlan.update({
      where: { id: planId },
      data: {
        name: dto.name,
        description: dto.description,
        duration: dto.duration,
        ...(dto.exercises && {
          exercises: {
            create: dto.exercises.map((exercise, index) => ({
              name: exercise.name,
              sets: exercise.sets,
              reps: exercise.reps,
              notes: exercise.notes,
              order: exercise.order ?? index,
            })),
          },
        }),
      },
      include: {
        exercises: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  async deleteWorkoutPlan(userId: string, planId: string) {
    await this.getWorkoutPlanById(userId, planId);

    await this.prisma.workoutPlan.delete({
      where: { id: planId },
    });

    return { message: 'Workout plan deleted successfully' };
  }
}
