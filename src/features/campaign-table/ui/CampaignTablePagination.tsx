import { Button } from "../../../shared/ui/Button"

interface CampaignTablePaginationProps {
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
}

export function CampaignTablePagination({ page, totalPages, onPrev, onNext }: CampaignTablePaginationProps) {
  return (
    <div className="pagination">
      <Button type="button" onClick={onPrev} disabled={page === 1}>
        이전
      </Button>
      <span>
        {page} / {totalPages}
      </span>
      <Button type="button" onClick={onNext} disabled={page === totalPages}>
        다음
      </Button>
    </div>
  )
}
