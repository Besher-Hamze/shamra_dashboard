// Base types
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T;
}

export interface PaginatedResponse<T> {
    success: boolean;
    message: string;
    data: T[];
    pagination: Pagination;
}



export interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
}


// User and Auth types
export enum UserRole {
    ADMIN = 'admin',
    MANAGER = 'manager',
    EMPLOYEE = 'employee',
    CUSTOMER = 'customer',
    MERCHANT = 'merchant',
}
export interface User {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phoneNumber?: string;
    profileImage?: string;
    branchId?: string;
    branch?: Branch;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: User;
}

// User management types
export interface CreateUserData {
    firstName: string;
    lastName: string;
    password: string;
    role?: UserRole;
    phoneNumber?: string;
    profileImage?: string;
    branchId?: string;
    isActive?: boolean;
}

export interface UpdateUserData {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    profileImage?: string;
    branchId?: string;
    isActive?: boolean;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
}

export interface UsersQueryParams extends BaseQueryParams {
    role?: UserRole;
    branchId?: string;
    isActive?: boolean;
    search?: string;
}

// Address type
export interface Address {
    street: string;
    city: string;

    coordinates?: {
        lat: number;
        lng: number;
    };
}

// Branch types
export interface OperatingHours {
    [key: string]: {
        open: string;
        close: string;
    };
}

export interface Branch {
    id: string;
    name: string;
    description?: string;
    phone?: string;
    email?: string;
    address: Address;
    isActive: boolean;
    isMainBranch: boolean;
    operatingHours?: OperatingHours;
    sortOrder?: number;
    createdAt: string;
    updatedAt: string;
}

// Category types
export interface Category {
    id: string;
    name: string;
    description?: string;
    image?: string;
    subCategories?: SubCategory[];
    sortOrder?: number;
    isActive: boolean;
    isFeatured: boolean;
    createdAt: string;
    updatedAt: string;
}

// SubCategory types
export enum SubCategoryType {
    FREE_ATTR = 'free_attr',
    CUSTOM_ATTR = 'custom_attr'
}

export interface SubCategory {
    id: string;
    name: string;
    categoryId: string;
    image?: string;
    type: SubCategoryType;
    customFields?: string[];
    category?: Category;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSubCategoryData {
    name: string;
    categoryId: string;
    type: SubCategoryType;
    customFields?: string[];
    isActive?: boolean;
    image?: string;
}

export interface UpdateSubCategoryData extends Partial<CreateSubCategoryData> {
    id: string;
}

export interface SubCategoryQueryParams extends BaseQueryParams {
    name?: string;
    categoryId?: string;
    isActive?: boolean;
    search?: string;
}

// Product types

export enum ProductStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    OUT_OF_STOCK = 'out_of_stock',
}

// Branch Pricing types
export interface BranchPricing {
    branchId: string;
    price: number;
    costPrice: number;
    wholeSalePrice: number;
    sku: string;
    salePrice?: number;
    currency: string;
    stockQuantity: number;
    isOnSale: boolean;
    isActive: boolean;
}

export interface Product {
    id: string;
    name: string;
    description?: string;
    barcode?: string;
    categoryId: string;
    category?: Category;
    subCategoryId?: string;
    subCategory?: SubCategory;
    branches: string[]; // Array of branch IDs
    branchDetails?: Branch[]; // Populated branch details
    branchPricing?: BranchPricing[]; // Branch-specific pricing
    images: string[];
    mainImage?: string;
    brand?: string;
    specifications?: Record<string, any>;
    status: ProductStatus;
    isActive: boolean;
    isFeatured: boolean;
    tags: string[];
    keywords: string[];
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductData {
    name: string;
    description?: string;
    barcode?: string;
    categoryId: string;
    subCategoryId?: string;
    branches?: string[];
    branchPricing?: BranchPricing[];
    images?: string[];
    mainImage?: string;
    brand?: string;
    specifications?: Record<string, any>;
    status?: ProductStatus;
    isActive?: boolean;
    isFeatured?: boolean;
    tags?: string[];
    keywords?: string[];
    sortOrder?: number;
}

// Update Stock DTO
export interface UpdateStockData {
    stockQuantity: number;
    reason?: string;
}

// Update Price DTO
export interface UpdatePriceData {
    price?: number;
    salePrice?: number;
    isOnSale?: boolean;
    wholeSalePrice?: number;
}

// Customer types
export interface CustomerAddress {
    street: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
}

export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    customerCode?: string;
    address?: CustomerAddress;
    isActive: boolean;
    notes?: string;
    totalOrders?: number;
    totalSpent?: number;
    lastOrderDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCustomerData {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    customerCode?: string;
    address?: CustomerAddress;
    isActive?: boolean;
    notes?: string;
}

// Order types
export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
}

