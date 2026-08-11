export const NEW_ARRIVALS = [
  {
    id: 1,
    slug: 'vintage-clip-ons',
    title: 'Vintage Clip-Ons',
    subtitle: 'Forged steel handlebar risers for classic builds.',
    price: 1250,
    badge: 'Hot Pick',
    images: ['https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 2,
    slug: 'carbon-fairing',
    title: 'Carbon Fairing',
    subtitle: 'Race-inspired bodywork for a bold silhouette.',
    price: 3850,
    badge: 'Premium',
    images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 3,
    slug: 'led-headlamp-kit',
    title: 'LED Headlamp Kit',
    subtitle: 'High-output illumination with modern styling.',
    price: 950,
    badge: 'New',
    images: ['https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 4,
    slug: 'matt-black-exhaust',
    title: 'Matt Black Exhaust',
    subtitle: 'Deep tone performance exhaust with custom finish.',
    price: 2890,
    badge: 'Limited',
    images: ['https://images.unsplash.com/photo-1518544887700-0f7f52c468aa?auto=format&fit=crop&w=800&q=80']
  }
];

export function formatPeso(value) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0
  }).format(value);
}
