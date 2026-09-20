import api from '../api/axios';

export interface SizeInput {
  sizeName: string;
  extraPrice: number;
}

export interface ProductInput {
  name: string;
  categoryId: string;
  toppingGroupId?: string | null;
  price: number;
  description?: string;
  image?: string;
  isActive?: boolean;
  sizes?: SizeInput[];
}

const productService = {
  async getAll(params?: { page?: number; limit?: number }) {
    const res = await api.get('/products', { params });
    return res.data.data;
  },

  async create(data: ProductInput) {
    const res = await api.post('/products', data);
    return res.data.data;
  },

  async update(id: string, data: Partial<ProductInput>) {
    const res = await api.put(`/products/${id}`, data);
    return res.data.data;
  },

  async remove(id: string) {
    await api.delete(`/products/${id}`);
  },

  async uploadImage(file: File) {
    const form = new FormData();
    form.append('image', file);
    const res = await api.post('/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data as { url: string };
  },
};

export default productService;
