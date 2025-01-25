import { chatSession } from "@/configs/AiModel";
import { NextResponse } from "next/server";

export async function POST(req){
    const {prompt} = await req.json();

    try {
        const result = await chatSession.sendMessage(prompt);
        const AIResponse = result.response.text();

        return NextResponse.json({result: AIResponse});
    } catch (err) {
        return NextResponse.json({error: err})
    }
}