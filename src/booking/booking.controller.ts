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
import { BookingService } from './booking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateBookingDto, UpdateBookingDto } from './dto/booking.dto';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @Post()
  async createBooking(@Req() req, @Body() dto: CreateBookingDto) {
    return this.bookingService.createBooking(req.user.id, dto);
  }

  @Get()
  async getAllBookings(@Req() req) {
    return this.bookingService.getAllBookings(req.user.id);
  }

  @Get('trainer')
  async getTrainerBookings(@Req() req) {
    return this.bookingService.getTrainerBookings(req.user.id);
  }

  @Get(':id')
  async getBookingById(@Req() req, @Param('id') id: string) {
    return this.bookingService.getBookingById(req.user.id, id);
  }

  @Put(':id')
  async updateBooking(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateBookingDto,
  ) {
    return this.bookingService.updateBooking(req.user.id, id, dto);
  }

  @Delete(':id')
  async cancelBooking(@Req() req, @Param('id') id: string) {
    return this.bookingService.cancelBooking(req.user.id, id);
  }
}
