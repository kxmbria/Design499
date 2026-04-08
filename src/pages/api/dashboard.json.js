import { getDashboardData } from '../../lib/db.js';

export function GET() {
  return new Response(JSON.stringify(getDashboardData()), {
    headers: { 'Content-Type': 'application/json' }
  });
}
