import {
  Volume2,
  Wifi,
  Clock,
  BatteryFull,
  Bluetooth,
  Cpu,
  ShieldCheck,
  Sparkles,
  Zap,
  Star,
  Check,
  Gift,
  type LucideProps,
} from "lucide-react";

const MAP: Record<string, React.ComponentType<LucideProps>> = {
  Volume2,
  Wifi,
  Clock,
  BatteryFull,
  Bluetooth,
  Cpu,
  ShieldCheck,
  Sparkles,
  Zap,
  Star,
  Check,
  Gift,
};

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = MAP[name] ?? Star;
  return <Cmp {...props} />;
}
