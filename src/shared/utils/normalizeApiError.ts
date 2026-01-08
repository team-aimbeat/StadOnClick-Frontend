import type { ApiError } from "@/shared/types/api-error"

export type NormalizedApiError = {
  fieldErrors: Record<string, string>
  formError?: string
  toastMessage: string
}

function isApiError(error: unknown): error is ApiError {
  return typeof error === "object" && error !== null && "status" in (error as any)
}

export function normalizeApiError(
  error: unknown,
  fallbackMessage = "Unable to complete the request. Please try again."
): NormalizedApiError {
  const apiError = isApiError(error) ? (error as ApiError) : undefined
  const fieldErrorsFromApi = apiError?.data?.errors?.fieldErrors
  const fieldErrors =
    fieldErrorsFromApi &&
    Object.entries(fieldErrorsFromApi).reduce((acc, [field, messages]) => {
      if (messages?.length) {
        acc[field] = messages[0]
      }
      return acc
    }, {} as Record<string, string>)

  const formError =
    apiError?.data?.errors?.formErrors?.[0] ||
    apiError?.data?.message ||
    (apiError as any)?.error

  const firstFieldError = fieldErrors ? Object.values(fieldErrors)[0] : undefined
  const isRateLimited = apiError?.status === 429
  const rateLimitMessage = isRateLimited ? "Try after 5 minutes." : undefined

  return {
    fieldErrors: fieldErrors ?? {},
    formError,
    toastMessage: rateLimitMessage || formError || firstFieldError || fallbackMessage,
  }
}
