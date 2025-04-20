import { OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { createAdminClient } from './supabaseClient';


const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'text-embedding-3-small', 
});


export const getVectorStore = () => {
  const client = createAdminClient();
  
  return new SupabaseVectorStore(embeddings, {
    client,
    tableName: 'documents',
    queryName: 'match_documents',
  });
};


export const generateEmbeddings = async (texts: string[]) => {
  if (!texts.length) return [];
  
  return await embeddings.embedDocuments(texts);
};


export const performSimilaritySearch = async (
  query: string,
  limit: number = 5,
) => {
  const vectorStore = getVectorStore();
  const results = await vectorStore.similaritySearch(query, limit);
  
  return results;
};