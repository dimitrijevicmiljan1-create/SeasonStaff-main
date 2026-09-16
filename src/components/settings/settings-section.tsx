import { sectionTitle } from "@/lib/page-styles";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingsSection({
  title,
  description,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <Card className={cn("p-5 lg:p-6", className)}>
      <div className="mb-5 border-b border-border pb-4">
        <h2 className={cn(sectionTitle, "text-base")}>{title}</h2>
        {description && (
          <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
            {description}
          </p>
        )}
      </div>
      {children}
    </Card>
  );
}
