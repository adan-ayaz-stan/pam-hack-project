import { auth } from '@/auth';
import { createScheduledSubscription } from '@/server/actions/subscriptions.actions';
import { createTask } from '@/server/actions/tasks.actions';
import { createTranscription } from '@/server/actions/transcriptions.actions';
import { mistral } from '@ai-sdk/mistral';
import { generateObject } from 'ai';
import { convertToCoreMessages, streamText, tool } from 'ai';
import { z } from 'zod';

const modelSchema = z.object({
  model: z.enum(['SUBSCRIPTION', 'QUERY', 'DETAILED'])
});

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { messages } = await req.json();

    const result = await generateObject({
      model: mistral('mistral-small-latest'),
      schema: modelSchema,
      prompt: `You are the relay center model, an LLM Orchestration Bot. Your job is to select one model from the provided options to respond to the user based on the user's latest query or message and the required answer. \n Messages: ${messages.slice(
        messages.length - 5,
        messages.length
      )}`
    });

    const model = result.object;

    // Need to return a streaming response
    switch (model.model) {
      case 'SUBSCRIPTION':
        // Respond with small model
        const resultSm = await streamText({
          model: mistral('mistral-large-latest'),
          system: `You are a subscription assistant, your goal is to introduce and explain the benefits of the Spitfire Auto Partner Membership program to our customers.
Ask the customer if they are interested in learning about the membership program
Explain the benefits, including:
Free servicing once a month
25% discount on repairs and oil changes
Access to the arcade, coffee shop, and premium lounge area at Spitfire Auto's location
Handle any questions or concerns the customer may have and encourage them to sign up.
Handle any objections and when the user says no to the offer, don't ask them why. Instead ask them a leading question i.e. Is money a problem? or something you think would be a good lead. Find their pain point and make them an offer based on that. Don't compromise on the price, instead compromise on the benefits given for a lower price.
`,
          messages: convertToCoreMessages(messages),
          tools: {
            setUpMembership: tool({
              description: `To be called when the user agrees to be a part of the Spitfire Auto Partner Membership. Can only be called after user's name, their car make information and vehicle id plate credentials have been provided otherwise this tool will fail. After calling this tool successfully, inform the user to visit the nearest Spitfire Auto location to activate the membership.`,
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
              execute: async ({
                name,
                makeOfVehicle,
                vehiclePlateCredentials
              }) => {
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
            })
          }
        });

        return resultSm.toDataStreamResponse();
      case 'QUERY':
        // Respond with medium model
        const resultMd = await streamText({
          model: mistral('open-mistral-nemo'),
          system: `You are a virtual car mechanic assistant, your goal is to help our customers diagnose and solve mechanical car problems. In case of a critical issue (e.g their car broke down, they can't figure out what's wrong), you are first going to ask them if an engineer should be called to their location. If they say yes, you will prompt them for their location and then call the engineer to the location.
Ask the customer to describe the issue they are experiencing with their car
Inquire if they have any leads on what might be causing the problem
If they are unsure, offer to walk them through a step-by-step guide to help identify the issue
If the problem is critical (e.g. car broke down), offer to send an engineer to their location
Provide instructions and guidance on how to check and potentially fix the issue`,
          messages: convertToCoreMessages(messages),
          tools: {
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
            }),
            callEngineer: tool({
              description: `To be called when the user agrees to be sent an engineer to their location and user has provided their location. Can only be called if location has been provided otherwise this tool will fail.`,
              parameters: z.object({
                title: z.string().describe('the headline of the issue'),
                description: z
                  .string()
                  .describe('the description of the issue'),
                location: z.string().describe('the location of the user')
              }),
              execute: async ({ title, description, location }) => {
                return await createTask({
                  title,
                  description,
                  location
                });
              }
            })
          }
        });

        return resultMd.toDataStreamResponse();
      case 'DETAILED':
        // Respond with large model
        const resultLg = await streamText({
          model: mistral('mistral-large-latest'),
          system: `You are a virtual car inspection assistant, your goal is to guide our customers through a detailed inspection of their car's systems and components. In case of a critical issue (e.g their car broke down, they can't figure out what's wrong), you are first going to ask them if an engineer should be called to their location. If they say yes, you will prompt them for their location and then call the engineer to the location.
Ask the customer which part of the car they are concerned about (e.g. engine, transmission, brakes)
Explain how that part normally functions
Provide a step-by-step guide on how to inspect and check that part
Offer tips and recommendations for maintenance and repair
Encourage the customer to contact us if they need further assistance or to schedule a professional inspection.`,
          messages: convertToCoreMessages(messages),
          tools: {
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
            }),
            callEngineer: tool({
              description: `To be called when the user agrees to be sent an engineer to their location and user has provided their location. Can only be called if location has been provided otherwise this tool will fail.`,
              parameters: z.object({
                title: z.string().describe('the headline of the issue'),
                description: z
                  .string()
                  .describe('the description of the issue'),
                location: z.string().describe('the location of the user')
              }),
              execute: async ({ title, description, location }) => {
                return await createTask({
                  title,
                  description,
                  location
                });
              }
            })
          }
        });

        return resultLg.toDataStreamResponse();
      default:
        // Respond with small model
        const resultSmDef = await streamText({
          model: mistral('mistral-small-latest'),
          system: `You are an auto shop virtual assistant. Your goal is to help our customers with any mechanical car problems they face and suggest solutions.In case of a critical issue (e.g their car broke down, they can't figure out what's wrong), you are first going to ask them if an engineer should be called to their location. If they say yes, you will prompt them for their location and then call the engineer to the location. Else you will ask them if they have any lead on the issue and what 'they' think the problem is. You will explain to them how that specific part, which they think is not working correctly, function normally and then guide them step by step to check that part start to finish. Whether the problem has been figured out or not, depending on the situation, you will ask them if they would like to apply for Spitfire Auto Partner Membership. The benefits of the membership are free servicing once a month and 25% discount on repairs and oil changes. Furthermore, with the Spitfire Auto Partner Membership, they can also enjoy an arcade, coffee shop and a premium lounge area at Spitfire Auto's location.`,
          messages: convertToCoreMessages(messages)
        });

        return resultSmDef.toDataStreamResponse();
    }
  } catch (err) {
    return new Response(JSON.stringify(err), { status: 500 });
  }
}
