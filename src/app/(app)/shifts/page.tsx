import { ShiftBoardPage } from "@/components/shifts/shift-board-page";
import { ShiftsProvider } from "@/contexts/shifts-context";

export default function ShiftsPage() {
  return (
    <ShiftsProvider>
      <ShiftBoardPage />
    </ShiftsProvider>
  );
}
