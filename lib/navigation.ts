import {
  Home,
  FileBarChart,
  History,
  Star,
  Settings,
  UploadCloud,
  Ticket,
  CircleDot,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/ticket", label: "Generador de Tickets", icon: Ticket },
  { href: "/agregar-partido", label: "Agregar partido", icon: UploadCloud },
  { href: "/tenis", label: "Tenis", icon: CircleDot },
  { href: "/analisis", label: "Encuentros analizados", icon: FileBarChart },
  { href: "/historial", label: "Historial", icon: History },
  { href: "/favoritos", label: "Favoritos", icon: Star },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

export const MOBILE_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/ticket", label: "Tickets", icon: Ticket },
  { href: "/tenis", label: "Tenis", icon: CircleDot },
  { href: "/analisis", label: "Análisis", icon: FileBarChart },
  { href: "/historial", label: "Historial", icon: History },
];

export const APP_VERSION = "1.0.0";
