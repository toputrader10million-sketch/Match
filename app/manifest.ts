import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MealMate BD',
    short_name: 'MealMate',
    description: 'Meal Management System',
    start_url: '/',
    display: 'standalone',
    background_color: '#f4f5f7',
    theme_color: '#1D9E75',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
