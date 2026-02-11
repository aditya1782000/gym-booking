import { IsString, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  slotId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateBookingDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  status?: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}
