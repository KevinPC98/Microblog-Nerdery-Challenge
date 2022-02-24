import { Expose, Exclude } from 'class-transformer'
import { IsDateString, IsBoolean, IsNotEmpty, IsString } from 'class-validator'
import { BaseDto } from '../../base.dto'

@Exclude()
export class ResponsePostDto extends BaseDto {
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
}
