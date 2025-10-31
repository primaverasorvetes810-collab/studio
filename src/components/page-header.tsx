import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export default function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn("grid gap-1", className)}>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground font-headline">
            {title}
        </h1>
        {description && (
            <p className="text-md md:text-lg text-muted-foreground">{description}</p>
        )}
    </div>
  );
}
