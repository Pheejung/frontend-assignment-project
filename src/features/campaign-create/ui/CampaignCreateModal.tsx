import { useEffect, useRef, type MouseEvent } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import dayjs from "dayjs"
import type { CampaignPlatform } from "../../../entities/campaign/model/types"
import {
  campaignCreateSchema,
  type CampaignCreateFormValues,
  PLATFORM_OPTIONS,
} from "../model/campaignCreateSchema"
import { Button } from "../../../shared/ui/Button"
import { Input } from "../../../shared/ui/Input"
import { Select } from "../../../shared/ui/Select"

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
const EMPTY_NUMBER = Number.NaN

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter((element) => {
    if (element.getAttribute("aria-hidden") === "true") return false
    if (element.tabIndex === -1) return false
    return true
  })
}

export interface CampaignCreatePayload {
  name: string
  platform: CampaignPlatform
  budget: number
  initialSpend: number
  startDate: string
  endDate: string
}

interface CampaignCreateModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (payload: CampaignCreatePayload) => void
}

export function CampaignCreateModal({ open, onClose, onSubmit }: CampaignCreateModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const todayStr = dayjs().format("YYYY-MM-DD")
  const weekLaterStr = dayjs().add(7, "day").format("YYYY-MM-DD")

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CampaignCreateFormValues>({
    resolver: zodResolver(campaignCreateSchema),
    defaultValues: {
      name: "",
      platform: "Google",
      budget: EMPTY_NUMBER,
      initialSpend: EMPTY_NUMBER,
      startDate: todayStr,
      endDate: weekLaterStr,
    },
  })

  const startDate = watch("startDate")

  useEffect(() => {
    if (open) {
      reset({
        name: "",
        platform: "Google",
        budget: EMPTY_NUMBER,
        initialSpend: EMPTY_NUMBER,
        startDate: todayStr,
        endDate: weekLaterStr,
      })
    }
  }, [open, reset, todayStr, weekLaterStr])

  useEffect(() => {
    if (!open) return

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const modal = modalRef.current
    if (modal) {
      window.requestAnimationFrame(() => {
        const focusables = getFocusableElements(modal)
        const target = focusables[0] ?? modal
        target.focus()
      })
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== "Tab") return

      const root = modalRef.current
      if (!root) return

      const focusables = getFocusableElements(root)
      if (focusables.length === 0) {
        event.preventDefault()
        root.focus()
        return
      }

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (!first || !last) return

      const active = document.activeElement instanceof HTMLElement ? document.activeElement : null
      const isInside = active ? root.contains(active) : false

      if (event.shiftKey) {
        if (!isInside || active === first) {
          event.preventDefault()
          last.focus()
        }
        return
      }

      if (!isInside || active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = originalOverflow
      previousFocusRef.current?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        ref={modalRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="campaign-create-title"
        aria-describedby="campaign-create-subtitle"
        tabIndex={-1}
      >
        <div className="modal-header">
          <div>
            <h2 id="campaign-create-title">캠페인 등록</h2>
            <p id="campaign-create-subtitle" className="modal-subtitle">
              신규 캠페인을 생성하면 대시보드와 테이블에 즉시 반영됩니다.
            </p>
          </div>
          <Button variant="ghost" className="modal-close" onClick={onClose} aria-label="닫기">
            <span aria-hidden="true">×</span>
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
          <label className="field-block">
            <span>캠페인명</span>
            <Input {...register("name")} placeholder="캠페인명을 입력하세요" />
            {errors.name && <small className="field-error">{errors.name.message}</small>}
          </label>

          <label className="field-block">
            <span>광고 매체</span>
            <Select {...register("platform")}>
              {PLATFORM_OPTIONS.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </Select>
            {errors.platform && <small className="field-error">{errors.platform.message}</small>}
          </label>

          <div className="field-row two-col">
            <label className="field-block">
              <span>예산</span>
              <Input
                type="number"
                step={1}
                min={100}
                max={1_000_000_000}
                placeholder="100 ~ 1,000,000,000"
                {...register("budget", { valueAsNumber: true })}
              />
              {errors.budget && <small className="field-error">{errors.budget.message}</small>}
            </label>

            <label className="field-block">
              <span>집행 금액</span>
              <Input
                type="number"
                step={1}
                min={0}
                max={1_000_000_000}
                placeholder="0 ~ 1,000,000,000"
                {...register("initialSpend", { valueAsNumber: true })}
              />
              {errors.initialSpend && <small className="field-error">{errors.initialSpend.message}</small>}
            </label>
          </div>

          <div className="field-row two-col">
            <label className="field-block">
              <span>시작일</span>
              <Input type="date" {...register("startDate")} />
              {errors.startDate && <small className="field-error">{errors.startDate.message}</small>}
            </label>

            <label className="field-block">
              <span>종료일</span>
              <Input type="date" min={startDate || undefined} {...register("endDate")} />
              {errors.endDate && <small className="field-error">{errors.endDate.message}</small>}
            </label>
          </div>

          <p className="modal-note">상태는 등록 시 자동으로 진행중(active)으로 설정됩니다.</p>

          <div className="modal-actions">
            <Button variant="secondary" type="button" onClick={onClose}>
              취소
            </Button>
            <Button variant="primary" type="submit">
              등록
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
