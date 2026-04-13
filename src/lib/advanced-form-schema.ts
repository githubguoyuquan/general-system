import { z } from "zod";
import { MOCK_CITY_OPTIONS, MOCK_SKILL_OPTIONS } from "@/lib/mock";

const skillSet = new Set<string>(MOCK_SKILL_OPTIONS);
const cityValueSet = new Set(MOCK_CITY_OPTIONS.map((c) => c.value));

export const advancedFormSchema = z.object({
  plan: z.enum(["free", "pro", "team"]),
  skills: z
    .array(z.string())
    .min(1, "至少选择一项技能")
    .refine((arr) => arr.every((s) => skillSet.has(s)), { message: "技能选项无效" }),
  newsletter: z.boolean(),
  birthDate: z.date({ required_error: "请选择出生日期" }),
  country: z.enum(["cn", "us", "jp"]),
  city: z
    .string()
    .min(1, "请选择城市")
    .refine((v) => cityValueSet.has(v), { message: "请选择有效城市" }),
});

export type AdvancedFormValues = z.infer<typeof advancedFormSchema>;
