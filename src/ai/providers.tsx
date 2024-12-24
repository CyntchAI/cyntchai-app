import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { solanaTools } from './tools/solana';
import { ReactNode } from 'react';
import { z } from 'zod';
import { definedTools } from './tools/defined-fi';
import { pumpfunTools } from './tools/pumpfun';
import { jupiterTools } from './tools/jupiter';
import { dexscreenerTools } from './tools/dexscreener';
const usingAntropic = !!process.env.ANTHROPIC_API_KEY;

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const claude35Sonnet = anthropic('claude-3-5-sonnet-20241022');

const openai = createOpenAI({ baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1', apiKey: process.env.OPENAI_API_KEY });
const gpt4o = openai('gpt-4o');

export const defaultSystemPrompt = `
Your name is Neur (Agent).
You are a specialized AI assistant for Solana blockchain and DeFi operations, designed to provide secure, accurate, and user-friendly assistance.

Critical Rules:
- If previous tool result contains 'suppressFollowUp: true':
  1. DO NOT provide any detailed analysis or explanation in your response
  2. Keep your response brief and natural, directing attention to the displayed results
  3. Vary your responses naturally, for example:
     - "Take a look at the results above"
     - "I've displayed the information above"
     - "The results are shown above"
     - "You can see the details above"
- Always use the \`searchToken\` tool to get the correct token mint first and ask for user confirmation.

Common knowledge:
- { user: toly, description: Co-Founder of Solana Labs, twitter: @aeyakovenko, wallet: toly.sol }\

Common tokens:

`;

export const defaultModel = usingAntropic ? claude35Sonnet : gpt4o;

export interface ToolConfig {
   displayName?: string;
   icon?: ReactNode;
   isCollapsible?: boolean;
   description: string;
   parameters: z.ZodType<any>;
   execute: <T>(params: z.infer<T extends z.ZodType ? T : never>) => Promise<any>;
   render?: (result: unknown) => React.ReactNode | null;
}

export function DefaultToolResultRenderer({ result }: { result: unknown }) {
   if (result && typeof result === 'object' && 'error' in result) {
      return (
         <div className="pl-3.5 mt-2 text-sm text-destructive">
            {String((result as { error: unknown }).error)}
         </div>
      )
   }

   return (
      <div className="pl-3.5 mt-2 text-xs font-mono border-l border-border/40 text-muted-foreground/90">
         <pre className="whitespace-pre-wrap break-all truncate max-h-[200px] max-w-[400px]">
            {JSON.stringify(result, null, 2).trim()}
         </pre>
      </div>
   )
}

export const defaultTools: Record<string, ToolConfig> = {
   ...solanaTools,
   ...definedTools,
   ...pumpfunTools,
   ...jupiterTools,
   ...dexscreenerTools
}

export function getToolConfig(toolName: string): ToolConfig | undefined {
   return defaultTools[toolName]
}