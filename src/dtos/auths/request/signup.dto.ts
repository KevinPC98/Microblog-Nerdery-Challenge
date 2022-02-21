import { Expose, Exclude } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator'
import { BaseDto } from '../../base.dto'

@Exclude()
export class CreateUserDto extends BaseDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  readonly name: string

  @Expose()
  @IsNotEmpty()
  @IsString()
  readonly userName: string

  @Expose()
  @IsEmail()
  readonly email: string

  @Expose()
  @IsString()
  @Length(6, 20)
  password: string

  @Expose()
  @IsString()
  @Length(6, 20)
  passwordConfirmation: string
}
