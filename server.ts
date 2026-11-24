import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_ORDERS, INITIAL_PRODUCTS, INITIAL_STORE_CONFIG } from './src/server/seedData.ts';
import type { Order, Product, StoreConfig } from './src/shared/types.ts';
import { calculateVariantPricing } from './src/shared/types.ts';

interface StoreDatabase {
  config: StoreConfig;
  products: Product[];
  orders: Order[];
  newsletter: { email: string; subscribedAt: string }[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

function ensureDatabase(): StoreDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_PATH)) {
    const initial: StoreDatabase = {
      config: INITIAL_STORE_CONFIG,
      products: INITIAL_PRODUCTS,
      orders: INITIAL_ORDERS,
      newsletter: [],
    };
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as StoreDatabase;
    return {
      config: parsed.config ?? INITIAL_STORE_CONFIG,
      products: Array.isArray(parsed.products) && parsed.products.length > 0 ? parsed.products : INITIAL_PRODUCTS,
      orders: Array.isArray(parsed.orders) ? parsed.orders : INITIAL_ORDERS,
      newsletter: Array.isArray(parsed.newsletter) ? parsed.newsletter : [],
    };
  } catch {
    const fallback: StoreDatabase = {
      config: INITIAL_STORE_CONFIG,
      products: INITIAL_PRODUCTS,
      orders: INITIAL_ORDERS,
      newsletter: [],
    };
    fs.writeFileSync(STORE_PATH, JSON.stringify(fallback, null, 2), 'utf-8');
    return fallback;
  }
}

