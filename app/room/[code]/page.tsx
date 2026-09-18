import { BackgroundFX } from "@/components/ui/BackgroundFX";
import { RoomGame } from "@/components/online/RoomGame";

export const metadata = {
  title: "Room — Caro OX",
};

interface RoomPageProps {
  params: Promise<{ code: string }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { code } = await params;
  return (
    <main className="relative flex-1">
      <BackgroundFX />
      <RoomGame code={code.toUpperCase()} />
    </main>
  );
}
