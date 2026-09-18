import { BackgroundFX } from "@/components/ui/BackgroundFX";
import { OnlineLobby } from "@/components/online/OnlineLobby";

export const metadata = {
  title: "Play Online — Caro OX",
};

export default function OnlinePage() {
  return (
    <main className="relative flex-1">
      <BackgroundFX />
      <OnlineLobby />
    </main>
  );
}
