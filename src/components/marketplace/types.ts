export type ServiceDetail = {
  title: string
  subtitle: string
  duration: string
  price: string
}

export type Service = {
  id: string
  title: string
  location: string
  rating: number
  reviews: number
  image: string
  slug: string
  details: ServiceDetail[]
}
