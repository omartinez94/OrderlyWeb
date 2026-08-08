import { CheckCircle2, type LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./card";

export interface FeatureCardItem {
  icon: LucideIcon;
  title: string;
  description: string;
  points: string[];
  variant?: "primary" | "accent";
}

interface FeatureCardProps {
  feature: FeatureCardItem;
  className?: string;
}

export function FeatureCard({ feature, className = "" }: FeatureCardProps) {
  const Icon = feature.icon;
  const isAccent = feature.variant === "accent";

  const hoverBorder = isAccent ? "hover:border-accent/40" : "hover:border-primary/40";
  const iconBg = isAccent
    ? "bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white"
    : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white";
  const checkColor = isAccent ? "text-accent" : "text-primary";

  return (
    <Card
      className={`border-border-subtle bg-surface-elevated group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${hoverBorder} ${className}`}
    >
      <CardHeader>
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${iconBg}`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle className="font-display text-xl font-bold">{feature.title}</CardTitle>
        <CardDescription className="text-ink-muted">{feature.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="text-ink-muted space-y-2.5 text-sm">
          {feature.points.map((pt, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <CheckCircle2 className={`${checkColor} h-4 w-4 shrink-0`} />
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
