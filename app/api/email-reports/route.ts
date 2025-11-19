import { NextRequest, NextResponse } from 'next/server';
import { generateAllSupervisorReports, scheduledDailyReports } from '@/lib/emailUtils';
import { getBeadleSlips } from '@/lib/serverUtils';

export async function GET() {
  try {
    const slips = await getBeadleSlips();
    const uniqueForms = [...new Set(slips.map(slip => slip.grade_level))];
    const uniqueDates = [...new Set(slips.map(slip => slip.date))];
    
    return NextResponse.json({
      totalSlips: slips.length,
      formLevels: uniqueForms,
      dates: uniqueDates,
      sampleSlip: slips[0] || null
    });
  } catch (error) {
    console.error('[API] Error fetching slips:', error);
    return NextResponse.json({ error: 'Failed to fetch slips' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, date } = body;

    console.log('[API] Email reports request:', { action, date });

    if (action === 'generate') {
      if (!date) {
        return NextResponse.json(
          { error: 'Date is required' },
          { status: 400 }
        );
      }
      
      console.log(`[API] Generating reports for date: ${date}`);
      const reports = await generateAllSupervisorReports(date);
      console.log(`[API] Generated ${Object.keys(reports).length} reports`);
      return NextResponse.json({ reports });
    }

    if (action === 'scheduled') {
      console.log('[API] Running scheduled daily reports');
      const reports = await scheduledDailyReports();
      console.log(`[API] Generated ${Object.keys(reports).length} reports`);
      return NextResponse.json({ reports });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[API] Error in email reports API:', error);
    return NextResponse.json(
      { error: 'Failed to generate reports' },
      { status: 500 }
    );
  }
}
