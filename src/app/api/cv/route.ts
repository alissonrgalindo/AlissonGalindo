import { NextRequest, NextResponse } from 'next/server';
import { processCVData, CVData } from '@/lib/services/documentProcessor';

export async function POST(req: NextRequest) {
  try {
    const cvData = await req.json() as CVData;
    
    if (!cvData || Object.keys(cvData).length === 0) {
      return NextResponse.json(
        { error: 'CV data is required' },
        { status: 400 }
      );
    }
    
    // Process the CV data
    const result = await processCVData(cvData);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error processing CV data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process CV data';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}