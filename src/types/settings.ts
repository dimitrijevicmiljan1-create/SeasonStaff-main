export interface BusinessInfoForm {
  businessName: string;
  phone: string;
  email: string;
  address: string;
}

export interface ShiftDefaultsForm {
  defaultStartTime: string;
  defaultEndTime: string;
}

export interface OrganizationSettingsInput {
  businessName?: string;
  phone: string;
  email: string;
  address: string;
  defaultStartTime: string;
  defaultEndTime: string;
  defaultPositionIds: string[];
}

export interface AccountProfileInput {
  firstName: string;
  lastName: string;
  phone: string;
}
