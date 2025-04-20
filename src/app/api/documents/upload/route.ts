import { NextRequest, NextResponse } from 'next/server';
import { processDocumentText, DocumentType } from '@/lib/services/documentProcessor';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

function isValidDocumentType(type: string): type is DocumentType {
  const validTypes: DocumentType[] = ['cv', 'portfolio', 'project', 'blog', 'github', 'linkedin', 'other'];
  return validTypes.includes(type as DocumentType);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const typeRaw = formData.get('type') as string;
    const title = formData.get('title') as string;
    const source = formData.get('source') as string;
    
    if (!file || !typeRaw) {
      return NextResponse.json(
        { error: 'File and type are required' },
        { status: 400 }
      );
    }
    
    if (!isValidDocumentType(typeRaw)) {
      return NextResponse.json(
        { error: 'Invalid document type. Must be one of: cv, portfolio, project, blog, github, linkedin, other' },
        { status: 400 }
      );
    }
    
    const type: DocumentType = typeRaw;
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const tempDir = path.join(os.tmpdir(), 'cv-chatbot');
    await fs.mkdir(tempDir, { recursive: true });
    
    const tempFilePath = path.join(tempDir, file.name);
    await fs.writeFile(tempFilePath, buffer);
    
    let content = '';
    
    try {
      content = await fs.readFile(tempFilePath, 'utf-8');
    } catch (error) {
      console.error('Error reading file as text:', error);
      return NextResponse.json(
        { error: 'Unsupported file format or corrupted file' },
        { status: 400 }
      );
    }
    
    try {
      await fs.unlink(tempFilePath);
    } catch (error) {
      console.error('Error removing temp file:', error);
    }
    
    const documentId = uuidv4();
    const result = await processDocumentText(
      content,
      {
        document_id: documentId,
        title: title || file.name,
        type,
        source: source || 'file-upload',
      }
    );
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error processing uploaded file:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process file upload';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}