import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { STATUS_FLOW, estimatedTimeText, getStatusMeta, isFinalStatus, isKnownStatus } from '@/lib/order-status';

// Statuses the orders API accepts (the admin panel sets these)
function apiStatuses(): string[] {
  const src = fs.readFileSync(path.join(process.cwd(), 'src/app/api/orders/route.ts'), 'utf8');
  const match = src.match(/const VALID_STATUSES = \[([^\]]+)\]/);
  if (!match) throw new Error('VALID_STATUSES not found in src/app/api/orders/route.ts');
  return [...match[1].matchAll(/'([a-z_]+)'/g)].map((m) => m[1]);
}

describe('order statuses on /tracking', () => {
  it('knows every status the orders API accepts', () => {
    const statuses = apiStatuses();
    expect(statuses).toEqual(expect.arrayContaining(['preparing', 'cooking', 'packing', 'ready', 'completed', 'cancelled']));
    for (const status of statuses) {
      expect(isKnownStatus(status), `missing tracking config for "${status}"`).toBe(true);
    }
  });

  it('shows the admin statuses with their labels', () => {
    expect(getStatusMeta('cooking').label).toBe('Cocinando');
    expect(getStatusMeta('packing').label).toBe('Empacando');
    expect(getStatusMeta('completed').label).toBe('Completado');
  });

  it('uses a neutral fallback for unknown statuses instead of failing', () => {
    for (const status of ['weird_status', '', null, undefined, 'toString', '__proto__']) {
      const meta = getStatusMeta(status as string);
      expect(meta.label).toBe('Actualizando estado');
      expect(meta.progress).toBe(0);
    }
    expect(estimatedTimeText('weird_status', new Date().toISOString())).toBe('Calculando tiempo...');
  });

  it('orders the flow by increasing progress, ending at 100%', () => {
    const progress = STATUS_FLOW.map((s) => getStatusMeta(s).progress);
    expect([...progress].sort((a, b) => a - b)).toEqual(progress);
    expect(progress.at(-1)).toBe(100);
  });

  it('treats completed, delivered and cancelled as final (stop polling)', () => {
    expect(isFinalStatus('completed')).toBe(true);
    expect(isFinalStatus('delivered')).toBe(true);
    expect(isFinalStatus('cancelled')).toBe(true);
    expect(isFinalStatus('cooking')).toBe(false);
    expect(isFinalStatus('weird_status')).toBe(false);
  });
});
