import type { Landmark } from "@/utils/skeleton-renderer";

export interface PoseCameraProps {
  onLandmarks?: (landmarks: Landmark[]) => void;
}
