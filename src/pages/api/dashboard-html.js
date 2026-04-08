import { getDashboardData } from '../../lib/db.js';
import { renderDashboardHtml } from '../../lib/renderDashboard.js';

export function GET() {
  return new Response(renderDashboardHtml(getDashboardData()), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}
