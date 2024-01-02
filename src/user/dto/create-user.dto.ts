import { Exclude, Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Exclude()
export class CreateUserDto {
  @IsString()
  @Expose()
  readonly name: string;
}
