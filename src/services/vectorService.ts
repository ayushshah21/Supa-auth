import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';

if (!import.meta.env.VITE_PINECONE_API_KEY) {
  console.error('Pinecone API key is missing. Please check your .env file.');
}

if (!import.meta.env.VITE_PINECONE_ENVIRONMENT) {
  console.error('Pinecone environment is missing. Please check your .env file.');
}

const pinecone = new Pinecone({
  apiKey: import.meta.env.VITE_PINECONE_API_KEY
});

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const INDEX_NAME = import.meta.env.PINECONE_INDEX || 'support-knowledge';

// Initialize the index
const index = pinecone.index(INDEX_NAME);

// Function to create embeddings
async function createEmbedding(text: string) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

// Function to query similar content
export async function querySimilarContent(query: string, topK: number = 3) {
  try {
    const queryEmbedding = await createEmbedding(query);
    
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });

    return queryResponse.matches.map(match => ({
      content: match.metadata?.content || '',
      score: match.score,
    }));
  } catch (error) {
    console.error('Error querying vector database:', error);
    throw error;
  }
}

// Function to upsert new content
export async function upsertContent(id: string, content: string) {
  try {
    const embedding = await createEmbedding(content);
    
    await index.upsert([{
      id,
      values: embedding,
      metadata: {
        content,
        timestamp: new Date().toISOString(),
      },
    }]);
    
    return true;
  } catch (error) {
    console.error('Error upserting to vector database:', error);
    throw error;
  }
} 