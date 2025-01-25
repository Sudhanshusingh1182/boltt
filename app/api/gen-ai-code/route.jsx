import { genAICode } from "@/configs/AiModel";
import { NextResponse } from "next/server";

export const maxDuration = 60 ;

export async function POST(req){
    
    const {prompt} = await req.json();

    try {
        const result = await genAICode.sendMessage(prompt);
        const resp = result.response.text();

        return NextResponse.json(JSON.parse(resp));
    } catch (error) {
        console.log(error);
        
        return NextResponse.json({error:error});
    }
}