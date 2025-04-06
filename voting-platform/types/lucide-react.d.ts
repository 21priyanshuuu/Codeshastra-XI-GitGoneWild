declare module 'lucide-react' {
  import { ComponentType, SVGProps } from 'react';
  
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
  }
  
  // Common icons
  export const Loader2: ComponentType<IconProps>;
  export const ArrowLeft: ComponentType<IconProps>;
  export const ArrowRight: ComponentType<IconProps>;
  export const Check: ComponentType<IconProps>;
  export const CheckCircle: ComponentType<IconProps>;
  export const X: ComponentType<IconProps>;
  export const XCircle: ComponentType<IconProps>;
  export const AlertCircle: ComponentType<IconProps>;
  export const AlertTriangle: ComponentType<IconProps>;
  export const Info: ComponentType<IconProps>;
  export const Clock: ComponentType<IconProps>;
  export const Calendar: ComponentType<IconProps>;
  export const Users: ComponentType<IconProps>;
  export const ChevronLeft: ComponentType<IconProps>;
  export const ChevronRight: ComponentType<IconProps>;
  export const ChevronDown: ComponentType<IconProps>;
  export const ChevronUp: ComponentType<IconProps>;
  export const MoreHorizontal: ComponentType<IconProps>;
  export const Circle: ComponentType<IconProps>;
  export const Search: ComponentType<IconProps>;
  export const Dot: ComponentType<IconProps>;
  export const GripVertical: ComponentType<IconProps>;
  export const PanelLeft: ComponentType<IconProps>;
  
  // Feature icons
  export const Shield: ComponentType<IconProps>;
  export const ShieldCheck: ComponentType<IconProps>;
  export const Lock: ComponentType<IconProps>;
  export const Eye: ComponentType<IconProps>;
  export const FileText: ComponentType<IconProps>;
  export const FileCheck: ComponentType<IconProps>;
  export const LinkIcon: ComponentType<IconProps>;
  export const TrendingUp: ComponentType<IconProps>;
  export const Award: ComponentType<IconProps>;
  export const ExternalLink: ComponentType<IconProps>;
  export const Wallet: ComponentType<IconProps>;
  export const UserCheck: ComponentType<IconProps>;
  export const Vote: ComponentType<IconProps>;
  export const Fingerprint: ComponentType<IconProps>;
  
  // Camera icons
  export const Camera: ComponentType<IconProps>;
  export const RefreshCw: ComponentType<IconProps>;
  
  // Navigation icons
  export const LogOut: ComponentType<IconProps>;
  export const User: ComponentType<IconProps>;
  export const Settings: ComponentType<IconProps>;
  export const HelpCircle: ComponentType<IconProps>;
  export const Menu: ComponentType<IconProps>;
} 