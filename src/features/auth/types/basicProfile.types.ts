export const GenderEnum = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  NON_BINARY: "NON_BINARY",
  PREFER_NOT_TO_SAY: "PREFER_NOT_TO_SAY",
} as const

export type GenderEnum = (typeof GenderEnum)[keyof typeof GenderEnum]

export const AgeGroupEnum = {
  AGE_16_19: "AGE_16_19",
  AGE_20_24: "AGE_20_24",
  AGE_25_34: "AGE_25_34",
  AGE_35_44: "AGE_35_44",
  AGE_45_54: "AGE_45_54",
  AGE_55_64: "AGE_55_64",
  AGE_65_PLUS: "AGE_65_PLUS",
} as const

export type AgeGroupEnum = (typeof AgeGroupEnum)[keyof typeof AgeGroupEnum]

export type BasicProfileRequest = {
  onboardingSessionId: string
  firstName: string
  lastName?: string
  nickName?: string
  email: string
  gender?: GenderEnum
  ageGroup?: AgeGroupEnum
  locale?: string
  password: string
  streetAddress?: string
  cityId?: string
  profileImageUrl?: string
  marketingConsent?: boolean
  termsAccepted: true
}
