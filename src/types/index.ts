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
export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'CUSTOMER';
    phoneNumber?: string;
    profileImage?: string;
    branchId?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: User;
}

// Address type
export interface Address {
    street: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
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
    nameAr: string;
    description?: string;
    descriptionAr?: string;
    code: string;
    phone?: string;
    email?: string;
    website?: string;
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
    nameAr: string;
    description?: string;
    descriptionAr?: string;
    slug: string;
    image?: string;
    icon?: string;
    parentId?: string;
    parent?: Category;
    children?: Category[];
    subCategories?: SubCategory[];
    sortOrder?: number;
    isActive: boolean;
    isFeatured: boolean;
    createdAt: string;
    updatedAt: string;
}

// SubCategory types
export interface SubCategory {
    id: string;
    name: string;
    categoryId: string;
    category?: Category;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSubCategoryData {
    name: string;
    categoryId: string;
    isActive?: boolean;
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
export interface ProductDimensions {
    length: number;
    width: number;
    height: number;
}

export enum ProductStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    OUT_OF_STOCK = 'out_of_stock',
}

export interface Product {
    id: string;
    name: string;
    description?: string;
    barcode?: string;
    price: number;
    costPrice?: number;
    salePrice?: number;
    currency: string;
    stockQuantity: number;
    minStockLevel?: number;
    categoryId: string;
    category?: Category;
    subCategoryId?: string;
    subCategory?: SubCategory;
    branches: string[]; // Array of branch IDs
    branchDetails?: Branch[]; // Populated branch details
    images: string[];
    mainImage?: string;
    brand?: string;
    status: ProductStatus;
    isActive: boolean;
    isFeatured: boolean;
    isOnSale: boolean;
    tags: string[];
    keywords?: string[];
    sortOrder?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductData {
    name: string;
    description?: string;
    barcode?: string;
    price: number;
    costPrice?: number;
    salePrice?: number;
    currency: string;
    stockQuantity: number;
    minStockLevel?: number;
    categoryId: string;
    subCategoryId?: string;
    branches: string[];
    images?: string[];
    mainImage?: string;
    brand?: string;
    status?: ProductStatus;
    isActive?: boolean;
    isFeatured?: boolean;
    isOnSale?: boolean;
    tags?: string[];
    keywords?: string[];
    sortOrder?: number;
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
    productSku: string;
    quantity: number;
    price: number;
    total?: number;
}

export interface Order {
    id: string;
    orderNumber: string;
    customerId: string;
    customer?: Customer;
    branchId: string;
    branch?: Branch;
    items: OrderItem[];
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
    isPaid: boolean;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrderData {
    customerId: string;
    branchId: string;
    items: OrderItem[];
    taxAmount?: number;
    discountAmount?: number;
    notes?: string;
    isPaid?: boolean;
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

// Notification types
export interface Notification {
    id: string;
    title: string;
    titleAr?: string;
    message: string;
    messageAr?: string;
    type: 'ORDER' | 'LOW_STOCK' | 'SYSTEM' | 'CUSTOMER' | 'PAYMENT' | 'INVENTORY';
    recipientId: string;
    branchId?: string;
    productId?: string;
    orderId?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    channels: ('app' | 'email' | 'sms')[];
    isRead: boolean;
    metadata?: Record<string, any>;
    createdAt: string;
    readAt?: string;
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
    status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
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


