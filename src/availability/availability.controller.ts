import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAvailabilityDto, UpdateAvailabilityDto } from './dto/availability.dto';

@Controller('availability')
@UseGuards(JwtAuthGuard)
export class AvailabilityController {
  constructor(private availabilityService: AvailabilityService) {}

  @Post()
  async createAvailability(@Req() req, @Body() dto: CreateAvailabilityDto) {
    return this.availabilityService.createAvailability(req.user.id, dto);
  }

  @Get()
  async getAllAvailabilities(@Req() req) {
    return this.availabilityService.getAllAvailabilities(req.user.id);
  }

  @Get('slots')
  async getAvailableSlots(@Query('date') date?: string) {
    return this.availabilityService.getAvailableSlots(date);
  }

  @Get(':id')
  async getAvailabilityById(@Req() req, @Param('id') id: string) {
    return this.availabilityService.getAvailabilityById(req.user.id, id);
  }

  @Put(':id')
  async updateAvailability(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    return this.availabilityService.updateAvailability(req.user.id, id, dto);
  }

  @Delete(':id')
  async deleteAvailability(@Req() req, @Param('id') id: string) {
    return this.availabilityService.deleteAvailability(req.user.id, id);
  }
}
