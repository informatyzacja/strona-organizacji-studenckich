// API types from https://api.topwr.solvro.pl/api/v1/student_organizations/

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
}
