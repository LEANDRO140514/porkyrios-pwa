"use client";

import { useState, useEffect, memo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, Plus, Loader2, Image as ImageIcon, Zap, Home } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import Image from "next/image";
import { trackGAEvent, trackFbqEvent } from "@/lib/analytics";

type Category = {
  id: number;
  name: string;
  emoji: string;
  image: string | null;
  active: boolean;
};

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  categoryId: number | null;
  stock: number;
  image: string | null;
  active: boolean;
};

// Memoized ProductCard component
const ProductCard = memo(({ 
  product, 
  getCategoryName, 
  getItemQuantityInCart, 
  handleAddToCart 
}: { 
  product: Product;
  getCategoryName: (id: number | null) => string;
  getItemQuantityInCart: (id: number) => number;
  handleAddToCart: (product: Product) => void;
}) => {
  const quantityInCart = getItemQuantityInCart(product.id);
  const availableStock = product.stock - quantityInCart;
  
  const getStockIndicator = (stock: number) => {
    if (stock === 0) {
      return { label: "🚫 Agotado", color: "bg-red-500/90 text-white border-red-400", show: true };
    }
    if (stock <= 3) {
      return { label: `⚡ ¡Solo ${stock}!`, color: "bg-red-500/90 text-white border-red-400", show: true, urgent: true };
    }
    if (stock <= 5) {
      return { label: `⚠️ Últimas ${stock}`, color: "bg-yellow-500/90 text-white border-yellow-400", show: true };
    }
    if (stock <= 10) {
      return { label: `📦 Quedan ${stock}`, color: "bg-orange-500/80 text-white border-orange-400", show: true };
    }
    return { label: "", color: "", show: false };
  };

  const stockIndicator = getStockIndicator(product.stock);

  return (
    <Card
      className={`bg-gray-800 border-gray-700 overflow-hidden transition-all ${
        stockIndicator.urgent 
          ? "border-red-500/50 shadow-lg shadow-red-500/20 hover:border-red-500" 
          : "hover:border-[#FF6B35]"
      }`}
    >
      {/* Mobile: horizontal layout | Desktop: vertical layout */}
      <div className="flex flex-row sm:flex-col">
        {/* Product Image */}
        {product.image ? (
          <div className="relative w-24 h-24 sm:w-full sm:h-40 bg-gray-700 flex-shrink-0">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {stockIndicator.show && (
              <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                <span className={`px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-sm font-bold ${stockIndicator.color} border shadow-lg ${
                  stockIndicator.urgent ? "animate-pulse" : ""
                }`}>
                  {stockIndicator.label}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="relative w-24 h-24 sm:w-full sm:h-40 bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center flex-shrink-0">
            <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-500" />
            {stockIndicator.show && (
              <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                <span className={`px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-sm font-bold ${stockIndicator.color} border shadow-lg ${
                  stockIndicator.urgent ? "animate-pulse" : ""
                }`}>
                  {stockIndicator.label}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="p-3 sm:p-5 flex-1 min-w-0">
          {/* Category Badge */}
          <span className="text-gray-400 text-xs sm:text-sm">
            {getCategoryName(product.categoryId)}
          </span>

          {/* Product Info */}
          <h3 className="text-sm sm:text-lg font-bold text-white mt-0.5 sm:mt-1 truncate">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-gray-400 text-xs mb-1 sm:mb-3 line-clamp-1 sm:line-clamp-2 hidden sm:block">
              {product.description}
            </p>
          )}

          {/* Price and Action */}
          <div className="flex items-center justify-between mt-1 sm:mt-2">
            <p className="text-lg sm:text-2xl font-bold text-[#FF6B35]">
              ${product.price.toFixed(2)}
            </p>

            <Button
              onClick={() => handleAddToCart(product)}
              disabled={availableStock === 0}
              size="sm"
              className={`font-bold text-xs sm:text-sm h-7 sm:h-9 px-2 sm:px-3 ${
                availableStock === 0
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-[#FF6B35] hover:bg-[#FF8E53] text-white"
              }`}
            >
              {availableStock === 0 ? (
                <>Sin stock</>
              ) : (
                <>
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5" />
                  Agregar
                </>
              )}
            </Button>
          </div>

          {/* Critical Stock Warning - solo desktop */}
          {product.stock <= 3 && product.stock > 0 && (
            <div className="hidden sm:block mt-2 pt-2 border-t border-red-500/30">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-xs font-bold">
                  ¡Últimas unidades! Ordena ahora
                </p>
              </div>
            </div>
          )}

          {/* In Cart Indicator */}
          {quantityInCart > 0 && (
            <div className="mt-1 sm:mt-2 pt-1 sm:pt-2 border-t border-gray-700">
              <p className="text-xs sm:text-sm text-green-400 flex items-center gap-1">
                <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                {quantityInCart} en carrito
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
});

ProductCard.displayName = "ProductCard";

export default function MenuPage() {
  const router = useRouter();
  const { cart, addToCart, getItemCount } = useCart();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [selectedCategory, searchQuery, products]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        fetch("/api/categories?limit=100"),
        fetch("/api/products?limit=100"),
      ]);

      if (categoriesRes.ok && productsRes.ok) {
        const categoriesData = await categoriesRes.json();
        const productsData = await productsRes.json();
        
        setCategories(categoriesData.filter((c: Category) => c.active));
        setProducts(productsData.filter((p: Product) => p.active && p.stock > 0));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error al cargar el menú");
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== null) {
      filtered = filtered.filter((p) => p.categoryId === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  };

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return "";
    const category = categories.find((c) => c.id === categoryId);
    return category ? `${category.emoji} ${category.name}` : "";
  };

  const getItemQuantityInCart = (productId: number) => {
    const item = cart.find((i) => i.id === productId);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = (product: Product) => {
    const quantityInCart = getItemQuantityInCart(product.id);
    
    // Check if adding would exceed stock
    if (quantityInCart >= product.stock) {
      toast.error(`⚠️ Stock insuficiente. Solo quedan ${product.stock} unidades`);
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
      image: product.image,
    });

    // Track add to cart event in Google Analytics
    trackGAEvent({
      action: 'add_to_cart',
      category: 'ecommerce',
      label: product.name,
      value: product.price,
    });

    // Track add to cart event in Meta Pixel
    trackFbqEvent('AddToCart', {
      content_ids: [product.id.toString()],
      content_name: product.name,
      content_type: 'product',
      value: product.price,
      currency: 'MXN',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header - Optimizado Mobile First */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
              {/* Logo */}
              <div className="relative w-10 h-10 md:w-12 md:h-12 cursor-pointer flex-shrink-0" onClick={() => router.push("/")}>
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Porkyrios-1763088561391.png?width=8000&height=8000&resize=contain"
                  alt="Porkyrios"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white flex items-center gap-1 md:gap-2 truncate">
                  🌮 Porkyrios
                </h1>
                <p className="text-gray-400 text-xs md:text-sm hidden sm:block">Menú Digital</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              {/* Botón de Inicio - AHORA VISIBLE EN MOBILE */}
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs md:text-sm px-2 md:px-4 h-8 md:h-10 flex items-center gap-1"
                onClick={() => router.push("/")}
              >
                <Home className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Inicio</span>
              </Button>
              <Button
                onClick={() => router.push("/cart")}
                className="bg-[#FF6B35] hover:bg-[#FF8E53] text-white font-bold relative text-xs md:text-sm px-3 md:px-4 h-8 md:h-10"
              >
                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 md:mr-2" />
                <span className="hidden md:inline">Carrito</span>
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-red-500 text-white text-[10px] md:text-xs font-bold rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Search Bar - Optimizado Mobile First */}
          <div className="mt-3 md:mt-4">
            <div className="relative">
              <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 md:pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 h-9 md:h-10 text-sm md:text-base"
              />
            </div>
          </div>

          {/* Category Filters - NOMBRES SIEMPRE VISIBLES */}
          <div className="flex gap-1.5 md:gap-2 mt-3 md:mt-4 overflow-x-auto pb-2 -mx-3 md:mx-0 px-3 md:px-0 scrollbar-hide">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 text-sm md:text-base h-9 md:h-10 px-4 md:px-5 font-semibold ${
                selectedCategory === null
                  ? "bg-[#FF6B35] hover:bg-[#FF8E53] text-white"
                  : "border-gray-500 text-white bg-gray-700/50 hover:bg-gray-600"
              }`}
            >
              Todos
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 text-sm md:text-base h-9 md:h-10 px-4 md:px-5 whitespace-nowrap font-semibold ${
                  selectedCategory === category.id
                    ? "bg-[#FF6B35] hover:bg-[#FF8E53] text-white"
                    : "border-gray-500 text-white bg-gray-700/50 hover:bg-gray-600"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-base">{category.emoji}</span> {category.name}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid - Optimizado Mobile First */}
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 lg:py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 md:py-16 lg:py-20">
            <Loader2 className="w-10 h-10 md:w-12 md:h-12 animate-spin text-[#FF6B35]" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 md:py-16 lg:py-20 px-4">
            <div className="text-5xl md:text-6xl mb-3 md:mb-4">🍽️</div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
              No se encontraron productos
            </h2>
            <p className="text-gray-400 text-sm md:text-base">
              Intenta con otra búsqueda o categoría
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                getCategoryName={getCategoryName}
                getItemQuantityInCart={getItemQuantityInCart}
                handleAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart Button (Mobile) - Optimizado */}
      {getItemCount() > 0 && (
        <div className="fixed bottom-4 right-4 md:hidden z-50">
          <Button
            onClick={() => router.push("/cart")}
            className="bg-[#FF6B35] hover:bg-[#FF8E53] text-white font-bold rounded-full w-14 h-14 shadow-2xl relative"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
              {getItemCount()}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}