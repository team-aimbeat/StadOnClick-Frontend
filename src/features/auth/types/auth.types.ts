export type AuthUser = {
  id: string
  email: string
  phone: string | null
  firstName: string
  lastName: string | null
  nickName: string | null
  displayName: string
  roles: string[]
  profileImageUrl: string | null
}
