import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Zap, 
  Leaf, 
  Heart, 
  Smartphone, 
  ShoppingBag, 
  Palette, 
  Users, 
  Lightbulb,
  Truck,
  Home,
  Briefcase,
  GraduationCap
} from 'lucide-react';

const CategoryTabs = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Categories with icons
  const categories = [
    { name: 'All Categories', value: '', icon: Home },
    { name: 'Tech & Innovation', value: 'Tech & Innovation', icon: Zap },
    { name: 'Clean Energy', value: 'Clean Energy', icon: Leaf },
    { name: 'Healthcare', value: 'Healthcare', icon: Heart },
    { name: 'Agriculture', value: 'Agriculture', icon: Truck },
    { name: 'E-commerce', value: 'E-commerce', icon: ShoppingBag },
    { name: 'Mobile Apps', value: 'Mobile Apps', icon: Smartphone },
    { name: 'Creative Works', value: 'Creative Works', icon: Palette },
    { name: 'Community Projects', value: 'Community Projects', icon: Users },
    { name: 'Education', value: 'Education', icon: GraduationCap },
    { name: 'Business Services', value: 'Business Services', icon: Briefcase },
    { name: 'Innovation', value: 'Innovation', icon: Lightbulb },
  ];

  // Handle scroll functionality
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const updateScrollButtons = () => {
        setCanScrollLeft(container.scrollLeft > 0);
        setCanScrollRight(
          container.scrollLeft < container.scrollWidth - container.clientWidth - 10
        );
      };

      container.addEventListener('scroll', updateScrollButtons);
      updateScrollButtons();

      return () => container.removeEventListener('scroll', updateScrollButtons);
    }
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (categoryValue) => {
    // Navigate to dashboard with category filter
    if (categoryValue) {
      navigate(`/dashboard?category=${encodeURIComponent(categoryValue)}`);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative py-4">
          {/* Scroll Left Button */}
          {canScrollLeft && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 text-gray-700 p-2   shadow-md border border-gray-200 transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {/* Scroll Right Button */}
          {canScrollRight && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 text-gray-700 p-2   shadow-md border border-gray-200 transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          {/* Gradient overlays */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-[5] pointer-events-none" />
          )}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-[5] pointer-events-none" />
          )}

          {/* Categories Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide px-8"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.value || 'all'}
                  onClick={() => handleCategoryClick(category.value)}
                  className="flex-none group flex items-center space-x-3 px-6 py-3.5 rounded-xl border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                >
                  <Icon className="h-5 w-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
                  <span className="text-base font-semibold text-gray-700 group-hover:text-primary-700 whitespace-nowrap">
                    {category.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide {
          -webkit-overflow-scrolling: touch;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default CategoryTabs;
