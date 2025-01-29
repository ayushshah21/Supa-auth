# LangSmith, LangChain, and LangGraph: A Comprehensive Guide

This document provides a comprehensive overview of LangSmith, LangChain, and LangGraph, focusing on the most up-to-date documentation and key concepts relevant to building agentic workflows. It's designed as a reference for your AutoCRM project, particularly the OutreachGPT feature.

## LangSmith: Monitoring, Evaluation, and Debugging for LLM Applications

LangSmith is a platform designed to help you monitor, evaluate, and debug your LangChain applications. It provides a powerful suite of tools to:

* **Track Runs:** Log inputs, outputs, intermediate steps, and latencies of your LangChain chains and agents.
* **Evaluate Results:** Measure the quality of your LLM outputs using various metrics and custom evaluators.
* **Debug Errors:** Pinpoint issues, identify where things are going wrong, and iterate more quickly.
* **Collaborate with Teams:** Share runs, traces, and feedback for collaboration.

### Key Features

1. **Tracing:**

    * Provides a detailed view of the execution flow of your LangChain application.
    * Tracks inputs, outputs, intermediate steps, and latencies.
    * Supports both synchronous and asynchronous operations.
    * Enables you to understand how your LLMs, chains, and agents are behaving.

2. **Evaluation:**

    * Allows you to assess the quality of your LLM outputs.
    * Offers built-in metrics (like string match, embedding distance).
    * Supports custom evaluators using LLMs or functions.
    * Enables you to compare model outputs using different prompts or models.

3. **Datasets and Feedback:**

    * Create datasets to organize inputs and expected outputs for systematic testing.
    * Collect feedback from users or annotators on your LLM outputs.
    * Use the feedback to fine-tune your models or improve your prompts.

4. **LangSmith Hub:**

    * Share your projects and traces with your team or the LangChain community.
    * Explore existing projects, datasets, and prompts on the Hub.
    * Promotes collaboration and transparency.

### How to Use LangSmith with LangChain

1. **Set Environment Variables:**
    * LANGCHAIN_TRACING_V2=true: Enables detailed tracing (recommended).
    * LANGCHAIN_API_KEY: Your LangSmith API key.
    * LANGCHAIN_PROJECT: Your LangSmith project name (optional).

2. **Start Tracing**
    * Add LANGCHAIN_TRACING_V2 = true to your .env file.

* Add "langsmith": ">=0.2.8 <0.4.0", to your dependencies in package.json.
  * Install using npm i or yarn.

3. **Enable Run Tracking:**
    * To enable tracing programmatically, pass a callbacks array with a LangChainTracer instance in your runnable's options.

typescript
        import { OpenAI } from "@langchain/openai";
        import { LangChainTracer } from "langchain/callbacks";

        const model = new OpenAI();
        
        const result = await model.invoke("What is 1 + 1?", {
           callbacks: [new LangChainTracer()],
        });

