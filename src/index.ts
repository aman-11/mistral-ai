import {Mistral} from '@mistralai/mistralai'
import { createClient } from '@supabase/supabase-js'
import dotenv from "dotenv";
dotenv.config();


/**
 * Retrieval -> Generation
 *
 * A) Retrieval
 * 1. read document
 * 2. search query
 * 3. create embedding format for above #1 & #2 and store in vector  DB smth supabase
 * 4. do semantic search in vector  DB and get search result
 *
 * B)Generation
 * 1. User Input question user ask
 * 2. Retrieval output search result
 * 3. create a prompt
 * 4. LLMs
 * 5. response
 */

/**
 * Data has been created by data.ts
 * here we are focusing on Generation
 * 1. ge the user input
 * 2. create embedding for user input for similarity search
 * 3. do semantic search in vector  DB and get search result, retrieveMatches(#userInpuut.embedding)
 * 4. generate chat response from combining #3 and #1 and ask mistral to generate
 */

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const mistralClient = new Mistral({apiKey: process.env.MISTRAL_AI});
const supabase = createClient(supabaseUrl as string, supabaseKey as string)

const userInput = 'What is the name of old clockmaker?'

async function createEmbedding(userInput : string) {
    const {data} = await mistralClient.embeddings.create({
        model: 'mistral-embed',
        inputs: [userInput]
    })

   return data[0].embedding;
}

async function retrieveMatches(embedding: number[]) {
    const { data } = await supabase.rpc('match_handbook_docs',
        {
            'query_embedding': embedding,
            'match_threshold': 0.70, // how similar it is, higher it will be more picky we are
            'match_count': 5 // more relevant data
        }
    );

    return data.map((chunk: { content: any; }) => chunk.content).join(' ');
}

async function generateChatResponse(context: string, query: string) {
    const chatResponse = await mistralClient.chat.complete({
        model: 'mistral-tiny',
        messages: [
            {role: 'system', content: context},
            {role: 'user', content: query}
        ],
        temperature: 0.5, // lower value more deterministic
    });

    return chatResponse.choices?.[0].message.content
}

const embedding = await createEmbedding(userInput) as number[];
const matches = await retrieveMatches(embedding);
console.log('matches', matches)
const response = await generateChatResponse(matches, userInput)
console.log('response', response)