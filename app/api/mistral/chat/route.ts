import { convertToCoreMessages, streamText, tool } from 'ai';
import { mistral } from '@ai-sdk/mistral';
import { z } from 'zod';
import { auth } from '@/auth';
import { createTask } from '@/server/actions/tasks.actions';
import { createScheduledSubscription } from '@/server/actions/subscriptions.actions';
import { createTranscription } from '@/server/actions/transcriptions.actions';

export const maxDuration = 40;

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { messages } = await req.json();

  const result = await streamText({
    model: mistral('mistral-large-latest'),
    system: `You are an auto shop virtual assistant. Your goal is to help our customers with any mechanical car problems they face and suggest solutions.In case of a critical issue (e.g their car broke down, they can't figure out what's wrong), you are first going to ask them if an engineer should be called to their location. If they say yes, you will prompt them for their location and then call the engineer to the location. Else you will ask them if they have any lead on the issue and what 'they' think the problem is. You will explain to them how that specific part, which they think is not working correctly, function normally and then guide them step by step to check that part start to finish. Whether the problem has been figured out or not, depending on the situation, you will ask them if they would like to apply for Spitfire Auto Partner Membership. The benefits of the membership are free servicing once a month and 25% discount on repairs and oil changes. Furthermore, with the Spitfire Auto Partner Membership, they can also enjoy an arcade, coffee shop and a premium lounge area at Spitfire Auto's location.`,
    messages: convertToCoreMessages(messages),
    tools: {
      callEngineer: tool({
        description: `To be called when the user agrees to be sent an engineer to their location and user has provided their location. Can only be called if location has been provided otherwise this tool will fail.`,
        parameters: z.object({
          title: z.string().describe('the headline of the issue'),
          description: z.string().describe('the description of the issue'),
          location: z.string().describe('the location of the user')
        }),
        execute: async ({ title, description, location }) => {
          return await createTask({
            title,
            description,
            location
          });
        }
      }),
      setUpMembership: tool({
        description: `To be called when the user agrees to be a part of the Spitfire Auto Partner Membership. Can only be called after user's name, their car make information and vehicle plate credentials have been provided otherwise this tool will fail. After calling this tool successfully, inform the user to visit the nearest Spitfire Auto location to activate the membership.`,
        parameters: z.object({
          name: z.string().describe('the name of the user'),
          makeOfVehicle: z
            .string()
            .describe('the make of the user owned transport/vehicle'),
          vehiclePlateCredentials: z
            .string()
            .describe(
              'the plate credentials of the user owned transport/vehicle'
            )
        }),
        execute: async ({ name, makeOfVehicle, vehiclePlateCredentials }) => {
          await createTranscription({
            messages: messages,
            outcome: true,
            title: `Membership sold to ${name} for ${makeOfVehicle} ${vehiclePlateCredentials}`
          });

          return await createScheduledSubscription({
            name,
            vehicle_make: makeOfVehicle,
            vehicle_plate: vehiclePlateCredentials
          });
        }
      }),
      subscriptionDenied: tool({
        description: `To be called when the user denies the membership. Can only be called if the user has provided any reason for their denial otherwise this tool will fail.`,
        parameters: z.object({
          reason: z.string().describe('the reason for denial')
        }),
        execute: async ({ reason }) => {
          await createTranscription({
            messages: messages,
            outcome: false,
            title: `User denied membership. Reason: ${reason}`
          });
        }
      }),
      failureToResolveQuery: tool({
        description: `To be called if the user keeps repeating the query and you cannot understand it. Can only be called if enough messages have been sent and query is still not resolved. Otherwise this tool will fail.`,
        parameters: z.object({
          reason: z
            .string()
            .describe(
              `the user's query and the reason for failure to resolve query`
            )
        }),
        execute: async ({ reason }) => {
          await createTranscription({
            messages: messages,
            outcome: false,
            title: `Failure to resolve query. Details: ${reason}`
          });
        }
      })
    }
  });

  return result.toDataStreamResponse();
}
