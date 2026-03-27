"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  X,
  LogOut,
  DollarSign,
  Users,
  FolderOpen,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  ShoppingBag,
  Save,
  XCircle,
  ClipboardList,
  Upload,
  Image as ImageIcon,
  Tag,
  Download,
  TrendingDown,
  BarChart3,
  PackageCheck,
  AlertTriangle,
  History,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Filter,
  MapPin,
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Megaphone,
  Plug2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";
import { notifyOrderStatusChange } from "@/lib/notifications";
import { optimizeImage } from "@/lib/image-optimizer";
import { Textarea } from "@/components/ui/textarea";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

type Category = {
  id: number;
  name: string;
  emoji: string;
  image: string | null;
  imagePublicId: string | null;
  imageSize: number | null;
  active: boolean;
  createdAt: string;
};

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  categoryId: number | null;
  stock: number;
  image: string | null;
  imagePublicId: string | null;
  imageSize: number | null;
  active: boolean;
  featured: boolean;
  createdAt: string;
};

type Order = {
  id: number;
  orderNumber: string;
  customerName: string;
  phone: string;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  customerEmail?: string;
};

type Coupon = {
  id: number;
  code: string;
  type: string;
  value: number;
  minPurchase: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  startDate: string | null;
  endDate: string | null;
  active: boolean;
  createdAt: string;
};

type SalesData = {
  date: string;
  total: number;
  orders_count: number;
};

type TopProduct = {
  product_id: number;
  product_name: string;
  total_quantity: number;
  total_revenue: number;
  order_count: number;
};

type RevenueStats = {
  total_revenue: number;
  average_order: number;
  today_revenue: number;
  week_revenue: number;
  month_revenue: number;
  year_revenue: number;
};

type OverviewStats = {
  total_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  active_orders: number;
  total_revenue: number;
  average_order: number;
  total_products: number;
  low_stock_products: number;
  total_customers: number;
};

type InventoryMovement = {
  id: number;
  productId: number;
  productName: string;
  type: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string | null;
  orderId: number | null;
  createdBy: string | null;
  createdAt: string;
};

type InventoryReport = {
  total_products: number;
  active_products: number;
  total_stock_value: number;
  low_stock_count: number;
  out_of_stock_count: number;
  recent_movements_count: number;
  total_movements: number;
};

type LowStockProduct = Product;

type PostalCode = {
  id: number;
  code: string;
  municipality: string | null;
  state: string | null;
  deliveryCost: number;
  active: boolean;
  createdAt: string;
};

type Review = {
  id: number;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  status: string;
  moderationReason: string | null;
  ipAddress: string | null;
  isVerifiedPurchase: boolean;
  reportedCount: number;
  createdAt: string;
  moderatedAt: string | null;
  moderatedBy: string | null;
  reports?: ReviewReport[];
};

type ReviewReport = {
  id: number;
  reporterName: string | null;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
};

type ReviewStats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  averageRating: number;
  ratingDistribution: { [key: string]: number };
  recentActivity: number;
};

