import { useEffect, type MouseEvent } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { CampaignPlatform } from "../../../entities/campaign/model/types"

const PLATFORM_OPTIONS: CampaignPlatform[] = ["Google", "Meta", "Naver"]

const schema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "캠페인명은 2자 이상 100자 이하로 입력해주세요.")
      .max(100, "캠페인명은 2자 이상 100자 이하로 입력해주세요."),
    platform: z.enum(["Google", "Meta", "Naver"], {
      error: "광고 매체를 선택해주세요.",
    }),
    budget: z
      .number({ error: "예산은 100원 이상 10억 원 이하 정수여야 합니다." })
      .int("예산은 정수여야 합니다.")
      .min(100, "예산은 100원 이상이어야 합니다.")
      .max(1_000_000_000, "예산은 10억 원 이하여야 합니다."),
    initialSpend: z
      .number({ error: "집행 금액은 0원 이상 10억 원 이하 정수여야 합니다." })
      .int("집행 금액은 정수여야 합니다.")
      .min(0, "집행 금액은 0원 이상이어야 합니다.")
      .max(1_000_000_000, "집행 금액은 10억 원 이하여야 합니다."),
    startDate: z.string().min(1, "시작일을 선택해주세요."),
    endDate: z.string().min(1, "종료일을 선택해주세요."),
  })
  .refine((data) => data.initialSpend <= data.budget, {
    message: "집행 금액은 예산을 초과할 수 없습니다.",
    path: ["initialSpend"],
  })
  .refine((data) => data.startDate.length === 0 || data.endDate.length === 0 || data.endDate > data.startDate, {
    message: "종료일은 시작일보다 이후여야 합니다.",
    path: ["endDate"],
  })

type FormValues = z.infer<typeof schema>

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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      platform: "Google",
      budget: undefined,
      initialSpend: undefined,
      startDate: "",
      endDate: "",
    },
  })

  useEffect(() => {
    if (open) reset()
  }, [open, reset])

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="캠페인 등록">
        <div className="modal-header">
          <div>
            <h2>캠페인 등록</h2>
            <p className="modal-subtitle">신규 캠페인을 생성하면 대시보드와 테이블에 즉시 반영됩니다.</p>
          </div>
          <button type="button" className="ghost modal-close" onClick={onClose} aria-label="닫기">
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
          <label className="field-block">
            <span>캠페인명</span>
            <input {...register("name")} placeholder="캠페인명을 입력하세요" />
            {errors.name && <small className="field-error">{errors.name.message}</small>}
          </label>

          <label className="field-block">
            <span>광고 매체</span>
            <select {...register("platform")}>
              {PLATFORM_OPTIONS.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
            {errors.platform && <small className="field-error">{errors.platform.message}</small>}
          </label>

          <div className="field-row two-col">
            <label className="field-block">
              <span>예산</span>
              <input
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
              <input
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
              <input type="date" {...register("startDate")} />
              {errors.startDate && <small className="field-error">{errors.startDate.message}</small>}
            </label>

            <label className="field-block">
              <span>종료일</span>
              <input type="date" {...register("endDate")} />
              {errors.endDate && <small className="field-error">{errors.endDate.message}</small>}
            </label>
          </div>

          <p className="modal-note">상태는 등록 시 자동으로 진행중(active)으로 설정됩니다.</p>

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
