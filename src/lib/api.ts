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
    UpdateOrderData,
    UpdateOrderStatusData,
    OrdersQueryParams,
    Category,
    CategoriesQueryParams,
    SubCategory,
    CreateSubCategoryData,
    UpdateSubCategoryData,
    SubCategoryQueryParams,
    SubSubCategory,
    CreateSubSubCategoryData,
    UpdateSubSubCategoryData,
    SubSubCategoryQueryParams,
    Branch,
    InventoryItem,
    InventoryQueryParams,
    StockAdjustmentData,
    Notification,
    CreateNotificationData,
    NotificationStats,
    DashboardStats,
    SalesData,
    OrderStats,
    CustomerStats,
    ProductStats,
    InventoryStats,
    BaseQueryParams,
    CreateUserData,
    UpdateUserData,
    ChangePasswordData,
    UsersQueryParams,
    UserRole,
    Banner,
    CreateBannerData,
    UpdateBannerData,
    UpdateSortOrderData,
    BannersQueryParams,
    BannerStats,
    MerchantRequest,
    CreateMerchantRequestData,
    UpdateMerchantRequestData,
    ReviewMerchantRequestData,
    MerchantRequestsQueryParams,
    MerchantRequestStats,
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
    async login(phoneNumber: string, password: string): Promise<AxiosResponse<ApiResponse<AuthResponse>>> {
        return this.api.post('/auth/login', { phoneNumber, password });
    }

    async register(userData: Partial<User>): Promise<AxiosResponse<ApiResponse<AuthResponse>>> {
        return this.api.post('/auth/register', userData);
    }

    async logout(): Promise<AxiosResponse<ApiResponse<null>>> {
        return this.api.post('/auth/logout');
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
        if (data.categoryId) formData.append('categoryId', data.categoryId);
        if (data.subCategoryId) formData.append('subCategoryId', data.subCategoryId);
        if (data.branches && data.branches.length > 0) formData.append('branches', JSON.stringify(data.branches));
        if (data.branchPricing && data.branchPricing.length > 0) formData.append('branchPricing', JSON.stringify(data.branchPricing));
        if (data.brand) formData.append('brand', data.brand);
        if (data.specifications && Object.keys(data.specifications).length > 0) {
            formData.append('specifications', JSON.stringify(data.specifications));
        }
        if (data.status) formData.append('status', data.status);
        if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
        if (data.isFeatured !== undefined) formData.append('isFeatured', String(data.isFeatured));
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
        if (data.categoryId) formData.append('categoryId', data.categoryId);
        if (data.subCategoryId !== undefined) formData.append('subCategoryId', data.subCategoryId || '');
        if (data.branches !== undefined) {
            formData.append('branches', data.branches && data.branches.length > 0 ? JSON.stringify(data.branches) : '[]');
        }
        if (data.branchPricing !== undefined) {
            formData.append('branchPricing', data.branchPricing && data.branchPricing.length > 0 ? JSON.stringify(data.branchPricing) : '[]');
        }
        if (data.brand !== undefined) formData.append('brand', data.brand || '');
        if (data.specifications !== undefined) {
            formData.append('specifications', data.specifications && Object.keys(data.specifications).length > 0 ? JSON.stringify(data.specifications) : '{}');
        }
        if (data.status) formData.append('status', data.status);
        if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
        if (data.isFeatured !== undefined) formData.append('isFeatured', String(data.isFeatured));
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

    async getOrderByNumber(orderNumber: string): Promise<AxiosResponse<ApiResponse<Order>>> {
        return this.api.get(`/orders/number/${orderNumber}`);
    }

    async createOrder(data: CreateOrderData): Promise<AxiosResponse<ApiResponse<Order>>> {
        return this.api.post('/orders', data);
    }

    async updateOrder(id: string, data: UpdateOrderData): Promise<AxiosResponse<ApiResponse<Order>>> {
        return this.api.patch(`/orders/${id}`, data);
    }

    async updateOrderStatus(id: string, data: UpdateOrderStatusData): Promise<AxiosResponse<ApiResponse<Order>>> {
        return this.api.patch(`/orders/${id}/status`, data);
    }

    async deleteOrder(id: string): Promise<AxiosResponse<ApiResponse<null>>> {
        return this.api.delete(`/orders/${id}`);
    }

    async getOrderStats(): Promise<AxiosResponse<ApiResponse<OrderStats>>> {
        return this.api.get('/orders/stats');
    }

    async getRecentOrders(limit?: number): Promise<AxiosResponse<ApiResponse<Order[]>>> {
        return this.api.get('/orders/recent', { params: { limit } });
    }

    async getMyOrders(): Promise<AxiosResponse<ApiResponse<Order[]>>> {
        return this.api.get('/orders/my');
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
        // if (!imageFile) {
        //     return this.updateCategory(id, data);
        // }

        const formData = new FormData();

        // Add category data
        if (data.name) formData.append('name', data.name);
        if (data.description !== undefined) formData.append('description', data.description || '');
        if (data.sortOrder !== undefined) formData.append('sortOrder', String(data.sortOrder));
        if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
        if (data.isFeatured !== undefined) formData.append('isFeatured', String(data.isFeatured));


        // Add image file
        formData.append('image', imageFile || data.image || '');

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

    async createSubCategory(data: CreateSubCategoryData): Promise<AxiosResponse<ApiResponse<SubCategory>>> {
        return this.api.post('/sub-categories', data);
    }
    async createSubCategoryWithImage(data: CreateSubCategoryData, imageFile?: File): Promise<AxiosResponse<ApiResponse<SubCategory>>> {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('categoryId', data.categoryId);
        formData.append('type', data.type);
        if (data.customFields && data.customFields.length > 0) {
            formData.append('customFields', JSON.stringify(data.customFields));
        }
        formData.append('isActive', String(data.isActive));
        if (imageFile) {
            formData.append('image', imageFile);
        }
        return this.api.post('/sub-categories', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    async updateSubCategory(id: string, data: UpdateSubCategoryData): Promise<AxiosResponse<ApiResponse<SubCategory>>> {
        return this.api.patch(`/sub-categories/${id}`, data);
    }

    async updateSubCategoryWithImage(id: string, data: UpdateSubCategoryData, imageFile?: File): Promise<AxiosResponse<ApiResponse<SubCategory>>> {
        const formData = new FormData();
        if (data.name) formData.append('name', data.name);
        if (data.categoryId) formData.append('categoryId', data.categoryId);
        if (data.type) formData.append('type', data.type);
        if (data.customFields && data.customFields.length > 0) {
            formData.append('customFields', JSON.stringify(data.customFields));
        }
        if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
        formData.append('image', imageFile || data.image || '');

        return this.api.patch(`/sub-categories/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    async deleteSubCategory(id: string): Promise<AxiosResponse<ApiResponse<null>>> {
        return this.api.delete(`/sub-categories/${id}`);
    }

    // SubSubCategories endpoints
    async getSubSubCategories(params?: any): Promise<ApiResponse<SubSubCategory[]>> {
        return this.api.get('/sub-sub-categories', { params });
    }

    async getSubSubCategory(id: string): Promise<AxiosResponse<ApiResponse<SubSubCategory>>> {
        return this.api.get(`/sub-sub-categories/${id}`);
    }

    async getSubSubCategoriesBySubCategory(subCategoryId: string): Promise<AxiosResponse<SubSubCategory[]>> {
        return this.api.get(`/sub-sub-categories/sub-category/${subCategoryId}`);
    }

    async createSubSubCategory(data: CreateSubSubCategoryData): Promise<AxiosResponse<ApiResponse<SubSubCategory>>> {
        return this.api.post('/sub-sub-categories', data);
    }

    async createSubSubCategoryWithImage(data: CreateSubSubCategoryData, imageFile?: File): Promise<AxiosResponse<ApiResponse<SubSubCategory>>> {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('subCategoryId', data.subCategoryId);
        if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
        if (imageFile) {
            formData.append('image', imageFile);
        }
        return this.api.post('/sub-sub-categories', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    async updateSubSubCategory(id: string, data: UpdateSubSubCategoryData): Promise<AxiosResponse<ApiResponse<SubSubCategory>>> {
        return this.api.patch(`/sub-sub-categories/${id}`, data);
    }

    async updateSubSubCategoryWithImage(id: string, data: UpdateSubSubCategoryData, imageFile?: File): Promise<AxiosResponse<ApiResponse<SubSubCategory>>> {
        const formData = new FormData();
        if (data.name) formData.append('name', data.name);
        if (data.subCategoryId) formData.append('subCategoryId', data.subCategoryId);
        if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
        if (imageFile) {
            formData.append('image', imageFile);
        } else if (data.image) {
            formData.append('image', data.image);
        }

        return this.api.patch(`/sub-sub-categories/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    async deleteSubSubCategory(id: string): Promise<AxiosResponse<ApiResponse<null>>> {
        return this.api.delete(`/sub-sub-categories/${id}`);
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

    // Excel Import endpoints
    async importInventoryFromExcel(file: File, branchId: string, importMode: 'replace' | 'add' | 'subtract' = 'replace'): Promise<AxiosResponse<ApiResponse<any>>> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('branchId', branchId);
        formData.append('importMode', importMode);

        return this.api.post('/inventory/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    async downloadInventoryTemplate(): Promise<AxiosResponse<Blob>> {
        return this.api.get('/inventory/import/template', {
            responseType: 'blob'
        });
    }

    async exportInventoryToExcel(branchId?: string): Promise<AxiosResponse<Blob>> {
        return this.api.get('/inventory/export', {
            params: { branchId },
            responseType: 'blob'
        });
    }

    async deleteAllInventory(): Promise<AxiosResponse<ApiResponse<null>>> {
        return this.api.delete('/inventory/delete-all');
    }

    // Simple Notifications endpoints
    async getNotifications(): Promise<AxiosResponse<ApiResponse<Notification[]>>> {
        return this.api.get('/notifications/admin');
    }

    async createNotification(data: CreateNotificationData): Promise<AxiosResponse<ApiResponse<Notification>>> {
        return this.api.post('/notifications', data);
    }

    async broadcastNotification(title: string, message: string): Promise<AxiosResponse<ApiResponse<Notification>>> {
        return this.api.post('/notifications/broadcast', { title, message });
    }

    async markNotificationAsRead(id: string): Promise<AxiosResponse<ApiResponse<Notification>>> {
        return this.api.patch(`/notifications/${id}/read`);
    }

    async markAllNotificationsAsRead(): Promise<AxiosResponse<ApiResponse<null>>> {
        return this.api.patch('/notifications/mark-all-read');
    }

    async getNotificationStats(): Promise<AxiosResponse<ApiResponse<NotificationStats>>> {
        return this.api.get('/notifications/stats');
    }

    async deleteNotification(id: string): Promise<AxiosResponse<ApiResponse<null>>> {
        return this.api.delete(`/notifications/${id}`);
    }

    // Users endpoints
    async getUsers(params?: UsersQueryParams): Promise<AxiosResponse<PaginatedResponse<User>>> {
        return this.api.get('/users', { params });
    }

    async getUserById(id: string): Promise<AxiosResponse<ApiResponse<User>>> {
        return this.api.get(`/users/${id}`);
    }

    async createUser(userData: CreateUserData): Promise<AxiosResponse<ApiResponse<User>>> {
        return this.api.post('/users', userData);
    }

    async updateUser(id: string, userData: UpdateUserData): Promise<AxiosResponse<ApiResponse<User>>> {
        return this.api.patch(`/users/${id}`, userData);
    }

    async deleteUser(id: string): Promise<AxiosResponse<ApiResponse<null>>> {
        return this.api.delete(`/users/${id}`);
    }

    async toggleUserActive(id: string): Promise<AxiosResponse<ApiResponse<User>>> {
        return this.api.patch(`/users/${id}/toggle-active`);
    }

    async changeRole(id: string, role: UserRole): Promise<AxiosResponse<ApiResponse<User>>> {
        return this.api.patch(`/users/${id}/change-role`, { role });
    }

    async changeBranch(id: string, branchId: string): Promise<AxiosResponse<ApiResponse<User>>> {
        return this.api.patch(`/users/${id}/change-branch`, { branchId });
    }

    // Settings endpoints
    async getSettings(params?: any): Promise<ApiResponse<any>> {
        return this.api.get('/settings', { params });
    }

    async getSettingsByCategory(category: string): Promise<ApiResponse<any>> {
        return this.api.get(`/settings/category/${category}`);
    }

    async updateSetting(key: string, data: { value: any }): Promise<ApiResponse<any>> {
        return this.api.patch(`/settings/${key}`, data);
    }

    async bulkUpdateSettings(settings: Array<{ key: string; value: any }>): Promise<ApiResponse<any>> {
        return this.api.post('/settings/bulk-update', { settings });
    }

    async changePassword(changePasswordData: ChangePasswordData): Promise<AxiosResponse<ApiResponse<null>>> {
        return this.api.patch('/users/change-password', changePasswordData);
    }

    async getProfile(): Promise<AxiosResponse<ApiResponse<User>>> {
        return this.api.get('/users/profile');
    }

    async updateProfile(userData: UpdateUserData): Promise<AxiosResponse<ApiResponse<User>>> {
        return this.api.patch('/users/profile', userData);
    }

    // Banners endpoints
    async getBanners(params?: BannersQueryParams): Promise<AxiosResponse<PaginatedResponse<Banner>>> {
        // Only include params if they exist and are not empty
        const queryParams = params && Object.keys(params).length > 0 ? { params } : {};
        return this.api.get('/banners', queryParams);
    }

    async getBanner(id: string): Promise<AxiosResponse<ApiResponse<Banner>>> {
        return this.api.get(`/banners/${id}`);
    }

    async getActiveBanners(limit?: number): Promise<AxiosResponse<ApiResponse<Banner[]>>> {
        return this.api.get('/banners/active', { params: { limit } });
    }

    async getBannerStats(): Promise<AxiosResponse<ApiResponse<BannerStats>>> {
        return this.api.get('/banners/stats');
    }

    async createBanner(data: CreateBannerData): Promise<AxiosResponse<ApiResponse<Banner>>> {
        const formData = new FormData();

        // Add image file if it's a File object
        if (data.image instanceof File) {
            formData.append('image', data.image);
        } else if (data.image) {
            formData.append('image', data.image);
        }

        // Add other fields
        if (data.productId) formData.append('productId', data.productId);
        if (data.categoryId) formData.append('categoryId', data.categoryId);
        if (data.subCategoryId) formData.append('subCategoryId', data.subCategoryId);
        if (data.sortOrder !== undefined) formData.append('sortOrder', data.sortOrder.toString());
        if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString());

        return this.api.post('/banners', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    async updateBanner(id: string, data: UpdateBannerData): Promise<AxiosResponse<ApiResponse<Banner>>> {
        const formData = new FormData();

        // Add image file if it's a File object
        if (data.image instanceof File) {
            formData.append('image', data.image);
        } else if (data.image) {
            formData.append('image', data.image);
        }

        // Add other fields
        if (data.productId) formData.append('productId', data.productId);
        if (data.categoryId) formData.append('categoryId', data.categoryId);
        if (data.subCategoryId) formData.append('subCategoryId', data.subCategoryId);
        if (data.sortOrder !== undefined) formData.append('sortOrder', data.sortOrder.toString());
        if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString());

        return this.api.patch(`/banners/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    async toggleBannerActive(id: string): Promise<AxiosResponse<ApiResponse<Banner>>> {
        return this.api.patch(`/banners/${id}/toggle-active`);
    }

    async updateBannerSortOrder(id: string, data: UpdateSortOrderData): Promise<AxiosResponse<ApiResponse<Banner>>> {
        return this.api.patch(`/banners/${id}/sort-order`, data);
    }

    async deleteBanner(id: string): Promise<AxiosResponse<ApiResponse<null>>> {
        return this.api.delete(`/banners/${id}`);
    }

    // Merchant Requests endpoints
    async getMerchantRequests(params?: MerchantRequestsQueryParams): Promise<AxiosResponse<PaginatedResponse<MerchantRequest>>> {
        // Only include params if they exist and are not empty
        const queryParams = params && Object.keys(params).length > 0 ? { params } : {};
        return this.api.get('/merchants', queryParams);
    }

    async getMerchantRequest(id: string): Promise<AxiosResponse<ApiResponse<MerchantRequest>>> {
        return this.api.get(`/merchants/${id}`);
    }

    async getMyMerchantRequest(): Promise<AxiosResponse<ApiResponse<MerchantRequest>>> {
        return this.api.get('/merchants/my-request');
    }

    async getMerchantRequestStats(): Promise<AxiosResponse<ApiResponse<MerchantRequestStats>>> {
        return this.api.get('/merchants/statistics');
    }

    async createMerchantRequest(data: CreateMerchantRequestData): Promise<AxiosResponse<ApiResponse<MerchantRequest>>> {
        return this.api.post('/merchants/request', data);
    }

    async updateMyMerchantRequest(data: UpdateMerchantRequestData): Promise<AxiosResponse<ApiResponse<MerchantRequest>>> {
        return this.api.patch('/merchants/my-request', data);
    }

    async reviewMerchantRequest(id: string, data: ReviewMerchantRequestData): Promise<AxiosResponse<ApiResponse<MerchantRequest>>> {
        return this.api.patch(`/merchants/${id}/review`, data);
    }

    async deleteMerchantRequest(id: string): Promise<AxiosResponse<ApiResponse<null>>> {
        return this.api.delete(`/merchants/${id}`);
    }
}

export const apiService = new ApiService();
