const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = {
  // Auth endpoints
  auth: {
    login: async (username: string, password: string) => {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      return response.json();
    },
    register: async (data: any) => {
      const response = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    getMe: async (token: string) => {
      const response = await fetch(`${API_URL}/api/v1/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return response.json();
    },
  },

  // User management endpoints
  users: {
    getAll: async (token: string) => {
      const response = await fetch(`${API_URL}/api/v1/users/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return response.json();
    },
    getById: async (id: number, token: string) => {
      const response = await fetch(`${API_URL}/api/v1/users/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return response.json();
    },
    create: async (data: any, token: string) => {
      const response = await fetch(`${API_URL}/api/v1/users/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    update: async (id: number, data: any, token: string) => {
      const response = await fetch(`${API_URL}/api/v1/users/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    delete: async (id: number, token: string) => {
      const response = await fetch(`${API_URL}/api/v1/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return response.ok;
    },
  },

  // Buyer endpoints
  buyers: {
    getAll: async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/buyers/`);
        if (!response.ok) {
          throw new Error(`Failed to fetch buyers: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("[API] Network error fetching buyers:", error);
        }
        throw error;
      }
    },
    getById: async (id: number) => {
      const response = await fetch(`${API_URL}/api/v1/buyers/${id}`);
      return response.json();
    },
    create: async (data: any) => {
      const response = await fetch(`${API_URL}/api/v1/buyers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    update: async (id: number, data: any) => {
      const response = await fetch(`${API_URL}/api/v1/buyers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    delete: async (id: number) => {
      const response = await fetch(`${API_URL}/api/v1/buyers/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    },
  },

  // Supplier endpoints
  suppliers: {
    getAll: async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/suppliers/`, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch suppliers: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("[API] Error fetching suppliers:", error);
        }
        throw error;
      }
    },
    create: async (data: any) => {
      const response = await fetch(`${API_URL}/api/v1/suppliers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to create supplier: ${response.status}`);
      }
      return response.json();
    },
    update: async (id: number, data: any) => {
      const response = await fetch(`${API_URL}/api/v1/suppliers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to update supplier: ${response.status}`);
      }
      return response.json();
    },
    delete: async (id: number) => {
      const response = await fetch(`${API_URL}/api/v1/suppliers/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to delete supplier: ${response.status}`);
      }
      return response.ok;
    },
  },

  // Sample endpoints
  samples: {
    getAll: async () => {
      const response = await fetch(`${API_URL}/api/v1/samples/`);
      return response.json();
    },
    getById: async (id: number) => {
      const response = await fetch(`${API_URL}/api/v1/samples/${id}`);
      return response.json();
    },
    getBySampleId: async (sampleId: string) => {
      const response = await fetch(`${API_URL}/api/v1/samples/by-sample-id/${sampleId}`);
      return response.json();
    },
    create: async (data: any) => {
      const response = await fetch(`${API_URL}/api/v1/samples/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    update: async (id: number, data: any) => {
      const response = await fetch(`${API_URL}/api/v1/samples/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    getOperations: async (sampleId: number) => {
      const response = await fetch(`${API_URL}/api/v1/samples/operations?sample_id=${sampleId}`);
      return response.json();
    },
    createOperation: async (data: any) => {
      const response = await fetch(`${API_URL}/api/v1/samples/operations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
  },

  // Style endpoints
  styles: {
    getAll: async () => {
      const response = await fetch(`${API_URL}/api/v1/samples/styles?limit=1000`);
      return response.json();
    },
    getById: async (id: number) => {
      const response = await fetch(`${API_URL}/api/v1/samples/styles/${id}`);
      return response.json();
    },
    create: async (data: any) => {
      const response = await fetch(`${API_URL}/api/v1/samples/styles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    update: async (id: number, data: any) => {
      const response = await fetch(`${API_URL}/api/v1/samples/styles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    delete: async (id: number) => {
      const response = await fetch(`${API_URL}/api/v1/samples/styles/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete style');
      }
      return true;
    },
  },

  // Style Variant endpoints
  styleVariants: {
    getAll: async (styleSummaryId?: number) => {
      const url = styleSummaryId
        ? `${API_URL}/api/v1/samples/style-variants?style_summary_id=${styleSummaryId}&limit=1000`
        : `${API_URL}/api/v1/samples/style-variants?limit=1000`;
      const response = await fetch(url);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
        throw new Error(error.detail || `Failed to fetch style variants: ${response.status}`);
      }
      return response.json();
    },
    getById: async (id: number) => {
      const response = await fetch(`${API_URL}/api/v1/samples/style-variants/${id}`);
      return response.json();
    },
    create: async (data: any) => {
      const response = await fetch(`${API_URL}/api/v1/samples/style-variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    update: async (id: number, data: any) => {
      const response = await fetch(`${API_URL}/api/v1/samples/style-variants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    delete: async (id: number) => {
      const response = await fetch(`${API_URL}/api/v1/samples/style-variants/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    },
  },

  // Required Material endpoints
  requiredMaterials: {
    getAll: async (styleVariantId?: number) => {
      const url = styleVariantId
        ? `${API_URL}/api/v1/samples/required-materials?style_variant_id=${styleVariantId}`
        : `${API_URL}/api/v1/samples/required-materials`;
      const response = await fetch(url);
      return response.json();
    },
    getById: async (id: number) => {
      const response = await fetch(`${API_URL}/api/v1/samples/required-materials/${id}`);
      return response.json();
    },
    create: async (data: any) => {
      const response = await fetch(`${API_URL}/api/v1/samples/required-materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    update: async (id: number, data: any) => {
      const response = await fetch(`${API_URL}/api/v1/samples/required-materials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    delete: async (id: number) => {
      const response = await fetch(`${API_URL}/api/v1/samples/required-materials/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    },
  },

  // Order Management endpoints
  orders: {
    getAll: async () => {
      const response = await fetch(`${API_URL}/api/v1/orders/`);
      return response.json();
    },
    getById: async (id: number) => {
      const response = await fetch(`${API_URL}/api/v1/orders/${id}`);
      return response.json();
    },
    create: async (data: any) => {
      const response = await fetch(`${API_URL}/api/v1/orders/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    update: async (id: number, data: any) => {
      const response = await fetch(`${API_URL}/api/v1/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    delete: async (id: number) => {
      const response = await fetch(`${API_URL}/api/v1/orders/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    },
  },

  // Materials endpoints
  materials: {
    getAll: async () => {
      const response = await fetch(`${API_URL}/api/v1/materials/`);
      return response.json();
    },
    getById: async (id: number) => {
      const response = await fetch(`${API_URL}/api/v1/materials/${id}`);
      return response.json();
    },
    create: async (data: any) => {
      const response = await fetch(`${API_URL}/api/v1/materials/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create material');
      }
      return response.json();
    },
    update: async (id: number, data: any) => {
      const response = await fetch(`${API_URL}/api/v1/materials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update material');
      }
      return response.json();
    },
    delete: async (id: number) => {
      const response = await fetch(`${API_URL}/api/v1/materials/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    },
  },
};
