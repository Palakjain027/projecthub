export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function parsePagination(
  page?: string | number,
  limit?: string | number,
  maxLimit: number = 100
): PaginationParams {
  const parsedPage = Math.max(1, parseInt(String(page || '1'), 10) || 1);
  const parsedLimit = Math.min(
    maxLimit,
    Math.max(1, parseInt(String(limit || '20'), 10) || 20)
  );
  const skip = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip,
  };
}

export function createPaginationResult<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginationResult<T> {
  const totalPages = Math.ceil(total / params.limit);

  return {
    data,
    page: params.page,
    limit: params.limit,
    total,
    totalPages,
    hasNext: params.page < totalPages,
    hasPrev: params.page > 1,
  };
}

// Build Prisma orderBy from sort query param
export function parseSort(
  sort?: string,
  allowedFields: string[] = []
): Record<string, 'asc' | 'desc'> | undefined {
  if (!sort) return undefined;

  const [field, direction] = sort.split(':');
  
  if (!field || !allowedFields.includes(field)) {
    return undefined;
  }

  const order = direction?.toLowerCase() === 'desc' ? 'desc' : 'asc';
  
  return { [field]: order };
}
