import { Expose, Exclude } from 'class-transformer'
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator'
import { BaseDto } from '../../base.dto'

@Exclude()
export class ResquestCommentDto extends BaseDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  readonly content: string

  @Expose()
  @IsNotEmpty()
  @IsBoolean()
  readonly isPublic: boolean
}
