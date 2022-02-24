import { Expose, Exclude } from 'class-transformer'
import { IsBoolean } from 'class-validator'
import { BaseDto } from '../../base.dto'

@Exclude()
export class RequestLiketDto extends BaseDto {
  @Expose()
  @IsBoolean()
  readonly like: boolean
}