// Order Status
export enum OrderStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
    RETURNED = 'returned',
}
export interface Order {
    _id: string;
    orderNumber: string;
    userId: string | User;
    branchId?: string | Branch;
    items: OrderItem[];
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    status: OrderStatus;
    notes?: string;
    isPaid: boolean;
    paidAt?: Date;
    isDeleted: boolean;
    createdBy: string | User;
    updatedBy?: string | User;
    createdAt: Date;
    updatedAt: Date;
    location?: {
        lat: number;
        lng: number;
    },
    totalQuantity?: number; // Virtual field
    // Virtual fields from Mongoose
    user?: User;
    branch?: Branch;
}

export interface CreateOrderData {
    items: Omit<OrderItem, 'total'>[];
    branchId?: string;
    notes?: string;
    taxAmount?: number;
    discountAmount?: number;
}

export interface UpdateOrderData {
    items?: Omit<OrderItem, 'total'>[];
    branchId?: string;
    notes?: string;
    taxAmount?: number;
    discountAmount?: number;
    isPaid?: boolean;
}

export interface UpdateOrderStatusData {
    status: OrderStatus;
}

export interface OrdersQueryParams {
    page?: number;
    limit?: number;
    sort?: string;
    branchId?: string;
    status?: OrderStatus;
    isPaid?: boolean;
    search?: string;
}

export interface OrderStats {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    paidOrders: number;
    unpaidOrders: number;
    totalRevenue: number;
    paidRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Array<{
        _id: OrderStatus;
        count: number;
    }>;
    recentOrders: Order[];
}

// Banner types
export interface Banner {
    _id: string;
    image: string;
    productId?: string | Product;
    categoryId?: string | Category;
    subCategoryId?: string | SubCategory;
    sortOrder: number;
    isActive: boolean;
    isDeleted: boolean;
    createdBy: string | User;
    updatedBy?: string | User;
    createdAt: Date;
    updatedAt: Date;
    // Virtual fields from Mongoose
    product?: Product;
    category?: Category;
    subCategory?: SubCategory;
}

export interface CreateBannerData {
    image: string | File;
    productId?: string;
    categoryId?: string;
    subCategoryId?: string;
    sortOrder?: number;
    isActive?: boolean;
}

export interface UpdateBannerData {
    image?: string | File;
    productId?: string;
    categoryId?: string;
    subCategoryId?: string;
    sortOrder?: number;
    isActive?: boolean;
}

export interface UpdateSortOrderData {
    sortOrder: number;
}

export interface BannersQueryParams {
    page?: number;
    limit?: number;
    sort?: string;
    isActive?: boolean;
    productId?: string;
    categoryId?: string;
    subCategoryId?: string;
    search?: string;
}

export interface BannerStats {
    totalBanners: number;
    activeBanners: number;
    inactiveBanners: number;
    bannersByType: Array<{
        _id: string;
        count: number;
    }>;
    recentBanners: Banner[];
}

// Merchant Request Types
export enum MerchantRequestStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export interface MerchantRequest {
    _id: string;
    userId: string;
    storeName: string;
    address: string;
    phoneNumber: string;
    status: MerchantRequestStatus;
    rejectionReason?: string;
    reviewedBy?: string;
    reviewedAt?: Date;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    // Virtual fields from Mongoose
    user?: User;
    reviewer?: User;
}

