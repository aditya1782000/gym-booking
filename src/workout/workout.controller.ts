import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateWorkoutPlanDto, UpdateWorkoutPlanDto } from './dto/workout.dto';

@Controller('workouts')
@UseGuards(JwtAuthGuard)
export class WorkoutController {
  constructor(private workoutService: WorkoutService) {}

  @Post()
  async createWorkoutPlan(@Req() req, @Body() dto: CreateWorkoutPlanDto) {
    return this.workoutService.createWorkoutPlan(req.user.id, dto);
  }

  @Get()
  async getAllWorkoutPlans(@Req() req) {
    return this.workoutService.getAllWorkoutPlans(req.user.id);
  }

  @Get(':id')
  async getWorkoutPlanById(@Req() req, @Param('id') id: string) {
    return this.workoutService.getWorkoutPlanById(req.user.id, id);
  }

  @Put(':id')
  async updateWorkoutPlan(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateWorkoutPlanDto,
  ) {
    return this.workoutService.updateWorkoutPlan(req.user.id, id, dto);
  }

  @Delete(':id')
  async deleteWorkoutPlan(@Req() req, @Param('id') id: string) {
    return this.workoutService.deleteWorkoutPlan(req.user.id, id);
  }
}
