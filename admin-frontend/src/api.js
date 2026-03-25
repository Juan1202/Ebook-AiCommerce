import axios from 'axios'

const BFF = import.meta.env.VITE_BFF_URL || 'http://localhost:8009'

const http = axios.create({ baseURL: BFF, timeout: 5000 })

// --- Inventory ---
export async function getInventory() {
  try {
    const r = await http.get('/api/inventory/')
    return r.data
  } catch {
    return MOCK_INVENTORY
  }
}

export async function checkAvailability(ref) {
  try {
    const r = await http.get(`/api/inventory/availability/${ref}`)
    return r.data
  } catch {
    return { book_reference: ref, available_quantity: 0, mock: true }
  }
}

// --- Batches ---
export async function getBatches() {
  try {
    const r = await http.get('/api/inventory/batches/')
    return r.data
  } catch {
    return MOCK_BATCHES
  }
}

export async function getBatchErrors(batchId) {
  try {
    const r = await http.get(`/api/inventory/batches/${batchId}/errors`)
    return r.data
  } catch {
    return []
  }
}

export async function uploadBatch(file) {
  const form = new FormData()
  form.append('file', file)
  const r = await http.post('/api/inventory/batches/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return r.data
}

// --- Quality ---
export async function getQualitySummary() {
  try {
    const r = await http.get('/api/quality/summary')
    return r.data
  } catch {
    return MOCK_QUALITY_SUMMARY
  }
}

// --- Services health ---
export async function getServicesStatus() {
  const services = [
    { name: 'auth-service', path: '/api/auth/health' },
    { name: 'inventory-service', path: '/api/inventory/health' },
    { name: 'catalog-service', path: '/api/catalog/health' },
    { name: 'ai-enrichment-mock', path: '/api/enrichment/health' },
    { name: 'data-quality-module', path: '/api/quality/health' },
    { name: 'config-module', path: '/api/config/health' },
  ]
  const results = await Promise.allSettled(
    services.map(s => http.get(s.path).then(() => ({ ...s, status: 'up' })))
  )
  return results.map((r, i) =>
    r.status === 'fulfilled' ? r.value : { ...services[i], status: 'down' }
  )
}

// --- Mock fallback data ---
const MOCK_INVENTORY = [
  { id: 1, book_reference: 'REF-001', title: 'Cien Años de Soledad', author: 'García Márquez', quantity: 5, condition: 'new' },
  { id: 2, book_reference: 'REF-002', title: 'El Quijote', author: 'Cervantes', quantity: 3, condition: 'good' },
  { id: 3, book_reference: 'REF-003', title: '1984', author: 'Orwell', quantity: 8, condition: 'like_new' },
]

const MOCK_BATCHES = [
  { id: 1, filename: 'sample_inventory.csv', status: 'completed', total_rows: 12, valid_rows: 10, error_rows: 2 },
  { id: 2, filename: 'libros_enero.xlsx', status: 'completed', total_rows: 50, valid_rows: 48, error_rows: 2 },
]

const MOCK_QUALITY_SUMMARY = {
  total_batches: 2,
  completed_batches: 2,
  failed_batches: 0,
  total_items_processed: 62,
  total_errors: 4,
  overall_error_rate: 0.0645,
  batches: MOCK_BATCHES.map(b => ({ ...b, error_rate: b.error_rows / b.total_rows })),
}
