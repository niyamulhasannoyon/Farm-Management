import { NextResponse } from 'next/server';
import { INITIAL_FLOCKS, getStoredFlockRecords } from '@/lib/mockData';
import { computeFlockRecords } from '@/lib/calculations';
import { evaluateFlockAlerts, AlertFlag } from '@/lib/alerts';

/**
 * Scheduled Alert Summary Endpoint (for Vercel Cron or manual manager trigger)
 * Checks all active flocks in Unit-B and compiles critical/warning alert digests.
 */
export async function GET() {
  const allFlags: (AlertFlag & { flockNo: string; shedNo: string; breed: string })[] = [];

  for (const flock of INITIAL_FLOCKS) {
    if (flock.status !== 'ACTIVE') continue;

    const raw = getStoredFlockRecords(flock.id);
    const computed = computeFlockRecords(raw);
    const flags = evaluateFlockAlerts(computed);

    for (const flag of flags) {
      allFlags.push({
        ...flag,
        flockNo: flock.flockNo,
        shedNo: flock.shedNo,
        breed: flock.breed,
      });
    }
  }

  const criticals = allFlags.filter((f) => f.severity === 'critical');
  const warnings = allFlags.filter((f) => f.severity === 'warn');

  // Format WhatsApp / Email markdown digest text
  const textDigest = [
    `🐔 *RBCL UNIT-B BREEDER FARM - DAILY ALERT DIGEST*`,
    `📅 Date: ${new Date().toISOString().split('T')[0]}`,
    `⚠️ Total Anomalies: ${allFlags.length} (${criticals.length} Critical, ${warnings.length} Warnings)`,
    '',
    criticals.length > 0 ? `🚨 *CRITICAL ALERTS (≥2x Threshold):*` : `✅ No Critical Alerts.`,
    ...criticals.map(
      (c) => `• Shed ${c.shedNo} (Flock ${c.flockNo}) Wk ${c.ageWeeks}: ${c.message}`
    ),
    '',
    warnings.length > 0 ? `⚠️ *WARNING ALERTS (≥1x Threshold):*` : '',
    ...warnings.map(
      (w) => `• Shed ${w.shedNo} (Flock ${w.flockNo}) Wk ${w.ageWeeks}: ${w.message}`
    ),
  ].join('\n');

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    totalActiveFlocks: INITIAL_FLOCKS.filter((f) => f.status === 'ACTIVE').length,
    totalAlerts: allFlags.length,
    criticalCount: criticals.length,
    warningCount: warnings.length,
    criticalAlerts: criticals,
    warningAlerts: warnings,
    textDigest,
  });
}
