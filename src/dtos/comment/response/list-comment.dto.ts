import { Expose, Exclude } from 'class-transformer'
import { BaseDto } from '../../base.dto'
import { ItemCommentDto } from '../response/ItemComment.dto'

@Exclude()
export class ListCommentDto extends BaseDto {
  @Expose()
  readonly comments: ItemCommentDto[]

  @Expose()
  readonly pagination: {
    totalPages: number
    itemsPerPage: number
    totalItems: number
    currentPage: number
    nextPage: number | null
    previousPage: number | null
  }
}
