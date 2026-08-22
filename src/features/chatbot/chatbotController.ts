import { Context } from 'hono';
import { streamSSE } from 'hono/streaming';
import { AppContext } from '../../shared/controller/appContext';
import { authGuardBackend } from '../auth/authGuardBackend';
import {
  chatbotSendMessageInputSchema,
  ChatbotSendMessageInput,
} from './chatbotSchemas';
import { streamChatbotResponse } from './chatbotService';
import { checkAllLimits, trackTokenUsage } from './chatbotUsageService';
import {
  acquireChatbotLock,
  releaseChatbotLock,
  ChatbotLockError,
} from './chatbotLockService';

export async function chatbotSendMessageController(
  body: unknown,
  context: AppContext,
  c: Context,
) {
  await authGuardBackend(
    {
      chatbot: ['use'],
    },
    context,
  );

  const input: ChatbotSendMessageInput =
    chatbotSendMessageInputSchema.parse(body);

  const userId = context.currentUser!.id;
  const organizationId = context.currentOrganization!.id;

  // Prevents multiple concurrent requests from same user to avoid response mixing
  try {
    await acquireChatbotLock(userId);
  } catch (error) {
    if (error instanceof ChatbotLockError) {
      return c.json(
        {
          error: 'concurrent_request',
          message: error.message,
        },
        409, // Conflict
      );
    }
    throw error;
  }

  const limitCheck = await checkAllLimits(userId, organizationId);

  if (!limitCheck.allowed) {
    // Must release lock before returning to avoid permanent lockout
    await releaseChatbotLock(userId);

    return c.json(
      {
        error: 'limit_exceeded',
        limitType: limitCheck.limitType,
        current: limitCheck.current,
        limit: limitCheck.limit,
        message: getLimitExceededMessage(
          limitCheck.limitType,
          limitCheck.limit,
        ),
      },
      429, // Too Many Requests
    );
  }

  return streamSSE(c, async (stream) => {
    let inputTokens = 0;
    let outputTokens = 0;

    try {
      for await (const chunk of streamChatbotResponse(
        input.message,
        input.conversationHistory || [],
        context,
      )) {
        if (chunk.type === 'usage' && chunk.usage) {
          inputTokens = chunk.usage.inputTokens;
          outputTokens = chunk.usage.outputTokens;
        }

        await stream.writeSSE({
          data: JSON.stringify(chunk),
          event: chunk.type,
        });

        if (chunk.type === 'error' || chunk.type === 'done') {
          // Brief delay ensures client receives final chunks before connection closes
          await stream.sleep(100);
        }
      }

      if (inputTokens > 0 || outputTokens > 0) {
        await trackTokenUsage(
          userId,
          organizationId,
          inputTokens,
          outputTokens,
        );
      }
    } catch (error: any) {
      console.error('Chatbot controller error:', error);
      await stream.writeSSE({
        data: JSON.stringify({
          type: 'error',
          content: error.message || 'An unexpected error occurred',
        }),
        event: 'error',
      });
    } finally {
      // Critical: ensures lock is always released preventing user lockout on errors
      await releaseChatbotLock(userId);
    }
  });
}

function getLimitExceededMessage(
  limitType: 'user' | 'organization' | 'global',
  limit: number,
): string {
  switch (limitType) {
    case 'user':
      return `You've reached your personal daily chatbot limit of ${limit.toLocaleString()} tokens. Your limit will reset tomorrow. Tokens count both your questions and the AI's responses.`;
    case 'organization':
      return `Your organization has reached its daily chatbot limit of ${limit.toLocaleString()} tokens. This limit is shared across all members and will reset tomorrow.`;
    case 'global':
      return 'The chatbot service has reached its daily capacity limit. Please try again tomorrow when the limit resets.';
  }
}
