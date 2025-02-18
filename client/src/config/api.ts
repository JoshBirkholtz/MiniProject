export const API_URL: string = import.meta.env.NODE_ENV === 'production' 
  ? '' // Empty string for same-origin requests
  : 'http://localhost:5500';