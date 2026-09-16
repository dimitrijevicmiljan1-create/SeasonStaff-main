export function cellDroppableId(employeeId: string, date: string): string {
  return `cell:${employeeId}:${date}`;
}

export function parseCellDroppableId(id: string): {
  employeeId: string;
  date: string;
} | null {
  const match = /^cell:([^:]+):(\d{4}-\d{2}-\d{2})$/.exec(id);
  if (!match) return null;
  return { employeeId: match[1], date: match[2] };
}

export function shiftDraggableId(shiftId: string): string {
  return `shift:${shiftId}`;
}

export function parseShiftDraggableId(id: string): string | null {
  const match = /^shift:(.+)$/.exec(id);
  return match ? match[1] : null;
}
