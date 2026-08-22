import Anthropic from '@anthropic-ai/sdk';
import { AppContext } from '../../shared/controller/appContext';
import { McpTool } from '../mcp/mcpTypes';
import { getAllMcpTools } from '../mcp/mcp';
import { ChatbotMessage } from './chatbotSchemas';
import { roles, rolesIds } from '../permissions';
import type { Role } from 'better-auth/plugins/access';
import { dictionaryFormat } from '../../translation/dictionaryFormat';
import { env } from '../../env';

const anthropicApiKey = env.ANTHROPIC_API_KEY;

if (!anthropicApiKey) {
  console.warn(
    'ANTHROPIC_API_KEY is not set. Chatbot functionality will not work.',
  );
}

const anthropic = anthropicApiKey
  ? new Anthropic({ apiKey: anthropicApiKey })
  : null;

function convertMcpToolsToAnthropicFormat(
  mcpTools: McpTool[],
): Anthropic.Tool[] {
  return mcpTools.map((mcpTool) => ({
    name: mcpTool.name,
    description: mcpTool.description,
    input_schema: mcpTool.schema as Anthropic.Tool.InputSchema,
  }));
}

function hasToolPermission(tool: McpTool, context: AppContext): boolean {
  if (!context.currentMember) {
    return false;
  }

  const role: Role = roles[context.currentMember.role as keyof typeof rolesIds];

  if (!role) {
    return false;
  }

  if (
    !tool.requiredPermissions ||
    Object.keys(tool.requiredPermissions).length === 0
  ) {
    return true;
  }

  const result = role.authorize(tool.requiredPermissions as any);

  return result.success;
}

function filterToolsByPermissions(
  mcpTools: McpTool[],
  context: AppContext,
): { allowedTools: McpTool[]; anthropicTools: Anthropic.Tool[] } {
  const allowedTools = mcpTools.filter((tool) =>
    hasToolPermission(tool, context),
  );
  const anthropicTools = convertMcpToolsToAnthropicFormat(allowedTools);

  return { allowedTools, anthropicTools };
}

async function executeMcpTool(
  toolName: string,
  toolInput: any,
  allowedTools: McpTool[],
  context: AppContext,
): Promise<string> {
  const tool = allowedTools.find((t) => t.name === toolName);

  if (!tool) {
    return `Error: Tool "${toolName}" not found or not allowed`;
  }

  try {
    const result = await tool.handler(toolInput, context);
    return JSON.stringify(result, null, 2);
  } catch (error: any) {
    console.error(`Chatbot tool execution error [${toolName}]:`, error);
    return `Error executing ${toolName}: ${error.message}`;
  }
}

function convertHistoryToAnthropicMessages(
  history: ChatbotMessage[],
): Anthropic.MessageParam[] {
  return history.map((msg) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));
}

function createSystemPrompt(context: AppContext): string {
  const orgName = context.currentOrganization?.name || 'your organization';
  const languageName =
    context.dictionary.shared.locales[
      context.locale as keyof typeof context.dictionary.shared.locales
    ] || 'English';

  return dictionaryFormat(
    context.dictionary.chatbot.systemPrompt,
    orgName,
    languageName,
  );
}

export interface ChatbotStreamChunk {
  type: 'text' | 'tool_use' | 'tool_result' | 'error' | 'done' | 'usage';
  content?: string;
  toolName?: string;
  toolInput?: any;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export async function* streamChatbotResponse(
  message: string,
  conversationHistory: ChatbotMessage[] = [],
  context: AppContext,
): AsyncGenerator<ChatbotStreamChunk> {
  if (!anthropic) {
    yield {
      type: 'error',
      content:
        'Anthropic API is not configured. Please set ANTHROPIC_API_KEY environment variable.',
    };
    return;
  }

  const allMcpTools = getAllMcpTools(context.dictionary);
  const { allowedTools, anthropicTools } = filterToolsByPermissions(
    allMcpTools,
    context,
  );

  let messages: Anthropic.MessageParam[] = [
    ...convertHistoryToAnthropicMessages(conversationHistory),
    { role: 'user', content: message },
  ];

  try {
    // Agentic loop: continue until Claude provides final answer
    let continueLoop = true;
    const maxIterations = 10;
    let iteration = 0;

    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    while (continueLoop && iteration < maxIterations) {
      iteration++;

      const stream = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        system: createSystemPrompt(context),
        messages,
        tools: anthropicTools.length > 0 ? anthropicTools : undefined,
        stream: true,
      });

      const contentBlocks: Array<
        Anthropic.TextBlockParam | Anthropic.ToolUseBlockParam
      > = [];
      let currentTextBlock = '';
      let currentToolUse: { id: string; name: string; input: string } | null =
        null;
      let stopReason: string | null = null;

      for await (const event of stream) {
        if (event.type === 'message_start') {
          if (event.message.usage) {
            totalInputTokens += event.message.usage.input_tokens || 0;
          }
        } else if (event.type === 'content_block_start') {
          if (event.content_block.type === 'text') {
            currentTextBlock = '';
          } else if (event.content_block.type === 'tool_use') {
            currentToolUse = {
              id: event.content_block.id,
              name: event.content_block.name,
              input: '',
            };
            yield {
              type: 'tool_use',
              toolName: event.content_block.name,
              toolInput: {},
            };
          }
        } else if (event.type === 'content_block_delta') {
          if (event.delta.type === 'text_delta') {
            currentTextBlock += event.delta.text;
            yield {
              type: 'text',
              content: event.delta.text,
            };
          } else if (event.delta.type === 'input_json_delta') {
            if (currentToolUse) {
              currentToolUse.input += event.delta.partial_json;
            }
          }
        } else if (event.type === 'content_block_stop') {
          if (currentTextBlock) {
            contentBlocks.push({
              type: 'text',
              text: currentTextBlock,
            } as Anthropic.TextBlockParam);
            currentTextBlock = '';
          } else if (currentToolUse) {
            contentBlocks.push({
              type: 'tool_use',
              id: currentToolUse.id,
              name: currentToolUse.name,
              input: currentToolUse.input
                ? JSON.parse(currentToolUse.input)
                : {},
            } as Anthropic.ToolUseBlockParam);
            currentToolUse = null;
          }
        } else if (event.type === 'message_delta') {
          if (event.delta.stop_reason) {
            stopReason = event.delta.stop_reason;
          }
          if (event.usage) {
            totalOutputTokens += event.usage.output_tokens || 0;
          }
        }
      }

      if (stopReason === 'tool_use') {
        messages.push({
          role: 'assistant',
          content: contentBlocks,
        });

        const toolResults: Anthropic.MessageParam = {
          role: 'user',
          content: [],
        };

        for (const block of contentBlocks) {
          if (block.type === 'tool_use') {
            const toolResult = await executeMcpTool(
              block.name,
              block.input,
              allowedTools,
              context,
            );

            (toolResults.content as Anthropic.ToolResultBlockParam[]).push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: toolResult,
            });

            yield {
              type: 'tool_result',
              toolName: block.name,
              content: toolResult,
            };
          }
        }

        messages.push(toolResults);
      } else {
        continueLoop = false;
      }
    }

    yield {
      type: 'usage',
      usage: {
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
      },
    };

    yield { type: 'done' };
  } catch (error: any) {
    console.error('Chatbot streaming error:', error);
    yield {
      type: 'error',
      content:
        error.message || 'An error occurred while processing your request',
    };
  }
}
