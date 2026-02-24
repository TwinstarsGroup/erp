import { IsNumber, IsString, Min } from 'class-validator';

export class CreateVoucherDto {
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsString()
  description!: string;

  @IsString()
  payee!: string;
}
