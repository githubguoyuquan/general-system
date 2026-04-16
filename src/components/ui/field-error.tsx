import { cn } from "@/lib/utils";

type FieldErrorProps = {
  message?: string | null;
  className?: string;
};

/** 表单校验错误：微弱左右抖动（animate-form-error-shake） */
export function FieldError({ message, className }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p role="alert" className={cn("text-sm text-destructive animate-form-error-shake", className)}>
      {message}
    </p>
  );
}
