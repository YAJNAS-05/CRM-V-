import 'axios'

declare module 'axios' {
  export interface AxiosRequestConfig {
    _silent?: boolean
    _retry?: boolean
  }
}
