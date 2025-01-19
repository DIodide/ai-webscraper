/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { Logger } from "@/utils/logger";
import { scrapeUrl } from "@/utils/scraper";
import { getGeminiResponse } from "@/utils/gemini";

const logger = new Logger("API: analyze");

export async function POST(req: Request) {
  const { url, prompt } = await req.json();

  logger.info(`Received form state: ${url} ${prompt}`);

  const scrapedContent = await scrapeUrl(url);

    
  logger.info("READ: received fullContent: ", scrapedContent?.content);
  // Setup GEmini API
  const message = [
    {
      role: "system" as const,
      content:
        "You are a data extraction assistant. Extract only the specific data requested by the user from web content and return it in valid JSON format. Be precise and focused on the requested data points. If no specific data is requested, extract key information like title, main topics, and key points in JSON format.",
    },
    {
      role: "user" as const,
      content:
            `Extract the data from the following webpage content in JSON format
            <WebPageContent>
                ${scrapedContent?.content}
            </WebPageContent>
            
            Provide the extracted data as a valid JSON object.`,
    },
  ];
    
    logger.info("MESSAGES:", message);

    const analysis = await getGeminiResponse(message);
    logger.info(" GEMINI RECEIVED ANALYSIS:", analysis);

    return NextResponse.json({
        analysis,
        metadata: {
            title: scrapedContent?.title,
            description: scrapedContent?.metaDescription,
            headings: scrapedContent?.headings
        }
        
    }

    );
}
