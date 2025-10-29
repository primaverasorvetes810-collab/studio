import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
};

export default function PageHeader({ title, description, className, children }: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
        <div className="grid gap-1">
            <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">
                {title}
            </h1>
            {description && (
                <p className="text-lg text-muted-foreground">{description}</p>
            )}
        </div>
        {children}
    </div>
  );
}