type PromotionalBanner = {
  id: number;
  title: string;
  description: string;
  couponCode: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function AdminPanel() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem("admin_auth") === "PORKYRIOS2025";
    }
    return false;
  });
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "categories" | "products" | "orders" | "coupons" | "inventory" | "postal-codes" | "reviews" | "promotions" | "integrations">("dashboard");

  // GHL Integration state
  const [ghlEnabled, setGhlEnabled] = useState(false);
  const [ghlApiKey, setGhlApiKey] = useState("");
  const [ghlLocationId, setGhlLocationId] = useState("");
  const [ghlTestStatus, setGhlTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [ghlTestMessage, setGhlTestMessage] = useState("");
  const [isSavingGHL, setIsSavingGHL] = useState(false);
  const [hasLoadedGHL, setHasLoadedGHL] = useState(false);

  // Analytics state
  const [salesPeriod, setSalesPeriod] = useState<"today" | "week" | "month" | "year">("week");
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [hasLoadedAnalytics, setHasLoadedAnalytics] = useState(false);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [hasLoadedCategories, setHasLoadedCategories] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    emoji: "",
    image: "",
    imagePublicId: "",
    imageSize: 0,
  });

  // Storage monitor state
  const [storageStats, setStorageStats] = useState<{ usedMB: number; limitMB: number; percentUsed: number } | null>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [hasLoadedProducts, setHasLoadedProducts] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | null>(null);
  
  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [hasLoadedOrders, setHasLoadedOrders] = useState(false);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string | null>(null);

  // Coupons state
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
  const [hasLoadedCoupons, setHasLoadedCoupons] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Inventory state
  const [inventoryReport, setInventoryReport] = useState<InventoryReport | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [hasLoadedInventory, setHasLoadedInventory] = useState(false);
  const [movementFilter, setMovementFilter] = useState<string | null>(null);
  const [selectedProductForMovements, setSelectedProductForMovements] = useState<number | null>(null);
  const [adjustmentForm, setAdjustmentForm] = useState({
    productId: "",
    newStock: "",
    reason: "",
    createdBy: "",
  });

  // Postal Codes state
  const [postalCodes, setPostalCodes] = useState<PostalCode[]>([]);
  const [isLoadingPostalCodes, setIsLoadingPostalCodes] = useState(false);
  const [hasLoadedPostalCodes, setHasLoadedPostalCodes] = useState(false);
  const [editingPostalCode, setEditingPostalCode] = useState<PostalCode | null>(null);
  const [newPostalCode, setNewPostalCode] = useState({
    code: "",
    municipality: "",
    state: "",
    deliveryCost: "35.00",
  });

  // Products state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    stock: "",
    image: "",
    imagePublicId: "",
    imageSize: 0,
  });

  // Coupons form state
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    type: "percentage",
    value: "",
    minPurchase: "",
    maxDiscount: "",
    usageLimit: "",
    startDate: "",
    endDate: "",
  });

  // Image upload states
  const [uploadingCategoryImage, setUploadingCategoryImage] = useState(false);
  const [uploadingProductImage, setUploadingProductImage] = useState(false);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [hasLoadedReviews, setHasLoadedReviews] = useState(false);
  const [reviewStatusFilter, setReviewStatusFilter] = useState<string | null>(null);
  const [moderatingReview, setModeratingReview] = useState<Review | null>(null);
  const [moderationReason, setModerationReason] = useState("");

  // Promotions state
  const [promotionalBanners, setPromotionalBanners] = useState<PromotionalBanner[]>([]);
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(false);
  const [hasLoadedPromotions, setHasLoadedPromotions] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PromotionalBanner | null>(null);
  const [newBanner, setNewBanner] = useState({
    title: "",
    description: "",
    couponCode: "",
  });

    // Reviews section control state
    const [reviewsSectionEnabled, setReviewsSectionEnabled] = useState(true);
    const [isUpdatingReviewsSetting, setIsUpdatingReviewsSetting] = useState(false);

    // Tracking section control state
    const [trackingSectionEnabled, setTrackingSectionEnabled] = useState(true);
    const [isUpdatingTrackingSetting, setIsUpdatingTrackingSetting] = useState(false);

  // Verificación inicial completa
  useEffect(() => {
    setIsCheckingAuth(false);
  }, []);

  // Fetch data based on active tab
  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === "dashboard" && !hasLoadedAnalytics) {
        fetchAnalytics();
      } else if (activeTab === "categories" && !hasLoadedCategories) {
        fetchCategories();
        if (!hasLoadedProducts) fetchProducts();
      } else if (activeTab === "products" && !hasLoadedProducts) {
        if (!hasLoadedCategories) fetchCategories();
        fetchProducts();
      } else if (activeTab === "orders" && !hasLoadedOrders) {
          fetchOrders();
          fetchTrackingSetting();
      } else if (activeTab === "coupons" && !hasLoadedCoupons) {
        fetchCoupons();
      } else if (activeTab === "inventory" && !hasLoadedInventory) {
        fetchInventoryData();
      } else if (activeTab === "postal-codes" && !hasLoadedPostalCodes) {
        fetchPostalCodes();
      } else if (activeTab === "reviews" && !hasLoadedReviews) {
        fetchReviewsData();
        fetchReviewsSetting();
      } else if (activeTab === "promotions" && !hasLoadedPromotions) {
        fetchPromotions();
        if (!hasLoadedProducts) fetchProducts();
      } else if (activeTab === "integrations" && !hasLoadedGHL) {
        fetchGHLSettings();
      }
    }
  }, [isAuthenticated, activeTab]);

  // Refetch sales when period changes
  useEffect(() => {
    if (isAuthenticated && activeTab === "dashboard" && hasLoadedAnalytics) {
      fetchSalesData();
    }
  }, [salesPeriod, isAuthenticated, activeTab, hasLoadedAnalytics]);

  // Filter products when category filter changes
  useEffect(() => {
    if (selectedCategoryFilter === null) {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.categoryId === selectedCategoryFilter));
    }
  }, [selectedCategoryFilter, products]);

  // Filter orders when status filter changes
  useEffect(() => {
    if (selectedStatusFilter === null) {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(o => o.status === selectedStatusFilter));
    }
  }, [selectedStatusFilter, orders]);

  // Analytics fetch functions
  const fetchAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      await Promise.all([
        fetchSalesData(),
        fetchTopProducts(),
        fetchRevenueStats(),
        fetchOverviewStats(),
        fetchStorageStats(),
      ]);
      setHasLoadedAnalytics(true);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Error al cargar las estadísticas");
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const fetchSalesData = async () => {
    try {
      const response = await fetch(`/api/analytics/sales?period=${salesPeriod}`);
      if (!response.ok) throw new Error("Failed to fetch sales data");
      const data = await response.json();
      setSalesData(data);
    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
  };

  const fetchTopProducts = async () => {
    try {
      const response = await fetch("/api/analytics/top-products?limit=5");
      if (!response.ok) throw new Error("Failed to fetch top products");
      const data = await response.json();
      setTopProducts(data);
    } catch (error) {
      console.error("Error fetching top products:", error);
    }
  };

  const fetchRevenueStats = async () => {
    try {
      const response = await fetch("/api/analytics/revenue");
      if (!response.ok) throw new Error("Failed to fetch revenue stats");
      const data = await response.json();
      setRevenueStats(data);
    } catch (error) {
      console.error("Error fetching revenue stats:", error);
    }
  };

  const fetchOverviewStats = async () => {
    try {
      const response = await fetch("/api/analytics/overview");
      if (!response.ok) throw new Error("Failed to fetch overview stats");
      const data = await response.json();
      setOverviewStats(data);
    } catch (error) {
      console.error("Error fetching overview stats:", error);
    }
  };

  // CSV Export function
  const exportToCSV = () => {
    const csvRows = [];
    
    // Headers
    csvRows.push("Tipo,Métrica,Valor");
    
    // Overview stats
    if (overviewStats) {
      csvRows.push(`Pedidos,Total,${overviewStats.total_orders}`);
      csvRows.push(`Pedidos,Completados,${overviewStats.completed_orders}`);
      csvRows.push(`Pedidos,Cancelados,${overviewStats.cancelled_orders}`);
      csvRows.push(`Pedidos,Activos,${overviewStats.active_orders}`);
      csvRows.push(`Ingresos,Total,$${overviewStats.total_revenue.toFixed(2)}`);
      csvRows.push(`Ingresos,Promedio,$${overviewStats.average_order.toFixed(2)}`);
      csvRows.push(`Productos,Total,${overviewStats.total_products}`);
      csvRows.push(`Productos,Stock Bajo,${overviewStats.low_stock_products}`);
      csvRows.push(`Clientes,Total,${overviewStats.total_customers}`);
    }
    
    // Revenue stats
    if (revenueStats) {
      csvRows.push(`Ingresos,Hoy,$${revenueStats.today_revenue.toFixed(2)}`);
      csvRows.push(`Ingresos,Esta Semana,$${revenueStats.week_revenue.toFixed(2)}`);
      csvRows.push(`Ingresos,Este Mes,$${revenueStats.month_revenue.toFixed(2)}`);
      csvRows.push(`Ingresos,Este Año,$${revenueStats.year_revenue.toFixed(2)}`);
    }
    
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `porkyrios-reporte-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success("📥 Reporte descargado exitosamente");
  };

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await fetch("/api/categories?limit=100");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
      setHasLoadedCategories(true);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Error al cargar las categorías");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await fetch("/api/products?limit=100");
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
      setHasLoadedProducts(true);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Error al cargar los productos");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const response = await fetch("/api/orders?limit=100");
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data);
      setFilteredOrders(data);
      setHasLoadedOrders(true);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error al cargar los pedidos");
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchCoupons = async () => {
    setIsLoadingCoupons(true);
    try {
      const response = await fetch("/api/coupons?limit=100");
      if (!response.ok) throw new Error("Failed to fetch coupons");
      const data = await response.json();
      setCoupons(data);
      setHasLoadedCoupons(true);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Error al cargar los cupones");
    } finally {
      setIsLoadingCoupons(false);
    }
  };

  const fetchInventoryData = async () => {
    setIsLoadingInventory(true);
    try {
      await Promise.all([
        fetchInventoryReport(),
        fetchLowStockProducts(),
        fetchInventoryMovements(),
        fetchProducts(),
      ]);
      setHasLoadedInventory(true);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      toast.error("Error al cargar los datos de inventario");
    } finally {
      setIsLoadingInventory(false);
    }
  };

  const fetchInventoryReport = async () => {
    try {
      const response = await fetch("/api/inventory/report");
      if (!response.ok) throw new Error("Failed to fetch inventory report");
      const data = await response.json();
      setInventoryReport(data);
    } catch (error) {
      console.error("Error fetching inventory report:", error);
    }
  };

  const fetchLowStockProducts = async () => {
    try {
      const response = await fetch("/api/inventory/low-stock?threshold=10");
      if (!response.ok) throw new Error("Failed to fetch low stock products");
      const data = await response.json();
      setLowStockProducts(data);
    } catch (error) {
      console.error("Error fetching low stock products:", error);
    }
  };

  const fetchInventoryMovements = async () => {
    try {
      let url = "/api/inventory/movements?limit=50";
      if (movementFilter) url += `&type=${movementFilter}`;
      if (selectedProductForMovements) url += `&productId=${selectedProductForMovements}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch inventory movements");
      const data = await response.json();
      setInventoryMovements(data);
    } catch (error) {
      console.error("Error fetching inventory movements:", error);
    }
  };

  const fetchPostalCodes = async () => {
    setIsLoadingPostalCodes(true);
    try {
      const response = await fetch("/api/postal-codes?limit=100");
      if (!response.ok) throw new Error("Failed to fetch postal codes");
      const data = await response.json();
      setPostalCodes(data);
      setHasLoadedPostalCodes(true);
    } catch (error) {
      console.error("Error fetching postal codes:", error);
      toast.error("Error al cargar los códigos postales");
    } finally {
      setIsLoadingPostalCodes(false);
    }
  };

  const fetchReviewsData = async () => {
    setIsLoadingReviews(true);
    try {
      await Promise.all([
        fetchReviews(),
        fetchReviewStats(),
        fetchReviewsSetting(),
      ]);
      setHasLoadedReviews(true);
    } catch (error) {
      console.error("Error fetching reviews data:", error);
      toast.error("Error al cargar las reseñas");
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const fetchReviewsSetting = async () => {
    try {
      const response = await fetch("/api/settings?key=reviews_section_enabled");
      if (response.ok) {
        const data = await response.json();
        setReviewsSectionEnabled(data.value === "true");
      }
    } catch (error) {
      console.error("Error fetching reviews section setting:", error);
    }
  };

  const handleToggleReviewsSection = async () => {
    setIsUpdatingReviewsSetting(true);
    try {
      const newValue = !reviewsSectionEnabled;
      const response = await fetch(`/api/settings?key=reviews_section_enabled`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          value: newValue.toString(),
          description: `Reviews section ${newValue ? "enabled" : "disabled"} on homepage`,
        }),
      });

      if (!response.ok) throw new Error("Failed to update setting");

      setReviewsSectionEnabled(newValue);
      toast.success(`✅ Sección de reseñas ${newValue ? "activada" : "desactivada"} en homepage`);
    } catch (error) {
      console.error("Error updating reviews section setting:", error);
      toast.error("Error al actualizar la configuración");
    } finally {
      setIsUpdatingReviewsSetting(false);
      }
    };

    const fetchTrackingSetting = async () => {
      try {
        const response = await fetch("/api/settings?key=tracking_section_enabled");
        if (response.ok) {
          const data = await response.json();
          setTrackingSectionEnabled(data.value === "true");
        }
      } catch (error) {
        console.error("Error fetching tracking section setting:", error);
      }
    };

    const handleToggleTrackingSection = async () => {
      setIsUpdatingTrackingSetting(true);
      try {
        const newValue = !trackingSectionEnabled;
        const response = await fetch(`/api/settings?key=tracking_section_enabled`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            value: newValue.toString(),
            description: `Tracking section ${newValue ? "enabled" : "disabled"}`,
          }),
        });

        if (!response.ok) throw new Error("Failed to update setting");

        setTrackingSectionEnabled(newValue);
        toast.success(`✅ Rastreo de pedidos ${newValue ? "activado" : "desactivado"}`);
      } catch (error) {
        console.error("Error updating tracking section setting:", error);
        toast.error("Error al actualizar la configuración");
      } finally {
        setIsUpdatingTrackingSetting(false);
      }
    };

    const fetchReviews = async () => {
      try {
      let url = "/api/reviews/admin?limit=100";
      if (reviewStatusFilter) url += `&status=${reviewStatusFilter}`;
      
      const token = localStorage.getItem("bearer_token");
      if (!token) {
        toast.error("Debes iniciar sesión para ver las reseñas");
        return;
      }
      
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch reviews");
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      if (!token) {
        toast.error("Debes iniciar sesión para ver las estadísticas");
        return;
      }
      
      const response = await fetch("/api/reviews/admin/stats", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch review stats");
      const data = await response.json();
      setReviewStats(data);
    } catch (error) {
      console.error("Error fetching review stats:", error);
    }
  };

  const fetchPromotions = async () => {
    setIsLoadingPromotions(true);
    try {
      const response = await fetch("/api/promotional-banner");
      if (response.ok) {
        const data = await response.json();
        // If single banner returned, wrap in array
        setPromotionalBanners(data ? [data] : []);
      }
      setHasLoadedPromotions(true);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      toast.error("Error al cargar las promociones");
    } finally {
      setIsLoadingPromotions(false);
    }
  };

  // ─── GHL Functions ────────────────────────────────────────────
  const fetchGHLSettings = async () => {
    try {
      const res = await fetch("/api/ghl/settings");
      if (res.ok) {
        const data = await res.json();
        setGhlEnabled(data.enabled);
        setGhlApiKey(data.apiKey);
        setGhlLocationId(data.locationId);
      }
      setHasLoadedGHL(true);
    } catch (error) {
      console.error("Error loading GHL settings:", error);
      setHasLoadedGHL(true);
    }
  };

  const saveGHLSettings = async () => {
    setIsSavingGHL(true);
    try {
      const res = await fetch("/api/ghl/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: ghlEnabled,
          apiKey: ghlApiKey,
          locationId: ghlLocationId,
        }),
      });
      if (res.ok) {
        toast.success("Configuración GHL guardada");
      } else {
        toast.error("Error al guardar configuración GHL");
      }
    } catch {
      toast.error("Error de conexión al guardar GHL");
    } finally {
      setIsSavingGHL(false);
    }
  };

  const testGHLConnectionHandler = async () => {
    if (!ghlApiKey.trim() || !ghlLocationId.trim()) {
      toast.error("Ingresa el API Key y Location ID antes de probar");
      return;
    }
    setGhlTestStatus("testing");
    setGhlTestMessage("");
    try {
      const res = await fetch("/api/ghl/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: ghlApiKey, locationId: ghlLocationId }),
      });
      const data = await res.json();
      if (data.success) {
        setGhlTestStatus("success");
        setGhlTestMessage(`✅ Conectado a: ${data.locationName}`);
        toast.success(`Conexión exitosa con GHL: ${data.locationName}`);
      } else {
        setGhlTestStatus("error");
        setGhlTestMessage(data.error || "Conexión fallida");
        toast.error(data.error || "No se pudo conectar a GHL");
      }
    } catch {
      setGhlTestStatus("error");
      setGhlTestMessage("Error de red al conectar con GHL");
      toast.error("Error de red al conectar con GHL");
    }
  };
  // ──────────────────────────────────────────────────────────────

  const handleInventoryAdjustment = async () => {
    if (!adjustmentForm.productId) {
      toast.error("Selecciona un producto");
      return;
    }
    if (!adjustmentForm.newStock || parseInt(adjustmentForm.newStock) < 0) {
      toast.error("El stock debe ser mayor o igual a 0");
      return;
    }
    if (!adjustmentForm.reason.trim()) {
      toast.error("Ingresa una razón para el ajuste");
      return;
    }
    if (!adjustmentForm.createdBy.trim()) {
      toast.error("Ingresa quién realiza el ajuste");
      return;
    }

    try {
      const response = await fetch("/api/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: parseInt(adjustmentForm.productId),
          newStock: parseInt(adjustmentForm.newStock),
          reason: adjustmentForm.reason,
          createdBy: adjustmentForm.createdBy,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to adjust inventory");
      }

      const result = await response.json();
      toast.success(`✅ Stock de "${result.productName}" ajustado a ${result.newStock}`);
      
      setAdjustmentForm({
        productId: "",
        newStock: "",
        reason: "",
        createdBy: "",
      });

      await fetchInventoryData();
    } catch (error) {
      console.error("Error adjusting inventory:", error);
      toast.error(error instanceof Error ? error.message : "Error al ajustar el inventario");
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "addition":
        return <ArrowUpRight className="w-4 h-4 text-green-400" />;
      case "reduction":
        return <ArrowDownRight className="w-4 h-4 text-red-400" />;
      case "sale":
        return <ShoppingBag className="w-4 h-4 text-blue-400" />;
      case "adjustment":
        return <RefreshCw className="w-4 h-4 text-yellow-400" />;
      case "return":
        return <ArrowUpRight className="w-4 h-4 text-purple-400" />;
      default:
        return <History className="w-4 h-4 text-gray-400" />;
    }
  };

  const getMovementLabel = (type: string) => {
    const labels: Record<string, string> = {
      addition: "Reabastecimiento",
      reduction: "Reducción",
      sale: "Venta",
      adjustment: "Ajuste",
      return: "Devolución",
    };
    return labels[type] || type;
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case "addition":
      case "return":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "reduction":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "sale":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "adjustment":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getProductCount = (categoryId: number) => {
    return products.filter(p => p.categoryId === categoryId).length;
  };

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return "Sin categoría";
    const category = categories.find(c => c.id === categoryId);
    return category ? `${category.emoji} ${category.name}` : "Sin categoría";
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours}h`;
    return date.toLocaleDateString();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      if (password === "PORKYRIOS2025") {
        sessionStorage.setItem("admin_auth", "PORKYRIOS2025");
        setIsAuthenticated(true);
      } else {
        setError("❌ Contraseña incorrecta");
      }
      setIsLoading(false);
    }, 500);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    setIsAuthenticated(false);
    setPassword("");
    setActiveTab("dashboard");
  };

  const handleImageUpload = async (
    file: File,
    setUploading: (loading: boolean) => void,
    onSuccess: (url: string, publicId?: string, size?: number) => void,
    oldPublicId?: string | null
  ) => {
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("❌ Solo se permiten imágenes (JPEG, PNG, GIF, WebP)");
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB before optimization
    if (file.size > maxSize) {
      toast.error("❌ La imagen es muy grande. Máximo 10MB");
      return;
    }

    setUploading(true);

    try {
      // Step 1: Client-side optimization → WebP, max 800px, quality 0.8
      toast.info("⚙️ Optimizando imagen...", { duration: 1500 });
      const { blob: optimizedBlob, size } = await optimizeImage(file);

      // Step 2: Delete old image file if replacing
      if (oldPublicId) {
        try {
          await fetch(`/api/upload?publicId=${encodeURIComponent(oldPublicId)}`, { method: "DELETE" });
        } catch (e) {
          console.error("Failed to delete old image:", e);
        }
      }

      // Step 3: Upload optimized WebP
      const optimizedFile = new File(
        [optimizedBlob],
        file.name.replace(/\.[^.]+$/, ".webp"),
        { type: "image/webp" }
      );
      const formData = new FormData();
      formData.append("file", optimizedFile);

      const response = await fetch("/api/upload", { method: "POST", body: formData });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload");
      }

      const data = await response.json();
      onSuccess(data.url, data.publicId, size);
      toast.success(`✅ Imagen optimizada y subida (${(size / 1024).toFixed(0)} KB)`);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("❌ Error al procesar la imagen");
    } finally {
      setUploading(false);
    }
  };

  // Delete an uploaded image file and clear the field in the record
  const handleDeleteImage = async (
    publicId: string,
    clearState: () => void,
    entityType?: "product" | "category",
    entityId?: number
  ) => {
    try {
      await fetch(`/api/upload?publicId=${encodeURIComponent(publicId)}`, { method: "DELETE" });

      if (entityType && entityId) {
        const endpoint = entityType === "product" ? `/api/products?id=${entityId}` : `/api/categories?id=${entityId}`;
        await fetch(endpoint, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: null, imagePublicId: null, imageSize: null }),
        });
      }

      clearState();
      toast.success("🗑️ Imagen eliminada");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("❌ Error al eliminar la imagen");
    }
  };

  // Fetch storage stats
  const fetchStorageStats = async () => {
    try {
      const res = await fetch("/api/storage");
      if (res.ok) {
        const data = await res.json();
        setStorageStats(data);
      }
    } catch (e) {
      console.error("Error fetching storage stats:", e);
    }
  };

  // Category Management Functions
  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (!newCategory.emoji.trim()) {
      toast.error("El emoji es obligatorio");
      return;
    }

    if (categories.some(cat => cat.name.toLowerCase() === newCategory.name.toLowerCase())) {
      toast.error("Ya existe una categoría con ese nombre");
      return;
    }

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategory.name,
          emoji: newCategory.emoji,
          image: newCategory.image || null,
          imagePublicId: newCategory.imagePublicId || null,
          imageSize: newCategory.imageSize || null,
          active: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create category");
      }

      const newCat = await response.json();
      setCategories([...categories, newCat]);
      setNewCategory({ name: "", emoji: "", image: "", imagePublicId: "", imageSize: 0 });
      toast.success(`✅ Categoría "${newCat.name}" agregada correctamente`);
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Error al crear la categoría");
    }
  };

  const handleToggleCategory = async (id: number) => {
    const category = categories.find(cat => cat.id === id);
    if (!category) return;

    try {
      const response = await fetch(`/api/categories?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          active: !category.active,
        }),
      });

      if (!response.ok) throw new Error("Failed to update category");

      const updatedCat = await response.json();
      setCategories(categories.map(cat => 
        cat.id === id ? updatedCat : cat
      ));
      toast.success(`${category.active ? "❌ Categoría desactivada" : "✅ Categoría activada"}`);
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Error al actualizar la categoría");
    }
  };

  const handleDeleteCategory = async (id: number) => {
    const category = categories.find(cat => cat.id === id);
    if (!category) return;

    const productCount = getProductCount(id);

    if (productCount > 0) {
      toast.error(`❌ No se puede eliminar. La categoría tiene ${productCount} producto(s)`);
      return;
    }

    try {
      const response = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete category");

      setCategories(categories.filter(cat => cat.id !== id));
      toast.success(`🗑️ Categoría "${category.name}" eliminada`);
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Error al eliminar la categoría");
    }
  };

  // Product Management Functions
  const handleAddProduct = async () => {
    if (!newProduct.name.trim()) {
      toast.error("El nombre del producto es obligatorio");
      return;
    }
    if (!newProduct.price || parseFloat(newProduct.price) <= 0) {
      toast.error("El precio debe ser mayor a 0");
      return;
    }

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProduct.name,
          description: newProduct.description || null,
          price: parseFloat(newProduct.price),
          categoryId: newProduct.categoryId ? parseInt(newProduct.categoryId) : null,
          stock: newProduct.stock ? parseInt(newProduct.stock) : 0,
          image: newProduct.image || null,
          imagePublicId: newProduct.imagePublicId || null,
          imageSize: newProduct.imageSize || null,
          active: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create product");
      }

      const product = await response.json();
      setProducts([...products, product]);
      setNewProduct({
        name: "",
        description: "",
        price: "",
        categoryId: "",
        stock: "",
        image: "",
        imagePublicId: "",
        imageSize: 0,
      });
      toast.success(`✅ Producto "${product.name}" agregado correctamente`);
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Error al crear el producto");
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;

    if (!editingProduct.name.trim()) {
      toast.error("El nombre del producto es obligatorio");
      return;
    }
    if (editingProduct.price <= 0) {
      toast.error("El precio debe ser mayor a 0");
      return;
    }

    try {
      const response = await fetch(`/api/products?id=${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingProduct.name,
          description: editingProduct.description || null,
          price: editingProduct.price,
          categoryId: editingProduct.categoryId,
          stock: editingProduct.stock,
          image: editingProduct.image || null,
          imagePublicId: editingProduct.imagePublicId || null,
          imageSize: editingProduct.imageSize || null,
          active: editingProduct.active,
        }),
      });

      if (!response.ok) throw new Error("Failed to update product");

      const updatedProduct = await response.json();
      setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      setEditingProduct(null);
      toast.success(`✅ Producto actualizado correctamente`);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Error al actualizar el producto");
    }
  };

  const handleToggleProduct = async (id: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          active: !product.active,
        }),
      });

      if (!response.ok) throw new Error("Failed to update product");

      const updatedProduct = await response.json();
      setProducts(products.map(p => p.id === id ? updatedProduct : p));
      toast.success(`${product.active ? "❌ Producto desactivado" : "✅ Producto activado"}`);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Error al actualizar el producto");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    if (!confirm(`¿Estás seguro de eliminar "${product.name}"?`)) return;

    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete product");

      setProducts(products.filter(p => p.id !== id));
      toast.success(`🗑️ Producto eliminado`);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Error al eliminar el producto");
    }
  };

  // Coupon Management Functions
  const handleAddCoupon = async () => {
    if (!newCoupon.code.trim()) {
      toast.error("El código es obligatorio");
      return;
    }
    if (!newCoupon.value || parseFloat(newCoupon.value) <= 0) {
      toast.error("El valor debe ser mayor a 0");
      return;
    }
    if (newCoupon.type === "percentage" && parseFloat(newCoupon.value) > 100) {
      toast.error("El porcentaje no puede ser mayor a 100");
      return;
    }

    try {
      const payload: any = {
        code: newCoupon.code.toUpperCase(),
        type: newCoupon.type,
        value: parseFloat(newCoupon.value),
        active: true,
      };

      if (newCoupon.minPurchase) payload.minPurchase = parseFloat(newCoupon.minPurchase);
      if (newCoupon.maxDiscount) payload.maxDiscount = parseFloat(newCoupon.maxDiscount);
      if (newCoupon.usageLimit) payload.usageLimit = parseInt(newCoupon.usageLimit);
      if (newCoupon.startDate) payload.startDate = new Date(newCoupon.startDate).toISOString();
      if (newCoupon.endDate) payload.endDate = new Date(newCoupon.endDate).toISOString();

      const response = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create coupon");
      }

      const coupon = await response.json();
      setCoupons([coupon, ...coupons]);
      setNewCoupon({
        code: "",
        type: "percentage",
        value: "",
        minPurchase: "",
        maxDiscount: "",
        usageLimit: "",
        startDate: "",
        endDate: "",
      });
      toast.success(`✅ Cupón "${coupon.code}" creado correctamente`);
    } catch (error) {
      console.error("Error creating coupon:", error);
      toast.error(error instanceof Error ? error.message : "Error al crear el cupón");
    }
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
  };

  const handleSaveCoupon = async () => {
    if (!editingCoupon) return;

    try {
      const payload: any = {
        code: editingCoupon.code,
        type: editingCoupon.type,
        value: editingCoupon.value,
        active: editingCoupon.active,
        minPurchase: editingCoupon.minPurchase,
        maxDiscount: editingCoupon.maxDiscount,
        usageLimit: editingCoupon.usageLimit,
        startDate: editingCoupon.startDate,
        endDate: editingCoupon.endDate,
      };

      const response = await fetch(`/api/coupons?id=${editingCoupon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to update coupon");

      const updated = await response.json();
      setCoupons(coupons.map(c => c.id === updated.id ? updated : c));
      setEditingCoupon(null);
      toast.success("✅ Cupón actualizado correctamente");
    } catch (error) {
      console.error("Error updating coupon:", error);
      toast.error("Error al actualizar el cupón");
    }
  };

  const handleToggleCoupon = async (id: number) => {
    const coupon = coupons.find(c => c.id === id);
    if (!coupon) return;

    try {
      const response = await fetch(`/api/coupons?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !coupon.active }),
      });

      if (!response.ok) throw new Error("Failed to update coupon");

      const updated = await response.json();
      setCoupons(coupons.map(c => c.id === id ? updated : c));
      toast.success(`${coupon.active ? "❌ Cupón desactivado" : "✅ Cupón activado"}`);
    } catch (error) {
      console.error("Error updating coupon:", error);
      toast.error("Error al actualizar el cupón");
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    const coupon = coupons.find(c => c.id === id);
    if (!coupon) return;

    if (!confirm(`¿Estás seguro de eliminar el cupón "${coupon.code}"?`)) return;

    try {
      const response = await fetch(`/api/coupons?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete coupon");

      setCoupons(coupons.filter(c => c.id !== id));
      toast.success(`🗑️ Cupón "${coupon.code}" eliminado`);
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error("Error al eliminar el cupón");
    }
  };

  // Banner Management Functions
  const handleAddBanner = async () => {
    if (!newBanner.title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }
    if (!newBanner.description.trim()) {
      toast.error("La descripción es obligatoria");
      return;
    }
    if (newBanner.description.length > 120) {
      toast.error("La descripción no puede exceder 120 caracteres");
      return;
    }

    try {
      const response = await fetch("/api/promotional-banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newBanner.title,
          description: newBanner.description,
          couponCode: newBanner.couponCode || null,
          active: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create banner");
      }

      const banner = await response.json();
      setPromotionalBanners([banner]);
      setNewBanner({ title: "", description: "", couponCode: "" });
      toast.success(`✅ Banner "${banner.title}" creado correctamente`);
    } catch (error) {
      console.error("Error creating banner:", error);
      toast.error(error instanceof Error ? error.message : "Error al crear el banner");
    }
  };

  const handleEditBanner = (banner: PromotionalBanner) => {
    setEditingBanner(banner);
  };

  const handleSaveBanner = async () => {
    if (!editingBanner) return;

    if (editingBanner.description.length > 120) {
      toast.error("La descripción no puede exceder 120 caracteres");
      return;
    }

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/promotional-banner/${editingBanner.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editingBanner.title,
          description: editingBanner.description,
          couponCode: editingBanner.couponCode || null,
          active: editingBanner.active,
        }),
      });

      if (!response.ok) throw new Error("Failed to update banner");

      const updated = await response.json();
      setPromotionalBanners([updated]);
      setEditingBanner(null);
      toast.success("✅ Banner actualizado correctamente");
    } catch (error) {
      console.error("Error updating banner:", error);
      toast.error("Error al actualizar el banner");
    }
  };

  const handleDeleteBanner = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este banner?")) return;

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/promotional-banner/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete banner");

      setPromotionalBanners([]);
      toast.success("🗑️ Banner eliminado");
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast.error("Error al eliminar el banner");
    }
  };

  const handleToggleFeatured = async (productId: number, currentFeatured: boolean) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/products/${productId}/featured`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ featured: !currentFeatured }),
      });

      if (!response.ok) throw new Error("Failed to toggle featured");

      const updatedProduct = await response.json();
      setProducts(products.map(p => p.id === productId ? updatedProduct : p));
      toast.success(`${currentFeatured ? "❌ Producto quitado de destacados" : "⭐ Producto marcado como destacado"}`);
    } catch (error) {
      console.error("Error toggling featured:", error);
      toast.error("Error al actualizar el producto");
    }
  };

  const getReviewStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "approved":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getReviewStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendiente",
      approved: "Aprobada",
      rejected: "Rechazada",
    };
    return labels[status] || status;
  };

  const handleModerateReview = async (reviewId: number, newStatus: string) => {
    if (newStatus === "rejected" && !moderationReason.trim()) {
      toast.error("Debes proporcionar una razón para rechazar la reseña");
      return;
    }

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/reviews/admin/${reviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          moderationReason: newStatus === "rejected" ? moderationReason : null,
        }),
      });

      if (!response.ok) throw new Error("Failed to moderate review");

      await fetchReviews();
      await fetchReviewStats();
      setModeratingReview(null);
      setModerationReason("");
      toast.success(`✅ Reseña ${newStatus === "approved" ? "aprobada" : "rechazada"} correctamente`);
    } catch (error) {
      console.error("Error moderating review:", error);
      toast.error("Error al moderar la reseña");
    }
  };

  // Postal Codes Management Functions
  const handleAddPostalCode = async () => {
    if (!newPostalCode.code.trim() || newPostalCode.code.length !== 5) {
      toast.error("El código postal debe tener exactamente 5 dígitos");
      return;
    }
    if (!newPostalCode.deliveryCost || parseFloat(newPostalCode.deliveryCost) <= 0) {
      toast.error("El costo de envío debe ser mayor a 0");
      return;
    }

    // Check if postal code already exists
    if (postalCodes.some(pc => pc.code === newPostalCode.code)) {
      toast.error(`El código postal ${newPostalCode.code} ya está registrado`);
      return;
    }

    try {
      const response = await fetch("/api/postal-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newPostalCode.code,
          municipality: newPostalCode.municipality || null,
          state: newPostalCode.state || null,
          deliveryCost: parseFloat(newPostalCode.deliveryCost),
          active: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create postal code");
      }

      const postalCode = await response.json();
      setPostalCodes([postalCode, ...postalCodes]);
      setNewPostalCode({
        code: "",
        municipality: "",
        state: "",
        deliveryCost: "35.00",
      });
      toast.success(`✅ Código Postal ${postalCode.code} agregado correctamente`);
    } catch (error) {
      console.error("Error creating postal code:", error);
      toast.error(error instanceof Error ? error.message : "Error al crear el código postal");
    }
  };

  const handleEditPostalCode = (postalCode: PostalCode) => {
    setEditingPostalCode(postalCode);
  };

  const handleSavePostalCode = async () => {
    if (!editingPostalCode) return;

    if (editingPostalCode.deliveryCost <= 0) {
      toast.error("El costo de envío debe ser mayor a 0");
      return;
    }

    try {
      const response = await fetch(`/api/postal-codes?id=${editingPostalCode.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          municipality: editingPostalCode.municipality || null,
          state: editingPostalCode.state || null,
          deliveryCost: editingPostalCode.deliveryCost,
          active: editingPostalCode.active,
        }),
      });

      if (!response.ok) throw new Error("Failed to update postal code");

      const updated = await response.json();
      setPostalCodes(postalCodes.map(pc => pc.id === updated.id ? updated : pc));
      setEditingPostalCode(null);
      toast.success("✅ Código Postal actualizado correctamente");
    } catch (error) {
      console.error("Error updating postal code:", error);
      toast.error("Error al actualizar el código postal");
    }
  };

  const handleTogglePostalCode = async (id: number) => {
    const postalCode = postalCodes.find(pc => pc.id === id);
    if (!postalCode) return;

    try {
      const response = await fetch(`/api/postal-codes?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !postalCode.active }),
      });

      if (!response.ok) throw new Error("Failed to update postal code");

      const updated = await response.json();
      setPostalCodes(postalCodes.map(pc => pc.id === id ? updated : pc));
      toast.success(`${postalCode.active ? "❌ Código Postal desactivado" : "✅ Código Postal activado"}`);
    } catch (error) {
      console.error("Error updating postal code:", error);
      toast.error("Error al actualizar el código postal");
    }
  };

  const handleDeletePostalCode = async (id: number) => {
    const postalCode = postalCodes.find(pc => pc.id === id);
    if (!postalCode) return;

    if (!confirm(`¿Estás seguro de eliminar el código postal "${postalCode.code}"?`)) return;

    try {
      const response = await fetch(`/api/postal-codes?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete postal code");

      setPostalCodes(postalCodes.filter(pc => pc.id !== id));
      toast.success(`🗑️ Código Postal "${postalCode.code}" eliminado`);
    } catch (error) {
      console.error("Error deleting postal code:", error);
      toast.error("Error al eliminar el código postal");
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders?id=${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update order status");

      const updatedOrder = await response.json();
      setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
      
      toast.success(`✅ Pedido actualizado a: ${getStatusLabel(newStatus)}`);

      // Send notifications
      if (updatedOrder.customerEmail) {
        await notifyOrderStatusChange(
          updatedOrder.orderNumber,
          newStatus,
          updatedOrder.customerEmail,
          updatedOrder.customerName
        );
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Error al actualizar el pedido");
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      preparing: "Preparando",
      cooking: "Cocinando",
      packing: "Empacando",
      ready: "Listo",
      completed: "Completado",
      cancelled: "Cancelado"
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready": return "bg-green-500";
      case "cooking": return "bg-orange-500";
      case "packing": return "bg-blue-500";
      case "preparing": return "bg-yellow-500";
      case "completed": return "bg-emerald-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Sin límite";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isCouponExpired = (coupon: Coupon) => {
    if (!coupon.endDate) return false;
    return new Date(coupon.endDate) < new Date();
  };

  const isCouponLimitReached = (coupon: Coupon) => {
    if (!coupon.usageLimit) return false;
    return coupon.usedCount >= coupon.usageLimit;
  };

  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  });

  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const preparingCount = orders.filter(o => ["preparing", "cooking", "packing"].includes(o.status)).length;
  const completedToday = todayOrders.filter(o => o.status === "completed").length;

  // Login Screen - Optimizado Mobile First
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-3 md:p-4">
        <Card className="w-full max-w-md p-6 md:p-8 bg-gray-800 border-gray-700">
          <div className="text-center space-y-4 md:space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#FF6B35] rounded-full flex items-center justify-center">
                <span className="text-3xl md:text-4xl">🔐</span>
              </div>
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Panel de Administración
              </h1>
              <p className="text-gray-400 text-sm md:text-base">
                Acceso Restringido - Porkyrios
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3 md:space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa la contraseña secreta"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 text-center text-base md:text-lg h-11 md:h-12 pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <div className="text-red-400 text-xs md:text-sm font-medium">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#FF6B35] hover:bg-[#FF8E53] text-white font-bold py-2.5 md:py-3 text-base md:text-lg h-auto"
                disabled={isLoading || !password}
              >
                {isLoading ? "Verificando..." : "🔓 Acceder"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-gray-400 hover:text-white text-sm md:text-base h-10 md:h-11"
                onClick={() => router.push("/")}
              >
                ← Volver al inicio
              </Button>
            </form>

            <div className="pt-3 md:pt-4 border-t border-gray-700">
              <p className="text-[10px] md:text-xs text-gray-500 text-center">
                💡 Pista: Triple click en el logo o usa el Konami Code
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Admin Dashboard - Optimizado Mobile First
  const stats = [
    { label: "Pedidos Hoy", value: todayOrders.length.toString(), icon: Package, color: "bg-blue-500" },
    { label: "Ingresos", value: `$${todayRevenue.toFixed(2)}`, icon: DollarSign, color: "bg-green-500" },
    { label: "En Preparación", value: preparingCount.toString(), icon: Clock, color: "bg-orange-500" },
    { label: "Completados", value: completedToday.toString(), icon: CheckCircle, color: "bg-emerald-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header - Optimizado Mobile First */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-1.5 md:gap-2 truncate">
                🔐 Panel Admin
              </h1>
              <p className="text-gray-400 text-xs md:text-sm hidden sm:block">Porkyrios - Sistema de Gestión</p>
            </div>
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs md:text-sm px-2 md:px-4 h-8 md:h-10"
                onClick={() => router.push("/")}
              >
                🏠 <span className="hidden sm:inline ml-1">Ver Sitio</span>
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-xs md:text-sm px-2 md:px-4 h-8 md:h-10"
              >
                <LogOut className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </div>
          </div>

          {/* Tabs Navigation - Optimizado Mobile First */}
          <div className="flex gap-1 md:gap-2 mt-3 md:mt-4 overflow-x-auto pb-2 -mx-3 md:mx-0 px-3 md:px-0 scrollbar-hide">
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              className={`flex-shrink-0 text-xs md:text-sm h-8 md:h-10 px-2 md:px-3 ${activeTab === "dashboard" ? "bg-[#FF6B35] hover:bg-[#FF8E53]" : "text-gray-400 hover:text-white"}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <BarChart3 className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            <Button
              variant={activeTab === "orders" ? "default" : "ghost"}
              className={`flex-shrink-0 text-xs md:text-sm h-8 md:h-10 px-2 md:px-3 ${activeTab === "orders" ? "bg-[#FF6B35] hover:bg-[#FF8E53]" : "text-gray-400 hover:text-white"}`}
              onClick={() => setActiveTab("orders")}
            >
              <ClipboardList className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden sm:inline">Pedidos</span>
            </Button>
            <Button
              variant={activeTab === "products" ? "default" : "ghost"}
              className={`flex-shrink-0 text-xs md:text-sm h-8 md:h-10 px-2 md:px-3 ${activeTab === "products" ? "bg-[#FF6B35] hover:bg-[#FF8E53]" : "text-gray-400 hover:text-white"}`}
              onClick={() => setActiveTab("products")}
            >
              <ShoppingBag className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden sm:inline">Productos</span>
            </Button>
            <Button
              variant={activeTab === "categories" ? "default" : "ghost"}
              className={`flex-shrink-0 text-xs md:text-sm h-8 md:h-10 px-2 md:px-3 ${activeTab === "categories" ? "bg-[#FF6B35] hover:bg-[#FF8E53]" : "text-gray-400 hover:text-white"}`}
              onClick={() => setActiveTab("categories")}
            >
              <FolderOpen className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden sm:inline">Categorías</span>
            </Button>
            <Button
              variant={activeTab === "inventory" ? "default" : "ghost"}
              className={`flex-shrink-0 text-xs md:text-sm h-8 md:h-10 px-2 md:px-3 ${activeTab === "inventory" ? "bg-[#FF6B35] hover:bg-[#FF8E53]" : "text-gray-400 hover:text-white"}`}
              onClick={() => setActiveTab("inventory")}
            >
              <PackageCheck className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden sm:inline">Inventario</span>
              {inventoryReport && inventoryReport.low_stock_count > 0 && (
                <span className="ml-1 md:ml-2 bg-red-500 text-white text-[10px] md:text-xs font-bold rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">
                  {inventoryReport.low_stock_count}
                </span>
              )}
            </Button>
            <Button
              variant={activeTab === "postal-codes" ? "default" : "ghost"}
              className={`flex-shrink-0 text-xs md:text-sm h-8 md:h-10 px-2 md:px-3 ${activeTab === "postal-codes" ? "bg-[#FF6B35] hover:bg-[#FF8E53]" : "text-gray-400 hover:text-white"}`}
              onClick={() => setActiveTab("postal-codes")}
            >
              <MapPin className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden sm:inline">CP</span>
            </Button>
            <Button
              variant={activeTab === "coupons" ? "default" : "ghost"}
              className={`flex-shrink-0 text-xs md:text-sm h-8 md:h-10 px-2 md:px-3 ${activeTab === "coupons" ? "bg-[#FF6B35] hover:bg-[#FF8E53]" : "text-gray-400 hover:text-white"}`}
              onClick={() => setActiveTab("coupons")}
            >
              <Tag className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden sm:inline">Cupones</span>
            </Button>
            <Button
              variant={activeTab === "promotions" ? "default" : "ghost"}
              className={`flex-shrink-0 text-xs md:text-sm h-8 md:h-10 px-2 md:px-3 ${activeTab === "promotions" ? "bg-[#FF6B35] hover:bg-[#FF8E53]" : "text-gray-400 hover:text-white"}`}
              onClick={() => setActiveTab("promotions")}
            >
              <Megaphone className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden sm:inline">Promos</span>
            </Button>
            <Button
              variant={activeTab === "reviews" ? "default" : "ghost"}
              className={`flex-shrink-0 text-xs md:text-sm h-8 md:h-10 px-2 md:px-3 ${activeTab === "reviews" ? "bg-[#FF6B35] hover:bg-[#FF8E53]" : "text-gray-400 hover:text-white"}`}
              onClick={() => setActiveTab("reviews")}
            >
              <Star className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden sm:inline">Reseñas</span>
              {reviewStats && reviewStats.pending > 0 && (
                <span className="ml-1 md:ml-2 bg-yellow-500 text-white text-[10px] md:text-xs font-bold rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">
                  {reviewStats.pending}
                </span>
              )}
            </Button>
            <Button
              variant={activeTab === "integrations" ? "default" : "ghost"}
              className={`flex-shrink-0 text-xs md:text-sm h-8 md:h-10 px-2 md:px-3 ${activeTab === "integrations" ? "bg-[#FF6B35] hover:bg-[#FF8E53]" : "text-gray-400 hover:text-white"}`}
              onClick={() => setActiveTab("integrations")}
            >
              <Plug2 className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden sm:inline">Integraciones</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 lg:py-8">
        {activeTab === "dashboard" && (
          <>
            {/* Export Button - Optimizado Mobile First */}
            <div className="flex justify-end mb-4 md:mb-6">
              <Button
                onClick={exportToCSV}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs md:text-sm h-8 md:h-10 px-3 md:px-4"
              >
                <Download className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                <span className="hidden sm:inline">Exportar CSV</span>
              </Button>
            </div>

            {/* Stats Grid - Optimizado Mobile First */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
              {overviewStats ? (
                <>
                  <Card className="bg-gray-800 border-gray-700 p-3 md:p-4 lg:p-6 hover:border-[#FF6B35] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-400 text-[10px] md:text-xs lg:text-sm mb-1 truncate">Total Pedidos</p>
                        <p className="text-xl md:text-2xl lg:text-3xl font-bold text-white truncate">{overviewStats.total_orders}</p>
                        <p className="text-[9px] md:text-xs text-gray-500 mt-1 truncate">
                          {overviewStats.completed_orders} completados
                        </p>
                      </div>
                      <div className="bg-blue-500 w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                        <Package className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700 p-3 md:p-4 lg:p-6 hover:border-[#FF6B35] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-400 text-[10px] md:text-xs lg:text-sm mb-1 truncate">Ingresos Totales</p>
                        <p className="text-xl md:text-2xl lg:text-3xl font-bold text-white truncate">${overviewStats.total_revenue.toFixed(2)}</p>
                        <p className="text-[9px] md:text-xs text-gray-500 mt-1 truncate">
                          Promedio: ${overviewStats.average_order.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-green-500 w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                        <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700 p-3 md:p-4 lg:p-6 hover:border-[#FF6B35] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-400 text-[10px] md:text-xs lg:text-sm mb-1 truncate">Productos</p>
                        <p className="text-xl md:text-2xl lg:text-3xl font-bold text-white truncate">{overviewStats.total_products}</p>
                        <p className="text-[9px] md:text-xs text-yellow-500 mt-1 truncate">
                          {overviewStats.low_stock_products} stock bajo
                        </p>
                      </div>
                      <div className="bg-purple-500 w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                        <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700 p-3 md:p-4 lg:p-6 hover:border-[#FF6B35] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-400 text-[10px] md:text-xs lg:text-sm mb-1 truncate">Clientes</p>
                        <p className="text-xl md:text-2xl lg:text-3xl font-bold text-white truncate">{overviewStats.total_customers}</p>
                        <p className="text-[9px] md:text-xs text-gray-500 mt-1 truncate">
                          {overviewStats.active_orders} activos
                        </p>
                      </div>
                      <div className="bg-cyan-500 w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                        <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                    </div>
                  </Card>
                </>
              ) : (
                stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Card
                      key={stat.label}
                      className="bg-gray-800 border-gray-700 p-3 md:p-4 lg:p-6 hover:border-[#FF6B35] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-gray-400 text-[10px] md:text-xs lg:text-sm mb-1 truncate">{stat.label}</p>
                          <p className="text-xl md:text-2xl lg:text-3xl font-bold text-white truncate">{stat.value}</p>
                        </div>
                        <div className={`${stat.color} w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ml-2`}>
                          <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Revenue Stats Cards - Optimizado Mobile First */}
            {revenueStats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
                <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 p-3 md:p-4 lg:p-6">
                  <div className="text-white">
                    <p className="text-blue-200 text-[10px] md:text-xs lg:text-sm mb-1 md:mb-2">Hoy</p>
                    <p className="text-xl md:text-2xl lg:text-3xl font-bold truncate">${revenueStats.today_revenue.toFixed(2)}</p>
                    <div className="flex items-center gap-1 md:gap-2 mt-1 md:mt-2">
                      <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="text-[10px] md:text-xs lg:text-sm">Ingresos del día</span>
                    </div>
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0 p-3 md:p-4 lg:p-6">
                  <div className="text-white">
                    <p className="text-green-200 text-[10px] md:text-xs lg:text-sm mb-1 md:mb-2">Esta Semana</p>
                    <p className="text-xl md:text-2xl lg:text-3xl font-bold truncate">${revenueStats.week_revenue.toFixed(2)}</p>
                    <div className="flex items-center gap-1 md:gap-2 mt-1 md:mt-2">
                      <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="text-[10px] md:text-xs lg:text-sm">Últimos 7 días</span>
                    </div>
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0 p-3 md:p-4 lg:p-6">
                  <div className="text-white">
                    <p className="text-purple-200 text-[10px] md:text-xs lg:text-sm mb-1 md:mb-2">Este Mes</p>
                    <p className="text-xl md:text-2xl lg:text-3xl font-bold truncate">${revenueStats.month_revenue.toFixed(2)}</p>
                    <div className="flex items-center gap-1 md:gap-2 mt-1 md:mt-2">
                      <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="text-[10px] md:text-xs lg:text-sm">Últimos 30 días</span>
                    </div>
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-0 p-3 md:p-4 lg:p-6">
                  <div className="text-white">
                    <p className="text-orange-200 text-[10px] md:text-xs lg:text-sm mb-1 md:mb-2">Este Año</p>
                    <p className="text-xl md:text-2xl lg:text-3xl font-bold truncate">${revenueStats.year_revenue.toFixed(2)}</p>
                    <div className="flex items-center gap-1 md:gap-2 mt-1 md:mt-2">
                      <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="text-[10px] md:text-xs lg:text-sm">Últimos 365 días</span>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Sales Chart */}
            <Card className="bg-gray-800 border-gray-700 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Ventas por Periodo
                </h2>
                <select
                  value={salesPeriod}
                  onChange={(e) => setSalesPeriod(e.target.value as any)}
                  className="bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm"
                >
                  <option value="today">Hoy</option>
                  <option value="week">Última Semana</option>
                  <option value="month">Último Mes</option>
                  <option value="year">Último Año</option>
                </select>
              </div>

              {isLoadingAnalytics ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#FF6B35]" />
                </div>
              ) : salesData.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <TrendingDown className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay datos de ventas completadas en este periodo</p>
                  <p className="text-sm mt-2">Solo se cuentan pedidos con estado "Completado"</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF"
                      tick={{ fill: '#9CA3AF' }}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      tick={{ fill: '#9CA3AF' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value: any) => ['$' + value.toFixed(2), 'Ventas']}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#FF6B35" 
                      strokeWidth={2}
                      name="Ingresos"
                      dot={{ fill: '#FF6B35', r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="orders_count" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Pedidos"
                      dot={{ fill: '#10B981', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>

            {/* Top Products */}
            <Card className="bg-gray-800 border-gray-700 p-6 mb-8">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <ShoppingBag className="w-5 h-5" />
                Top 5 Productos Más Vendidos
              </h2>

              {isLoadingAnalytics ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#FF6B35]" />
                </div>
              ) : topProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay productos vendidos aún</p>
                  <p className="text-sm mt-2">Solo se cuentan pedidos completados</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topProducts}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="product_name" 
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        angle={-15}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                        formatter={(value: any, name: string) => {
                          if (name === 'total_revenue') return ['$' + value.toFixed(2), 'Ingresos'];
                          if (name === 'total_quantity') return [value, 'Cantidad'];
                          return [value, name];
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="total_revenue" 
                        fill="#FF6B35" 
                        name="Ingresos"
                        radius={[8, 8, 0, 0]}
                      />
                      <Bar 
                        dataKey="total_quantity" 
                        fill="#10B981" 
                        name="Cantidad"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="mt-6 space-y-3">
                    {topProducts.map((product, index) => (
                      <div
                        key={product.product_id}
                        className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-[#FF6B35] w-10 h-10 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-white font-bold">{product.product_name}</p>
                            <p className="text-gray-400 text-sm">
                              {product.total_quantity} unidades vendidas en {product.order_count} pedidos
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[#FF6B35] font-bold text-xl">
                            ${product.total_revenue.toFixed(2)}
                          </p>
                          <p className="text-gray-400 text-sm">Ingresos</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>

            {/* Storage Monitor */}
            {storageStats && (
              <Card className="bg-gray-800 border-gray-700 p-4 md:p-6 mb-6 md:mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 md:w-5 md:h-5 text-[#FF6B35]" />
                    Almacenamiento de Imágenes
                  </h2>
                  <span className="text-sm text-gray-400">
                    {storageStats.usedMB.toFixed(2)} MB / {storageStats.limitMB} MB
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(storageStats.percentUsed, 100)}%`,
                      backgroundColor: storageStats.percentUsed > 80 ? "#EF4444" : storageStats.percentUsed > 60 ? "#F59E0B" : "#FF6B35",
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {storageStats.percentUsed.toFixed(1)}% utilizado
                  {storageStats.percentUsed > 80 && (
                    <span className="text-red-400 ml-2">⚠️ Límite próximo — considera eliminar imágenes no usadas</span>
                  )}
                </p>
              </Card>
            )}

            {/* Recent Orders */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Pedidos Recientes
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => setActiveTab("orders")}
                >
                  Ver Todos
                </Button>
              </div>

              {!hasLoadedOrders ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#FF6B35]" />
                  <span className="ml-3 text-gray-400">Cargando pedidos...</span>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay pedidos aún</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="text-white font-bold">{order.orderNumber}</span>
                          <span className="text-gray-400 text-sm">hace {getTimeAgo(order.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <span className="text-white font-bold">${order.total.toFixed(2)}</span>
                        <span
                          className={`${getStatusColor(order.status)} text-white px-3 py-1 rounded-full text-sm font-medium`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}

        {activeTab === "orders" && (
            <div className="space-y-6">
              {/* Tracking Section Control */}
              <Card className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border-blue-500/30 p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">
                      📍 Rastreo de Pedidos
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Activa o desactiva el servicio de rastreo de pedidos para tus clientes. Si no cuentas con repartidor, puedes desactivarlo.
                    </p>
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={handleToggleTrackingSection}
                        disabled={isUpdatingTrackingSetting}
                        className={`${
                          trackingSectionEnabled 
                            ? "bg-orange-600 hover:bg-orange-700" 
                            : "bg-green-600 hover:bg-green-700"
                        } text-white font-bold`}
                      >
                        {isUpdatingTrackingSetting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : trackingSectionEnabled ? (
                          <XCircle className="w-4 h-4 mr-2" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        {trackingSectionEnabled ? "Desactivar Rastreo" : "Activar Rastreo"}
                      </Button>
                      <span className={`px-3 py-2 rounded-full text-sm font-medium border ${
                        trackingSectionEnabled
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-gray-600/50 text-gray-400 border-gray-600"
                      }`}>
                        {trackingSectionEnabled ? "✓ Activo" : "✗ Inactivo"}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-gray-800 border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  Gestión de Pedidos ({filteredOrders.length})
                </h2>

                <select
                  value={selectedStatusFilter || ""}
                  onChange={(e) => setSelectedStatusFilter(e.target.value || null)}
                  className="bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Todos los estados</option>
                  <option value="preparing">Preparando</option>
                  <option value="cooking">Cocinando</option>
                  <option value="packing">Empacando</option>
                  <option value="ready">Listo</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              {!hasLoadedOrders ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#FF6B35]" />
                  <span className="ml-3 text-gray-400">Cargando pedidos...</span>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay pedidos para mostrar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-white font-bold text-lg">{order.orderNumber}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} text-white`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-gray-300 text-sm">👤 {order.customerName}</p>
                            <p className="text-gray-400 text-sm">📞 {order.phone}</p>
                            <p className="text-gray-400 text-sm">🕐 Hace {getTimeAgo(order.createdAt)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[#FF6B35] font-bold text-xl">${order.total.toFixed(2)}</p>
                        </div>
                      </div>

                      {order.status !== "completed" && order.status !== "cancelled" && (
                        <div className="flex gap-2 flex-wrap">
                          {order.status === "preparing" && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id, "cooking")}
                              className="bg-orange-600 hover:bg-orange-700 text-white"
                            >
                              → Cocinando
                            </Button>
                          )}
                          {order.status === "cooking" && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id, "packing")}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              → Empacando
                            </Button>
                          )}
                          {order.status === "packing" && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id, "ready")}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              → Listo
                            </Button>
                          )}
                          {order.status === "ready" && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id, "completed")}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              ✓ Completar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUpdateOrderStatus(order.id, "cancelled")}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            ✗ Cancelar
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === "categories" && (
          <div className="space-y-6">
            {/* Add New Category */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <Plus className="w-5 h-5" />
                Agregar Nueva Categoría
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Nombre</label>
                    <Input
                      placeholder="ej: Tacos"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Emoji</label>
                    <Input
                      placeholder="ej: 🌮"
                      value={newCategory.emoji}
                      onChange={(e) => setNewCategory({ ...newCategory, emoji: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 text-2xl"
                      maxLength={4}
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      💡 Windows: Win + . | Mac: Cmd + Ctrl + Espacio | Móvil: Teclado de emojis
                    </p>
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Imagen</label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                        onClick={() => document.getElementById("category-image-upload")?.click()}
                        disabled={uploadingCategoryImage}
                      >
                        {uploadingCategoryImage ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        Subir
                      </Button>
                      <input
                        id="category-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(
                              file,
                              setUploadingCategoryImage,
                              (url, publicId, size) => {
                                setNewCategory({ ...newCategory, image: url, imagePublicId: publicId ?? "", imageSize: size ?? 0 });
                              },
                              newCategory.imagePublicId || null
                            );
                          }
                        }}
                      />
                      {newCategory.image && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:text-red-300"
                          onClick={() => setNewCategory({ ...newCategory, image: "" })}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {newCategory.image && (
                  <div className="flex justify-center">
                    <img
                      src={newCategory.image}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-600"
                    />
                  </div>
                )}

                <Button
                  onClick={handleAddCategory}
                  className="w-full bg-[#FF6B35] hover:bg-[#FF8E53] text-white font-bold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Categoría
                </Button>
              </div>
            </Card>

            {/* Categories List */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <FolderOpen className="w-5 h-5" />
                Lista de Categorías ({categories.length})
              </h2>

              {!hasLoadedCategories ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#FF6B35]" />
                  <span className="ml-3 text-gray-400">Cargando categorías...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {categories.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No hay categorías registradas</p>
                    </div>
                  ) : (
                    categories.map((category) => {
                      const productCount = getProductCount(category.id);
                      return (
                        <div
                          key={category.id}
                          className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.name}
                                className="w-16 h-16 object-cover rounded-lg border-2 border-gray-600"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center text-3xl">
                                {category.emoji}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-3">
                                <span className="text-white font-bold text-lg">{category.name}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  category.active 
                                    ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                                    : "bg-gray-600/50 text-gray-400 border border-gray-600"
                                }`}>
                                  {category.active ? "✓ Activa" : "✗ Inactiva"}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-gray-400 text-sm">ID: {category.id}</span>
                                <span className="text-gray-400 text-sm">•</span>
                                <span className="text-gray-400 text-sm">{productCount} producto(s)</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {category.imagePublicId && (
                              <Button
                                variant="outline"
                                size="sm"
                                title="Eliminar imagen"
                                onClick={() => handleDeleteImage(
                                  category.imagePublicId!,
                                  () => setCategories(categories.map(c => c.id === category.id ? { ...c, image: null, imagePublicId: null, imageSize: null } : c)),
                                  "category",
                                  category.id
                                )}
                                className="border-gray-600 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                              >
                                <ImageIcon className="w-3 h-3 mr-1" />
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleCategory(category.id)}
                              className={`border-gray-600 ${
                                category.active
                                  ? "text-orange-400 hover:bg-orange-500/20"
                                  : "text-green-400 hover:bg-green-500/20"
                              }`}
                            >
                              {category.active ? "Desactivar" : "Activar"}
                            </Button>

                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={productCount > 0}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Add New Product */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <Plus className="w-5 h-5" />
                Agregar Nuevo Producto
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Nombre *</label>
                    <Input
                      placeholder="Taco al Pastor"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Precio *</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="3.50"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Categoría</label>
                    <select
                      value={newProduct.categoryId}
                      onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2"
                    >
                      <option value="">Sin categoría</option>
                      {categories.filter(c => c.active).map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.emoji} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Stock Inicial</label>
                    <Input
                      type="number"
                      placeholder="20"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-gray-400 text-sm mb-2 block">Descripción</label>
                    <Input
                      placeholder="Carne de cerdo marinada con piña..."
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Imagen del Producto</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      onClick={() => document.getElementById("product-image-upload")?.click()}
                      disabled={uploadingProductImage}
                    >
                      {uploadingProductImage ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Subir Imagen
                    </Button>
                    <input
                      id="product-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(
                            file,
                            setUploadingProductImage,
                            (url, publicId, size) => {
                              setNewProduct({ ...newProduct, image: url, imagePublicId: publicId ?? "", imageSize: size ?? 0 });
                            },
                            newProduct.imagePublicId || null
                          );
                        }
                      }}
                    />
                    {newProduct.image && (
                      <>
                        <span className="text-green-400 text-sm flex items-center">
                          ✓ Imagen cargada
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                          onClick={() => setNewProduct({ ...newProduct, image: "" })}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Quitar
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {newProduct.image && (
                  <div className="flex justify-center">
                    <img
                      src={newProduct.image}
                      alt="Preview"
                      className="w-48 h-48 object-cover rounded-lg border-2 border-gray-600"
                    />
                  </div>
                )}

                <Button
                  onClick={handleAddProduct}
                  className="w-full bg-[#FF6B35] hover:bg-[#FF8E53] text-white font-bold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Producto
                </Button>
              </div>
            </Card>

            {/* Products List */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Lista de Productos ({filteredProducts.length})
                </h2>

                <div className="flex items-center gap-3">
                  <select
                    value={selectedCategoryFilter || ""}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value ? parseInt(e.target.value) : null)}
                    className="bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.name} ({getProductCount(cat.id)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!hasLoadedProducts ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#FF6B35]" />
                  <span className="ml-3 text-gray-400">Cargando productos...</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay productos registrados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No hay productos registrados</p>
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                      >
                        {editingProduct?.id === product.id ? (
                          // Edit Mode
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div>
                                <label className="text-gray-400 text-xs mb-1 block">Nombre</label>
                                <Input
                                  value={editingProduct.name}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                  className="bg-gray-600 border-gray-500 text-white text-sm"
                                />
                              </div>

                              <div>
                                <label className="text-gray-400 text-xs mb-1 block">Precio</label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={editingProduct.price}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                                  className="bg-gray-600 border-gray-500 text-white text-sm"
                                />
                              </div>

                              <div>
                                <label className="text-gray-400 text-xs mb-1 block">Stock</label>
                                <Input
                                  type="number"
                                  value={editingProduct.stock}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })}
                                  className="bg-gray-600 border-gray-500 text-white text-sm"
                                />
                              </div>

                              <div>
                                <label className="text-gray-400 text-xs mb-1 block">Categoría</label>
                                <select
                                  value={editingProduct.categoryId || ""}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value ? parseInt(e.target.value) : null })}
                                  className="w-full bg-gray-600 border border-gray-500 text-white rounded-md px-2 py-2 text-sm"
                                >
                                  <option value="">Sin categoría</option>
                                  {categories.filter(c => c.active).map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                      {cat.emoji} {cat.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="md:col-span-2 lg:col-span-3">
                                <label className="text-gray-400 text-xs mb-1 block">Descripción</label>
                                <Input
                                  value={editingProduct.description || ""}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                  className="bg-gray-600 border-gray-500 text-white text-sm"
                                />
                              </div>

                              <div className="flex items-end gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-500 text-gray-300"
                                  onClick={() => document.getElementById(`edit-image-${editingProduct.id}`)?.click()}
                                  disabled={uploadingEditImage}
                                >
                                  {uploadingEditImage ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Upload className="w-3 h-3" />
                                  )}
                                </Button>
                                <input
                                  id={`edit-image-${editingProduct.id}`}
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleImageUpload(
                                        file,
                                        setUploadingEditImage,
                                        (url, publicId, size) => {
                                          setEditingProduct({ ...editingProduct, image: url, imagePublicId: publicId ?? editingProduct.imagePublicId, imageSize: size ?? editingProduct.imageSize });
                                        },
                                        editingProduct.imagePublicId || null
                                      );
                                    }
                                  }}
                                />
                              </div>
                            </div>

                            {editingProduct.image && (
                              <div className="flex items-center gap-3">
                                <img
                                  src={editingProduct.image}
                                  alt="Preview"
                                  className="w-24 h-24 object-cover rounded-lg border-2 border-gray-500"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-400 hover:text-red-300"
                                  onClick={() => setEditingProduct({ ...editingProduct, image: null })}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Quitar imagen
                                </Button>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Button
                                onClick={handleSaveProduct}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                size="sm"
                              >
                                <Save className="w-4 h-4 mr-1" />
                                Guardar
                              </Button>
                              <Button
                                onClick={() => setEditingProduct(null)}
                                variant="outline"
                                className="border-gray-600 text-gray-300"
                                size="sm"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-20 h-20 object-cover rounded-lg border-2 border-gray-600"
                                />
                              ) : (
                                <div className="w-20 h-20 bg-gray-600 rounded-lg flex items-center justify-center">
                                  <ImageIcon className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-white font-bold text-lg">{product.name}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    product.active 
                                      ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                                      : "bg-gray-600/50 text-gray-400 border border-gray-600"
                                  }`}>
                                    {product.active ? "✓ Activo" : "✗ Inactivo"}
                                  </span>
                                  {product.featured && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/30">
                                      ⭐ Destacado
                                    </span>
                                  )}
                                  {product.stock <= 5 && product.stock > 0 && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                      ⚠️ Stock bajo
                                    </span>
                                  )}
                                  {product.stock === 0 && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                                      🚫 Agotado
                                    </span>
                                  )}
                                </div>
                                {product.description && (
                                  <p className="text-gray-400 text-sm mb-2">{product.description}</p>
                                )}
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="text-[#FF6B35] font-bold">${product.price.toFixed(2)}</span>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-gray-400">{getCategoryName(product.categoryId)}</span>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-gray-400">Stock: {product.stock}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleFeatured(product.id, product.featured)}
                                className={`border-gray-600 ${
                                  product.featured
                                    ? "text-orange-400 hover:bg-orange-500/20"
                                    : "text-yellow-400 hover:bg-yellow-500/20"
                                }`}
                                title={product.featured ? "Quitar de destacados" : "Marcar como destacado"}
                              >
                                <Star className={`w-4 h-4 ${product.featured ? "fill-orange-400" : ""}`} />
                              </Button>

                              {product.imagePublicId && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  title="Eliminar imagen"
                                  onClick={() => handleDeleteImage(
                                    product.imagePublicId!,
                                    () => setProducts(products.map(p => p.id === product.id ? { ...p, image: null, imagePublicId: null, imageSize: null } : p)),
                                    "product",
                                    product.id
                                  )}
                                  className="border-gray-600 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                                >
                                  <ImageIcon className="w-3 h-3 mr-1" />
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                                className="border-gray-600 text-blue-400 hover:bg-blue-500/20"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleProduct(product.id)}
                                className={`border-gray-600 ${
                                  product.active
                                    ? "text-orange-400 hover:bg-orange-500/20"
                                    : "text-green-400 hover:bg-green-500/20"
                                }`}
                              >
                                {product.active ? "Desactivar" : "Activar"}
                              </Button>

                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteProduct(product.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === "coupons" && (
          <div className="space-y-6">
            {/* Add New Coupon */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <Plus className="w-5 h-5" />
                Crear Nuevo Cupón
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Código *</label>
                    <Input
                      placeholder="PORKY10"
                      value={newCoupon.code}
                      onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Tipo *</label>
                    <select
                      value={newCoupon.type}
                      onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2"
                    >
                      <option value="percentage">Porcentaje (%)</option>
                      <option value="fixed">Monto Fijo ($)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Valor *</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={newCoupon.type === "percentage" ? "10" : "5.00"}
                      value={newCoupon.value}
                      onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Compra Mínima</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="20.00"
                      value={newCoupon.minPurchase}
                      onChange={(e) => setNewCoupon({ ...newCoupon, minPurchase: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Descuento Máximo</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="50.00"
                      value={newCoupon.maxDiscount}
                      onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Límite de Usos</label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={newCoupon.usageLimit}
                      onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Fecha Inicio</label>
                    <Input
                      type="date"
                      value={newCoupon.startDate}
                      onChange={(e) => setNewCoupon({ ...newCoupon, startDate: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Fecha Fin</label>
                    <Input
                      type="date"
                      value={newCoupon.endDate}
                      onChange={(e) => setNewCoupon({ ...newCoupon, endDate: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddCoupon}
                  className="w-full bg-[#FF6B35] hover:bg-[#FF8E53] text-white font-bold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Cupón
                </Button>
              </div>
            </Card>

            {/* Coupons List */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <Tag className="w-5 h-5" />
                Lista de Cupones ({coupons.length})
              </h2>

              {!hasLoadedCoupons ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#FF6B35]" />
                  <span className="ml-3 text-gray-400">Cargando cupones...</span>
                </div>
              ) : coupons.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay cupones registrados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {coupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                    >
                      {editingCoupon?.id === coupon.id ? (
                        // Edit Mode
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                              <label className="text-gray-400 text-xs mb-1 block">Código</label>
                              <Input
                                value={editingCoupon.code}
                                onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                                className="bg-gray-600 border-gray-500 text-white text-sm uppercase"
                              />
                            </div>

                            <div>
                              <label className="text-gray-400 text-xs mb-1 block">Tipo</label>
                              <select
                                value={editingCoupon.type}
                                onChange={(e) => setEditingCoupon({ ...editingCoupon, type: e.target.value })}
                                className="w-full bg-gray-600 border border-gray-500 text-white rounded-md px-2 py-2 text-sm"
                              >
                                <option value="percentage">Porcentaje</option>
                                <option value="fixed">Fijo</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-gray-400 text-xs mb-1 block">Valor</label>
                              <Input
                                type="number"
                                step="0.01"
                                value={editingCoupon.value}
                                onChange={(e) => setEditingCoupon({ ...editingCoupon, value: parseFloat(e.target.value) })}
                                className="bg-gray-600 border-gray-500 text-white text-sm"
                              />
                            </div>

                            <div>
                              <label className="text-gray-400 text-xs mb-1 block">Límite</label>
                              <Input
                                type="number"
                                value={editingCoupon.usageLimit || ""}
                                onChange={(e) => setEditingCoupon({ ...editingCoupon, usageLimit: e.target.value ? parseInt(e.target.value) : null })}
                                className="bg-gray-600 border-gray-500 text-white text-sm"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={handleSaveCoupon}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              size="sm"
                            >
                              <Save className="w-4 h-4 mr-1" />
                              Guardar
                            </Button>
                            <Button
                              onClick={() => setEditingCoupon(null)}
                              variant="outline"
                              className="border-gray-600 text-gray-300"
                              size="sm"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-white font-bold text-xl">{coupon.code}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                coupon.active 
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                                  : "bg-gray-600/50 text-gray-400 border border-gray-600"
                              }`}>
                                {coupon.active ? "✓ Activo" : "✗ Inactivo"}
                              </span>
                              {isCouponExpired(coupon) && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                                  ⏰ Expirado
                                </span>
                              )}
                              {isCouponLimitReached(coupon) && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                  🚫 Límite Alcanzado
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Descuento:</span>
                                <p className="text-[#FF6B35] font-bold">
                                  {coupon.type === "percentage" ? `${coupon.value}%` : `$${coupon.value}`}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-400">Usos:</span>
                                <p className="text-white font-medium">
                                  {coupon.usedCount} / {coupon.usageLimit || "∞"}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-400">Compra Mín:</span>
                                <p className="text-white">
                                  {coupon.minPurchase ? `$${coupon.minPurchase}` : "Sin mínimo"}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-400">Vigencia:</span>
                                <p className="text-white text-xs">
                                  {formatDate(coupon.endDate)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCoupon(coupon)}
                              className="border-gray-600 text-blue-400 hover:bg-blue-500/20"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleCoupon(coupon.id)}
                              className={`border-gray-600 ${
                                coupon.active 
                                  ? "text-orange-400 hover:bg-orange-500/20" 
                                  : "text-green-400 hover:bg-green-500/20"
                              }`}
                            >
                              {coupon.active ? "Desactivar" : "Activar"}
                            </Button>

                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteCoupon(coupon.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === "inventory" && (
          <div className="space-y-6">
            {/* Inventory Overview Stats */}
            {inventoryReport && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 p-6">
                  <div className="text-white">
                    <p className="text-blue-200 text-sm mb-2">Valor Total Stock</p>
                    <p className="text-3xl font-bold">${inventoryReport.total_stock_value.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">{inventoryReport.active_products} productos activos</span>
                    </div>
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-600 to-yellow-700 border-0 p-6">
                  <div className="text-white">
                    <p className="text-yellow-200 text-sm mb-2">Stock Bajo</p>
                    <p className="text-3xl font-bold">{inventoryReport.low_stock_count}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">≤ 10 unidades</span>
                    </div>
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-red-600 to-red-700 border-0 p-6">
                  <div className="text-white">
                    <p className="text-red-200 text-sm mb-2">Agotados</p>
                    <p className="text-3xl font-bold">{inventoryReport.out_of_stock_count}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <PackageCheck className="w-4 h-4" />
                      <span className="text-sm">0 unidades disponibles</span>
                    </div>
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0 p-6">
                  <div className="text-white">
                    <p className="text-purple-200 text-sm mb-2">Movimientos Recientes</p>
                    <p className="text-3xl font-bold">{inventoryReport.recent_movements_count}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <History className="w-4 h-4" />
                      <span className="text-sm">Últimos 7 días</span>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Low Stock Alert */}
            {lowStockProducts.length > 0 && (
              <Card className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-yellow-500/30 p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-yellow-500 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">
                      ⚠️ Alerta: Productos con Stock Bajo
                    </h3>
                    <p className="text-gray-300 mb-4">
                      {lowStockProducts.length} producto(s) requieren reabastecimiento urgente
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {lowStockProducts.slice(0, 6).map((product) => (
                        <div
                          key={product.id}
                          className="bg-gray-800/50 rounded-lg p-3 border border-yellow-500/30"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-white font-bold text-sm">{product.name}</p>
                              <p className="text-gray-400 text-xs">{getCategoryName(product.categoryId)}</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-2xl font-bold ${
                                product.stock === 0 ? "text-red-400" : "text-yellow-400"
                              }`}>
                                {product.stock}
                              </p>
                              <p className="text-gray-400 text-xs">unidades</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {lowStockProducts.length > 6 && (
                      <p className="text-gray-400 text-sm mt-3">
                        + {lowStockProducts.length - 6} producto(s) más con stock bajo
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Manual Inventory Adjustment */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <RefreshCw className="w-5 h-5" />
                Ajuste Manual de Inventario
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Producto *</label>
                    <select
                      value={adjustmentForm.productId}
                      onChange={(e) => setAdjustmentForm({ ...adjustmentForm, productId: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2"
                    >
                      <option value="">Seleccionar producto</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} (Stock actual: {product.stock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Nuevo Stock *</label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="100"
                      value={adjustmentForm.newStock}
                      onChange={(e) => setAdjustmentForm({ ...adjustmentForm, newStock: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Razón *</label>
                    <Input
                      placeholder="Conteo físico, daño, etc."
                      value={adjustmentForm.reason}
                      onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Realizado por *</label>
                    <Input
                      placeholder="Nombre del admin"
                      value={adjustmentForm.createdBy}
                      onChange={(e) => setAdjustmentForm({ ...adjustmentForm, createdBy: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleInventoryAdjustment}
                  className="w-full bg-[#FF6B35] hover:bg-[#FF8E53] text-white font-bold"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Ajustar Inventario
                </Button>
              </div>
            </Card>

            {/* Inventory Movements History */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Historial de Movimientos ({inventoryMovements.length})
                </h2>

                <div className="flex items-center gap-3">
                  <select
                    value={selectedProductForMovements || ""}
                    onChange={(e) => {
                      setSelectedProductForMovements(e.target.value ? parseInt(e.target.value) : null);
                      fetchInventoryMovements();
                    }}
                    className="bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Todos los productos</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={movementFilter || ""}
                    onChange={(e) => {
                      setMovementFilter(e.target.value || null);
                      fetchInventoryMovements();
                    }}
                    className="bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Todos los tipos</option>
                    <option value="addition">Reabastecimiento</option>
                    <option value="sale">Ventas</option>
                    <option value="reduction">Reducción</option>
                    <option value="adjustment">Ajustes</option>
                    <option value="return">Devoluciones</option>
                  </select>
                </div>
              </div>

              {!hasLoadedInventory ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#FF6B35]" />
                  <span className="ml-3 text-gray-400">Cargando movimientos...</span>
                </div>
              ) : inventoryMovements.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay movimientos de inventario registrados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inventoryMovements.map((movement) => (
                    <div
                      key={movement.id}
                      className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="bg-gray-600 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                            {getMovementIcon(movement.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-white font-bold">{movement.productName}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getMovementColor(movement.type)}`}>
                                {getMovementLabel(movement.type)}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Cantidad:</span>
                                <p className={`font-bold ${
                                  movement.type === "addition" || movement.type === "return" 
                                    ? "text-green-400" 
                                    : "text-red-400"
                                }`}>
                                  {movement.type === "addition" || movement.type === "return" ? "+" : "-"}
                                  {Math.abs(movement.quantity)}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-400">Stock Anterior:</span>
                                <p className="text-white font-medium">{movement.previousStock}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Stock Nuevo:</span>
                                <p className="text-white font-medium">{movement.newStock}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Fecha:</span>
                                <p className="text-white text-xs">
                                  {new Date(movement.createdAt).toLocaleString("es-ES")}
                                </p>
                              </div>
                            </div>
                            {movement.reason && (
                              <p className="text-gray-400 text-sm mt-2">
                                📝 {movement.reason}
                              </p>
                            )}
                            {movement.createdBy && (
                              <p className="text-gray-500 text-xs mt-1">
                                Por: {movement.createdBy}
                              </p>
                            )}
                            {movement.orderId && (
                              <p className="text-blue-400 text-xs mt-1">
                                🧾 Pedido #{movement.orderId}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === "postal-codes" && (
          <div className="space-y-6">
            {/* Add New Postal Code */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <Plus className="w-5 h-5" />
                Agregar Código Postal
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Código Postal *</label>
                    <Input
                      placeholder="44100"
                      value={newPostalCode.code}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 5) {
                          setNewPostalCode({ ...newPostalCode, code: value });
                        }
                      }}
                      maxLength={5}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Municipio</label>
                    <Input
                      placeholder="Guadalajara"
                      value={newPostalCode.municipality}
                      onChange={(e) => setNewPostalCode({ ...newPostalCode, municipality: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Estado</label>
                    <Input
                      placeholder="Jalisco"
                      value={newPostalCode.state}
                      onChange={(e) => setNewPostalCode({ ...newPostalCode, state: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Costo de Envío *</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="35.00"
                      value={newPostalCode.deliveryCost}
                      onChange={(e) => setNewPostalCode({ ...newPostalCode, deliveryCost: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddPostalCode}
                  className="w-full bg-[#FF6B35] hover:bg-[#FF8E53] text-white font-bold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Código Postal
                </Button>
              </div>
            </Card>

            {/* Postal Codes List */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5" />
                Códigos Postales Configurados ({postalCodes.length})
              </h2>

              {!hasLoadedPostalCodes ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#FF6B35]" />
                  <span className="ml-3 text-gray-400">Cargando códigos postales...</span>
                </div>
              ) : postalCodes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay códigos postales registrados</p>
                  <p className="text-sm mt-2">Agrega códigos postales para delimitar tus áreas de entrega</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {postalCodes.map((postalCode) => (
                    <div
                      key={postalCode.id}
                      className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                    >
                      {editingPostalCode?.id === postalCode.id ? (
                        // Edit Mode
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <label className="text-gray-400 text-xs mb-1 block">Código Postal</label>
                              <Input
                                value={editingPostalCode.code}
                                disabled
                                className="bg-gray-600 border-gray-500 text-white text-sm opacity-50"
                              />
                            </div>

                            <div>
                              <label className="text-gray-400 text-xs mb-1 block">Municipio</label>
                              <Input
                                value={editingPostalCode.municipality || ""}
                                onChange={(e) => setEditingPostalCode({ ...editingPostalCode, municipality: e.target.value })}
                                className="bg-gray-600 border-gray-500 text-white text-sm"
                              />
                            </div>

                            <div>
                              <label className="text-gray-400 text-xs mb-1 block">Estado</label>
                              <Input
                                value={editingPostalCode.state || ""}
                                onChange={(e) => setEditingPostalCode({ ...editingPostalCode, state: e.target.value })}
                                className="bg-gray-600 border-gray-500 text-white text-sm"
                              />
                            </div>

                            <div>
                              <label className="text-gray-400 text-xs mb-1 block">Costo de Envío</label>
                              <Input
                                type="number"
                                step="0.01"
                                value={editingPostalCode.deliveryCost}
                                onChange={(e) => setEditingPostalCode({ ...editingPostalCode, deliveryCost: parseFloat(e.target.value) })}
                                className="bg-gray-600 border-gray-500 text-white text-sm"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={handleSavePostalCode}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              size="sm"
                            >
                              <Save className="w-4 h-4 mr-1" />
                              Guardar
                            </Button>
                            <Button
                              onClick={() => setEditingPostalCode(null)}
                              variant="outline"
                              className="border-gray-600 text-gray-300"
                              size="sm"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-white font-bold text-2xl">📮 {postalCode.code}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                postalCode.active 
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                                  : "bg-gray-600/50 text-gray-400 border border-gray-600"
                              }`}>
                                {postalCode.active ? "✓ Activo" : "✗ Inactivo"}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Ubicación:</span>
                                <p className="text-white font-medium">
                                  {postalCode.municipality && postalCode.state 
                                    ? `${postalCode.municipality}, ${postalCode.state}`
                                    : postalCode.municipality || postalCode.state || "No especificado"}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-400">Costo de Envío:</span>
                                <p className="text-[#FF6B35] font-bold text-lg">
                                  ${postalCode.deliveryCost.toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-400">Agregado:</span>
                                <p className="text-white text-xs">
                                  {new Date(postalCode.createdAt).toLocaleDateString("es-ES")}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditPostalCode(postalCode)}
                              className="border-gray-600 text-blue-400 hover:bg-blue-500/20"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTogglePostalCode(postalCode.id)}
                              className={`border-gray-600 ${
                                postalCode.active 
                                  ? "text-orange-400 hover:bg-orange-500/20" 
                                  : "text-green-400 hover:bg-green-500/20"
                              }`}
                            >
                              {postalCode.active ? "Desactivar" : "Activar"}
                            </Button>

                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeletePostalCode(postalCode.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Info Card */}
            <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-500/30 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    💡 ¿Cómo funcionan los Códigos Postales?
                  </h3>
                  <ul className="text-gray-300 space-y-2 text-sm">
                    <li>• Solo los códigos postales <strong>activos</strong> estarán disponibles para entrega</li>
                    <li>• Puedes personalizar el <strong>costo de envío</strong> para cada código postal</li>
                    <li>• Los clientes verán un error si su código postal <strong>no está registrado</strong></li>
                    <li>• Desactiva códigos postales temporalmente sin eliminarlos</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "promotions" && (
          <div className="space-y-6">
            {/* Add New Banner */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <Plus className="w-5 h-5" />
                Crear Banner Promocional
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Título *</label>
                    <Input
                      placeholder="¡Primera orden con 20% descuento!"
                      value={newBanner.title}
                      onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Descripción * (máx 120 caracteres)</label>
                    <Input
                      placeholder="Válido en tu primer pedido. No acumulable."
                      value={newBanner.description}
                      onChange={(e) => setNewBanner({ ...newBanner, description: e.target.value })}
                      maxLength={120}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      {newBanner.description.length}/120 caracteres
                    </p>
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Código de Cupón (opcional)</label>
                    <Input
                      placeholder="PORKY2025"
                      value={newBanner.couponCode}
                      onChange={(e) => setNewBanner({ ...newBanner, couponCode: e.target.value.toUpperCase() })}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 uppercase"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddBanner}
                  className="w-full bg-[#FF6B35] hover:bg-[#FF8E53] text-white font-bold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Banner
                </Button>
              </div>
            </Card>

            {/* Current Banner */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <Tag className="w-5 h-5" />
                Banner Activo
              </h2>

              {!hasLoadedPromotions ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#FF6B35]" />
                  <span className="ml-3 text-gray-400">Cargando banner...</span>
                </div>
              ) : promotionalBanners.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay banner activo</p>
                  <p className="text-sm mt-2">Crea un banner arriba para mostrarlo en la homepage</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {promotionalBanners.map((banner) => (
                    <div
                      key={banner.id}
                      className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                    >
                      {editingBanner?.id === banner.id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="text-gray-400 text-xs mb-1 block">Título</label>
                              <Input
                                value={editingBanner.title}
                                onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                                className="bg-gray-600 border-gray-500 text-white text-sm"
                              />
                            </div>

                            <div>
                              <label className="text-gray-400 text-xs mb-1 block">Descripción</label>
                              <Input
                                value={editingBanner.description}
                                onChange={(e) => setEditingBanner({ ...editingBanner, description: e.target.value })}
                                maxLength={120}
                                className="bg-gray-600 border-gray-500 text-white text-sm"
                              />
                              <p className="text-gray-500 text-xs mt-1">
                                {editingBanner.description.length}/120
                              </p>
                            </div>

                            <div>
                              <label className="text-gray-400 text-xs mb-1 block">Código de Cupón</label>
                              <Input
                                value={editingBanner.couponCode || ""}
                                onChange={(e) => setEditingBanner({ ...editingBanner, couponCode: e.target.value.toUpperCase() })}
                                className="bg-gray-600 border-gray-500 text-white text-sm uppercase"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={handleSaveBanner}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              size="sm"
                            >
                              <Save className="w-4 h-4 mr-1" />
                              Guardar
                            </Button>
                            <Button
                              onClick={() => setEditingBanner(null)}
                              variant="outline"
                              className="border-gray-600 text-gray-300"
                              size="sm"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-white font-bold text-lg">{banner.title}</span>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                ✓ Activo
                              </span>
                            </div>
                            <p className="text-gray-300 text-sm mb-2">{banner.description}</p>
                            {banner.couponCode && (
                              <p className="text-[#FF6B35] font-bold text-sm">
                                Código: {banner.couponCode}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditBanner(banner)}
                              className="border-gray-600 text-blue-400 hover:bg-blue-500/20"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteBanner(banner.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Info Card */}
            <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-500/30 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Tag className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    💡 Gestión de Promociones
                  </h3>
                  <ul className="text-gray-300 space-y-2 text-sm">
                    <li>• El <strong>banner promocional</strong> se muestra arriba de la homepage para captar atención inmediata</li>
                    <li>• Solo puedes tener <strong>un banner activo</strong> a la vez para mantener el mensaje claro</li>
                    <li>• Combina banners con cupones existentes para <strong>maximizar conversión</strong></li>
                    <li>• Para gestionar <strong>productos destacados</strong>, ve al tab de <strong>Productos</strong> y usa el botón ⭐</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-6">
            {/* Reviews Section Control */}
            <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    💡 Control de Sección de Reseñas
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Activa o desactiva la sección de reseñas en la homepage
                  </p>
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={handleToggleReviewsSection}
                      disabled={isUpdatingReviewsSetting}
                      className={`${
                        reviewsSectionEnabled 
                          ? "bg-orange-600 hover:bg-orange-700" 
                          : "bg-green-600 hover:bg-green-700"
                      } text-white font-bold`}
                    >
                      {isUpdatingReviewsSetting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : reviewsSectionEnabled ? (
                        <XCircle className="w-4 h-4 mr-2" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      {reviewsSectionEnabled ? "Desactivar Reseñas en Homepage" : "Activar Reseñas en Homepage"}
                    </Button>
                    <span className={`px-3 py-2 rounded-full text-sm font-medium border ${
                      reviewsSectionEnabled
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-gray-600/50 text-gray-400 border-gray-600"
                    }`}>
                      {reviewsSectionEnabled ? "✓ Activa" : "✗ Inactiva"}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Review Stats */}
            {reviewStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card className="bg-gray-800 border-gray-700 p-6 hover:border-[#FF6B35] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Total Reseñas</p>
                      <p className="text-3xl font-bold text-white">{reviewStats.total}</p>
                    </div>
                    <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </Card>

                <Card className="bg-gray-800 border-gray-700 p-6 hover:border-yellow-500 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Pendientes</p>
                      <p className="text-3xl font-bold text-yellow-400">{reviewStats.pending}</p>
                    </div>
                    <div className="bg-yellow-500 w-12 h-12 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </Card>

                <Card className="bg-gray-800 border-gray-700 p-6 hover:border-green-500 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Aprobadas</p>
                      <p className="text-3xl font-bold text-green-400">{reviewStats.approved}</p>
                    </div>
                    <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center">
                      <ThumbsUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </Card>

                <Card className="bg-gray-800 border-gray-700 p-6 hover:border-red-500 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Rechazadas</p>
                      <p className="text-3xl font-bold text-red-400">{reviewStats.rejected}</p>
                    </div>
                    <div className="bg-red-500 w-12 h-12 rounded-lg flex items-center justify-center">
                      <ThumbsDown className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-orange-600 to-yellow-600 border-0 p-6">
                  <div className="text-white">
                    <p className="text-orange-200 text-sm mb-1">Calificación</p>
                    <p className="text-3xl font-bold">{reviewStats.averageRating.toFixed(1)}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.round(reviewStats.averageRating)
                              ? "fill-white text-white"
                              : "text-white/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Rating Distribution */}
            {reviewStats && (
              <Card className="bg-gray-800 border-gray-700 p-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                  <BarChart3 className="w-5 h-5" />
                  Distribución de Calificaciones
                </h2>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = reviewStats.ratingDistribution[rating.toString()] || 0;
                    const percentage = reviewStats.approved > 0 ? (count / reviewStats.approved) * 100 : 0;
                    return (
                      <div key={rating} className="flex items-center gap-4">
                        <div className="flex items-center gap-1 w-24">
                          <span className="text-white font-medium">{rating}</span>
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        </div>
                        <div className="flex-1 bg-gray-700 rounded-full h-6 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-[#FF6B35] to-[#FF8E53] h-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-gray-400 w-16 text-right">{count} ({percentage.toFixed(0)}%)</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Reviews List */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Moderación de Reseñas ({reviews.length})
                </h2>

                <select
                  value={reviewStatusFilter || ""}
                  onChange={(e) => {
                    setReviewStatusFilter(e.target.value || null);
                    fetchReviews();
                  }}
                  className="bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Todos los estados</option>
                  <option value="pending">Pendientes</option>
                  <option value="approved">Aprobadas</option>
                  <option value="rejected">Rechazadas</option>
                </select>
              </div>

              {!hasLoadedReviews ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#FF6B35]" />
                  <span className="ml-3 text-gray-400">Cargando reseñas...</span>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay reseñas para mostrar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-gray-700/50 rounded-lg p-6 hover:bg-gray-700 transition-colors"
                    >
                      {/* Review Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                            {review.userName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-white font-bold">{review.userName}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getReviewStatusBadge(review.status)}`}>
                                {getReviewStatusLabel(review.status)}
                              </span>
                              {review.isVerifiedPurchase && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                  ✓ Compra Verificada
                                </span>
                              )}
                              {review.reportedCount > 0 && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                                  <Flag className="w-3 h-3" />
                                  {review.reportedCount} reportes
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm">{review.userEmail}</p>
                            <p className="text-gray-500 text-xs mt-1">
                              {new Date(review.createdAt).toLocaleString("es-ES")}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-500"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Review Content */}
                      <div className="mb-4">
                        <p className="text-white text-lg leading-relaxed">{review.comment}</p>
                      </div>

                      {/* Technical Info */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 text-xs">
                        {review.ipAddress && (
                          <div className="bg-gray-800/50 rounded px-3 py-2">
                            <span className="text-gray-400">IP:</span>
                            <span className="text-white ml-2">{review.ipAddress}</span>
                          </div>
                        )}
                        {review.moderatedBy && (
                          <div className="bg-gray-800/50 rounded px-3 py-2">
                            <span className="text-gray-400">Moderado por:</span>
                            <span className="text-white ml-2">{review.moderatedBy}</span>
                          </div>
                        )}
                        {review.moderatedAt && (
                          <div className="bg-gray-800/50 rounded px-3 py-2">
                            <span className="text-gray-400">Fecha moderación:</span>
                            <span className="text-white ml-2">
                              {new Date(review.moderatedAt).toLocaleDateString("es-ES")}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Moderation Reason */}
                      {review.status === "rejected" && review.moderationReason && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                          <p className="text-red-400 text-sm">
                            <strong>Razón de rechazo:</strong> {review.moderationReason}
                          </p>
                        </div>
                      )}

                      {/* Reports */}
                      {review.reports && review.reports.length > 0 && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                          <h4 className="text-red-400 font-bold mb-3 flex items-center gap-2">
                            <Flag className="w-4 h-4" />
                            Reportes de usuarios ({review.reports.length})
                          </h4>
                          <div className="space-y-2">
                            {review.reports.map((report) => (
                              <div key={report.id} className="bg-gray-800/50 rounded p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <span className="text-white font-medium">{report.reporterName || "Usuario"}</span>
                                    <span className="text-gray-400 text-xs ml-2">
                                      {new Date(report.createdAt).toLocaleDateString("es-ES")}
                                    </span>
                                  </div>
                                  <span className="px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                    {report.reason}
                                  </span>
                                </div>
                                {report.details && (
                                  <p className="text-gray-300 text-sm">{report.details}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Moderation Actions */}
                      {review.status === "pending" && (
                        <>
                          {moderatingReview?.id === review.id ? (
                            <div className="space-y-3">
                              <div>
                                <label className="text-gray-400 text-sm mb-2 block">
                                  Razón de rechazo (obligatorio para rechazar)
                                </label>
                                <Textarea
                                  placeholder="Explica por qué se rechaza esta reseña..."
                                  value={moderationReason}
                                  onChange={(e) => setModerationReason(e.target.value)}
                                  rows={3}
                                  className="bg-gray-600 border-gray-500 text-white placeholder:text-gray-400"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleModerateReview(review.id, "approved")}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <ThumbsUp className="w-4 h-4 mr-2" />
                                  Aprobar
                                </Button>
                                <Button
                                  onClick={() => handleModerateReview(review.id, "rejected")}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  <ThumbsDown className="w-4 h-4 mr-2" />
                                  Rechazar
                                </Button>
                                <Button
                                  onClick={() => {
                                    setModeratingReview(null);
                                    setModerationReason("");
                                  }}
                                  variant="outline"
                                  className="border-gray-600 text-gray-300"
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => setModeratingReview(review)}
                                className="bg-[#FF6B35] hover:bg-[#FF8E53] text-white"
                              >
                                Moderar Reseña
                              </Button>
                              <Button
                                onClick={() => handleModerateReview(review.id, "approved")}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <ThumbsUp className="w-4 h-4 mr-2" />
                                Aprobar Rápido
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
        {/* ─── INTEGRACIONES TAB ─────────────────────────────────────── */}
        {activeTab === "integrations" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-1">Integraciones</h2>
              <p className="text-gray-400 text-sm">Conecta Porkyrios con plataformas externas de CRM y marketing.</p>
            </div>

            {/* GHL Card */}
            <Card className="bg-gray-800 border-gray-700 p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#FF6B35]/20 flex items-center justify-center flex-shrink-0">
                    <Plug2 className="w-5 h-5 text-[#FF6B35]" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base md:text-lg">GoHighLevel (GHL)</h3>
                    <p className="text-gray-400 text-xs md:text-sm">CRM y automatización de marketing</p>
                  </div>
                </div>
                {/* Enable toggle */}
                <button
                  type="button"
                  onClick={() => setGhlEnabled(!ghlEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${ghlEnabled ? "bg-[#FF6B35]" : "bg-gray-600"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${ghlEnabled ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>

              <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                Cuando se crea un nuevo pedido, el cliente se agrega automáticamente como contacto en tu subcuenta de GHL.
                Si el contacto ya existe, se le añade una nota con los detalles del pedido.
              </p>

              {/* Info boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                  <p className="text-[#FF6B35] font-bold text-sm">Crea Contacto</p>
                  <p className="text-gray-400 text-xs mt-1">Nuevo cliente → contacto en GHL automáticamente</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                  <p className="text-[#FF6B35] font-bold text-sm">Agrega Nota</p>
                  <p className="text-gray-400 text-xs mt-1">Cada pedido queda registrado como nota en el contacto</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                  <p className="text-[#FF6B35] font-bold text-sm">Non-blocking</p>
                  <p className="text-gray-400 text-xs mt-1">Si GHL falla, el pedido se crea igual sin errores</p>
                </div>
              </div>

              {/* Credentials form */}
              <div className={`space-y-4 transition-opacity ${ghlEnabled ? "opacity-100" : "opacity-50 pointer-events-none"}`}>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">
                    API Key de la Subcuenta (Location)
                  </label>
                  <Input
                    type="password"
                    placeholder="eyJhbGciOi..."
                    value={ghlApiKey}
                    onChange={(e) => {
                      setGhlApiKey(e.target.value);
                      setGhlTestStatus("idle");
                    }}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    GHL → Settings → Integrations → API Keys → Location API Key
                  </p>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">
                    Location ID (ID de la Subcuenta)
                  </label>
                  <Input
                    type="text"
                    placeholder="abc123xyz..."
                    value={ghlLocationId}
                    onChange={(e) => {
                      setGhlLocationId(e.target.value);
                      setGhlTestStatus("idle");
                    }}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    GHL → Settings → Business Info → Location ID
                  </p>
                </div>

                {/* Test connection result */}
                {ghlTestStatus !== "idle" && ghlTestMessage && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                    ghlTestStatus === "success"
                      ? "bg-green-900/30 border border-green-700 text-green-300"
                      : ghlTestStatus === "error"
                      ? "bg-red-900/30 border border-red-700 text-red-300"
                      : "bg-gray-700 text-gray-300"
                  }`}>
                    {ghlTestStatus === "success" && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
                    {ghlTestStatus === "error" && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                    {ghlTestStatus === "testing" && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />}
                    {ghlTestMessage}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 flex-1"
                    onClick={testGHLConnectionHandler}
                    disabled={ghlTestStatus === "testing" || !ghlApiKey || !ghlLocationId}
                  >
                    {ghlTestStatus === "testing" ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Probando...</>
                    ) : (
                      <><Plug2 className="w-4 h-4 mr-2" /> Probar Conexión</>
                    )}
                  </Button>
                  <Button
                    className="bg-[#FF6B35] hover:bg-[#FF8E53] text-white flex-1"
                    onClick={saveGHLSettings}
                    disabled={isSavingGHL}
                  >
                    {isSavingGHL ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" /> Guardar Configuración</>
                    )}
                  </Button>
                </div>
              </div>

              {!ghlEnabled && (
                <p className="text-center text-gray-500 text-sm mt-4 italic">
                  Activa la integración con el toggle para configurar las credenciales.
                </p>
              )}
            </Card>

            {/* More integrations placeholder */}
            <Card className="bg-gray-800/50 border-gray-700 border-dashed p-6 text-center">
              <Plug2 className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Próximamente más integraciones: Google Analytics, WhatsApp Business, etc.</p>
            </Card>
          </div>
        )}
        {/* ─────────────────────────────────────────────────────────── */}

      </div>
    </div>
  );
}