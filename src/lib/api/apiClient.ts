export const api = {
  get: async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    return request<T>(url, { ...options, method: 'GET' })
  },

  post: async <T>(url: string, data?: unknown, options: RequestInit = {}): Promise<T> => {
    const body = (typeof data !== 'undefined') ? JSON.stringify(data) : undefined

    return request<T>(url, { ...options, method: 'POST', body })
  },
}

async function request<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
