"use client";

import { Volume2, VolumeX } from "lucide-react";
import { Button } from "./Button";

interface SoundToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export function SoundToggle({ enabled, onToggle }: SoundToggleProps) {
  return (
    <Button variant="icon" aria-label={enabled ? "Mute sound" : "Unmute sound"} onClick={onToggle}>
      {enabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
    </Button>
  );
}
