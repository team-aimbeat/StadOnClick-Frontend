import { ComponentType } from "react";
import { LucideIcon } from "lucide-react";
import type { IconType as ReactIconsType } from "react-icons";
type AnyIconComponent = 
  | LucideIcon 
  | ReactIconsType 
  | ComponentType<{ className?: string }>;
export interface ActionConfig<T = any> {
  title?: string;
  icon?: AnyIconComponent;
  onClick?: (row: T) => void;
  component?: ComponentType<{ row: T }>;
}
