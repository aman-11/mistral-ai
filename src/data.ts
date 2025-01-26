import {Mistral} from '@mistralai/mistralai'
import { createClient } from '@supabase/supabase-js'
import dotenv from "dotenv";
dotenv.config();

const mistralClient = new Mistral({apiKey: process.env.MISTRAL_AI});

/**
 * read document - A.1
 */
import {RecursiveCharacterTextSplitter} from "@langchain/textsplitters";
import fs from 'fs';
async function textSplitter() {
    const story = fs.readFileSync('../story.txt', 'utf8');

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 100,
        chunkOverlap: 10,
    });
    const output = await splitter.createDocuments([story]);
    const text =  output.map(value => value.pageContent)
    return text;
}

// const exampleChunk = text[0];
//
// const embedding = await mistralClient.embeddings.create({
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
    const {data} = await mistralClient.embeddings.create({
        model: 'mistral-embed',
        inputs: texts
    })

    return texts.map((content: string, index: number) => ({
        content,
        embedding: data[index].embedding
    }))
}

// console.log(await createEmbeddings(texts));


/**
 * A.3 part 2 we will be uploading to supabase
 * vector database have the capacity to store and retrieve embedding quickly and at scale
 * how they work?
 * instead of exact match values it similarity matrix, finds more similar
 * 1. users interact with and receive resp from my own content
 * 2. control on our own data and its in real time
 * 3. reduce in hallucinations
 */
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl as string, supabaseKey as string)

/**
 * create a table
 * create table handbook_docs(
 *   id bigserial primary key,
 *   content text,
 *   embedding vector(1024) -- 1024 are the dimensions here for the vector
 * );
 */

type IHandbookDocsRow = {
    content: string,
    embedding: number[] | undefined
};
const texts = await textSplitter();
const data: IHandbookDocsRow[] = await createEmbeddings(texts);
await supabase.from('handbook_docs').insert(data);
console.log('upload complete')