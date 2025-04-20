import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/services/supabaseClient';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id;
    const supabase = createAdminClient();
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }
    
    const { error: vectorError } = await supabase
      .from('documents')
      .delete()
      .eq('metadata->document_id', documentId);
      
    if (vectorError) throw vectorError;
    
    const { error: metadataError } = await supabase
      .from('documents_metadata')
      .delete()
      .eq('id', documentId);
      
    if (metadataError) throw metadataError;
    
    return NextResponse.json({ 
      success: true,
      message: 'Document successfully deleted' 
    });
    
  } catch (error) {
    console.error('Error deleting document:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to delete document';
    
    return NextResponse.json(
      { 
        error: 'Failed to delete document',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}