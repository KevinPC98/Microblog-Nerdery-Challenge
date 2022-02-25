import { Expose, Exclude } from 'class-transformer'
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator'
import { BaseDto } from '../../base.dto'

@Exclude()
export class UserDto extends BaseDto {
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
  @IsBoolean()
  readonly isEmailPublic: boolean

  @Expose()
  @IsBoolean()
  readonly isNamePublic: boolean

  @Expose()
  @IsBoolean()
  readonly isActive: boolean

  @Expose()
  @IsDateString()
  readonly createdAt: string

  @Expose()
  @IsDateString()
  readonly updatedAt: string
}
