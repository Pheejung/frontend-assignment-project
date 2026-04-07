import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CampaignCreateModal } from './CampaignCreateModal'

describe('CampaignCreateModal accessibility', () => {
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
})
