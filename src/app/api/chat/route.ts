import { NextRequest, NextResponse } from 'next/server';
import { chatWithAssistant, Message } from '@/lib/services/chatService';


interface ChatRequest {
  message: string;
  history?: Message[];
  conversationId?: string;
  options?: {
    maxContextLength?: number;
    temperature?: number;
    retrievalEnabled?: boolean;
    retrievalCount?: number;
    includeHistory?: boolean;
  };
}

export async function POST(req: NextRequest) {
  try {
    
    const body = await req.json() as ChatRequest;
    const { message, history, conversationId, options = {} } = body;
    
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    
    const chatOptions = {
      maxContextLength: options.maxContextLength || 8,
      temperature: options.temperature || 0.7,
      retrievalEnabled: options.retrievalEnabled !== false, 
      retrievalCount: options.retrievalCount || 5,
      includeHistory: options.includeHistory !== false, 
      conversationId: conversationId,
    };
    
    
    const response = await chatWithAssistant(
      message,
      history || [],
      chatOptions
    );
    
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error in chat API route:', error);
    const errorDetails = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to process chat request',
        message: "I'm sorry, I encountered an unexpected error. Please try again.",
        details: errorDetails
      },
      { status: 500 }
    );
  }
}