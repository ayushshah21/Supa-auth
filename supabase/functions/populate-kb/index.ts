/* eslint-disable @typescript-eslint/no-explicit-any */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.1.0";
import { PineconeClient } from "https://esm.sh/@pinecone-database/pinecone@0.1.6";

// interface KnowledgeEntry {
//   id: string;
//   content: string;
// }

serve(
  async (
    req: { json: () => PromiseLike<{ entries: any }> | { entries: any } },
  ) => {
    try {
      // Get environment variables
      const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY");
      const PINECONE_KEY = Deno.env.get("PINECONE_API_KEY");
      const PINECONE_ENV = Deno.env.get("PINECONE_ENVIRONMENT");

      if (!OPENAI_KEY || !PINECONE_KEY || !PINECONE_ENV) {
        throw new Error("Missing required environment variables");
      }

      // Initialize OpenAI
      const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_KEY }));

      // Initialize Pinecone
      const pinecone = new PineconeClient();
      await pinecone.init({
        apiKey: PINECONE_KEY,
        environment: PINECONE_ENV,
      });

      const index = pinecone.Index("support-knowledge");

      // Get entries from request body
      const { entries } = await req.json();

      if (!Array.isArray(entries)) {
        throw new Error("Entries must be an array");
      }

      const results = [];

      for (const entry of entries) {
        try {
          // Generate embedding
          const embeddingResponse = await openai.createEmbedding({
            model: "text-embedding-ada-002",
            input: entry.content,
          });

          const embedding = embeddingResponse.data.data[0].embedding;

          // Upsert to Pinecone
          await index.upsert({
            upsertRequest: {
              vectors: [{
                id: entry.id,
                values: embedding,
                metadata: {
                  content: entry.content,
                },
              }],
            },
          });

          results.push({ id: entry.id, status: "success" });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error
            ? error.message
            : "Unknown error occurred";
          results.push({ id: entry.id, status: "error", error: errorMessage });
        }
      }

      return new Response(JSON.stringify({ results }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Unknown error occurred";
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
);
