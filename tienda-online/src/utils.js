import { createClient } from '@supabase/supabase-js';

// Supabase Initialization
const SUPABASE_URL = 'https://agdvljvyeoqisxdrryou.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Lo10nsckhw5Wt8PHGIW_BQ_Z23nw2Gl';
export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helpers para adaptar datos DB <-> React
export const mapToReact = (dbProduct) => ({
  id: dbProduct.id,
  name: dbProduct.name,
  price: dbProduct.price,
  oldPrice: dbProduct.old_price,
  badge: dbProduct.badge,
  img: dbProduct.image_url,
  category: dbProduct.category,
  unit: dbProduct.unit,
  isOffer: dbProduct.is_offer,
  isFeatured: dbProduct.is_featured,
  inStock: dbProduct.in_stock
});

export const mapToSupabase = (reactProduct) => ({
  name: reactProduct.name,
  price: reactProduct.price,
  old_price: reactProduct.oldPrice,
  badge: reactProduct.badge,
  image_url: reactProduct.img,
  category: reactProduct.category || 'Golosinas',
  unit: reactProduct.unit || 'Unidad',
  is_offer: reactProduct.isOffer,
  is_featured: reactProduct.isFeatured,
  in_stock: reactProduct.inStock
});

export const CATEGORIES = ['Todos', 'Gomitas', 'Chocolates', 'Alfajores', 'Chupetines', 'Caramelos', 'Snacks', 'Turrones', 'Chicles'];

export const fmt = (n) => new Intl.NumberFormat('es-AR', { style:'currency', currency:'ARS', minimumFractionDigits:0 }).format(n);
