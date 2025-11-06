import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import './admin.css';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category_id: string;
  images: string[];
  is_featured: boolean;
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/admin/login';
        return;
      }

      const { data: adminData } = await supabase
        .from('admin_users')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();

      if (!adminData?.is_admin) {
        setError('Access denied. You are not an admin.');
        setTimeout(() => {
          supabase.auth.signOut();
          window.location.href = '/admin/login';
        }, 2000);
        return;
      }

      setIsAdmin(true);
      setIsAuthenticated(true);
      loadProducts();
      loadCategories();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error: err } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setProducts(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error: err } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setCategories(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  if (loading) {
    return <div className="admin-container"><div className="loading">Loading...</div></div>;
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>Crave Admin Dashboard</h1>
          <button onClick={handleSignOut} className="btn-logout">
            Sign Out
          </button>
        </div>
      </header>

      <div className="admin-layout">
        <nav className="admin-nav">
          <button
            className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('products');
              setShowProductForm(false);
              setShowCategoryForm(false);
            }}
          >
            Products
          </button>
          <button
            className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('categories');
              setShowProductForm(false);
              setShowCategoryForm(false);
            }}
          >
            Categories
          </button>
        </nav>

        <main className="admin-content">
          {activeTab === 'products' && (
            <ProductsSection
              products={products}
              categories={categories}
              showForm={showProductForm}
              setShowForm={setShowProductForm}
              editingProduct={editingProduct}
              setEditingProduct={setEditingProduct}
              onProductsChange={loadProducts}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesSection
              categories={categories}
              showForm={showCategoryForm}
              setShowForm={setShowCategoryForm}
              editingCategory={editingCategory}
              setEditingCategory={setEditingCategory}
              onCategoriesChange={loadCategories}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function ProductsSection({
  products,
  categories,
  showForm,
  setShowForm,
  editingProduct,
  setEditingProduct,
  onProductsChange,
}: any) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    stock_quantity: 0,
    category_id: '',
    images: [],
    is_featured: false,
    is_active: true,
  });
  const [imageUrls, setImageUrls] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingProduct) {
      setFormData(editingProduct);
      setImageUrls(editingProduct.images?.join('\n') || '');
      setShowForm(true);
    }
  }, [editingProduct]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file, { upsert: false });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);

        setImageUrls((prev) => (prev ? prev + '\n' + data.publicUrl : data.publicUrl));
        setFormData((prev) => ({
          ...prev,
          images: [...(prev.images || []), data.publicUrl],
        }));
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const images = imageUrls
        .split('\n')
        .map((url) => url.trim())
        .filter((url) => url);

      const payload = {
        ...formData,
        images,
        price: parseFloat(formData.price?.toString() || '0'),
        stock_quantity: parseInt(formData.stock_quantity?.toString() || '0'),
      };

      if (editingProduct) {
        const { error: err } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);

        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('products').insert([payload]);

        if (err) throw err;
      }

      setFormData({
        name: '',
        description: '',
        price: 0,
        stock_quantity: 0,
        category_id: '',
        images: [],
        is_featured: false,
        is_active: true,
      });
      setImageUrls('');
      setShowForm(false);
      setEditingProduct(null);
      onProductsChange();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error: err } = await supabase.from('products').delete().eq('id', id);

      if (err) throw err;
      onProductsChange();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="section">
      <div className="section-header">
        <h2>Products</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingProduct(null);
            setFormData({
              name: '',
              description: '',
              price: 0,
              stock_quantity: 0,
              category_id: '',
              images: [],
              is_featured: false,
              is_active: true,
            });
            setImageUrls('');
          }}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter product name"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter product description"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price (₦) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label>Stock Quantity *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock_quantity || ''}
                onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={formData.category_id || ''}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            >
              <option value="">Select a category</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Product Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
            />
            {formData.images && formData.images.length > 0 && (
              <div className="image-preview">
                {formData.images.map((img, idx) => (
                  <img key={idx} src={img} alt={`Product ${idx}`} />
                ))}
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-checkbox">
              <input
                type="checkbox"
                checked={formData.is_featured || false}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              />
              <label>Featured Product</label>
            </div>

            <div className="form-checkbox">
              <input
                type="checkbox"
                checked={formData.is_active !== false}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <label>Active</label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
          </button>
        </form>
      )}

      <div className="products-grid">
        {products.map((product: any) => (
          <div key={product.id} className="product-card">
            {product.images && product.images[0] && (
              <img src={product.images[0]} alt={product.name} className="product-image" />
            )}
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="price">₦{product.price.toFixed(2)}</p>
              <p className="stock">Stock: {product.stock_quantity}</p>
              <div className="product-actions">
                <button
                  onClick={() => setEditingProduct(product)}
                  className="btn btn-small btn-edit"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="btn btn-small btn-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoriesSection({
  categories,
  showForm,
  setShowForm,
  editingCategory,
  setEditingCategory,
  onCategoriesChange,
}: any) {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    description: '',
    image_url: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingCategory) {
      setFormData(editingCategory);
      setShowForm(true);
    }
  }, [editingCategory]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileName = `${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('category-images')
        .upload(fileName, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('category-images').getPublicUrl(fileName);

      setFormData((prev) => ({
        ...prev,
        image_url: data.publicUrl,
      }));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingCategory) {
        const { error: err } = await supabase
          .from('categories')
          .update(formData)
          .eq('id', editingCategory.id);

        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('categories').insert([formData]);

        if (err) throw err;
      }

      setFormData({
        name: '',
        description: '',
        image_url: '',
      });
      setShowForm(false);
      setEditingCategory(null);
      onCategoriesChange();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const { error: err } = await supabase.from('categories').delete().eq('id', id);

      if (err) throw err;
      onCategoriesChange();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="section">
      <div className="section-header">
        <h2>Categories</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingCategory(null);
            setFormData({
              name: '',
              description: '',
              image_url: '',
            });
          }}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-group">
            <label>Category Name *</label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter category name"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter category description"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Category Image</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {formData.image_url && (
              <img src={formData.image_url} alt="Category" className="image-preview-single" />
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Add Category'}
          </button>
        </form>
      )}

      <div className="categories-grid">
        {categories.map((category: any) => (
          <div key={category.id} className="category-card">
            {category.image_url && <img src={category.image_url} alt={category.name} />}
            <div className="category-info">
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <div className="category-actions">
                <button
                  onClick={() => setEditingCategory(category)}
                  className="btn btn-small btn-edit"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="btn btn-small btn-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