function saveDatabase(db: StoreDatabase): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '8mb' }));

  let db = ensureDatabase();

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, brand: db.config.brandName });
  });

  // Get & Update Store Configuration (Admin Customization)
  app.get('/api/config', (_req, res) => {
    res.json(db.config);
  });

  app.put('/api/config', (req, res) => {
    const incoming = req.body as Partial<StoreConfig>;
    db.config = {
      ...db.config,
      ...incoming,
      contact: {
        ...db.config.contact,
        ...(incoming.contact || {}),
      },
      featuredCollectionIds: {
        ...db.config.featuredCollectionIds,
        ...(incoming.featuredCollectionIds || {}),
      },
    };
    saveDatabase(db);
    res.json(db.config);
  });

  // Reset store config/catalog to defaults if needed
  app.post('/api/config/reset', (_req, res) => {
    db = {
      config: INITIAL_STORE_CONFIG,
      products: INITIAL_PRODUCTS,
      orders: db.orders,
      newsletter: db.newsletter,
    };
    saveDatabase(db);
    res.json({ config: db.config, productsCount: db.products.length });
  });

  // Products Listing with full search, filtering, sorting & pagination
  app.get('/api/products', (req, res) => {
    const {
      q,
      category,
      subcategory,
      minPrice,
      maxPrice,
      color,
      material,
      minDiscount,
      inStock,
      flag,
      sort = 'featured',
      page = '1',
      limit = '50',
    } = req.query as Record<string, string | undefined>;

    let items = db.products.map((p) => {
      const firstInStock = p.variants.find((v) => v.stock > 0) || p.variants[0];
      const computed = calculateVariantPricing(p, firstInStock, db.config);
      return {
        ...p,
        price: computed.currentPrice,
        originalPrice: computed.originalPrice,
        discountPercent: computed.discountPercent,
      };
    });

    if (q && q.trim()) {
      const term = q.trim().toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.nameTe.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term) ||
          p.subcategory.toLowerCase().includes(term) ||
          p.material.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
      );
    }

    if (category && category !== 'All') {
      if (category === 'Wedding & Festive') {
        items = items.filter((p) => p.flags.isWeddingFestive);
      } else {
        items = items.filter((p) => p.category.toLowerCase() === category.toLowerCase());
      }
    }

    if (subcategory && subcategory !== 'All') {
      items = items.filter((p) => p.subcategory.toLowerCase() === subcategory.toLowerCase());
    }

    if (minPrice) {
      const min = Number(minPrice);
      if (!Number.isNaN(min)) items = items.filter((p) => p.price >= min);
    }

    if (maxPrice) {
      const max = Number(maxPrice);
      if (!Number.isNaN(max)) items = items.filter((p) => p.price <= max);
    }

    if (color && color !== 'All') {
      items = items.filter((p) => p.colors.some((c) => c.toLowerCase() === color.toLowerCase()));
    }

    if (material && material !== 'All') {
      items = items.filter((p) => p.material.toLowerCase().includes(material.toLowerCase()));
    }

    if (minDiscount) {
      const md = Number(minDiscount);
      if (!Number.isNaN(md)) items = items.filter((p) => p.discountPercent >= md);
    }

    if (inStock === 'true') {
      items = items.filter((p) => p.variants.some((v) => v.stock > 0));
    }

    if (flag) {
      items = items.filter((p) => {
        if (flag === 'new') return p.flags.isNewArrival;
        if (flag === 'bestseller') return p.flags.isBestSeller;
        if (flag === 'featured') return p.flags.isFeatured;
        if (flag === 'wedding') return p.flags.isWeddingFestive;
        if (flag === 'offers') return p.flags.isSpecialOffer || p.discountPercent >= 15;
        if (flag === 'ready') return p.flags.isReadyToWear;
        return true;
      });
    }

    switch (sort) {
      case 'price-asc':
        items.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        items.sort((a, b) => b.price - a.price);
        break;
      case 'discount':
        items.sort((a, b) => b.discountPercent - a.discountPercent);
        break;
      case 'newest':
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'rating':
        items.sort((a, b) => b.rating - a.rating);
        break;
      default:
        items.sort((a, b) => Number(b.flags.isFeatured) - Number(a.flags.isFeatured));
    }

    const total = items.length;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 50));
    const start = (pageNum - 1) * limitNum;
    const paginated = items.slice(start, start + limitNum);

    res.json({
      products: paginated,
      total,
      page: pageNum,
      totalPages: Math.max(1, Math.ceil(total / limitNum)),
    });
  });

  // Single Product Detail
  app.get('/api/products/:id', (req, res) => {
    const product = db.products.find((p) => p._id === req.params.id || p.slug === req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  });

  // Create Product (Admin)
  app.post('/api/products', (req, res) => {
    const body = req.body as Partial<Product>;
    if (!body.name || !body.category || !body.subcategory) {
      res.status(400).json({ error: 'Name, category, and subcategory are required.' });
      return;
    }
    const id = `prod-${Date.now()}`;
    const newProduct: Product = {
      _id: id,
      slug: body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
      sku: body.sku || `SDA-${Date.now().toString().slice(-5)}`,
      name: body.name,
      nameTe: body.nameTe || body.name,
      category: body.category,
      subcategory: body.subcategory,
      description: body.description || 'Curated luxury creation from SDA Collections.',
      descriptionTe: body.descriptionTe || body.description || 'SDA కలెక్షన్స్ ప్రత్యేక డిజైన్.',
      images: body.images && body.images.length > 0 ? body.images : [INITIAL_PRODUCTS[0].images[0]],
      price: Number(body.price) || 4999,
      originalPrice: Number(body.originalPrice) || Number(body.price) || 5999,
      discountPercent: Number(body.discountPercent) || 10,
      isWeightPriced: Boolean(body.isWeightPriced),
      metalType: body.metalType || 'None',
      makingChargePercent: Number(body.makingChargePercent) || 0,
      gstPercent: Number(body.gstPercent) || 5,
      variants:
        body.variants && body.variants.length > 0
          ? body.variants
          : [
              {
                id: `var-${Date.now()}`,
                label: 'Standard Edition',
                color: 'Gold',
                colorHex: '#D4AF62',
                sizeOrLength: 'Free Size',
                weightGrams: body.isWeightPriced ? 18 : undefined,
                stock: 5,
              },
            ],
      material: body.material || 'Pure Silk & Zari',
      colors: body.colors && body.colors.length > 0 ? body.colors : ['Gold'],
      occasion: body.occasion || ['Festive', 'Wedding'],
      specifications: body.specifications || [{ label: 'Origin', value: 'SDA Atelier India' }],
      flags: body.flags || {
        isNewArrival: true,
        isBestSeller: false,
        isFeatured: true,
        isWeddingFestive: false,
        isSpecialOffer: false,
        isReadyToWear: false,
      },
      rating: 5.0,
      reviewCount: 0,
      reviews: [],
      createdAt: new Date().toISOString(),
    };
    db.products.unshift(newProduct);
    saveDatabase(db);
    res.status(201).json(newProduct);
  });

  // Update Product / Variant Stock (Admin)
  app.put('/api/products/:id', (req, res) => {
    const idx = db.products.findIndex((p) => p._id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    db.products[idx] = { ...db.products[idx], ...req.body, _id: db.products[idx]._id };
    saveDatabase(db);
    res.json(db.products[idx]);
  });

  // Delete Product (Admin)
  app.delete('/api/products/:id', (req, res) => {
    db.products = db.products.filter((p) => p._id !== req.params.id);
    saveDatabase(db);
    res.json({ ok: true });
  });

  // Add Customer Review
  app.post('/api/products/:id/reviews', (req, res) => {
    const idx = db.products.findIndex((p) => p._id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    const { author, city, rating, comment } = req.body as {
      author?: string;
      city?: string;
      rating?: number;
      comment?: string;
    };
    if (!author || !comment) {
      res.status(400).json({ error: 'Name and review comment are required.' });
      return;
    }
    const review = {
      id: `rev-${Date.now()}`,
      author: author.trim(),
      city: (city || 'India').trim(),
      rating: Math.max(1, Math.min(5, Number(rating) || 5)),
      comment: comment.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
      verified: true,
    };
    const product = db.products[idx];
    const reviews = [review, ...product.reviews];
    const totalScore = reviews.reduce((acc, r) => acc + r.rating, 0);
    product.reviews = reviews;
    product.reviewCount = Math.max(product.reviewCount + 1, reviews.length);
    product.rating = Number((totalScore / reviews.length).toFixed(1));
    saveDatabase(db);
    res.status(201).json(product);
  });

  // Delivery PIN Code Checker
  app.get('/api/pincode/:pin', (req, res) => {
    const pin = req.params.pin.trim();
    if (!/^[1-9][0-9]{5}$/.test(pin)) {
      res.status(400).json({ valid: false, message: 'Please enter a valid 6-digit Indian PIN code.' });
      return;
    }
    const firstDigit = pin[0];
    const isSouthMetro = ['5', '6'].includes(firstDigit);
    const days = isSouthMetro ? '2–3 business days' : '4–6 business days';
    const codAvailable = !pin.startsWith('79');
    res.json({
      valid: true,
      pincode: pin,
      serviceable: true,
      estimatedDelivery: days,
      codAvailable,
      insuredShipping: true,
      message: `Insured luxury delivery to ${pin} in ${days}. ${codAvailable ? 'Cash on Delivery available.' : 'Prepaid UPI/Card only.'}`,
    });
  });

  // Create Order & Decrement Variant Inventory
  app.post('/api/orders', (req, res) => {
    const body = req.body as {
      customerName?: string;
      phone?: string;
      email?: string;
      address?: string;
      city?: string;
      state?: string;
      pincode?: string;
      paymentMethod?: 'UPI' | 'Card' | 'COD';
      items?: { productId: string; variantId: string; quantity: number }[];
    };

    if (!body.customerName || !body.phone || !body.address || !body.pincode || !body.items?.length) {
      res.status(400).json({ error: 'Complete shipping details and at least one item are required.' });
      return;
    }

    const orderItems: Order['items'] = [];
    let subtotal = 0;

    for (const reqItem of body.items) {
      const product = db.products.find((p) => p._id === reqItem.productId);
      if (!product) {
        res.status(400).json({ error: `Product ${reqItem.productId} no longer exists.` });
        return;
      }
      const variant = product.variants.find((v) => v.id === reqItem.variantId) || product.variants[0];
      if (!variant || variant.stock < reqItem.quantity) {
        res.status(400).json({
          error: `Insufficient inventory for ${product.name} (${variant?.label || 'Selected variant'}).`,
        });
        return;
      }

      const pricing = calculateVariantPricing(product, variant, db.config);
      variant.stock -= reqItem.quantity;

      orderItems.push({
        productId: product._id,
        variantId: variant.id,
        name: product.name,
        variantLabel: variant.label,
        unitPrice: pricing.currentPrice,
        quantity: reqItem.quantity,
        image: product.images[0],
      });
      subtotal += pricing.currentPrice * reqItem.quantity;
    }

    const shipping = subtotal >= 2999 ? 0 : 199;
    const orderNumber = `SDA-2026-${Math.floor(1000 + Math.random() * 8999)}`;
    const newOrder: Order = {
      _id: `ord-${Date.now()}`,
      orderNumber,
      customerName: body.customerName.trim(),
      phone: body.phone.trim(),
      email: (body.email || '').trim(),
      address: body.address.trim(),
      city: (body.city || 'Hyderabad').trim(),
      state: (body.state || 'Telangana').trim(),
      pincode: body.pincode.trim(),
      paymentMethod: body.paymentMethod || 'UPI',
      items: orderItems,
      subtotal,
      shipping,
      total: subtotal + shipping,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
    };

    db.orders.unshift(newOrder);
    saveDatabase(db);
    res.status(201).json(newOrder);
  });

  app.get('/api/orders', (_req, res) => {
    res.json(db.orders);
  });

  app.put('/api/orders/:id/status', (req, res) => {
    const order = db.orders.find((o) => o._id === req.params.id || o.orderNumber === req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    if (req.body?.status) {
      order.status = req.body.status;
      saveDatabase(db);
    }
    res.json(order);
  });

  app.get('/api/orders/track/:orderNumber', (req, res) => {
    const query = req.params.orderNumber.trim().toLowerCase();
    const order = db.orders.find(
      (o) => o.orderNumber.toLowerCase() === query || o.phone.replace(/\s+/g, '').endsWith(query)
    );
    if (!order) {
      res.status(404).json({ error: 'No matching order found. Try SDA-2026-1042.' });
      return;
    }
    res.json(order);
  });

  // Newsletter Subscription
  app.post('/api/newsletter', (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }
    if (!db.newsletter.some((n) => n.email === email)) {
      db.newsletter.push({ email, subscribedAt: new Date().toISOString() });
      saveDatabase(db);
    }
    res.json({ ok: true, message: 'Welcome to the SDA Collections Royal Circle.' });
  });

  // Demo Auth Endpoint
  app.post('/api/auth/login', (req, res) => {
    const { email, password, mode } = req.body as { email?: string; password?: string; mode?: 'customer' | 'admin' };
    if (!email) {
      res.status(400).json({ error: 'Email is required.' });
      return;
    }
    if (mode === 'admin' || email.toLowerCase() === 'admin@sdacollections.in') {
      if (password !== 'SDA@2026' && password !== 'admin123') {
        res.status(401).json({ error: 'Invalid admin passcode. Use SDA@2026 for demo admin access.' });
        return;
      }
      res.json({
        id: 'admin-1',
        name: 'SDA Creative Director',
        email: 'admin@sdacollections.in',
        role: 'admin',
        token: 'sda-admin-session',
      });
      return;
    }
    res.json({
      id: `cust-${Date.now()}`,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      role: 'customer',
      token: 'sda-customer-session',
    });
  });

  // Vite middleware in dev, static dist in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SDA Collections server running on http://localhost:${PORT}`);
  });
}

startServer();
