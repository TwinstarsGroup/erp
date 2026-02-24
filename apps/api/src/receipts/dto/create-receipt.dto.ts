import { IsNumber, IsString, Min } from 'class-validator';

export class CreateReceiptDto {
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsString()
  description!: string;

  @IsString()
  payer!: string;
}
