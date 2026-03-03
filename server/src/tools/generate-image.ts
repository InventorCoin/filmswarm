import { FunctionTool, type ToolContext } from '@google/adk';
import { v4 as uuid } from 'uuid';
import { getGenAI, MODELS } from '../config/gemini.js';
import { getBucket } from '../config/firebase.js';
import { eventBus } from '../pipeline/event-bus.js';

async function executeGenerateImage(
  input: { prompt: string; label: string },
  toolContext?: ToolContext
): Promise<{ url: string; description: string }> {
  const { prompt, label } = input;
  const projectId = (toolContext?.state?.get?.('projectId') ?? 'unknown') as string;
  const agentName = toolContext?.agentName ?? 'unknown';

  eventBus.emit(projectId, { type: 'tool_call', agent: agentName, tool: 'generate_image' });

  const genai = getGenAI();

  const response = await genai.models.generateContent({
    model: MODELS.IMAGE,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Generate a cinematic, high-quality concept art image for film pre-production. ${prompt}`,
          },
        ],
      },
    ],
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p: any) => p.inlineData);

  if (!imagePart?.inlineData?.data) {
    return { url: '', description: `[Image generation failed for: ${label}]` };
  }

  // Upload to GCS
  const imageId = uuid();
  const fileName = `filmswarm/${projectId}/${imageId}.png`;
  const bucket = getBucket();
  const file = bucket.file(fileName);

  const buffer = Buffer.from(imagePart.inlineData.data as string, 'base64');
  await file.save(buffer, {
    metadata: {
      contentType: (imagePart.inlineData.mimeType as string) || 'image/png',
      metadata: { projectId, agent: agentName, label },
    },
  });

  await file.makePublic();
  const url = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

  const textPart = parts.find((p: any) => p.text);
  const description = (textPart as any)?.text || label;

  eventBus.emit(projectId, {
    type: 'image_generated',
    agent: agentName,
    url,
    description,
  });

  return { url, description };
}

export const generateImageTool = new FunctionTool({
  name: 'generate_image',
  description:
    'Generate a cinematic concept art image for film pre-production. Returns a public URL and description.',
  parameters: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description:
          'Detailed image generation prompt describing the scene, character, or location',
      },
      label: {
        type: 'string',
        description: 'Short label for the image',
      },
    },
    required: ['prompt', 'label'],
  } as any,
  execute: executeGenerateImage as any,
});
