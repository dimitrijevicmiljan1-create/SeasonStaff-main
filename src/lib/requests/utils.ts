import type { SupabaseClient } from "@supabase/supabase-js";

import { getEmployeeFullName } from "@/lib/employees/utils";
import { formatTimeFromDb } from "@/lib/shifts/utils";
import { formatFullDate } from "@/lib/week-utils";
import type {
  Request,
  RequestListItem,
  RequestMetadata,
  RequestType,
  RequestWithEmployee,
  SwapRequestMetadata,
  TimeOffRequestMetadata,
} from "@/types/requests";

export const REQUEST_SELECT = `
  id,
  employee_id,
  organization_id,
  type,
  status,
  metadata,
  created_at,
  employees (
    first_name,
    last_name
  )
`;

export interface ShiftPreview {
  id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  positions: { name: string } | null;
}

function parseMetadata(
  type: RequestType,
  raw: unknown,
): RequestMetadata {
  const meta = (raw ?? {}) as Record<string, unknown>;
  if (type === "swap") {
    return {
      shift_id: String(meta.shift_id ?? ""),
      note: meta.note ? String(meta.note) : undefined,
    } satisfies SwapRequestMetadata;
  }
  return {
    date: String(meta.date ?? ""),
    note: meta.note ? String(meta.note) : undefined,
  } satisfies TimeOffRequestMetadata;
}

export function mapRequestRow(
  row: Record<string, unknown>,
): RequestWithEmployee {
  const type = row.type as RequestType;
  const employeesRaw = row.employees;
  const employees =
    employeesRaw && typeof employeesRaw === "object" && !Array.isArray(employeesRaw)
      ? (employeesRaw as RequestWithEmployee["employees"])
      : { first_name: "", last_name: "" };

  return {
    id: String(row.id),
    employee_id: String(row.employee_id),
    organization_id: String(row.organization_id),
    type,
    status: row.status as Request["status"],
    metadata: parseMetadata(type, row.metadata),
    created_at: String(row.created_at),
    employees,
  };
}

export function formatRequestCreatedDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatRequestDetails(
  request: Pick<Request, "type" | "metadata">,
  shiftById: Map<string, ShiftPreview>,
): string {
  if (request.type === "time_off") {
    const meta = request.metadata as TimeOffRequestMetadata;
    const dateLabel = meta.date ? formatFullDate(new Date(meta.date + "T12:00:00")) : "—";
    return meta.note ? `${dateLabel} · ${meta.note}` : dateLabel;
  }

  const meta = request.metadata as SwapRequestMetadata;
  const shift = shiftById.get(meta.shift_id);
  if (!shift) {
    return meta.note ? `Shift swap · ${meta.note}` : "Shift swap request";
  }

  const dateLabel = formatFullDate(new Date(shift.shift_date + "T12:00:00"));
  const start = formatTimeFromDb(shift.start_time);
  const end = formatTimeFromDb(shift.end_time);
  const position = shift.positions?.name;
  const base = position
    ? `${dateLabel} ${start}–${end} (${position})`
    : `${dateLabel} ${start}–${end}`;
  return meta.note ? `${base} · ${meta.note}` : base;
}

export function toRequestListItem(
  request: RequestWithEmployee,
  shiftById: Map<string, ShiftPreview>,
): RequestListItem {
  return {
    ...request,
    employeeName: getEmployeeFullName(request.employees),
    details: formatRequestDetails(request, shiftById),
    createdDate: formatRequestCreatedDate(request.created_at),
  };
}

export async function loadShiftPreviewsForRequests(
  supabase: SupabaseClient,
  requests: RequestWithEmployee[],
): Promise<Map<string, ShiftPreview>> {
  const shiftIds = requests
    .filter((r) => r.type === "swap")
    .map((r) => (r.metadata as SwapRequestMetadata).shift_id)
    .filter(Boolean);

  if (shiftIds.length === 0) {
    return new Map();
  }

  const { data } = await supabase
    .from("shifts")
    .select(
      "id, shift_date, start_time, end_time, positions ( name )",
    )
    .in("id", shiftIds);

  const map = new Map<string, ShiftPreview>();
  for (const row of data ?? []) {
    const r = row as Record<string, unknown>;
    const positionsRaw = r.positions;
    const positions =
      positionsRaw && typeof positionsRaw === "object"
        ? (positionsRaw as { name: string })
        : null;
    map.set(String(r.id), {
      id: String(r.id),
      shift_date: String(r.shift_date),
      start_time: String(r.start_time),
      end_time: String(r.end_time),
      positions,
    });
  }
  return map;
}
