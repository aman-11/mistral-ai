import {Mistral} from '@mistralai/mistralai'
import {toolCallByName, toolsForAi} from './tools.js';
import dotenv from "dotenv";
import {ToolCall} from "@mistralai/mistralai/src/models/components/toolcall";
dotenv.config();

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const mistralClient = new Mistral({apiKey: process.env.MISTRAL_AI});

async function agent(query: any){
    const messages = [
        { role: 'user', content: query },
    ]
    /**
     * hardcoded 5 times as of now since going with naive sol,
     * as while can go into infinie time
     */
    for(let i=0; i<5; i++) {
        const chatResponse = await mistralClient.chat.complete({
            model: 'mistral-tiny',
            // @ts-ignore
            messages,
            tools: toolsForAi,
        });

        // continue to put in messages so that internal interaction goes on
        // @ts-ignore
        messages.push(chatResponse.choices[0].message)

        /**
         * if finish reason is simply stop return the response
         * from the assistant
         */
        if(chatResponse.choices?.[0].finishReason === 'stop'){
            return chatResponse.choices[0].message.content;
        }

        if(chatResponse.choices?.[0].finishReason === 'tool_calls'){
            const { id, function: { name, arguments: args } }: ToolCall = chatResponse.choices[0].message.toolCalls?.[0] as ToolCall;
            const fnName = name;
            const fnParams = JSON.parse(args as string);
            /**
             * store the map of the toolCallFunctionName by function definition
             */
            const result = toolCallByName[fnName](fnParams);
            messages.push({
                role: 'tool',
                // @ts-ignore
                name: fnName,
                content: JSON.stringify(result),
                toolCallId: id
            })

            /**
             * sleeping for 1 sec as free model has 1rps
             */
            await sleep(1500);
            console.log(messages)
        }
    }
}


const response  = await agent('When was order number ON-004 ordered?');
// const response  = await agent('Is the order number ON-001 shipped?');
/**
 * LLM gives back the toolCalls which has to be invoked, with role assistant
 * {"id":"cd5ce19992c8402ca6fc7d7e985a29ca","object":"chat.completion","model":"mistral-tiny","usage":{"promptTokens":85,"completionTokens":26,"totalTokens":111},"created":1737913029,"choices":[{"index":0,"message":{"content":"","toolCalls":[{"id":"ZxV4WUvjp","function":{"name":"getOrderStatus","arguments":"{\"orderNumber\": \"ON-001\"}"},"index":0}],"prefix":false,"role":"assistant"},"finishReason":"tool_calls"}]}
 */
console.log(JSON.stringify(response))