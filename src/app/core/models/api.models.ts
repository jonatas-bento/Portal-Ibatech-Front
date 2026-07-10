// src/app/core/models/api.models.ts

// Wrapper genérico para respostas paginadas (expansão futura)
export interface PagedResult<T> {
  items:       T[];
  totalCount:  number;
  page:        number;
  pageSize:    number;
  totalPages:  number;
}

// Estrutura de erro retornada pelo ExceptionHandlingMiddleware do .NET
export interface ApiError {
  status:    number;
  title:     string;
  detail?:   string;
  traceId?:  string;
  errors?:   Record<string, string[]>; // validation errors (400)
}