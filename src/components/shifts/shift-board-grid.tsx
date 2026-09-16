"use client";

import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { memo, useEffect, useMemo, useRef } from "react";

import {
  formatDayHeader,
  getWeekDays,
  isToday,
  toDateKey,
} from "@/lib/week-utils";
import {
  formatWeeklyHoursLabel,
  getWeeklyHoursByEmployee,
} from "@/lib/shift-time-utils";
import type { BoardEmployee, ShiftWithPosition } from "@/types/shifts";
import { cn } from "@/lib/utils";
import {
  ShiftCell,
  type ShiftCellClickHandler,
} from "@/components/shifts/shift-cell";

const DAY_COL_WIDTH = 88;
const DAY_COL_WIDTH_LG = 104;

const gridColsClass =
  "grid-cols-[104px_repeat(7,88px)] lg:grid-cols-[140px_repeat(7,104px)]";

interface ShiftBoardGridProps {
  weekStart: Date;
  employees: BoardEmployee[];
  shifts: ShiftWithPosition[];
  onCellClick: ShiftCellClickHandler;
  onDragEnd: (event: DragEndEvent) => void;
}

interface ShiftBoardRowProps {
  employee: BoardEmployee;
  days: Date[];
  weeklyMinutes: number;
  getShift: (employeeId: string, date: string) => ShiftWithPosition | undefined;
  onCellClick: ShiftCellClickHandler;
}

const ShiftBoardRow = memo(function ShiftBoardRow({
  employee,
  days,
  weeklyMinutes,
  getShift,
  onCellClick,
}: ShiftBoardRowProps) {
  return (
    <>
      <div className="sticky left-0 z-10 flex h-full min-h-0 flex-col justify-center gap-0.5 border-b border-r border-border bg-surface px-2 py-2 shadow-[4px_0_8px_-4px_rgba(17,24,39,0.1)] lg:px-3">
        <p className="truncate text-xs font-medium text-text-primary lg:text-sm">
          {employee.name}
        </p>
        <p className="text-[10px] font-semibold tabular-nums text-text-secondary lg:text-xs">
          {formatWeeklyHoursLabel(weeklyMinutes)}
        </p>
      </div>

      {days.map((day) => {
        const dateKey = toDateKey(day);
        const shift = getShift(employee.id, dateKey);
        return (
          <ShiftCell
            key={`${employee.id}-${dateKey}`}
            employeeId={employee.id}
            date={dateKey}
            shift={shift}
            isToday={isToday(day)}
            onCellClick={onCellClick}
          />
        );
      })}
    </>
  );
});

export const ShiftBoardGrid = memo(function ShiftBoardGrid({
  weekStart,
  employees,
  shifts,
  onCellClick,
  onDragEnd,
}: ShiftBoardGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const onCellClickRef = useRef(onCellClick);
  onCellClickRef.current = onCellClick;

  const stableOnCellClick = useMemo<ShiftCellClickHandler>(
    () => (employeeId, date, shift) => {
      onCellClickRef.current(employeeId, date, shift);
    },
    [],
  );

  const days = useMemo(() => getWeekDays(weekStart), [weekStart]);

  const employeeIds = useMemo(
    () => employees.map((employee) => employee.id),
    [employees],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  useEffect(() => {
    const todayIndex = days.findIndex((day) => isToday(day));
    if (todayIndex < 0 || !scrollRef.current) return;

    const cellWidth =
      window.innerWidth >= 1024 ? DAY_COL_WIDTH_LG : DAY_COL_WIDTH;
    scrollRef.current.scrollLeft = Math.max(0, todayIndex * cellWidth - cellWidth);
  }, [days]);

  const shiftMap = useMemo(() => {
    const map = new Map<string, ShiftWithPosition>();
    for (const shift of shifts) {
      map.set(`${shift.employee_id}__${shift.shift_date}`, shift);
    }
    return map;
  }, [shifts]);

  const getShift = useMemo(
    () => (employeeId: string, date: string) =>
      shiftMap.get(`${employeeId}__${date}`),
    [shiftMap],
  );

  const weeklyMinutesByEmployee = useMemo(
    () => getWeeklyHoursByEmployee(shifts, employeeIds),
    [shifts, employeeIds],
  );

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref={scrollRef}
          className="app-scroll-region relative z-0 min-h-0 flex-1 overflow-auto overscroll-x-contain"
        >
          <div
            className={cn("inline-grid min-w-max content-start", gridColsClass)}
            style={{
              gridTemplateRows: `2.75rem repeat(${employees.length}, minmax(3.5rem, max-content))`,
            }}
          >
            <div
              className={cn(
                "sticky left-0 top-0 z-10 flex h-full min-h-0 items-end border-b border-r border-border bg-surface px-2 pb-2 shadow-[4px_0_8px_-4px_rgba(17,24,39,0.1)]",
              )}
            >
              <span className="text-[10px] font-medium uppercase tracking-wide text-text-secondary lg:text-xs">
                Team
              </span>
            </div>

            {days.map((day) => {
              const { day: label, date } = formatDayHeader(day);
              const today = isToday(day);
              return (
                <div
                  key={toDateKey(day)}
                  className={cn(
                    "relative sticky top-0 z-10 flex h-full min-h-0 flex-col items-center justify-center border-b border-r border-border",
                    today
                      ? "bg-accent-subtle shadow-[inset_0_2px_0_0_var(--accent)]"
                      : "bg-surface",
                  )}
                >
                  {today && (
                    <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-accent lg:right-1.5" />
                  )}
                  <span
                    className={cn(
                      "text-[10px] font-medium uppercase leading-none lg:text-xs",
                      today ? "font-semibold text-accent" : "text-text-secondary",
                    )}
                  >
                    {today ? "Today" : label}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 flex h-6 w-6 items-center justify-center text-sm font-semibold tabular-nums leading-none",
                      today
                        ? "rounded-full bg-accent text-white"
                        : "text-text-primary",
                    )}
                  >
                    {date}
                  </span>
                </div>
              );
            })}

            {employees.map((employee) => (
              <ShiftBoardRow
                key={employee.id}
                employee={employee}
                days={days}
                weeklyMinutes={weeklyMinutesByEmployee[employee.id] ?? 0}
                getShift={getShift}
                onCellClick={stableOnCellClick}
              />
            ))}
          </div>
        </div>
      </div>
    </DndContext>
  );
});
