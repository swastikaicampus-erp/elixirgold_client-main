import { useState, useEffect } from "react";

interface CarouselProps {
  images?: string[];
  autoSlide?: boolean;
  interval?: number;
}

const Carousel = ({ images = [], autoSlide = true, interval = 3000 }: CarouselProps) => {
  const [current, setCurrent] = useState(0);
  const hasMultipleSlides = images.length > 1;

  // Next Slide
  const nextSlide = () => {
    if (!images.length) return;
    setCurrent((prev) => (prev + 1) % images.length);
  };

  // Previous Slide
  const prevSlide = () => {
    if (!images.length) return;
    setCurrent((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  // Auto Slide
  useEffect(() => {
    if (!autoSlide || !hasMultipleSlides) return;

    const slideInterval = setInterval(nextSlide, interval);

    return () => clearInterval(slideInterval);
  }, [autoSlide, hasMultipleSlides, interval, images.length]);

  useEffect(() => {
    if (current >= images.length) {
      setCurrent(0);
    }
  }, [current, images.length]);

  if (!images.length) {
    return <p>No images found</p>;
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl">
      
      {/* Images */}
      <div className="relative h-56 md:h-96">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Slide ${index + 1}`}
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700 ${
              current === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {/* Indicators */}
      <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 gap-3">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full ${
              current === index
                ? "bg-white"
                : "bg-white/50"
            }`}
          />
        ))}
      </div>

      {/* Previous Button */}
      <button
        onClick={prevSlide}
        className="absolute top-0 left-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group"
      >
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/30 group-hover:bg-black/50">
          ❮
        </span>
      </button>

      {/* Next Button */}
      <button
        onClick={nextSlide}
        className="absolute top-0 right-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group"
      >
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/30 group-hover:bg-black/50">
          ❯
        </span>
      </button>
    </div>
  );
};

export default Carousel;