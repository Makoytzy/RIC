export default function ProductImage({ images = [], alt }) {
  return (
    <div className="relative h-56 w-full overflow-hidden bg-slate-950">
      <img
        src={images[0] || 'https://images.unsplash.com/photo-1518544887700-0f7f52c468aa?auto=format&fit=crop&w=800&q=80'}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
      />
    </div>
  );
}
