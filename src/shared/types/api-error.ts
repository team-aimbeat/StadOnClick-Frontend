export type ApiError = {
  status: number
  data?: {
    message?: string
    errors?: {
      formErrors?: string[]
      fieldErrors?: Record<string, string[]>
    }
  }
}