export interface CreateMerchantRequestData {
    storeName: string;
    address: string;
    phoneNumber: string;
}

export interface UpdateMerchantRequestData {
    storeName?: string;
    address?: string;
    phoneNumber?: string;
}

export interface ReviewMerchantRequestData {
    status: MerchantRequestStatus;
    rejectionReason?: string;
}

export interface MerchantRequestsQueryParams {
    page?: number;
    limit?: number;
    status?: MerchantRequestStatus;
    search?: string;
}

export interface MerchantRequestStats {
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    recentRequests: MerchantRequest[];
}

// Inventory types
export interface InventoryItem {
    id: string;
    productId: string;
    product?: Product;
    branchId: string;
    branch?: Branch;
    currentStock: number;
    reservedStock?: number;
    availableStock?: number;
    minStockLevel: number;
    maxStockLevel?: number;
    reorderPoint?: number;
    reorderQuantity?: number;
    unitCost: number;
    currency: string;
    unit: string;
    isLowStock?: boolean;
    isOutOfStock?: boolean;
    lastUpdated: string;
    createdAt: string;
    updatedAt: string;
}

export interface InventoryTransaction {
    id: string;
    productId: string;
    branchId: string;
    type: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'TRANSFER' | 'RETURN' | 'DAMAGE';
    quantity: number;
    unitCost?: number;
    reference?: string;
    notes?: string;
    createdBy: string;
    createdAt: string;
}

export interface StockAdjustmentData {
    productId: string;
    branchId: string;
    type: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'TRANSFER' | 'RETURN' | 'DAMAGE';
    quantity: number;
    unitCost?: number;
    reference?: string;
    notes?: string;
}

// Excel Import types
export interface ImportInventoryData {
    branchId: string;
    importMode: 'replace' | 'add' | 'subtract';
    notes?: string;
}

export interface ImportResult {
    success: boolean;
    message: string;
    totalRows: number;
    processedRows: number;
    skippedRows: number;
    errors: ImportError[];
    summary: ImportSummary;
}

export interface ImportError {
    row: number;
    productCode: string;
    error: string;
    data?: any;
}

export interface ImportSummary {
    productsUpdated: number;
    productsCreated: number;
    productsNotFound: number;
    totalQuantityUpdated: number;
    totalValueUpdated: number;
}

// Simple Notification types
export interface Notification {
    id: string;
    title: string;
    message: string;
    recipientId?: string; // If null/undefined, it's sent to all users
    isRead: boolean;
    createdAt: string;
    readAt?: string;
}

export interface CreateNotificationData {
    title: string;
    message: string;
    recipientId?: string; // Optional - if not provided, sends to all users
}

export interface NotificationStats {
    totalNotifications: number;
    unreadCount: number;
    readCount: number;
}

// Dashboard and Statistics types
export interface DashboardStats {
    totalProducts: number;
    totalOrders: number;
    totalCustomers: number;
    totalRevenue: number;
    lowStockProducts: number;
    pendingOrders: number;
    newCustomersThisMonth: number;
    revenueGrowth: number;
}

export interface SalesData {
    period: string;
    sales: number;
    orders: number;
    customers: number;
}

export interface ProductCategoryData {
    categoryId: string;
    categoryName: string;
    categoryNameAr: string;
    productCount: number;
    percentage: number;
}

export interface TopSellingProduct {
    productId: string;
    productName: string;
    productNameAr: string;
    sku: string;
    totalSold: number;
    revenue: number;
}

export interface CustomerStats {
    totalCustomers: number;
    activeCustomers: number;
    newCustomersThisMonth: number;
    topCustomers: Customer[];
}

export interface OrderStats {
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
}

export interface ProductStats {
    totalProducts: number;
    activeProducts: number;
    featuredProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    totalInventoryValue: number;
}

export interface InventoryStats {
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalValue: number;
    averageStockLevel: number;
}

