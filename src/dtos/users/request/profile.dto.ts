import { Expose, Exclude } from 'class-transformer'
import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator'
import { BaseDto } from '../../base.dto'

@Exclude()
export class ProfileDto extends BaseDto {
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
}
