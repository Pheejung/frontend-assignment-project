import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CampaignCreateModal } from './CampaignCreateModal'

function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

describe('CampaignCreateModal accessibility', () => {
  it('uses local calendar date defaults for start/end date', () => {
    vi.useFakeTimers()
    try {
      const fixedNow = new Date(2026, 3, 8, 0, 30, 0)
      vi.setSystemTime(fixedNow)

      render(
        <CampaignCreateModal
          open
          onClose={() => undefined}
          onSubmit={() => undefined}
        />,
      )

      const expectedStart = formatLocalDate(fixedNow)
      const expectedEndDate = new Date(fixedNow)
      expectedEndDate.setDate(expectedEndDate.getDate() + 7)
      const expectedEnd = formatLocalDate(expectedEndDate)

      const startDateInput = screen.getByLabelText('시작일') as HTMLInputElement
      const endDateInput = screen.getByLabelText('종료일') as HTMLInputElement

      expect(startDateInput.value).toBe(expectedStart)
      expect(endDateInput.value).toBe(expectedEnd)
    } finally {
      vi.useRealTimers()
    }
  })

  it('closes by Escape key', async () => {
    const onClose = vi.fn()

    render(
      <CampaignCreateModal
        open
        onClose={onClose}
        onSubmit={() => undefined}
      />,
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('restores focus to the trigger when closed', async () => {
    const onClose = vi.fn()

    const { rerender } = render(
      <>
        <button type="button" data-testid="trigger">열기</button>
        <CampaignCreateModal open={false} onClose={onClose} onSubmit={() => undefined} />
      </>,
    )

    const trigger = screen.getByTestId('trigger')
    trigger.focus()
    expect(trigger).toHaveFocus()

    rerender(
      <>
        <button type="button" data-testid="trigger">열기</button>
        <CampaignCreateModal open onClose={onClose} onSubmit={() => undefined} />
      </>,
    )

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    rerender(
      <>
        <button type="button" data-testid="trigger">열기</button>
        <CampaignCreateModal open={false} onClose={onClose} onSubmit={() => undefined} />
      </>,
    )

    await waitFor(() => {
      expect(trigger).toHaveFocus()
    })
  })

  it('resets form values when modal is reopened', async () => {
    const onClose = vi.fn()

    const { rerender } = render(
      <CampaignCreateModal open onClose={onClose} onSubmit={() => undefined} />,
    )

    const nameInput = screen.getByPlaceholderText('캠페인명을 입력하세요') as HTMLInputElement
    const budgetInput = screen.getByPlaceholderText('100 ~ 1,000,000,000') as HTMLInputElement
    const spendInput = screen.getByPlaceholderText('0 ~ 1,000,000,000') as HTMLInputElement

    fireEvent.change(nameInput, { target: { value: '임시 캠페인' } })
    fireEvent.change(budgetInput, { target: { value: '12345' } })
    fireEvent.change(spendInput, { target: { value: '6789' } })

    expect(nameInput.value).toBe('임시 캠페인')
    expect(budgetInput.value).toBe('12345')
    expect(spendInput.value).toBe('6789')

    rerender(<CampaignCreateModal open={false} onClose={onClose} onSubmit={() => undefined} />)
    rerender(<CampaignCreateModal open onClose={onClose} onSubmit={() => undefined} />)

    await waitFor(() => {
      expect((screen.getByPlaceholderText('캠페인명을 입력하세요') as HTMLInputElement).value).toBe('')
      expect((screen.getByPlaceholderText('100 ~ 1,000,000,000') as HTMLInputElement).value).toBe('')
      expect((screen.getByPlaceholderText('0 ~ 1,000,000,000') as HTMLInputElement).value).toBe('')
    })
  })
})
