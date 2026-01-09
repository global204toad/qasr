// Frontend configuration
export const config = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'
};

console.log('Frontend config loaded:', config);