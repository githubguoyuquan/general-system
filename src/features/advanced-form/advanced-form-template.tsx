"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { PageFade } from "@/components/page-fade";
import { FieldError } from "@/components/ui/field-error";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { type AdvancedFormValues, advancedFormSchema } from "@/lib/advanced-form-schema";
import { MOCK_CITY_OPTIONS, MOCK_SKILL_OPTIONS } from "@/lib/mock";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function AdvancedFormTemplate() {
  const [cityOpen, setCityOpen] = useState(false);
  const form = useForm<AdvancedFormValues>({
    resolver: zodResolver(advancedFormSchema),
    defaultValues: {
      plan: "free",
      skills: ["TypeScript"],
      newsletter: true,
      country: "cn",
      city: "beijing",
    },
  });

  const cityLabel = MOCK_CITY_OPTIONS.find((c) => c.value === form.watch("city"))?.label ?? "选择城市…";

  async function onSubmit(data: AdvancedFormValues) {
    await delay(900);
    toast.success("提交成功（演示：未写入后端）", {
      description: `${format(data.birthDate, "yyyy-MM-dd")} · ${MOCK_CITY_OPTIONS.find((c) => c.value === data.city)?.label ?? data.city} · ${data.skills.join(", ")}`,
    });
  }

  return (
    <PageFade className="mx-auto max-w-2xl space-y-8">
      <PageHeader title="复杂表单模板" description="react-hook-form · zod · Popover 城市搜索 · 日期 · Toast" />

      <Card>
        <CardHeader>
          <CardTitle>万能业务表单</CardTitle>
          <CardDescription>校验与提交逻辑集中在 schema + handleSubmit，控件仅绑定 Controller。</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-3">
              <Label>订阅方案</Label>
              <Controller
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <RadioGroup onValueChange={field.onChange} value={field.value} className="grid gap-2 sm:grid-cols-3">
                    {[
                      { v: "free", l: "免费版" },
                      { v: "pro", l: "专业版" },
                      { v: "team", l: "团队版" },
                    ].map((o) => (
                      <div
                        key={o.v}
                        className="flex items-center space-x-2 rounded-lg border border-border/80 bg-card/50 p-3 shadow-sm transition-all duration-300 hover:border-primary/25 hover:shadow-card"
                      >
                        <RadioGroupItem value={o.v} id={`plan-${o.v}`} />
                        <Label htmlFor={`plan-${o.v}`} className="font-normal cursor-pointer">
                          {o.l}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />
              <FieldError message={form.formState.errors.plan?.message} />
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>技能（多选）</Label>
              <Controller
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {MOCK_SKILL_OPTIONS.map((skill) => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox
                          id={`sk-${skill}`}
                          checked={field.value.includes(skill)}
                          onCheckedChange={(c) => {
                            const on = c === true;
                            field.onChange(on ? [...field.value, skill] : field.value.filter((s) => s !== skill));
                          }}
                        />
                        <Label htmlFor={`sk-${skill}`} className="text-sm font-normal cursor-pointer">
                          {skill}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              />
              <FieldError message={form.formState.errors.skills?.message} />
            </div>

            <Separator />

            <div className="flex items-center justify-between rounded-lg border border-border/80 bg-card/40 p-4 shadow-sm transition-shadow duration-300 hover:shadow-card">
              <div className="space-y-0.5">
                <Label htmlFor="newsletter">订阅产品动态</Label>
                <p className="text-xs text-muted-foreground">关闭后仅保留必要通知邮件</p>
              </div>
              <Controller
                control={form.control}
                name="newsletter"
                render={({ field }) => (
                  <Switch id="newsletter" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>

            <Separator />

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>国家/地区</Label>
                <Controller
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cn">中国</SelectItem>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="jp">日本</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>城市（可搜索）</Label>
                <Controller
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <Popover open={cityOpen} onOpenChange={setCityOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          aria-expanded={cityOpen}
                          className={cn("w-full justify-between font-normal", !field.value && "text-muted-foreground")}
                        >
                          {cityLabel}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="搜索城市…" />
                          <CommandList>
                            <CommandEmpty>无匹配城市</CommandEmpty>
                            <CommandGroup>
                              {MOCK_CITY_OPTIONS.map((c) => (
                                <CommandItem
                                  key={c.value}
                                  value={c.label}
                                  onSelect={() => {
                                    field.onChange(c.value);
                                    setCityOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn("mr-2 h-4 w-4", field.value === c.value ? "opacity-100" : "opacity-0")}
                                  />
                                  {c.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                />
                <FieldError message={form.formState.errors.city?.message} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>出生日期</Label>
              <Controller
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP", { locale: zhCN }) : "选择日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                )}
              />
              <FieldError message={form.formState.errors.birthDate?.message} />
            </div>

            <Button type="submit" className="w-full transition-all duration-300 sm:w-auto" loading={form.formState.isSubmitting}>
              提交
            </Button>
          </form>
        </CardContent>
      </Card>
    </PageFade>
  );
}
