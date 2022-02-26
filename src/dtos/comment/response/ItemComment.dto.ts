import { Expose, Exclude } from 'class-transformer'
import { IsBoolean, IsNotEmpty, IsString, IsDateString } from 'class-validator'
import { BaseDto } from '../../base.dto'
import { UserDto } from '../../users/response/user.dto'

@Exclude()
export class ItemCommentDto extends BaseDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  readonly id: string

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
  readonly user: { userName: string }
}
