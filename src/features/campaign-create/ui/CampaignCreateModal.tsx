import { useEffect, useState, type FormEvent, type MouseEvent } from "react"
import type { CampaignPlatform } from "../../../entities/campaign/model/types"

interface CampaignCreateFormValues {
  name: string
  platform: CampaignPlatform
  budget: string
  initialSpend: string
  startDate: string
  endDate: string
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

type FormErrors = Partial<Record<keyof CampaignCreateFormValues, string>>

const PLATFORM_OPTIONS: CampaignPlatform[] = ["Google", "Meta", "Naver"]

const INITIAL_FORM_VALUES: CampaignCreateFormValues = {
  name: "",
  platform: "Google",
  budget: "",
  initialSpend: "",
  startDate: "",
  endDate: "",
}

function toSafeInteger(value: string): number {
  if (value.trim().length === 0) {
    return Number.NaN
  }

  const parsed = Number(value)
  if (!Number.isInteger(parsed)) {
    return Number.NaN
  }

  return parsed
}

function validate(values: CampaignCreateFormValues): FormErrors {
  const nextErrors: FormErrors = {}
  const name = values.name.trim()

  if (name.length < 2 || name.length > 100) {
    nextErrors.name = "캠페인명은 2자 이상 100자 이하로 입력해주세요."
  }

  if (!PLATFORM_OPTIONS.includes(values.platform)) {
    nextErrors.platform = "광고 매체를 선택해주세요."
  }

  const budget = toSafeInteger(values.budget)
  if (Number.isNaN(budget) || budget < 100 || budget > 1_000_000_000) {
    nextErrors.budget = "예산은 100원 이상 10억 원 이하 정수여야 합니다."
  }

  const initialSpend = toSafeInteger(values.initialSpend)
  if (Number.isNaN(initialSpend) || initialSpend < 0 || initialSpend > 1_000_000_000) {
    nextErrors.initialSpend = "집행 금액은 0원 이상 10억 원 이하 정수여야 합니다."
  }

  if (!Number.isNaN(budget) && !Number.isNaN(initialSpend) && initialSpend > budget) {
    nextErrors.initialSpend = "집행 금액은 예산을 초과할 수 없습니다."
  }

  if (values.startDate.length === 0) {
    nextErrors.startDate = "시작일을 선택해주세요."
  }

  if (values.endDate.length === 0) {
    nextErrors.endDate = "종료일을 선택해주세요."
  }

  if (values.startDate.length > 0 && values.endDate.length > 0 && values.endDate <= values.startDate) {
    nextErrors.endDate = "종료일은 시작일보다 이후여야 합니다."
  }

  return nextErrors
}

export function CampaignCreateModal({ open, onClose, onSubmit }: CampaignCreateModalProps) {
  const [values, setValues] = useState<CampaignCreateFormValues>(INITIAL_FORM_VALUES)
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (!open) {
      return
    }

    setValues(INITIAL_FORM_VALUES)
    setErrors({})
  }, [open])

  if (!open) {
    return null
  }

  function updateField<K extends keyof CampaignCreateFormValues>(key: K, value: CampaignCreateFormValues[K]) {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }))

    setErrors((prev) => ({
      ...prev,
      [key]: undefined,
    }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate(values)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    onSubmit({
      name: values.name.trim(),
      platform: values.platform,
      budget: Number(values.budget),
      initialSpend: Number(values.initialSpend),
      startDate: values.startDate,
      endDate: values.endDate,
    })
  }

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="캠페인 등록">
        <div className="modal-header">
          <h2>캠페인 등록</h2>
          <button type="button" className="ghost" onClick={onClose} aria-label="닫기">
            닫기
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            <span>캠페인명</span>
            <input
              value={values.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="캠페인명을 입력하세요"
            />
            {errors.name ? <small className="field-error">{errors.name}</small> : null}
          </label>

          <label>
            <span>광고 매체</span>
            <select
              value={values.platform}
              onChange={(event) => updateField("platform", event.target.value as CampaignPlatform)}
            >
              {PLATFORM_OPTIONS.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
            {errors.platform ? <small className="field-error">{errors.platform}</small> : null}
          </label>

          <label>
            <span>예산</span>
            <input
              type="number"
              step={1}
              min={100}
              max={1_000_000_000}
              value={values.budget}
              onChange={(event) => updateField("budget", event.target.value)}
              placeholder="100 ~ 1,000,000,000"
            />
            {errors.budget ? <small className="field-error">{errors.budget}</small> : null}
          </label>

          <label>
            <span>집행 금액</span>
            <input
              type="number"
              step={1}
              min={0}
              max={1_000_000_000}
              value={values.initialSpend}
              onChange={(event) => updateField("initialSpend", event.target.value)}
              placeholder="0 ~ 1,000,000,000"
            />
            {errors.initialSpend ? <small className="field-error">{errors.initialSpend}</small> : null}
          </label>

          <label>
            <span>시작일</span>
            <input
              type="date"
              value={values.startDate}
              onChange={(event) => updateField("startDate", event.target.value)}
            />
            {errors.startDate ? <small className="field-error">{errors.startDate}</small> : null}
          </label>

          <label>
            <span>종료일</span>
            <input
              type="date"
              value={values.endDate}
              onChange={(event) => updateField("endDate", event.target.value)}
            />
            {errors.endDate ? <small className="field-error">{errors.endDate}</small> : null}
          </label>

          <p className="muted">상태는 등록 시 자동으로 진행중(active)으로 설정됩니다.</p>

          <div className="modal-actions">
            <button type="button" className="secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="primary">
              등록
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