4.  **View Traces:**
    *   Visit the LangSmith UI ([https://smith.langchain.com/](https://smith.langchain.com/)) to explore your runs and their details.

### Key Benefits

* **Visibility:** Gain insights into your LLM application's behavior.
* **Evaluation:** Quantify and improve the quality of your LLM outputs.
* **Debugging:** Identify and fix issues quickly.
* **Iteration:** Develop faster through continuous feedback.
* **Collaboration:** Share insights and knowledge with your team.

## LangChain: Framework for Building LLM Applications

LangChain is a framework designed to streamline the creation of applications using Large Language Models (LLMs). It provides a comprehensive set of abstractions, components, and utilities to help you:

* **Connect to LLMs:** Support various models from OpenAI, Google, Anthropic, and more.
* **Chain Operations:** Construct complex workflows by chaining together LLM, tools, and other components.
* **Build Agents:** Create intelligent agents that can interact with tools and external data sources.
* **Manage Memory:** Implement memory capabilities to create conversational agents.
* **Orchestrate Data:**  Use various data loaders, retrievers, and output parsers to efficiently use your data.

### Core Concepts

1. **Models (LLMs):**

    * Interface with various language models.
    * Supports chat models, text models, embedding models, etc.
    * Includes options for configuring temperature, top-p, and other parameters.
    * Examples include OpenAI, ChatOpenAI, HuggingFaceHub, and more.

typescript
    import { OpenAI } from "@langchain/openai";
    const model = new OpenAI({
      temperature: 0.7, // Set the temperature (0-1)
      modelName: 'gpt-3.5-turbo', // Specifiy the model
    });

2. **Prompts:**

    * Templates to provide instructions and examples to language models.
    * Include support for placeholders, few-shot learning, and output parsing.
    * Examples include PromptTemplate, ChatPromptTemplate, FewShotPromptTemplate.

typescript
    import { PromptTemplate } from "@langchain/core/prompts";

    const template = "What is a good name for a company that makes {product}?";

    const prompt = new PromptTemplate({
      template,
      inputVariables: ["product"]
    });
   const formattedPrompt = await prompt.format({ product: 'shirts' });
   console.log(formattedPrompt); // Prints: What is a good name for a company that makes shirts?

3. **Chains:**

    * Sequences of operations to accomplish specific tasks.
    * Allow you to combine multiple LLM calls, data processing, and tool usage.
    * Examples include LLMChain, SequentialChain, RetrievalQAChain, and custom chains.

typescript
    import { OpenAI } from "@langchain/openai";
    import { PromptTemplate } from "@langchain/core/prompts";
    import { LLMChain } from "@langchain/core/chains";

      const model = new OpenAI({ temperature: 0 });
      const template = "What is a good name for a company that makes {product}?";

      const prompt = new PromptTemplate({
        template,
        inputVariables: ["product"],
      });

      const chain = new LLMChain({ llm: model, prompt });
    
      const res = await chain.invoke({ product: "socks" });
      console.log(res); // Response from LLM that gives a name for a company that makes socks

4.  **Tools:**

    *   External services or functions that agents can use.
    *   Allow your agents to interact with the world.
    *   Examples include SerpAPI, Calculator, WebBrowser, and custom tools.
     
typescript
    import { Calculator } from "@langchain/community/tools/calculator";

    const calculator = new Calculator();
    const result = await calculator.call("1 + 1");
    console.log(result) // Result is 2

5.  **Agents:**

    *   Intelligent actors that use tools to accomplish goals.
    *   Use LLMs to make decisions about tool usage based on a provided prompt.
    *   Support different types of agents (zero-shot-react-description, chat-zero-shot-react-description etc.) and custom implementations.
     
typescript
      import { OpenAI } from "@langchain/openai";
      import { initializeAgentExecutorWithOptions } from "langchain/agents";
      import { Calculator } from "@langchain/community/tools/calculator";

      const model = new OpenAI({ temperature: 0 });
      const tools = [new Calculator()];
    
        const executor = await initializeAgentExecutorWithOptions(tools, model, {
          agentType: "zero-shot-react-description",
        });
    
      const input = `What is 25 times 25`;
    
      const result = await executor.invoke({ input });
      console.log(result); // An object with the final output that gives the correct answer

6. **Memory**:
    *Stores previous interactions.
    *   Used for creating a conversational agent that remembers previous inputs.
    *   Supports various memory types, including buffer, buffer window, and vector store based memory.

typescript
    import { BufferMemory } from "langchain/memory";
    const memory = new BufferMemory();

    await memory.saveContext({input: "hi"}, {output: "hello"});
    const memoryOutput = await memory.loadMemoryVariables();
    console.log(memoryOutput); // An object with chat history

7.  **Retrievers:**

    *   Interfaces for fetching documents from various sources.
    *   Used in Retrieval Augmented Generation (RAG) systems.
    *   Examples include VectorStoreRetriever, WebResearchRetriever, and custom retrievers.

8.  **Output Parsers:**

    *   Transform LLM outputs into structured formats (e.g., JSON, lists, data structures).
    *   Helps create consistent and predictable outputs from language models.
    *   Examples include StructuredOutputParser, RegexParser, ListParser.

### Key Benefits

* **Abstraction:** Simplified development with high-level building blocks.
* **Flexibility:** Choose the components to match your needs.
* **Interoperability:** Use components from LangChain with your own code.
* **Community Support:** Leverage a large community and pre-built components.
* **Rapid Development:** Build complex applications faster.

## LangGraph: Defining Multi-Actor Workflows

LangGraph is an experimental library within LangChain, designed to create multi-actor workflows, where agents interact with each other, follow conditions, and react to data changes.

* **Graph Representation:** Workflows are modeled as directed graphs, where nodes represent actions and edges represent transitions.
* **State Management:** Manages workflow state and context.
* **Agent Interaction:** Supports multiple agents interacting in the workflow.
* **Conditional Logic:** Enables decision-making based on previous steps.
* **Looping and Cycles:** Define iterative workflows.
* **Agent Collaboration:** Allow agents to collaborate and interact with each other.

### Core Concepts

1. **Nodes:**
    * Represent distinct steps in the workflow.
    * Can be LLM calls, tool usage, or custom functions.
    * Examples: AgentAction, AgentExecutor, function calls.
2. **Edges:**
    * Define transitions between nodes.
    * Can be conditional or always execute.
    * Determine which node executes next based on specific criteria.
3. **State:**
    * Centralized data store for workflow information.
    * Accessible to all agents and steps.
    * Updated automatically as the graph progresses.

### How to Use LangGraph

1. **Define Nodes:** Use functions or other runnables for agent steps.
2. **Set Up Edges:** Create edges with conditions for transitions.
3. **Define the Graph:** Use a StateGraph to define the nodes and edges.
4. **Execute the Graph:**

* Create and use an instance of the agent and define the input messages
* Use .stream() method to see outputs

typescript
     import { ChatOpenAI } from "@langchain/openai";
    import { pull } from "langchain/hub";
    import { AgentExecutor } from "langchain/agents";
    import { PromptTemplate } from "@langchain/core/prompts";
    import { formatLogToString } from "langchain/agents/format_scratchpad/log";
    import { renderTextDescription } from "langchain/tools/render";
    import { DynamicTool } from "@langchain/core/tools";
    import { ReActSingleInputOutputParser } from "langchain/agents/react/output_parser";
    import { RunnableSequence } from "@langchain/core/runnables";
    import { AgentStep } from "@langchain/core/agents";
    import { BaseMessage, HumanMessage } from "@langchain/core/messages";

    // Define the tools
    const tools = [
        new DynamicTool({
          name: "get_length",
          description: "Returns the length of a word.",
          func: async (input: string) => input.length.toString(),
        }),
      ];
    const llm = new ChatOpenAI({ model: "gpt-3.5-turbo", temperature: 0 });
    const modelWithStop = llm.bind({
        stop: ["\nObservation"],
    });
    const prompt = await pull<PromptTemplate>("hwchase17/react-chat");
    const toolNames = tools.map((tool) => tool.name);
    const promptWithInputs = await prompt.partial({
      tools: renderTextDescription(tools),
      tool_names: toolNames.join(","),
    });

      const formatAgentSteps = (steps: AgentStep[]): BaseMessage[] =>
        steps.map((step) => new HumanMessage(step.action.log));

      const runnableAgent = RunnableSequence.from([
        {
          input: (i: { input: string; steps: AgentStep[] }) => i.input,
          agent_scratchpad: (i: { input: string; steps: AgentStep[] }) => formatLogToString(i.steps),
        },
        promptWithInputs,
        modelWithStop,
        new ReActSingleInputOutputParser({ toolNames }),
      ]);

      const executor = AgentExecutor.fromAgentAndTools({
          agent: runnableAgent,
          tools,
      });

      const inputs1 = {
        input: "what is the length of word 'hello'?",
      };

      const stream1 = await executor.stream(inputs1);

      for await (const output of stream1){
          console.log("Stream", output)
      }

### Key Benefits

* **Complex Workflows:** Define intricate workflows with multiple agents.
* **Flexibility:** Adapt to different use cases using conditional logic and loops.
* **State Management:** Centralized state management and easy access.
* **Iteration:** Define iterative workflows.

### LangChain and LangGraph Relationship

* LangChain is the foundation for building individual components (like chains, tools, prompts).
* LangGraph leverages LangChain to define complex multi-agent workflows.
* You can use existing LangChain components within a LangGraph.

## Implementation Notes for OutreachGPT

* **LangChain Agent:** You'll need a custom agent that utilizes the email_composer_tool and the supabase_db_retriever tool. You will also need to include BufferMemory to allow the agent to remember previous interactions.
* **LangSmith Integration:** Use LangSmith to log the inputs, outputs, and intermediate steps to your agent's execution for debugging and evaluation.
* **Data Retrieval:** Use the supabase_db_retriever tool to fetch customer data from Supabase, including achievements and any other relevant information to provide context.
* **Email Composition:** Use the email_composer_tool to generate personalized email drafts using OpenAI's LLMs.
* **User Review:** Implement a step where the user can review the generated email before sending it.
* **Evaluation:** Track success rates, email effectiveness, and user feedback using LangSmith to improve your system.

## Additional Resources

* **LangChain Documentation:** [https://js.langchain.com/docs/](https://js.langchain.com/docs/)
* **LangSmith Documentation:** [https://docs.smith.langchain.com/](https://docs.smith.langchain.com/)
* **LangGraph Documentation:** [https://js.langchain.com/docs/langgraph](https://js.langchain.com/docs/langgraph)
* **LangChain Hub**: [https://smith.langchain.com/hub](https://smith.langchain.com/hub)

This document should serve as a comprehensive guide as you integrate LangChain for your OutreachGPT feature. Please let me know if you have any other questions or need any additional information.

Given this file, does this help you understand a lot of the stuff and all the necessary documentation that you need to implement the core features based on kind of the code that I was working with before and what I've showed you? This is a lot of the up-to-date documentation that I need for this feature. What are your thoughts on it?

Below is a concise guide for working with LangChain (TypeScript/JavaScript version), LangGraph, and LangSmith, along with tips on using these libraries within a Supabase Edge Function on Deno. It covers common setup steps, a brief conceptual overview, the most important classes and utilities you’ll rely on, and example snippets.

---

## 1. Overview of the Ecosystem

1. **LangChain**  
   * A JavaScript/TypeScript library for building language model–powered applications.  
   * Focuses on “chains” of prompts, memory, and modularity.  

2. **LangGraph**  
   * An experimental framework (Beta) for creating *chat-based* or *agentic* workflows using “runnables” and “graphs.”  
   * Let’s you define multi-step sequences, branching, streaming, and function calls at a more granular level than standard “chains.”  

3. **LangSmith**  
   * A platform (and set of tooling) for *evaluating*, *monitoring*, and *experimenting* with LLM applications.  
   * Helps with logging runs, collecting traces, comparing prompts, and measuring usage across different runs.

You can use LangChain for building your core LLM logic, possibly layering on LangGraph for more advanced “runnables” or dynamic chat-based flows, and connect it all to LangSmith for logging, debugging, or A/B testing.  

---

## 2. Project Setup for TypeScript / Supabase Edge Functions (Deno)

1. **Create or Update Your `package.json`**  
   Make sure you have the dependencies you need:

   ```bash
   npm install langchain @langchain/core @langchain/agents @langchain/openai @langchain/community \
               @langchain/langgraph @langchain/llms langsmith
   # or yarn add ...
   ```

2. **Edge Functions with Deno**  
   * Supabase Edge Functions run on Deno Deploy.  
   * Deno does not support all Node.js APIs, so confirm any library you use is either ESM-compatible or has browser-like polyfills.  
   * The `@langchain/...` libraries ship as ESM modules, so they typically work in Deno. Some features that rely on Node modules (e.g. local file system) may need stubs or alternative approaches.

3. **Import Patterns**  
   * For ES modules in Deno, you can often import directly.  
   * If you are bundling before deploy, ensure your bundler handles ESM.  

Example minimal Edge Function structure for a “hello world” with LangChain:

```ts
// File: index.ts
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  openAIApiKey: Deno.env.get("OPENAI_API_KEY")!, // store keys in environment
  temperature: 0,
});

serve(async (req) => {
  // Quick example: simple completion
  const { query } = await req.json();
  const response = await llm.call(query);
  return new Response(JSON.stringify({ data: response }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

Then you would deploy this to your Supabase Edge Function, handle environment variables, etc.

---

## 3. Using LangChain in TypeScript

Below are some key modules and usage patterns you’ll frequently use.

### a) Basic Prompt + Model Usage

```ts
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

async function runSimpleChat() {
  const llm = new ChatOpenAI({ 
    modelName: "gpt-4", 
    temperature: 0 
  });

  const response = await llm.call([
    new HumanMessage("Hello! Can you summarize the history of AI?"),
  ]);

  console.log(response.content);
}
```

### b) Chains + Prompts

```ts
import { LLMChain } from "@langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";

const template = new PromptTemplate({
  template: "Write a short poem about {topic} in style {style}.",
  inputVariables: ["topic", "style"],
});

const chain = new LLMChain({
  prompt: template,
  llm: new ChatOpenAI({ temperature: 0.7 }),
});

await chain.call({ topic: "oceans", style: "classical" });
```

### c) Agents + Tools

```ts
import { initializeAgentExecutorWithOptions } from "@langchain/agents";
import { SerpAPI } from "@langchain/community/tools/serpapi";
import { Calculator } from "@langchain/community/tools/calculator";
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({ temperature: 0 });

const tools = [
  new SerpAPI(process.env.SERPAPI_API_KEY!, {
    location: "Austin,Texas,United States",
    hl: "en",
    gl: "us",
  }),
  new Calculator(),
];

const executor = await initializeAgentExecutorWithOptions(tools, model, {
  agentType: "chat-zero-shot-react-description",
  verbose: true,
});

const result = await executor.invoke({ 
  input: "What's the height of Eiffel Tower in meters plus 10?" 
});
console.log(result.output);
```

---

## 4. Using LangGraph

LangGraph is more advanced and still in *beta*. It uses `Runnable` objects to build *graphs* or *pipelines* of calls:

1. **`RunnableSequence`**  
   Lets you define a chain of steps.  

2. **`RunnableMap`**  
   Processes data in parallel or as a branching step.  

3. **`from`** function converters.  

A snippet:

```ts
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({ modelName: "gpt-4", temperature: 0 });

const pipeline = RunnableSequence.from([
  // Step 1: Provide input
  (input: { topic: string }) => `Tell me a short story about: ${input.topic}`,
  // Step 2: Pass to LLM
  llm,
]);

const res = await pipeline.invoke({ topic: "a talking cat" });
console.log(res);
// => The LLM’s text output
```

You can define more complex branching, error handling, or concurrency with `RunnableMap` or pass in multiple steps.

---

## 5. Using LangSmith

[LangSmith docs](https://docs.smith.langchain.com/) show how to:

* Track runs with `LANGCHAIN_HANDLER=langchain` or `LANGCHAIN_TRACING=true`.
* Compare different prompts or LLM variants.
* “Replay” or “fork” runs in a console to see how the chain performed.

For TypeScript, the flow is:

```ts
import { ChatOpenAI } from "@langchain/openai";

// 1. Set environment variable
// process.env.LANGCHAIN_TRACING = "true";

// 2. Use the model as usual
const llm = new ChatOpenAI({ 
  modelName: "gpt-3.5-turbo", 
  temperature: 0
});

// 3. All calls get traced automatically to your LangSmith instance
// (You may need to specify LANGCHAIN_ENDPOINT, LANGCHAIN_API_KEY, etc.)
```

You can also do more sophisticated usage with the `langsmith` Node library if you want to push or pull runs programmatically.

---

## 6. Integrating with Supabase Edge Functions on Deno

1. **No Node built-ins**: If any part of your agent tries to read local files or use Node APIs (like `fs` or `process`), it may not work in a pure Deno environment. Keep your code to purely ESM modules.  
2. **Setting Environment Variables**:  
   * Use `Deno.env.get("OPENAI_API_KEY")` for secrets.  
   * Or pass them in via the Edge Function config.  
3. **Deploy**:  
   * Commit/push your code to your Supabase project repo.  
   * Supabase automatically builds and hosts it as a Deno Edge function.

#### Example Edge Function with a Basic Agent

```ts
// File: index.ts
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { ChatOpenAI } from "@langchain/openai";
import { initializeAgentExecutorWithOptions } from "@langchain/agents";
import { SerpAPI } from "@langchain/community/tools/serpapi";
import { Calculator } from "@langchain/community/tools/calculator";

const tools = [
  new SerpAPI(Deno.env.get("SERPAPI_API_KEY") ?? "", {
    location: "Austin,Texas,United States",
    hl: "en",
    gl: "us",
  }),
  new Calculator(),
];

const llm = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  openAIApiKey: Deno.env.get("OPENAI_API_KEY") ?? "",
  temperature: 0,
});

const handler = async (req: Request): Promise<Response> => {
  const { question } = await req.json();
  const executor = await initializeAgentExecutorWithOptions(tools, llm, {
    agentType: "chat-zero-shot-react-description",
  });
  const result = await executor.invoke({ input: question });
  return new Response(JSON.stringify({ answer: result.output }), {
    headers: { "Content-Type": "application/json" },
  });
};

serve(handler);
```

---

## 7. Putting It All Together

1. Use **LangChain** for your standard chain building, prompt creation, memory usage, and agent-based tool usage.  
2. For advanced or chat-based flows with more detailed branching or streaming, import **LangGraph** and rewrite your flow using `RunnableSequence` or `RunnableMap`.  
3. Turn on **LangSmith** tracing to see live logs of your chain or agent, share, and compare.  
4. Deploy your code as a **Supabase Edge Function** on Deno. Make sure your scripts rely on ESM- and Deno-friendly code paths.  

**Tip**: Keep an eye on official documentation in each repo:  

* [LangChain (JS/TS) Docs](https://js.langchain.com/docs/)  
* [LangGraph (Beta)](https://github.com/hwchase17/langchainjs/tree/main/packages/langgraph)  
* [LangSmith Docs](https://docs.smith.langchain.com/)  
* [Supabase Edge Functions with Deno](https://supabase.com/docs/guides/functions)  

With the above setup, you should have a modern, “agentic” workflow solution that can orchestrate large language models, handle tool calls, store ephemeral or permanent memory, and record usage in LangSmith for debugging and iteration. Good luck!

# LangSmith, LangChain, and LangGraph for Agentic Workflows

This document provides a comprehensive overview of LangSmith, LangChain, and LangGraph, focusing on the most up-to-date documentation and key concepts relevant to building agentic workflows. It's designed as a reference for your AutoCRM project, particularly the OutreachGPT feature, and also based on the example implementations provided in the Python `agents_examples` directory.

## LangSmith: Monitoring, Evaluation, and Debugging for LLM Applications

LangSmith is a platform designed to help you monitor, evaluate, and debug your LangChain applications. It provides a powerful suite of tools to:

* **Track Runs:** Log inputs, outputs, intermediate steps, and latencies of your LangChain chains and agents.
* **Evaluate Results:** Measure the quality of your LLM outputs using various metrics and custom evaluators.
* **Debug Errors:** Pinpoint issues, identify where things are going wrong, and iterate more quickly.
* **Collaborate with Teams:** Share runs, traces, and feedback for collaboration.

### Key Features

1. **Tracing:**

    * Provides a detailed view of the execution flow of your LangChain application.
    * Tracks inputs, outputs, intermediate steps, and latencies.
    * Supports both synchronous and asynchronous operations.
    * Enables you to understand how your LLMs, chains, and agents are behaving.

2. **Evaluation:**

    * Allows you to assess the quality of your LLM outputs.
    * Offers built-in metrics (like string match, embedding distance).
    * Supports custom evaluators using LLMs or functions.
    * Enables you to compare model outputs using different prompts or models.

3. **Datasets and Feedback:**

    * Create datasets to organize inputs and expected outputs for systematic testing.
    * Collect feedback from users or annotators on your LLM outputs.
    * Use the feedback to fine-tune your models or improve your prompts.

4. **LangSmith Hub:**

    * Share your projects and traces with your team or the LangChain community.
    * Explore existing projects, datasets, and prompts on the Hub.
    * Promotes collaboration and transparency.

### How to Use LangSmith with LangChain

1. **Set Environment Variables:**
    * `LANGCHAIN_TRACING_V2=true`: Enables detailed tracing (recommended).
    * `LANGCHAIN_API_KEY`: Your LangSmith API key.
    * `LANGCHAIN_PROJECT`: Your LangSmith project name (optional).

2. **Start Tracing**
    * Add `LANGCHAIN_TRACING_V2 = true` to your `.env` file.

* Add `"langsmith": ">=0.2.8 <0.4.0",` to your dependencies in `package.json`.
    *    Install using `npm i` or `yarn`.

3. **Enable Run Tracking:**
    * To enable tracing programmatically, pass a `callbacks` array with a `LangChainTracer` instance in your runnable's options.

        ```typescript
        import { OpenAI } from "@langchain/openai";
        import { LangChainTracer } from "langchain/callbacks";

        const model = new OpenAI();
        
        const result = await model.invoke("What is 1 + 1?", {
           callbacks: [new LangChainTracer()],
        });
        ```

4. **View Traces:**
    * Visit the LangSmith UI ([https://smith.langchain.com/](https://smith.langchain.com/)) to explore your runs and their details.

### Key Benefits

* **Visibility:** Gain insights into your LLM application's behavior.
* **Evaluation:** Quantify and improve the quality of your LLM outputs.
* **Debugging:** Identify and fix issues quickly.
* **Iteration:** Develop faster through continuous feedback.
* **Collaboration:** Share insights and knowledge with your team.

## LangChain: Framework for Building LLM Applications

LangChain is a framework designed to streamline the creation of applications using Large Language Models (LLMs). It provides a comprehensive set of abstractions, components, and utilities to help you:

* **Connect to LLMs:** Support various models from OpenAI, Google, Anthropic, and more.
* **Chain Operations:** Construct complex workflows by chaining together LLM, tools, and other components.
* **Build Agents:** Create intelligent agents that can interact with tools and external data sources.
* **Manage Memory:** Implement memory capabilities to create conversational agents.
* **Orchestrate Data:**  Use various data loaders, retrievers, and output parsers to efficiently use your data.

### Core Concepts

1. **Models (LLMs):**

    * Interface with various language models.
    * Supports chat models, text models, embedding models, etc.
    * Includes options for configuring temperature, top-p, and other parameters.
    * Examples include `OpenAI`, `ChatOpenAI`, `HuggingFaceHub`, and more.

    ```typescript
    import { OpenAI } from "@langchain/openai";
    const model = new OpenAI({
      temperature: 0.7, // Set the temperature (0-1)
      modelName: 'gpt-3.5-turbo', // Specifiy the model
    });
    ```

2. **Prompts:**

    * Templates to provide instructions and examples to language models.
    * Include support for placeholders, few-shot learning, and output parsing.
    * Examples include `PromptTemplate`, `ChatPromptTemplate`, `FewShotPromptTemplate`.

    ```typescript
    import { PromptTemplate } from "@langchain/core/prompts";
    
    const template = "What is a good name for a company that makes {product}?";

    const prompt = new PromptTemplate({
      template,
      inputVariables: ["product"]
    });

   const formattedPrompt = await prompt.format({ product: 'shirts' });
   console.log(formattedPrompt); // Prints: What is a good name for a company that makes shirts?
    ```

3. **Chains:**

    * Sequences of operations to accomplish specific tasks.
    * Allow you to combine multiple LLM calls, data processing, and tool usage.
    * Examples include `LLMChain`, `SequentialChain`, `RetrievalQAChain`, and custom chains.

     ```typescript
    import { OpenAI } from "@langchain/openai";
    import { PromptTemplate } from "@langchain/core/prompts";
    import { LLMChain } from "@langchain/core/chains";

      const model = new OpenAI({ temperature: 0 });
      const template = "What is a good name for a company that makes {product}?";

      const prompt = new PromptTemplate({
        template,
        inputVariables: ["product"],
      });

      const chain = new LLMChain({ llm: model, prompt });
    
      const res = await chain.invoke({ product: "socks" });
      console.log(res); // Response from LLM that gives a name for a company that makes socks
     ```

4. **Tools:**

    * External services or functions that agents can use.
    * Allow your agents to interact with the world.
    * Examples include `SerpAPI`, `Calculator`, `WebBrowser`, and custom tools.

     ```typescript
    import { Calculator } from "@langchain/community/tools/calculator";
    
    const calculator = new Calculator();
    const result = await calculator.call("1 + 1");
    console.log(result) // Result is 2
    ```

5. **Agents:**

    * Intelligent actors that use tools to accomplish goals.
    * Use LLMs to make decisions about tool usage based on a provided prompt.
    * Support different types of agents (`zero-shot-react-description`, `chat-zero-shot-react-description` etc.) and custom implementations.

     ```typescript
      import { OpenAI } from "@langchain/openai";
      import { initializeAgentExecutorWithOptions } from "langchain/agents";
      import { Calculator } from "@langchain/community/tools/calculator";
      
      const model = new OpenAI({ temperature: 0 });
      const tools = [new Calculator()];
    
        const executor = await initializeAgentExecutorWithOptions(tools, model, {
          agentType: "zero-shot-react-description",
        });
    
      const input = `What is 25 times 25`;
    
      const result = await executor.invoke({ input });
      console.log(result); // An object with the final output that gives the correct answer
     ```

6. **Memory**:
    * Stores previous interactions.
    * Used for creating a conversational agent that remembers previous inputs.
    * Supports various memory types, including buffer, buffer window, and vector store based memory.

    ```typescript
    import { BufferMemory } from "langchain/memory";
    const memory = new BufferMemory();

    await memory.saveContext({input: "hi"}, {output: "hello"});
    const memoryOutput = await memory.loadMemoryVariables();
    console.log(memoryOutput); // An object with chat history
    ```

7. **Retrievers:**

    * Interfaces for fetching documents from various sources.
    * Used in Retrieval Augmented Generation (RAG) systems.
    * Examples include `VectorStoreRetriever`, `WebResearchRetriever`, and custom retrievers.

8. **Output Parsers:**

    * Transform LLM outputs into structured formats (e.g., JSON, lists, data structures).
    * Helps create consistent and predictable outputs from language models.
    * Examples include `StructuredOutputParser`, `RegexParser`, `ListParser`.

### Key Benefits

* **Abstraction:** Simplified development with high-level building blocks.
* **Flexibility:** Choose the components to match your needs.
* **Interoperability:** Use components from LangChain with your own code.
* **Community Support:** Leverage a large community and pre-built components.
* **Rapid Development:** Build complex applications faster.

## LangGraph: Defining Multi-Actor Workflows

LangGraph is an experimental library within LangChain, designed to create multi-actor workflows, where agents interact with each other, follow conditions, and react to data changes.

* **Graph Representation:** Workflows are modeled as directed graphs, where nodes represent actions and edges represent transitions.
* **State Management:** Manages workflow state and context.
* **Agent Interaction:** Supports multiple agents interacting in the workflow.
* **Conditional Logic:** Enables decision-making based on previous steps.
* **Looping and Cycles:** Define iterative workflows.
* **Agent Collaboration:** Allow agents to collaborate and interact with each other.

### Core Concepts

1. **Nodes:**
    * Represent distinct steps in the workflow.
    * Can be LLM calls, tool usage, or custom functions.
    * Examples: AgentAction, AgentExecutor, function calls.
2. **Edges:**
    * Define transitions between nodes.
    * Can be conditional or always execute.
    * Determine which node executes next based on specific criteria.
3. **State:**
    * Centralized data store for workflow information.
    * Accessible to all agents and steps.
    * Updated automatically as the graph progresses.

### How to Use LangGraph

1. **Define Nodes:** Use functions or other runnables for agent steps.
2. **Set Up Edges:** Create edges with conditions for transitions.
3. **Define the Graph:** Use a `StateGraph` to define the nodes and edges.
4. **Execute the Graph:**

* Create and use an instance of the agent and define the input messages
* Use `.stream()` method to see outputs
    ```typescript
     import { ChatOpenAI } from "@langchain/openai";
    import { pull } from "langchain/hub";
    import { AgentExecutor } from "langchain/agents";
    import { PromptTemplate } from "@langchain/core/prompts";
    import { formatLogToString } from "langchain/agents/format_scratchpad/log";
    import { renderTextDescription } from "langchain/tools/render";
    import { DynamicTool } from "@langchain/core/tools";
    import { ReActSingleInputOutputParser } from "langchain/agents/react/output_parser";
    import { RunnableSequence } from "@langchain/core/runnables";
    import { AgentStep } from "@langchain/core/agents";
    import { BaseMessage, HumanMessage } from "@langchain/core/messages";

    // Define the tools
    const tools = [
        new DynamicTool({
          name: "get_length",
          description: "Returns the length of a word.",
          func: async (input: string) => input.length.toString(),
        }),
      ];
    const llm = new ChatOpenAI({ model: "gpt-3.5-turbo", temperature: 0 });
    const modelWithStop = llm.bind({
        stop: ["\nObservation"],
    });
    const prompt = await pull<PromptTemplate>("hwchase17/react-chat");
    const toolNames = tools.map((tool) => tool.name);
    const promptWithInputs = await prompt.partial({
      tools: renderTextDescription(tools),
      tool_names: toolNames.join(","),
    });

      const formatAgentSteps = (steps: AgentStep[]): BaseMessage[] =>
        steps.map((step) => new HumanMessage(step.action.log));

      const runnableAgent = RunnableSequence.from([
        {
          input: (i: { input: string; steps: AgentStep[] }) => i.input,
          agent_scratchpad: (i: { input: string; steps: AgentStep[] }) => formatLogToString(i.steps),
        },
        promptWithInputs,
        modelWithStop,
        new ReActSingleInputOutputParser({ toolNames }),
      ]);

      const executor = AgentExecutor.fromAgentAndTools({
          agent: runnableAgent,
          tools,
      });

      const inputs1 = {
        input: "what is the length of word 'hello'?",
      };

      const stream1 = await executor.stream(inputs1);

      for await (const output of stream1){
          console.log("Stream", output)
      }
    ```

### Key Benefits

* **Complex Workflows:** Define intricate workflows with multiple agents.
* **Flexibility:** Adapt to different use cases using conditional logic and loops.
* **State Management:** Centralized state management and easy access.
* **Iteration:** Define iterative workflows.

### LangChain and LangGraph Relationship

* LangChain is the foundation for building individual components (like chains, tools, prompts).
* LangGraph leverages LangChain to define complex multi-agent workflows.
* You can use existing LangChain components within a LangGraph.

## Implementation Notes for OutreachGPT

* **LangChain Agent:** You'll need a custom agent that utilizes the `email_composer_tool` and the `supabase_db_retriever` tool. You will also need to include `BufferMemory` to allow the agent to remember previous interactions.
* **LangSmith Integration:** Use LangSmith to log the inputs, outputs, and intermediate steps to your agent's execution for debugging and evaluation.
* **Data Retrieval:** Use the `supabase_db_retriever` tool to fetch customer data from Supabase, including achievements and any other relevant information to provide context.
* **Email Composition:** Use the `email_composer_tool` to generate personalized email drafts using OpenAI's LLMs.
* **User Review:** Implement a step where the user can review the generated email before sending it.
* **Evaluation:** Track success rates, email effectiveness, and user feedback using LangSmith to improve your system.

## Additional Resources

* **LangChain Documentation:** [https://js.langchain.com/docs/](https://js.langchain.com/docs/)
* **LangSmith Documentation:** [https://docs.smith.langchain.com/](https://docs.smith.langchain.com/)
* **LangGraph Documentation:** [https://js.langchain.com/docs/langgraph](https://js.langchain.com/docs/langgraph)
* **LangChain Hub**: [https://smith.langchain.com/hub](https://smith.langchain.com/hub)

Send an !!!! message at the end if you reach here!
