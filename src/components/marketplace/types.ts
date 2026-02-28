export type ServiceDetail = {
  title: string
  price: string
  compareAtPrice?: string
  subtitle?: string
  duration?: string
}

export type Service = {
  id: string
  vendorId?: string
  title: string
  location: string
  rating: number
  reviews: number
  image: string
  images?: string[]
  slug: string
  categoryName: string
  categoryId: string
  details: ServiceDetail[]
}
