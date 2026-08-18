import { requireOperator } from '@/lib/api-auth';
import { resolveOwnerScope } from '@/lib/owner-scope';
import { OutreachService } from '@agency/outreach';
import { platformSettings } from '@agency/settings';
import type { OutreachDraftChannel } from '@agency/outreach';
import { NextResponse } from 'next/server';

const outreach = new OutreachService();

export async function GET(request: Request) {
  const operator = await requireOperator();
  if (operator instanceof NextResponse) return operator;

  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('templateId');
    const includeUnreviewed = searchParams.get('includeUnreviewed') === 'true';
    const dryRun = searchParams.get('dryRun') === 'true';
    const confirmSkipped = searchParams.get('confirmSkipped') === 'true';

    if (includeUnreviewed && request.headers.get('x-confirm-unreviewed') !== 'true') {
      return NextResponse.json(
        { error: 'Exporting NEW leads requires X-Confirm-Unreviewed: true header' },
        { status: 400 },
      );
    }

    const channelParam = searchParams.get('channel');
    const channel = (channelParam ?? 'email') as OutreachDraftChannel;
    const allowedChannels = new Set(['email', 'whatsapp', 'phone', 'follow_up']);
    if (!allowedChannels.has(channel)) {
      return NextResponse.json({ error: 'Invalid draft export channel' }, { status: 400 });
    }

    if (templateId) {
      return NextResponse.json(
        {
          error:
            'Template export is deprecated for operator handoff. Generate drafts per pursuit, then export cached drafts (omit templateId).',
          code: 'template_export_deprecated',
        },
        { status: 400 },
      );
    }

    const date = searchParams.get('date') ?? undefined;
    const owner = await resolveOwnerScope(searchParams.get('owner'));
    const settings = await platformSettings.ensureLoaded();
    const result = await outreach.exportDraftsCsv({
      channel,
      date,
      includeUnreviewed,
      owner,
      minReachability: settings.qualification.icp.minReachabilityForExport,
    });

    if (dryRun) {
      return NextResponse.json({
        count: result.count,
        skippedNoDraft: result.skippedNoDraft,
        skippedNoContact: result.skippedNoContact,
        skippedSuppressed: result.skippedSuppressed,
        skippedReachability: result.skippedReachability,
        channel: result.channel,
        exportMode: result.exportMode,
        requiresConfirm: result.skippedNoDraft > 0,
        message:
          result.skippedNoDraft > 0
            ? `${result.skippedNoDraft} pursuit(s) lack a cached ${result.channel} draft and will be skipped.`
            : result.count === 0
              ? 'No cached drafts match this export.'
              : `${result.count} cached draft(s) ready to export.`,
      });
    }

    if (result.skippedNoDraft > 0 && !confirmSkipped) {
      return NextResponse.json(
        {
          error:
            'Export would skip pursuits without a cached draft. Confirm with confirmSkipped=true after reviewing the dry-run counts.',
          code: 'export_confirm_required',
          count: result.count,
          skippedNoDraft: result.skippedNoDraft,
          skippedNoContact: result.skippedNoContact,
          skippedSuppressed: result.skippedSuppressed,
          skippedReachability: result.skippedReachability,
          channel: result.channel,
        },
        { status: 409 },
      );
    }

    return new NextResponse(result.csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'X-Export-Count': String(result.count),
        'X-Export-Mode': result.exportMode,
        'X-Export-Channel': result.channel,
        'X-Export-Skipped-No-Contact': String(result.skippedNoContact),
        'X-Export-Skipped-Suppressed': String(result.skippedSuppressed),
        'X-Export-Skipped-Reachability': String(result.skippedReachability),
        'X-Export-Skipped-No-Draft': String(result.skippedNoDraft),
        'X-Export-Min-Reachability': result.minReachability,
        'X-Export-Statuses': result.statuses.join(','),
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
