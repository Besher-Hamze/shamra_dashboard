import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { AuthService } from './auth';
import type {
    ApiResponse,
    PaginatedResponse,
    User,
    AuthResponse,
    Product,
    CreateProductData,
    ProductsQueryParams,
    Customer,
    CreateCustomerData,
    CustomersQueryParams,
    Order,
    CreateOrderData,
    OrdersQueryParams,
    Category,
    CategoriesQueryParams,
    SubCategory,
    CreateSubCategoryData,
    UpdateSubCategoryData,
    SubCategoryQueryParams,
    Branch,
    InventoryItem,
    InventoryQueryParams,
    StockAdjustmentData,
    Notification,
    NotificationsQueryParams,
    DashboardStats,
    SalesData,
    OrderStats,
    CustomerStats,
    ProductStats,
    InventoryStats,
    BaseQueryParams,
} from '@/types';

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor to add auth token
        this.api.interceptors.request.use(
            (config) => {
                const token = AuthService.getAccessToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor to handle token refresh
        this.api.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    const refreshToken = AuthService.getRefreshToken();
                    if (refreshToken) {
                        try {
                            const response = await axios.post(`${this.api.defaults.baseURL}/auth/refresh`, {
                                refresh_token: refreshToken,
                            });

                            if (response.data.success) {
                                AuthService.setTokens(response.data.data.access_token, refreshToken);
                                // Retry the original request
                                error.config.headers.Authorization = `Bearer ${response.data.data.access_token}`;
                                return this.api.request(error.config);
                            }
                        } catch (refreshError) {
                            AuthService.logout();
                            window.location.href = '/login';
                        }
                    } else {
                        AuthService.logout();
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    // Auth endpoints
    async login(email: string, password: string): Promise<AxiosResponse<ApiResponse<AuthResponse>>> {
        return this.api.post('/auth/login', { email, password });
    }

    async register(userData: Partial<User>): Promise<AxiosResponse<ApiResponse<AuthResponse>>> {
        return this.api.post('/auth/register', userData);
    }

    async logout(): Promise<AxiosResponse<ApiResponse<null>>> {
        return this.api.post('/auth/logout');
    }

    async getProfile(): Promise<AxiosResponse<ApiResponse<User>>> {
        return this.api.get('/auth/profile');
    }

    async selectBranch(branchId: string): Promise<AxiosResponse<ApiResponse<null>>> {
        return this.api.post('/auth/select-branch', { branchId });
    }

    // Dashboard endpoints
    async getDashboardStats(): Promise<AxiosResponse<ApiResponse<DashboardStats>>> {
        return this.api.get('/reports/dashboard');
    }

    async getSalesReport(params?: { startDate?: string; endDate?: string; branchId?: string }): Promise<AxiosResponse<ApiResponse<SalesData[]>>> {
        return this.api.get('/reports/sales', { params });
    }

    async exportSalesReport(params: { startDate: string; endDate: string; branchId?: string; format?: 'csv' | 'json' }): Promise<AxiosResponse<Blob>> {
        return this.api.get('/reports/sales/export', {
            params,
            responseType: 'blob'
        });
    }

    async getTopSellingProducts(params: { startDate: string; endDate: string; limit?: number; branchId?: string }): Promise<AxiosResponse<ApiResponse<any[]>>> {
        return this.api.get('/reports/top-selling-products', { params });
    }

    async getCustomerReport(params: { startDate: string; endDate: string }): Promise<AxiosResponse<ApiResponse<any>>> {
        return this.api.get('/reports/customers', { params });
    }

    async getInventoryReport(params?: { branchId?: string }): Promise<AxiosResponse<ApiResponse<any>>> {
        return this.api.get('/reports/inventory', { params });
    }

    async getBranchPerformanceReport(params: { startDate: string; endDate: string }): Promise<AxiosResponse<ApiResponse<any[]>>> {
        return this.api.get('/reports/branches/performance', { params });
    }

    async getProductPerformanceReport(params: { startDate: string; endDate: string; branchId?: string }): Promise<AxiosResponse<ApiResponse<any>>> {
        return this.api.get('/reports/products/performance', { params });
    }

    async getFinancialReport(params: { startDate: string; endDate: string; branchId?: string }): Promise<AxiosResponse<ApiResponse<any>>> {
        return this.api.get('/reports/financial', { params });
    }



    // Products endpoints
    async getProducts(params?: ProductsQueryParams): Promise<ApiResponse<PaginatedResponse<Product>>> {
        return this.api.get('/products', { params });
    }

    async getProduct(id: string): Promise<AxiosResponse<ApiResponse<Product>>> {
        return this.api.get(`/products/${id}`);
    }

    async createProduct(data: CreateProductData): Promise<AxiosResponse<ApiResponse<Product>>> {
        return this.api.post('/products', data);
    }

    async createProductWithImages(data: CreateProductData, files?: { mainImage?: File; images?: File[] }): Promise<AxiosResponse<ApiResponse<Product>>> {
        const formData = new FormData();

        // Convert data to match CreateProductFormDataDto expectations (all strings)
        if (data.name) formData.append('name', data.name);
        if (data.description) formData.append('description', data.description);
        if (data.barcode) formData.append('barcode', data.barcode);
        if (data.price !== undefined) formData.append('price', String(data.price));
        if (data.costPrice !== undefined) formData.append('costPrice', String(data.costPrice));
        if (data.salePrice !== undefined) formData.append('salePrice', String(data.salePrice));
        if (data.currency) formData.append('currency', data.currency);
        if (data.stockQuantity !== undefined) formData.append('stockQuantity', String(data.stockQuantity));
        if (data.minStockLevel !== undefined) formData.append('minStockLevel', String(data.minStockLevel));
        if (data.categoryId) formData.append('categoryId', data.categoryId);
        if (data.subCategoryId) formData.append('subCategoryId', data.subCategoryId);
        if (data.branches && data.branches.length > 0) formData.append('branches', JSON.stringify(data.branches));
        if (data.brand) formData.append('brand', data.brand);
        if (data.specifications && Object.keys(data.specifications).length > 0) {
            formData.append('specifications', JSON.stringify(data.specifications));
        }
        if (data.status) formData.append('status', data.status);
        if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
        if (data.isFeatured !== undefined) formData.append('isFeatured', String(data.isFeatured));
        if (data.isOnSale !== undefined) formData.append('isOnSale', String(data.isOnSale));
        if (data.tags && data.tags.length > 0) formData.append('tags', JSON.stringify(data.tags));
        if (data.keywords && data.keywords.length > 0) formData.append('keywords', JSON.stringify(data.keywords));
        if (data.sortOrder !== undefined) formData.append('sortOrder', String(data.sortOrder));

        // Add files
        if (files?.mainImage) {
            formData.append('mainImage', files.mainImage);
        }
        if (files?.images) {
            files.images.forEach((image) => {
                formData.append('images', image);
            });
        }

        return this.api.post('/products/with-images', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    async updateProduct(id: string, data: Partial<CreateProductData>): Promise<AxiosResponse<ApiResponse<Product>>> {
        return this.api.patch(`/products/${id}`, data);
    }

    async updateProductWithImages(id: string, data: Partial<CreateProductData>, files?: { mainImage?: File; images?: File[] }): Promise<AxiosResponse<ApiResponse<Product>>> {
        const formData = new FormData();

        // Convert data to match UpdateProductFormDataDto expectations (all strings)
        if (data.name) formData.append('name', data.name);
        if (data.description !== undefined) formData.append('description', data.description || '');
        if (data.barcode !== undefined) formData.append('barcode', data.barcode || '');
        if (data.price !== undefined) formData.append('price', String(data.price));
        if (data.costPrice !== undefined) formData.append('costPrice', String(data.costPrice));
        if (data.salePrice !== undefined) formData.append('salePrice', String(data.salePrice));
        if (data.currency) formData.append('currency', data.currency);
        if (data.stockQuantity !== undefined) formData.append('stockQuantity', String(data.stockQuantity));
        if (data.minStockLevel !== undefined) formData.append('minStockLevel', String(data.minStockLevel));
        if (data.categoryId) formData.append('categoryId', data.categoryId);
        if (data.subCategoryId !== undefined) formData.append('subCategoryId', data.subCategoryId || '');
        if (data.branches !== undefined) {
            formData.append('branches', data.branches && data.branches.length > 0 ? JSON.stringify(data.branches) : '[]');
        }
        if (data.brand !== undefined) formData.append('brand', data.brand || '');
        if (data.specifications !== undefined) {
            formData.append('specifications', data.specifications && Object.keys(data.specifications).length > 0 ? JSON.stringify(data.specifications) : '{}');
        }
        if (data.status) formData.append('status', data.status);
        if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
        if (data.isFeatured !== undefined) formData.append('isFeatured', String(data.isFeatured));
        if (data.isOnSale !== undefined) formData.append('isOnSale', String(data.isOnSale));
        if (data.tags !== undefined) {
            formData.append('tags', data.tags && data.tags.length > 0 ? JSON.stringify(data.tags) : '[]');
        }
        if (data.keywords !== undefined) {
            formData.append('keywords', data.keywords && data.keywords.length > 0 ? JSON.stringify(data.keywords) : '[]');
        }
        if (data.sortOrder !== undefined) formData.append('sortOrder', String(data.sortOrder));

        // Add files
        if (files?.mainImage) {
            formData.append('mainImage', files.mainImage);
        }
        if (files?.images) {
            files.images.forEach((image) => {
                formData.append('images', image);
            });
        }

        return this.api.patch(`/products/${id}/with-images`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    async deleteProduct(id: string): Promise<AxiosResponse<ApiResponse<null>>> {
        return this.api.delete(`/products/${id}`);
    }

    async getFeaturedProducts(limit?: number): Promise<AxiosResponse<ApiResponse<Product[]>>> {
        return this.api.get('/products/featured', { params: { limit } });
    }

    async getProductStats(): Promise<AxiosResponse<ApiResponse<ProductStats>>> {
        return this.api.get('/products/stats');
    }

    // Orders endpoints
    async getOrders(params?: OrdersQueryParams): Promise<ApiResponse<PaginatedResponse<Order>>> {
        return this.api.get('/orders', { params });
    }

    async getOrder(id: string): Promise<AxiosResponse<ApiResponse<Order>>> {
        return this.api.get(`/orders/by-id/${id}`);
    }

    async createOrder(data: CreateOrderData): Promise<AxiosResponse<ApiResponse<Order>>> {
        return this.api.post('/orders', data);
    }

    async updateOrder(id: string, data: Partial<CreateOrderData>): Promise<AxiosResponse<ApiResponse<Order>>> {
        return this.api.patch(`/orders/${id}`, data);
    }

    async updateOrderStatus(id: string, status: string): Promise<AxiosResponse<ApiResponse<Order>>> {
        return this.api.patch(`/orders/${id}/status`, { status });
    }

    async getOrderStats(): Promise<AxiosResponse<ApiResponse<OrderStats>>> {
        return this.api.get('/orders/stats');
    }

    async getRecentOrders(limit?: number): Promise<AxiosResponse<ApiResponse<Order[]>>> {
        return this.api.get('/orders/recent', { params: { limit } });
    }

    // Customers endpoints
    async getCustomers(params?: CustomersQueryParams): Promise<ApiResponse<PaginatedResponse<Customer>>> {
        return this.api.get('/customers', { params });
    }

    async getCustomer(id: string): Promise<AxiosResponse<ApiResponse<Customer>>> {
        return this.api.get(`/customers/${id}`);
    }

    async createCustomer(data: CreateCustomerData): Promise<AxiosResponse<ApiResponse<Customer>>> {
        return this.api.post('/customers', data);
    }

    async updateCustomer(id: string, data: Partial<CreateCustomerData>): Promise<AxiosResponse<ApiResponse<Customer>>> {
        return this.api.patch(`/customers/${id}`, data);
    }

    async deleteCustomer(id: string): Promise<AxiosResponse<ApiResponse<null>>> {
        return this.api.delete(`/customers/${id}`);
    }

    async getCustomerStats(): Promise<AxiosResponse<ApiResponse<CustomerStats>>> {
        return this.api.get('/customers/stats');
    }

    async getTopCustomers(limit?: number): Promise<AxiosResponse<ApiResponse<Customer[]>>> {
        return this.api.get('/customers/top-customers', { params: { limit } });
    }

    // Categories endpoints
    async getCategories(params?: CategoriesQueryParams): Promise<ApiResponse<PaginatedResponse<Category>>> {
        return this.api.get('/categories', { params });
    }

    async getCategory(id: string): Promise<AxiosResponse<ApiResponse<Category>>> {
        return this.api.get(`/categories/${id}`);
    }

    async createCategory(data: Partial<Category>): Promise<AxiosResponse<ApiResponse<Category>>> {
        return this.api.post('/categories', data);
    }

    async createCategoryWithImage(data: Partial<Category>, imageFile?: File): Promise<AxiosResponse<ApiResponse<Category>>> {
        if (!imageFile) {
            return this.createCategory(data);
        }

        const formData = new FormData();

        // Add category data
        if (data.name) formData.append('name', data.name);
        if (data.description) formData.append('description', data.description);
        if (data.sortOrder !== undefined) formData.append('sortOrder', String(data.sortOrder));
        if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
        if (data.isFeatured !== undefined) formData.append('isFeatured', String(data.isFeatured));

        // Add image file
        formData.append('image', imageFile);

        return this.api.post('/categories', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    async updateCategory(id: string, data: Partial<Category>): Promise<AxiosResponse<ApiResponse<Category>>> {
        return this.api.patch(`/categories/${id}`, data);
    }

    async updateCategoryWithImage(id: string, data: Partial<Category>, imageFile?: File): Promise<AxiosResponse<ApiResponse<Category>>> {
        if (!imageFile) {
            return this.updateCategory(id, data);
        }

        const formData = new FormData();

        // Add category data
        if (data.name) formData.append('name', data.name);
        if (data.description !== undefined) formData.append('description', data.description || '');
        if (data.sortOrder !== undefined) formData.append('sortOrder', String(data.sortOrder));
        if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
        if (data.isFeatured !== undefined) formData.append('isFeatured', String(data.isFeatured));

        // Add image file
        formData.append('image', imageFile);

        return this.api.patch(`/categories/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    async deleteCategory(id: string): Promise<AxiosResponse<ApiResponse<null>>> {
        return this.api.delete(`/categories/${id}`);
    }

    // Sub-Categories endpoints
    async getSubCategories(params?: any): Promise<ApiResponse<SubCategory[]>> {
        return this.api.get('/sub-categories', { params });
    }

    async getSubCategory(id: string): Promise<AxiosResponse<ApiResponse<SubCategory>>> {
        return this.api.get(`/sub-categories/${id}`);
    }

    async getSubCategoriesByCategory(categoryId: string): Promise<AxiosResponse<SubCategory[]>> {
        return this.api.get(`/sub-categories/category/${categoryId}`);
    }

    async createSubCategory(data: any): Promise<AxiosResponse<ApiResponse<SubCategory>>> {
        return this.api.post('/sub-categories', data);
    }
    async createSubCategoryWithImage(data: any, imageFile?: File): Promise<AxiosResponse<ApiResponse<SubCategory>>> {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('categoryId', data.categoryId);
        formData.append('isActive', data.isActive);
        if (imageFile) {
            formData.append('image', imageFile);
        }
        return this.api.post('/sub-categories', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    async updateSubCategory(id: string, data: any): Promise<AxiosResponse<ApiResponse<SubCategory>>> {
        return this.api.patch(`/sub-categories/${id}`, data);
    }

    async updateSubCategoryWithImage(id: string, data: any, imageFile?: File): Promise<AxiosResponse<ApiResponse<SubCategory>>> {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('categoryId', data.categoryId);
        formData.append('isActive', data.isActive);
        if (imageFile) {
            formData.append('image', imageFile);
        }
        return this.api.patch(`/sub-categories/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    async deleteSubCategory(id: string): Promise<AxiosResponse<ApiResponse<null>>> {
        return this.api.delete(`/sub-categories/${id}`);
    }

    // Branches endpoints
    async getBranches(params?: BaseQueryParams): Promise<ApiResponse<PaginatedResponse<Branch>>> {
        return this.api.get('/branches', { params });
    }

    async getBranch(id: string): Promise<AxiosResponse<ApiResponse<Branch>>> {
        return this.api.get(`/branches/${id}`);
    }

    async createBranch(data: Partial<Branch>): Promise<AxiosResponse<ApiResponse<Branch>>> {
        return this.api.post('/branches', data);
    }

    async updateBranch(id: string, data: Partial<Branch>): Promise<AxiosResponse<ApiResponse<Branch>>> {
        return this.api.patch(`/branches/${id}`, data);
    }

    async deleteBranch(id: string): Promise<AxiosResponse<ApiResponse<null>>> {
        return this.api.delete(`/branches/${id}`);
    }

    async getActiveBranches(): Promise<AxiosResponse<ApiResponse<Branch[]>>> {
        return this.api.get('/branches/active');
    }

    // Inventory endpoints
    async getInventory(params?: InventoryQueryParams): Promise<ApiResponse<PaginatedResponse<InventoryItem>>> {
        return this.api.get('/inventory', { params });
    }

    async getLowStockItems(params?: { branchId?: string; limit?: number }): Promise<AxiosResponse<ApiResponse<InventoryItem[]>>> {
        return this.api.get('/inventory/low-stock', { params });
    }

    async adjustStock(data: StockAdjustmentData): Promise<AxiosResponse<ApiResponse<InventoryItem>>> {
        return this.api.post('/inventory/adjust-stock', data);
    }

    async getInventoryStats(branchId?: string): Promise<AxiosResponse<ApiResponse<InventoryStats>>> {
        return this.api.get('/inventory/stats', { params: { branchId } });
    }

    // Notifications endpoints
    async getNotifications(params?: NotificationsQueryParams): Promise<ApiResponse<PaginatedResponse<Notification>>> {
        return this.api.get('/notifications/my', { params });
    }

    async markNotificationAsRead(id: string): Promise<AxiosResponse<ApiResponse<Notification>>> {
        return this.api.patch(`/notifications/${id}/read`);
    }

    async markAllNotificationsAsRead(): Promise<AxiosResponse<ApiResponse<null>>> {
        return this.api.patch('/notifications/mark-all-read');
    }

    async getUnreadCount(): Promise<AxiosResponse<ApiResponse<{ count: number }>>> {
        return this.api.get('/notifications/unread-count');
    }
}

export const apiService = new ApiService();
