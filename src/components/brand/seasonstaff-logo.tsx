import { AppLink } from "@/components/ui/app-link";
import Image from "next/image";

import { cn } from "@/lib/utils";

const LOGO_SRC = "/logo.png";

interface SeasonStaffLogoProps {
  className?: string;
  imageClassName?: string;
  size?: number;
  showWordmark?: boolean;
  href?: string | null;
}

export function SeasonStaffLogo({
  className,
  imageClassName,
  size = 32,
  showWordmark = true,
  href = "/dashboard",
}: SeasonStaffLogoProps) {
  const content = (
    <>
      <Image
        src={LOGO_SRC}
        alt=""
        width={size}
        height={size}
        className={cn("shrink-0 rounded-[22%]", imageClassName)}
        priority
      />
      {showWordmark && (
        <span className="truncate text-base font-semibold tracking-tight text-text-primary">
          SeasonStaff
        </span>
      )}
    </>
  );

  const wrapperClass = cn("flex min-w-0 items-center gap-2.5", className);

  if (href) {
    return (
      <AppLink href={href} className={wrapperClass} aria-label="SeasonStaff home">
        {content}
      </AppLink>
    );
  }

  return <div className={wrapperClass}>{content}</div>;
}
