import { ComponentType } from "react";
import { LucideIcon } from "lucide-react";

export interface ActionConfig<T = any> {
  title?: string;
  icon?: LucideIcon;
  onClick?: (row: T) => void;
  component?: ComponentType<{ row: T }>;
}
