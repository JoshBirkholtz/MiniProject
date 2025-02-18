export const API_URL: string = import.meta.env.PROD 
  ? '' // Empty string for same-origin requests
  : 'http://localhost:5500';