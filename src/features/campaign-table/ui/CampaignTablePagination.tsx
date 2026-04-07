interface CampaignTablePaginationProps {
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
}

export function CampaignTablePagination({ page, totalPages, onPrev, onNext }: CampaignTablePaginationProps) {
  return (
    <div className="pagination">
      <button type="button" onClick={onPrev} disabled={page === 1}>
        이전
      </button>
      <span>
        {page} / {totalPages}
      </span>
      <button type="button" onClick={onNext} disabled={page === totalPages}>
        다음
      </button>
    </div>
  )
}
