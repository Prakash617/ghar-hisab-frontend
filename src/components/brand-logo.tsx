import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  alt?: string;
}

export function BrandLogo({ className, alt = "Ghar Hisaab" }: BrandLogoProps) {
  return (
    <>
      <img
        src="/images/logo-ghar-hisaab.svg"
        alt={alt}
        className={cn(className, "dark:hidden")}
      />
      <img
        src="/images/logo-ghar-hisaab-dark.svg"
        alt=""
        aria-hidden="true"
        className={cn(className, "hidden dark:block")}
      />
    </>
  );
}
