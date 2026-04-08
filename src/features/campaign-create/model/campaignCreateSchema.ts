import { z } from "zod"
import type { CampaignPlatform } from "../../../entities/campaign/model/types"

export const PLATFORM_OPTIONS: CampaignPlatform[] = ["Google", "Meta", "Naver"]

export const campaignCreateSchema = z
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
  .refine((data) => data.startDate.length === 0 || data.endDate.length === 0 || data.endDate >= data.startDate, {
    message: "종료일은 시작일과 같거나 이후여야 합니다.",
    path: ["endDate"],
  })

export type CampaignCreateFormValues = z.infer<typeof campaignCreateSchema>
