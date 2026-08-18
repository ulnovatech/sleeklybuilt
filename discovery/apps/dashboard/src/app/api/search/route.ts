import { requireOperator } from '@/lib/api-auth';
import { getDb, businesses, discoveryRuns, intentSignals, leads, TEST_FIXTURE_COUNTRIES } from '@agency/database';
import { and, desc, eq, ilike, isNull, notInArray, or, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

type SearchGroup = {
  type: 'leads' | 'businesses' | 'runs' | 'demand';
  label: string;
  items: Array<{
    id: string;
    title: string;
    subtitle: string;
    href: string;
  }>;
};

export async function GET(request: Request) {
  const operator = await requireOperator();
  if (operator instanceof NextResponse) return operator;

  try {
    const q = new URL(request.url).searchParams.get('q')?.trim() ?? '';
    if (q.length < 2) {
      return NextResponse.json({
        q,
        groups: [] as SearchGroup[],
        message: 'Type at least 2 characters to search operations.',
      });
    }

    const pattern = `%${q.replace(/[%_]/g, '\\$&')}%`;
    const db = getDb();
    const limitPerGroup = 8;

    const [leadRows, businessRows, runRows, demandRows] = await Promise.all([
      db
        .select({
          id: leads.id,
          status: leads.status,
          businessName: businesses.name,
          city: businesses.city,
        })
        .from(leads)
        .innerJoin(businesses, eq(leads.businessId, businesses.id))
        .where(
          or(
            ilike(businesses.name, pattern),
            ilike(businesses.city, pattern),
            ilike(businesses.email, pattern),
            ilike(leads.status, pattern),
          ),
        )
        .orderBy(desc(leads.updatedAt))
        .limit(limitPerGroup),
      db
        .select({
          id: businesses.id,
          name: businesses.name,
          city: businesses.city,
          runId: businesses.discoveryRunId,
        })
        .from(businesses)
        .where(
          or(
            ilike(businesses.name, pattern),
            ilike(businesses.city, pattern),
            ilike(businesses.email, pattern),
            ilike(businesses.phone, pattern),
            ilike(businesses.website, pattern),
          ),
        )
        .orderBy(desc(businesses.createdAt))
        .limit(limitPerGroup),
      db
        .select()
        .from(discoveryRuns)
        .where(
          and(
            notInArray(discoveryRuns.country, [...TEST_FIXTURE_COUNTRIES]),
            or(
              ilike(discoveryRuns.country, pattern),
              ilike(discoveryRuns.city, pattern),
              ilike(discoveryRuns.industry, pattern),
              ilike(discoveryRuns.status, pattern),
              sql`${discoveryRuns.id}::text ILIKE ${pattern}`,
            ),
          ),
        )
        .orderBy(desc(discoveryRuns.createdAt))
        .limit(limitPerGroup),
      db
        .select()
        .from(intentSignals)
        .where(
          and(
            eq(intentSignals.signalClass, 'demand'),
            isNull(intentSignals.businessId),
            isNull(intentSignals.dismissedAt),
            or(
              ilike(intentSignals.title, pattern),
              ilike(intentSignals.snippet, pattern),
              ilike(intentSignals.source, pattern),
            ),
          ),
        )
        .orderBy(desc(intentSignals.capturedAt))
        .limit(limitPerGroup),
    ]);

    const groups: SearchGroup[] = [];
    if (leadRows.length) {
      groups.push({
        type: 'leads',
        label: 'Pursuits',
        items: leadRows.map((row) => ({
          id: row.id,
          title: row.businessName,
          subtitle: `${row.status}${row.city ? ` · ${row.city}` : ''}`,
          href: `/leads/${row.id}`,
        })),
      });
    }
    if (businessRows.length) {
      groups.push({
        type: 'businesses',
        label: 'Businesses',
        items: businessRows.map((row) => ({
          id: row.id,
          title: row.name,
          subtitle: row.city ?? 'Discovered business',
          href: row.runId ? `/discovery/${row.runId}` : '/discovery',
        })),
      });
    }
    if (runRows.length) {
      groups.push({
        type: 'runs',
        label: 'Discovery runs',
        items: runRows.map((row) => ({
          id: row.id,
          title: `${row.industry} · ${row.city}`,
          subtitle: `${row.status} · ${row.country}`,
          href: `/discovery/${row.id}`,
        })),
      });
    }
    if (demandRows.length) {
      groups.push({
        type: 'demand',
        label: 'Demand signals',
        items: demandRows.map((row) => ({
          id: row.id,
          title: row.title ?? row.signalType,
          subtitle: row.source,
          href: '/intent',
        })),
      });
    }

    return NextResponse.json({ q, groups });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
