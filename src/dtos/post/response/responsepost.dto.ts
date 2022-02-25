import { Expose, Exclude } from 'class-transformer'
import {
  IsDateString,
  IsBoolean,
  IsNotEmpty,
  IsString,
  IsNumber,
} from 'class-validator'
import { BaseDto } from '../../base.dto'

@Exclude()
export class ResponsePostDto extends BaseDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  readonly id: string

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
  @IsNumber()
  readonly countLike: number

  @Expose()
  @IsNumber()
  readonly countDisLike: number

  @Expose()
  @IsDateString()
  readonly updatedAt: string

  @Expose()
  @IsDateString()
  readonly createdAt: string

  @Expose()
  readonly user: { userName: string }
}
