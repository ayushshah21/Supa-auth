// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.1.0";
// import { PineconeClient } from "https://esm.sh/@pinecone-database/pinecone@0.1.6";

// serve(
//   async (
//     req: {
//       json: () => PromiseLike<{ ticketContent: any; previousMessages: any }> | {
//         ticketContent: any;
//         previousMessages: any;
//       };
//     },
//   ) => {
//   try {
//     // Get environment variables
//       const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY");
//       const PINECONE_KEY = Deno.env.get("PINECONE_API_KEY");
//       const PINECONE_ENV = Deno.env.get("PINECONE_ENVIRONMENT");
    
//     if (!OPENAI_KEY || !PINECONE_KEY || !PINECONE_ENV) {
//         throw new Error("Missing required environment variables");
//     }

//     // Initialize OpenAI
//       const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_KEY }));

//     // Initialize Pinecone
//       const pinecone = new PineconeClient();
//     await pinecone.init({
//       apiKey: PINECONE_KEY,
//         environment: PINECONE_ENV,
//       });

//       const index = pinecone.Index("support-knowledge");

//     // Get request data
//       const { ticketContent, previousMessages } = await req.json();
    
//     if (!ticketContent) {
//         throw new Error("Ticket content is required");
//     }

//     // Generate embedding for the ticket
//     const embeddingResponse = await openai.createEmbedding({
//       model: "text-embedding-ada-002",
//         input: ticketContent,
//       });
    
//       const embedding = embeddingResponse.data.data[0].embedding;

//     // Query similar content
//     const queryResponse = await index.query({
//       vector: embedding,
//       topK: 3,
//         includeMetadata: true,
//       });

//     // Construct context from similar content
//     const context = queryResponse.matches
//         .map((match) =>
//           match.metadata && "content" in match.metadata
//             ? match.metadata.content
//             : ""
//         )
//         .filter(Boolean)
//         .join("\n\n");

//     // Generate response using GPT-4
//     const completion = await openai.createChatCompletion({
//       model: "gpt-4",
//       messages: [
//         {
//           role: "system",
//             content:
//               `You are a helpful customer service representative. Use the following knowledge base information to help answer the customer's question. If the knowledge base doesn't contain relevant information, provide a general helpful response.\n\nKnowledge base:\n${context}`,
//         },
//         {
//           role: "user",
//             content: ticketContent,
//         },
//         ...(previousMessages || []).map((msg: any) => ({
//           role: "assistant",
//             content: msg,
//           })),
//       ],
//       temperature: 0.7,
//         max_tokens: 500,
//       });

//       const response = completion.data.choices[0].message.content;

//     return new Response(JSON.stringify({ response }), {
//         headers: { "Content-Type": "application/json" },
//       });
//   } catch (error) {
//     return new Response(JSON.stringify({ error: error.message }), {
//       status: 500,
//         headers: { "Content-Type": "application/json" },
//       });
//   }
//   },
// );
