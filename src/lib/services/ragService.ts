import { OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitters';
import { Document } from 'langchain/document';
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';


type DocumentType = 'cv' | 'portfolio' | 'project' | 'blog' | 'github' | 'linkedin' | 'other';

interface DocumentMetadata {
  document_id: string;
  title: string;
  type: DocumentType;
  source: string;
  chunk_index: number;
  years_experience?: number;
  skills?: string[];
  project_name?: string;
}

export interface ProcessDocumentResult {
  success: boolean;
  documentId?: string;
  chunkCount?: number;
  error?: string;
}


const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;
const EMBEDDING_MODEL = 'text-embedding-3-small';
const COMPLETION_MODEL = 'gpt-4o';
const SIMILARITY_THRESHOLD = 0.75;


const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};


const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: EMBEDDING_MODEL,
  dimensions: 1536, 
});


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


export const getVectorStore = () => {
  const client = createSupabaseClient();
  
  return new SupabaseVectorStore(embeddings, {
    client,
    tableName: 'documents',
    queryName: 'match_documents',
  });
};


export const splitDocumentIntoChunks = async (
  text: string,
  metadata: Omit<DocumentMetadata, 'chunk_index'>
): Promise<Document[]> => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
    separators: ['\n\n', '\n', '. ', ' ', ''],
  });
  
  const docs = await splitter.createDocuments(
    [text],
    [metadata]
  );
  
  
  return docs.map((doc, i) => {
    return new Document({
      pageContent: doc.pageContent,
      metadata: {
        ...doc.metadata,
        chunk_index: i,
      },
    });
  });
};


