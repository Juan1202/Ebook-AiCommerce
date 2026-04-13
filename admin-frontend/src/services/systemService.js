const GATEWAY = 'http://localhost:8009';

const SERVICES = [
  { name: 'BFF Gateway',       key: 'bff',        url: `${GATEWAY}/health` },
  { name: 'Auth Service',      key: 'auth',        url: `${GATEWAY}/api/auth/health` },
  { name: 'Inventory Service', key: 'inventory',   url: `${GATEWAY}/api/inventory/health` },
  { name: 'Catalog Service',   key: 'catalog',     url: `${GATEWAY}/api/catalog/health` },
  { name: 'AI Enrichment',     key: 'enrichment',  url: `${GATEWAY}/api/enrichment/health` },
  { name: 'Data Quality',      key: 'quality',     url: `${GATEWAY}/api/quality/health` },
  { name: 'Config Module',     key: 'config',      url: `${GATEWAY}/api/config/health` },
];

export async function getServicesHealth() {
  const results = await Promise.allSettled(
    SERVICES.map(async (svc) => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(svc.url, { signal: controller.signal });
        clearTimeout(timer);
        return { ...svc, status: res.ok ? 'online' : 'degraded' };
      } catch {
        return { ...svc, status: 'offline' };
      }
    })
  );
  return results.map((r) =>
    r.status === 'fulfilled' ? r.value : { ...r.reason, status: 'offline' }
  );
}
