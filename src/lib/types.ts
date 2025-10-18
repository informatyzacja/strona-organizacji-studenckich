// API types from https://api.topwr.solvro.pl/api/v1/student_organizations/

export interface OrganizationTag {
  tag: string;
}

export interface StudentOrganization {
  id: number;
  name: string;
  departmentId: number | null;
  logoKey: string | null;
  coverKey: string | null;
  description: string | null;
  shortDescription: string | null;
  coverPreview: boolean;
  source: string;
  organizationType: string;
  createdAt: string;
  updatedAt: string;
  organizationStatus: string;
  isStrategic: boolean;
  tags: OrganizationTag[];

  // non-api params
  logoUrl: string | null;
  coverUrl: string | null;
}

export interface PaginationInfo {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
  firstPage: number;
  firstPageUrl: string;
  lastPageUrl: string;
  nextPageUrl: string | null;
  previousPageUrl: string | null;
}