// Additional Report Types - Updated to match backend service
export interface TopSellingProduct {
    _id: string;
    productName: string;
    productSku: string;
    totalQuantity: number;
    totalRevenue: number;
    orderCount: number;
}

export interface CustomerReportData {
    period: { startDate: Date; endDate: Date };
    summary: {
        totalCustomers: number;
        totalSpent: number;
        averageOrderValue: number;
    };
    topCustomers: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        totalSpent: number;
        totalOrders: number;
        lastOrderDate: Date;
    }[];
}

export interface InventoryReportData {
    summary: {
        totalProducts: number;
        totalStockValue: number;
        lowStockCount: number;
        outOfStockCount: number;
    };
    lowStockItems: {
        _id: string;
        currentStock: number;
        unitCost: number;
        isLowStock: boolean;
        isOutOfStock: boolean;
        productId: {
            name: string;
            nameAr: string;
            sku: string;
        };
        branchId: {
            name: string;
            nameAr: string;
        };
    }[];
}

export interface BranchPerformance {
    _id: string;
    branchName: string;
    branchNameAr: string;
    totalOrders: number;
    totalRevenue: number;
    totalItems: number;
    averageOrderValue: number;
}

export interface ProductPerformanceData {
    _id: string;
    productName: string;
    productSku: string;
    totalQuantity: number;
    totalRevenue: number;
    orderCount: number;
    averagePrice: number;
}

export interface FinancialReportData {
    period: { startDate: Date; endDate: Date };
    summary: {
        totalRevenue: number;
        totalOrders: number;
        averageOrderValue: number;
        totalTax: number;
        totalDiscount: number;
    };
    dailyData: {
        _id: { date: string };
        revenue: number;
        orders: number;
        averageOrderValue: number;
    }[];
}

export interface SalesReportData {
    period: { startDate: Date; endDate: Date };
    summary: {
        totalOrders: number;
        totalRevenue: number;
        totalItems: number;
        averageOrderValue: number;
    };
    dailyData: {
        _id: { date: string; branchId?: string };
        totalOrders: number;
        totalRevenue: number;
        totalItems: number;
        averageOrderValue: number;
    }[];
}

export interface DashboardSummaryData {
    today: {
        orders: number;
        revenue: number;
    };
    totals: {
        customers: number;
        products: number;
        lowStockItems: number;
    };
}

// Query parameter types
export interface BaseQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface ProductsQueryParams extends BaseQueryParams {
    categoryId?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    isOnSale?: boolean;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    tags?: string;
    branchId?: string;
}

export interface OrdersQueryParams extends BaseQueryParams {
    customerId?: string;
    branchId?: string;
    status?: OrderStatus;
    isPaid?: boolean;
    startDate?: string;
    endDate?: string;
}

export interface CustomersQueryParams extends BaseQueryParams {
    isActive?: boolean;
    city?: string;
}

export interface CategoriesQueryParams extends BaseQueryParams {
    isActive?: boolean;
    isFeatured?: boolean;
    rootOnly?: boolean;
    parentId?: string;
    withSubCategories?: boolean;
}

export interface InventoryQueryParams extends BaseQueryParams {
    productId?: string;
    branchId?: string;
    isLowStock?: boolean;
    isOutOfStock?: boolean;
}

export interface NotificationsQueryParams extends BaseQueryParams {
    recipientId?: string;
    type?: string;
    branchId?: string;
    isRead?: boolean;
    priority?: string;
}

// Form data types
export interface LoginFormData {
    email: string;
    password: string;
}

export interface RegisterFormData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

// Error types
export interface ApiError {
    message: string;
    statusCode?: number;
    errors?: Record<string, string[]>;
}

// File upload types
export interface FileUpload {
    file: File;
    url?: string;
    progress?: number;
    error?: string;
}

// Chart data types
export interface ChartData {
    name: string;
    value: number;
    color?: string;
}

export interface TimeSeriesData {
    date: string;
    value: number;
    label?: string;
}


