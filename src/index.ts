import {Mistral} from '@mistralai/mistralai'
import {ChatCompletionResponse} from "@mistralai/mistralai/models/components";
import dotenv from "dotenv";
dotenv.config();

const apiKey = '89aQa0oqLiEQj2JrWpDkkcbCjFYFtOBJ';
console.log('apiKey', apiKey)
const client = new Mistral({apiKey: apiKey});

// const chatResponse = await client.chat.complete({
//     model: 'mistral-tiny',
//     messages: [
//         {role: 'system', content: 'When asked about value of apple, reply 1.666686. Reply with JSON'},
//         {role: 'user', content: 'What is value of apple?'}
//     ],
//     temperature: 0.5, // lower value more deterministic
//     responseFormat: {
//         type: 'json_object'
//     }
// });

// for await (const chunk of chatResponse){
//     console.log(chunk.data.choices[0].delta.content);
// }

// console.log('Chat:', chatResponse.choices?.[0].message.content);

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
 *
 *
 */

/**
 * read document - A.1
 */
import {RecursiveCharacterTextSplitter} from "@langchain/textsplitters";
import fs from 'fs';
async function textSplitter() {
    const story = fs.readFileSync('./story.txt', 'utf8');

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 100,
        chunkOverlap: 10,
    });
    const output = await splitter.createDocuments([story]);
    const text =  output.map(value => value.pageContent)
    return text;
}

const texts = await textSplitter();

// const exampleChunk = text[0];
//
// const embedding = await client.embeddings.create({
//     model: 'mistral-embed',
//     inputs: [exampleChunk]
// })
//
// console.log('embedding', JSON.stringify(embedding))

/**
 * A.3 part1 create embedding (still we haven't stored in DB)
 * create a function createEmbeddings(chunks) that turns all the text
 * into embedding (vectorial representation ) and then we will store in our vector database (supabase)
 * embeddingAndContent : [
 *      content: 'text',
 *      embedding: [4807baf77eaa46fab01548217732f9a0, 4807baf77eaa46fab01548217732f9a0]
 * ]
 */

async function createEmbeddings(texts: string[]) {
    const {data} = await client.embeddings.create({
        model: 'mistral-embed',
        inputs: texts
    })

    return texts.map((content: string, index: number) => ({
        content,
        embedding: data[index].embedding
    }))
}

console.log(await createEmbeddings(texts))


