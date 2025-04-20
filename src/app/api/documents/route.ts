import { NextRequest, NextResponse } from 'next/server';
import { processDocumentText, DocumentType } from '@/lib/services/documentProcessor';
import { createAdminClient } from '@/lib/services/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const supabase = createAdminClient();
    
    const { data: documents, error } = await supabase
      .from('documents_metadata')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return NextResponse.json({ documents });
    
  } catch (error) {
    console.error('Error fetching documents:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch documents';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

interface DocumentCreateRequest {
  text: string;
  title?: string;
  type: DocumentType;
  source?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as DocumentCreateRequest;
    const { text, title, type, source } = body;
    
    if (!text || !type) {
      return NextResponse.json(
        { error: 'Text and document type are required' },
        { status: 400 }
      );
    }
    
    const documentId = uuidv4();
    
    const result = await processDocumentText(
      text,
      {
        document_id: documentId,
        title: title || 'Untitled Document',
        type,
        source: source || 'manual-input',
      }
    );
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error processing document:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process document';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}