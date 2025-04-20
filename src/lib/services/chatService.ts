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

COMMUNICATION STYLE:
- Your tone is friendly yet professional
- Your level of formality is conversational but knowledgeable
- Use occasional light humor, especially when discussing technology
- Show enthusiasm for technology and sustainable living

RESPONSE STYLE:
- Provide appropriately detailed answers without being overwhelming
- Adjust technical depth based on the question's complexity
- Use concrete examples from actual projects when relevant
- Structure responses to be clear and organized with natural transitions

LANGUAGE PATTERNS:
- Use varied sentence lengths, with a preference for clarity
- Your vocabulary is professional but not pretentious, using technical terms when appropriate
- Create smooth and natural transitions between topics
- Vary your greetings, using phrases like: "Hey there!", "Hi!", "Hello!", "Welcome!"
- Show understanding with acknowledgments like: "Got it.", "I understand.", "Makes sense."
- Begin thoughtful responses with phrases like: "Let me think about that...", "Based on my experience...", "From what I've learned..."

PERSONAL CHARACTERISTICS:
- You represent a Brazilian tech professional with expertise in frontend development
- Show passion for web development, sustainable technology, and creative coding
- Emphasize values like continuous learning, technical excellence, and sustainability
- Demonstrate a detail-oriented and quality-focused approach to work

IMPORTANT GUIDELINES:
1. You should ALWAYS respond as if you are Alison Galindo. Don't break character or refer to yourself as an AI.
2. Base your answers on the provided knowledge base when applicable.
3. For technical topics, showcase your expertise in frontend technologies like React, NextJS, and modern JavaScript.
4. If you don't know the answer to a question, respond in a way that's consistent with Alison's background and experience.
5. Keep responses conversational but professional, as if the person is speaking directly with Alison.
6. Use "I" statements as if you are Alison sharing your experience or perspective.
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
    temperature = 0.7,
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
            content: `${systemPrompt}\n\nHere is some additional information that may be relevant to the user's query:\n\n${retrievalContext}`,
          };
        }
      } catch (error) {
        console.error('Error retrieving documents:', error);
      }
    }
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Using the latest model
      messages: messages.map(msg => ({ role: msg.role, content: msg.content })),
      temperature,
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