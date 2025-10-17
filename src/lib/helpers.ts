import type { paginationInfo, StudentOrganization } from "./types";

export async function fetchOrganizations(pagination?: {
  page: number;
  limit: number;
}): Promise<{ data: StudentOrganization[]; meta: paginationInfo }> {
  const url = pagination
    ? `${process.env.NEXT_PUBLIC_API_URL}/student_organizations?page=${pagination.page}&limit=${pagination.limit}`
    : `${process.env.NEXT_PUBLIC_API_URL}/student_organizations`;

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch student organizations: ${response.status}`,
    );
  }

  const { data, meta } = (await response.json()) as {
    data: StudentOrganization[];
    meta: paginationInfo;
  };
  return { data, meta };
}

export async function fetchOrganization(
  id: number,
): Promise<{ organization: StudentOrganization }> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/student_organizations/${id}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch student organization: ${response.status}`);
  }

  const { data } = (await response.json()) as { data: StudentOrganization };
  return { organization: data };
}

export async function fetchImageUrl(imageKey: string): Promise<string> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/files/${imageKey}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const { url } = (await response.json()) as { url: string };
  return url;
}
