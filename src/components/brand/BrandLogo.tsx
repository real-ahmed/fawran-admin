interface BrandLogoProps {
  appName: string;
  logoUrl?: string;
  className?: string;
  fallbackClassName?: string;
}

export const BrandLogo = ({
  appName,
  logoUrl,
  className = 'h-8 max-w-36 object-contain',
  fallbackClassName = 'flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground',
}: BrandLogoProps) => {
  if (logoUrl) {
    return <img src={logoUrl} alt={appName} className={className} />;
  }

  return <div className={fallbackClassName}>{appName.slice(0, 1).toUpperCase()}</div>;
};