export const processDocument = async (
  text: string,
  metadata: Omit<DocumentMetadata, 'chunk_index'>
): Promise<ProcessDocumentResult> => {
  try {
    
    const chunks = await splitDocumentIntoChunks(text, metadata);
    
    
    const vectorStore = getVectorStore();
    await vectorStore.addDocuments(chunks);
    
    
    const supabase = createSupabaseClient();
    await supabase
      .from('documents_metadata')
      .upsert({
        id: metadata.document_id,
        title: metadata.title,
        type: metadata.type,
        source: metadata.source,
        chunk_count: chunks.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    
    return {
      success: true,
      documentId: metadata.document_id,
      chunkCount: chunks.length,
    };
  } catch (error) {
    console.error('Error processing document:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};


export const performContextualSearch = async (
  query: string,
  options: {
    limit?: number;
    filter?: Record<string, any>;
    thresholdScore?: number;
  } = {}
) => {
  const vectorStore = getVectorStore();
  const { 
    limit = 5, 
    filter = {}, 
    thresholdScore = SIMILARITY_THRESHOLD 
  } = options;
  
  
  const results = await vectorStore.similaritySearchWithScore(
    query,
    limit,
    filter
  );
  
  
  return results
    .filter(([_, score]) => score >= thresholdScore)
    .map(([doc, score]) => ({
      content: doc.pageContent,
      metadata: doc.metadata,
      score
    }));
};


export const extractEntities = async (query: string) => {
  const response = await openai.chat.completions.create({
    model: COMPLETION_MODEL,
    messages: [
      {
        role: 'system',
        content: `Extraia as entidades-chave da consulta do usuário, especialmente tecnologias, 
                 habilidades, experiências profissionais ou tipos de projetos mencionados. 
                 Retorne apenas um objeto JSON com as seguintes chaves:
                 - technologies: array de tecnologias/frameworks mencionados
                 - experience: referências a anos de experiência
                 - projectTypes: tipos de projetos mencionados
                 - skills: habilidades mencionadas`
      },
      {
        role: 'user',
        content: query
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const content = response.choices[0]?.message.content;
  if (!content) return null;
  
  try {
    return JSON.parse(content);
  } catch (e) {
    console.error('Failed to parse entity extraction response:', e);
    return null;
  }
};


export const buildDynamicFilter = async (query: string) => {
  const entities = await extractEntities(query);
  if (!entities) return {};
  
  const filter: Record<string, any> = {};
  
  
  if (entities.technologies?.length > 0) {
    filter['technologies'] = entities.technologies;
  }
  
  if (entities.projectTypes?.length > 0) {
    filter['project_name'] = entities.projectTypes;
  }
  
  return filter;
};


export const getEnhancedContext = async (query: string) => {
  
  const dynamicFilter = await buildDynamicFilter(query);
  
  
  const searchResults = await performContextualSearch(query, {
    filter: dynamicFilter,
    limit: 5,
  });
  
  
  return searchResults.map(result => {
    const { content, metadata, score } = result;
    
    
    let contextualInfo = content;
    if (metadata.years_experience) {
      contextualInfo += `\nExperiência: ${metadata.years_experience} anos`;
    }
    
    
    if (metadata.project_name) {
      contextualInfo += `\nProjeto: ${metadata.project_name}`;
    }
    
    return {
      content: contextualInfo,
      source: metadata.source,
      title: metadata.title,
      type: metadata.type,
      relevance: score.toFixed(2),
    };
  });
};


export const generateResponseWithContext = async (
  query: string,
  context: any[],
  conversationHistory: { role: string; content: string }[] = []
) => {
  
  const contextText = context
    .map(item => `
      Conteúdo: ${item.content}
      Fonte: ${item.source}
      Relevância: ${item.relevance}
    `)
    .join('\n---\n');
    
  const systemPrompt = `
    Você é um assistente que representa Alison Galindo, um desenvolvedor frontend sênior do Brasil.
    
    DIRETRIZES IMPORTANTES:
    1. Mantenha suas respostas concisas e informativas (3-5 frases é ideal).
    2. Discuta APENAS tecnologias e experiências presentes no CV e portfólio do Alison.
    3. NÃO afirme ter experiência em tecnologias que não são mencionadas explicitamente no contexto fornecido.
    4. Se perguntado sobre uma tecnologia ou habilidade que não está no contexto, simplesmente diga que não tem experiência significativa com ela.
    5. Ao responder sobre tecnologias específicas que estão na sua experiência:
       - Mencione anos de experiência (se disponível no contexto)
       - Dê 1-2 exemplos específicos de projetos onde você a utilizou
       - Compartilhe um breve insight sobre como você a aplicou profissionalmente
    
    CONTEXTO RECUPERADO DO SEU CV E PORTFÓLIO:
    ${contextText}
    
    Responda com base APENAS no contexto acima. Se o contexto não contiver informações suficientes, admita que não tem experiência significativa com a tecnologia ou tópico perguntado.
  `;
  
  
  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: query }
  ];
  
  
  const response = await openai.chat.completions.create({
    model: COMPLETION_MODEL,
    messages: messages as any,
    temperature: 0.6,
    max_tokens: 500,
  });
  
  return response.choices[0]?.message.content || "Desculpe, não consegui gerar uma resposta.";
};


export async function chatWithRagEnhanced(
  message: string,
  conversationHistory: { role: string; content: string }[] = []
): Promise<{
  message: string;
  context?: any[];
  error?: string;
}> {
  try {
    
    const enhancedContext = await getEnhancedContext(message);
    
    
    if (enhancedContext.length === 0) {
      return {
        message: "Não tenho informações específicas sobre isso no meu CV ou portfólio. Posso ajudar com algo relacionado às minhas experiências em desenvolvimento frontend?",
        context: []
      };
    }
    
    
    const assistantMessage = await generateResponseWithContext(
      message,
      enhancedContext,
      conversationHistory
    );
    
    return {
      message: assistantMessage,
      context: enhancedContext
    };
    
  } catch (error) {
    console.error('Error in chatWithRagEnhanced:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return {
      message: "Desculpe, encontrei um erro ao processar sua solicitação. Por favor, tente novamente.",
      error: errorMessage
    };
  }
}