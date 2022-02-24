import { Expose, Exclude } from 'class-transformer'
import {
  IsDateString,
  IsBoolean,
  IsNotEmpty,
  IsString,
  IsNumber,
} from 'class-validator'
import { BaseDto } from '../../base.dto'
import { UserDto } from '../../users/response/user.dto'

@Exclude()
export class GetPostDto extends BaseDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  readonly title: string

  @Expose()
  @IsNotEmpty()
  @IsString()
  readonly content: string

  @Expose()
  @IsBoolean()
  readonly isPublic: boolean

  @Expose()
  @IsDateString()
  readonly createdAt: string

  @Expose()
  @IsNumber()
  readonly countLike: string

  @Expose()
  @IsNumber()
  readonly countDislike: string

  @Expose()
  readonly user: UserDto
}