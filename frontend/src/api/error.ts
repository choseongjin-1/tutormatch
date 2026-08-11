import { AxiosError } from 'axios'

export interface ApiErrorBody {
  timestamp: string
  status: number
  code: string
  message: string
  errors: { field: string; value: string; reason: string }[]
}

export function isApiError(error: unknown): error is AxiosError<ApiErrorBody> {
  return error instanceof AxiosError
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isApiError(error) && error.response?.data.message) {
    return error.response.data.message
  }
  return fallback
}
