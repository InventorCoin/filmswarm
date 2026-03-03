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

  console.log(`[generate_image] Starting for "${label}" by ${agentName} (project: ${projectId})`);

  let response: any;
  try {
    response = await genai.models.generateContent({
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
  } catch (err: any) {
    console.error(`[generate_image] API error for "${label}":`, err.message ?? err);
    return { url: '', description: `[Image generation failed for: ${label}] ${err.message ?? ''}` };
  }

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p: any) => p.inlineData);

  console.log(`[generate_image] Response for "${label}": ${parts.length} parts, hasImage=${!!imagePart?.inlineData?.data}`);

  if (!imagePart?.inlineData?.data) {
    return { url: '', description: `[Image generation failed for: ${label}]` };
  }

  // Upload to GCS
  let url: string;
  try {
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

    // Bucket has uniform bucket-level public access — no per-object ACL needed
    url = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    console.log(`[generate_image] Uploaded "${label}" to ${url}`);
  } catch (err: any) {
    console.error(`[generate_image] GCS upload error for "${label}":`, err.message ?? err);
    // Return without URL but don't crash the agent
    return { url: '', description: `[Image generated but upload failed for: ${label}]` };
  }

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
