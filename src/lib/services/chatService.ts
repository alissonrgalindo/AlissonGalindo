import { OpenAI } from 'openai';
import { createAdminClient } from './supabaseClient';
import { performSimilaritySearch } from './embeddingService';
import { v4 as uuidv4 } from 'uuid';
import { Document } from 'langchain/document';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  role: MessageRole;
  content: string;
}

interface DocumentWithMetadata extends Document {
  metadata: {
    source?: string;
    title?: string;
    type?: string;
    document_id?: string;
    chunk_index?: number;
    [key: string]: unknown;
  };
  pageContent: string;
}

interface ChatOptions {
  maxContextLength?: number;
  temperature?: number;
  retrievalEnabled?: boolean;
  retrievalCount?: number;
  includeHistory?: boolean;
  conversationId?: string;
}

function generateSystemPrompt(): string {
  return `
You are an AI assistant representing Alison Galindo, a senior frontend developer based in Caruaru, Pernambuco, Brazil.

IMPORTANT GUIDELINES:
1. Keep your responses concise but informative (3-5 sentences is ideal).
2. Only discuss technologies and experiences that are actually in Alison's CV and portfolio documents.
3. Do NOT claim expertise or work experience with technologies not mentioned in Alison's documents.
4. If asked about a technology or skill not in the documents, simply say you don't have significant experience with it.
5. Focus on your main expertise: React, Next.js, and modern frontend development.

CONTEXTUAL INFORMATION:
- When asked about specific technologies or frameworks that are in your experience:
  - Mention years of experience with that technology (if available in documents)
  - Give 1-2 specific examples of projects where you used it
  - Share a brief insight about how you've applied it professionally

COMMUNICATION STYLE:
- Friendly yet professional
- Show enthusiasm for frontend technology
- Speak in first person as if you are Alison

ABOUT ALISON:
- Brazilian tech professional with expertise in frontend development
- Passionate about web development, sustainable technology, and creative coding
- Values continuous learning, technical excellence, and sustainability
- Detail-oriented and quality-focused approach to work

When answering questions, be specific about your actual experience rather than giving general information about technologies.
`;
}

export async function chatWithAssistant(
  message: string,
  history: Message[] = [],
  options: ChatOptions = {}
): Promise<{
  message: string;
  conversationId?: string;
  error?: string;
}> {
  const {
    maxContextLength = 8,
    temperature = 0.6, 
    retrievalEnabled = true,
    retrievalCount = 5,
    includeHistory = true,
    conversationId,
  } = options;
  
  try {
    const systemPrompt = generateSystemPrompt();
    
    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
    ];
    
    let relevantHistory: Message[] = [];
    
    if (includeHistory) {
      if (conversationId) {
        const storedHistory = await getConversationHistory(conversationId);
        relevantHistory = storedHistory;
      } else {
        relevantHistory = history;
      }
      
      if (relevantHistory.length > maxContextLength * 2) {
        const recentMessages = relevantHistory.slice(-maxContextLength * 2);
        relevantHistory = recentMessages;
      }
      
      messages.push(...relevantHistory);
    }
    
    messages.push({ role: 'user', content: message });
    
    if (retrievalEnabled) {
      try {
        const results = await performSimilaritySearch(message, retrievalCount);
        
        if (results && results.length > 0) {
          const retrievalContext = formatRetrievedDocuments(results as DocumentWithMetadata[]);
          
          messages[0] = {
            role: 'system',
            content: `${systemPrompt}\n\nHere is relevant information from Alison's documents:\n\n${retrievalContext}\n\nRemember to provide relevant context about technology experience (years, projects, insights) when appropriate. Only reference technologies and experiences from these documents or previously verified experience.`,
          };
        }
      } catch (error) {
        console.error('Error retrieving documents:', error);
      }
    }
    
    // Add specific instruction for technology questions
    if (message.toLowerCase().includes('experience with') || 
        message.toLowerCase().includes('worked with') ||
        message.toLowerCase().includes('familiar with') ||
        message.toLowerCase().includes('knowledge of')) {
      messages.push({ 
        role: 'system', 
        content: `If this question is about a specific technology, framework or language, make sure to include: 
        1. Your years of experience with it (if available in the documents)
        2. 1-2 specific projects where you used it
        3. Your personal perspective on working with it` 
      });
    }
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Using the latest model
      messages: messages.map(msg => ({ role: msg.role, content: msg.content })),
      temperature,
      max_tokens: 750, // Increasing maximum tokens to allow for more context
    });
    
    const assistantMessage = completion.choices[0].message.content || '';
    
    let newConversationId = conversationId;
    
    if (conversationId) {
      await storeMessage(conversationId, 'user', message);
      await storeMessage(conversationId, 'assistant', assistantMessage);
    } else if (includeHistory) {
      newConversationId = await createConversation();
      
      await storeMessage(newConversationId, 'user', message);
      await storeMessage(newConversationId, 'assistant', assistantMessage);
    }
    
    return {
      message: assistantMessage,
      conversationId: newConversationId,
    };
    
  } catch (error) {
    console.error('Error in chatWithAssistant:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return {
      message: "I'm sorry, I encountered an error processing your request. Please try again.",
      error: errorMessage,
    };
  }
}

function formatRetrievedDocuments(documents: DocumentWithMetadata[]): string {
  let context = '';
  
  documents.forEach((doc, index) => {
    context += `DOCUMENT ${index + 1}:\n`;
    
    if (doc.metadata) {
      if (doc.metadata.source) {
        context += `Source: ${doc.metadata.source}\n`;
      }
      
      if (doc.metadata.title) {
        context += `Title: ${doc.metadata.title}\n`;
      }
      
      if (doc.metadata.type) {
        context += `Type: ${doc.metadata.type}\n`;
      }
    }
    
    context += `Content:\n${doc.pageContent}\n\n`;
  });
  
  return context;
}

async function createConversation(): Promise<string> {
  const supabase = createAdminClient();
  const conversationId = uuidv4();
  
  const { error } = await supabase
    .from('chat_conversations')
    .insert({
      id: conversationId,
      started_at: new Date().toISOString(),
      last_message_at: new Date().toISOString()
    });
    
  if (error) throw error;
  return conversationId;
}

async function storeMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<void> {
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from('chat_messages')
    .insert({
      conversation_id: conversationId,
      role,
      content
    });
    
  if (error) throw error;
  
  await supabase
    .from('chat_conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId);
}

async function getConversationHistory(conversationId: string): Promise<Message[]> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('chat_messages')
    .select('role, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
    
  if (error) throw error;
  
  if (!data) return [];
  
  return data.map(message => ({
    role: message.role as MessageRole,
    content: message.content,
  }));
}