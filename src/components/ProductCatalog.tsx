'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Product, Category, SiteSettings } from '@/lib/db';
import { Search, ArrowRight, X, ChevronLeft, ChevronRight, Eye, ChevronDown } from 'lucide-react';

interface ProductCatalogProps {
  products: Product[];
  categories: Category[];
  settings: SiteSettings;
}


export default function ProductCatalog({ products, categories, settings }: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('pelus-oyuncaklar');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [visibleCount, setVisibleCount] = useState<number>(8);

  // Hidden scroll & arrow navigation state for categories
  const categoriesRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false);

  const checkScroll = () => {
    if (categoriesRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoriesRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);
    }
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesRef.current) {
      if (direction === 'left') {
        if (categoriesRef.current.scrollLeft <= 280) {
          categoriesRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          categoriesRef.current.scrollBy({ left: -240, behavior: 'smooth' });
        }
      } else {
        categoriesRef.current.scrollBy({ left: 240, behavior: 'smooth' });
      }
      setTimeout(checkScroll, 350);
    }
  };

  const kicker = settings.productsKicker || 'ÜRÜNLERİMİZ';
  const title = settings.productsTitle || 'Bir oyuncaktan çok daha fazlası.';
  const subtitle =
    settings.productsSubtitle ||
    'Yumuşacık, sevimli ve karakter dolu — peluş oyuncaklarımız markalar, etkinlikler ve özel projeler için tasarlandı.';

  // Filter products intended for homepage
  const visibleProducts = useMemo(() => {
    return products.filter((p) => p.showOnHomepage !== false);
  }, [products]);

  // Active categories with products (strictly excluding 'all' / Tüm Ürünler)
  const activeCategories = useMemo(() => {
    return categories.filter((cat) => {
      if (cat.id === 'all') return false;
      return visibleProducts.some((p) => p.category === cat.id);
    });
  }, [categories, visibleProducts]);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [activeCategories]);

  // If selectedCategory is 'all', switch to the first real category
  useEffect(() => {
    if ((selectedCategory === 'all' || !activeCategories.some(c => c.id === selectedCategory)) && activeCategories.length > 0) {
      setSelectedCategory(activeCategories[0].id);
    }
  }, [selectedCategory, activeCategories]);

  // Filtered products list (Vitrin items sorted to the top)
  const filteredProducts = useMemo(() => {
    const list = visibleProducts.filter((item) => {
      const matchesCategory = item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    return [...list].sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
  }, [visibleProducts, selectedCategory, searchQuery]);

  // Reset pagination when category or search changes
  useEffect(() => {
    setVisibleCount(8);
  }, [selectedCategory, searchQuery]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const handleOpenModal = (product: Product) => {
    setActiveModalProduct(product);
    setActiveImageIndex(0);
  };

  // Map 2 primary category showcase cards
  const spotlightCards = useMemo(() => {
    const cat1Id = settings.spotlight1CategoryId || 'pelus-oyuncaklar';
    const cat2Id = settings.spotlight2CategoryId || 'tekstil-urunleri';
    const cat1 = categories.find((c) => c.id === cat1Id);
    const cat2 = categories.find((c) => c.id === cat2Id);

    return [
      {
        title: settings.spotlight1Title || cat1?.name || 'Peluş Oyuncaklar',
        categoryId: cat1Id,
        image: settings.spotlight1Image || '/images/category_pelus_bear.png'
      },
      {
        title: settings.spotlight2Title || cat2?.name || 'Tekstil Ürünleri',
        categoryId: cat2Id,
        image: settings.spotlight2Image || '/images/category_textil_bunny.png'
      }
    ];
  }, [categories, settings]);

  return (
    <section
      id="products"
      style={{ backgroundColor: 'var(--site-bg)' }}
      className="py-16 sm:py-24 border-t border-stone-300/80 relative transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Top Header Row: Left Narrative + Right 2 Showcase Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Column: Heading and Description */}
          <div className="lg:col-span-5 space-y-5">
            <span
              style={{ color: 'var(--text-muted)' }}
              className="text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase block"
            >
              {kicker}
            </span>

            <h2
              style={{ color: 'var(--text-main)' }}
              className="text-3xl sm:text-4xl lg:text-[42px] font-medium tracking-[-0.02em] leading-[1.14]"
            >
              {title}
            </h2>

            <p
              style={{ color: 'var(--text-muted)' }}
              className="text-xs sm:text-sm leading-relaxed max-w-md font-normal"
            >
              {subtitle}
            </p>
          </div>

          {/* Right Column: 2 Borderless Category Plush Toys Sitting on the Floor */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end">
            <div className="grid grid-cols-2 gap-8 sm:gap-12 w-full max-w-lg">
              {spotlightCards.map((card, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedCategory(card.categoryId);
                    const el = document.getElementById('catalog-grid');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="cursor-pointer flex flex-col items-center text-center group select-none"
                >
                  {/* Plush Studio Image sitting naturally on the site ground */}
                  <div className="w-full aspect-square relative flex items-end justify-center bg-transparent">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Clean Category Title below the toy */}
                  <span
                    style={{ color: 'var(--text-main)' }}
                    className="text-xs sm:text-[13px] font-medium tracking-normal text-stone-700 group-hover:text-stone-950 transition-colors pt-2 block"
                  >
                    {card.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Full Interactive Catalog View (Always visible) */}
        <div id="catalog-grid" className="mt-14 pt-10 border-t border-current/10 space-y-8">
            
            {/* Elegant Minimalist Filter Bar (Hidden Scrollbar + Arrow Navigation) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-current/10 pb-4">
              
              {/* Category Slider Container */}
              <div className="relative flex items-center flex-1 min-w-0">
                {/* Left Floating Arrow with Soft Gradient Fade */}
                <div
                  style={{ background: 'linear-gradient(to right, var(--site-bg) 60%, transparent)' }}
                  className={`absolute left-0 top-0 bottom-0 z-10 flex items-center pr-3 transition-opacity duration-200 ${
                    canScrollLeft ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <button
                    onClick={() => scrollCategories('left')}
                    aria-label="Önceki Kategoriler"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-main)',
                    }}
                    className="p-1 rounded-full shadow-md border border-black/10 hover:scale-105 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>

                {/* Categories Track */}
                <div
                  ref={categoriesRef}
                  onScroll={checkScroll}
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  className="flex items-center gap-6 sm:gap-8 overflow-x-auto scroll-smooth w-full [&::-webkit-scrollbar]:hidden py-1 px-3 sm:px-4"
                >
                  {activeCategories.map((cat) => {
                    const isActive = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        style={{
                          color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                        }}
                        className={`text-xs sm:text-[13px] tracking-[0.14em] uppercase transition-all cursor-pointer relative py-1.5 px-0.5 shrink-0 whitespace-nowrap ${
                          isActive ? 'font-bold' : 'font-medium hover:opacity-100'
                        }`}
                      >
                        <span>{cat.name}</span>
                        {isActive && (
                          <span
                            style={{ backgroundColor: 'var(--text-main)' }}
                            className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Right Floating Arrow with Soft Gradient Fade */}
                <div
                  style={{ background: 'linear-gradient(to left, var(--site-bg) 60%, transparent)' }}
                  className={`absolute right-0 top-0 bottom-0 z-10 flex items-center pl-3 transition-opacity duration-200 ${
                    canScrollRight ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <button
                    onClick={() => scrollCategories('right')}
                    aria-label="Sonraki Kategoriler"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-main)',
                    }}
                    className="p-1 rounded-full shadow-md border border-black/10 hover:scale-105 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Minimalist Search Input */}
              <div className="w-full sm:w-64 lg:w-56 shrink-0 relative">
                <Search style={{ color: 'var(--text-muted)' }} className="w-3.5 h-3.5 absolute left-0 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={settings.catalogSearchPlaceholder || 'Koleksiyonda ara...'}
                  style={{
                    color: 'var(--text-main)',
                    borderColor: 'var(--text-muted)',
                  }}
                  className="w-full pl-6 pr-2 py-1 bg-transparent border-b text-xs placeholder-stone-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div
                style={{ backgroundColor: 'var(--card-bg)' }}
                className="text-center py-16 rounded-3xl border border-current/10"
              >
                <p style={{ color: 'var(--text-muted)' }} className="text-sm font-semibold">
                  Aradığınız kriterde ürün bulunamadı.
                </p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                  {displayedProducts.map((product) => {
                    const productImages = product.images && product.images.length > 0 ? product.images : [product.image];
                    return (
                      <div
                        key={product.id}
                        onClick={() => handleOpenModal(product)}
                        className="group cursor-pointer flex flex-col justify-between transition-all"
                      >
                        {/* Image container: borderless, transparent, mix-blend-multiply */}
                        <div className="w-full aspect-square rounded-2xl overflow-hidden mb-3 relative flex items-center justify-center bg-transparent group-hover:scale-[1.03] transition-transform duration-300">
                          <img
                            src={productImages[0] || product.image}
                            alt={product.name}
                            className="w-full h-full object-contain p-2 mix-blend-multiply"
                          />
                          <div className="absolute inset-0 bg-stone-900/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                            <span className="bg-white/95 text-stone-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5" /> İncele
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4
                            style={{ color: 'var(--text-main)' }}
                            className="text-xs sm:text-sm font-bold line-clamp-1 group-hover:opacity-75 transition-opacity"
                          >
                            {product.name}
                          </h4>
                          <p
                            style={{ color: 'var(--text-muted)' }}
                            className="text-[11px] line-clamp-2 font-normal leading-relaxed"
                          >
                            {product.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Load More Button */}
                {visibleCount < filteredProducts.length && (
                  <div className="flex justify-center pt-10 sm:pt-12">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 8)}
                      style={{
                        backgroundColor: 'var(--card-bg)',
                        color: 'var(--text-main)',
                      }}
                      className="px-7 py-3 rounded-full text-xs font-bold uppercase tracking-[0.15em] border border-stone-300/80 hover:border-stone-900 shadow-xs hover:shadow-md transition-all cursor-pointer inline-flex items-center gap-2 group"
                    >
                      <span>{settings.catalogLoadMoreText || 'Daha Fazla Göster'} ({filteredProducts.length - visibleCount} Ürün Kaldı)</span>
                      <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

      </div>

      {/* Product Detail Modal */}
      {activeModalProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveModalProduct(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-main)',
            }}
            className="rounded-3xl sm:rounded-4xl max-w-4xl w-full p-6 sm:p-10 shadow-2xl border border-black/10 relative overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveModalProduct(null)}
              style={{
                backgroundColor: 'var(--site-bg)',
                color: 'var(--text-main)',
              }}
              className="absolute top-5 right-5 p-2 rounded-full border border-black/10 shadow-xs hover:opacity-80 transition-opacity cursor-pointer z-10"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Left Gallery Images (Dominant large photo) */}
              <div className="md:col-span-7 space-y-4">
                {(() => {
                  const gallery =
                    activeModalProduct.images && activeModalProduct.images.length > 0
                      ? activeModalProduct.images
                      : [activeModalProduct.image];
                  const currentImage = gallery[activeImageIndex] || gallery[0];

                  return (
                    <>
                      <div className="relative aspect-square sm:aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden bg-current/5 border border-black/5 flex items-center justify-center p-4">
                        <img
                          src={currentImage}
                          alt={activeModalProduct.name}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                        {gallery.length > 1 && (
                          <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : gallery.length - 1));
                              }}
                              style={{
                                backgroundColor: 'var(--card-bg)',
                                color: 'var(--text-main)',
                              }}
                              className="p-2 rounded-full shadow-md pointer-events-auto cursor-pointer border border-black/10 hover:scale-105 transition-transform"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveImageIndex((prev) => (prev < gallery.length - 1 ? prev + 1 : 0));
                              }}
                              style={{
                                backgroundColor: 'var(--card-bg)',
                                color: 'var(--text-main)',
                              }}
                              className="p-2 rounded-full shadow-md pointer-events-auto cursor-pointer border border-black/10 hover:scale-105 transition-transform"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {gallery.length > 1 && (
                        <div className="flex gap-2.5 overflow-x-auto pb-1">
                          {gallery.map((img, i) => (
                            <button
                              key={i}
                              onClick={() => setActiveImageIndex(i)}
                              style={{
                                borderColor: activeImageIndex === i ? 'var(--text-main)' : 'transparent',
                              }}
                              className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer bg-current/5 p-1 ${
                                activeImageIndex === i ? '' : 'opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img src={img} alt="thumbnail" className="w-full h-full object-contain mix-blend-multiply" />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Right Product Info */}
              <div className="md:col-span-5 space-y-4">
                <h3
                  style={{ color: 'var(--text-main)' }}
                  className="text-2xl sm:text-3xl font-bold tracking-tight leading-snug"
                >
                  {activeModalProduct.name}
                </h3>

                <p
                  style={{ color: 'var(--text-muted)' }}
                  className="text-xs sm:text-sm leading-relaxed font-normal"
                >
                  {activeModalProduct.description}
                </p>
              </div>

            </div>

          </div>
        </div>
      )}

    </section>
  );
}
