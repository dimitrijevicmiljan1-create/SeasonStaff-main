/**
 * Demo / presentation fixtures for SeasonStaff.
 * Enable with NEXT_PUBLIC_DEMO_MODE=true in .env.local
 */
export { isDemoMode } from "./demo/config";
export { DEMO_ORG_ID, DEMO_EMPLOYEE_IDS, DEMO_POSITION_IDS } from "./demo/constants";
export { buildDemoDataset, getDemoTodayShifts } from "./demo/build-data";
export {
  getDemoEmployees,
  getDemoPositions,
  getDemoWeekShifts,
  getDemoRequestListItems,
  getDemoPendingRequestSummaries,
  getDemoNotifications,
  getDemoAttendanceLogs,
  getDemoEmployeeOverview,
  resetDemoStore,
} from "./demo/store";
