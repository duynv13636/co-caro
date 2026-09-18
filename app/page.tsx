import { BackgroundFX } from "@/components/ui/BackgroundFX";
import { TicTacToe } from "@/components/game/TicTacToe";

export default function Home() {
  return (
    <main className="relative flex-1">
      <BackgroundFX />
      <TicTacToe />
    </main>
  );
}
