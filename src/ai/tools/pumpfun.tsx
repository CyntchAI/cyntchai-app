import { retrieveAgentKit } from "@/server/actions/ai";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LaunchResultProps {
    signature: string;
    mint: string;
    metadataUri: string;
}

function LaunchResult({ signature, mint, metadataUri }: LaunchResultProps) {
    return (
        <Card className="p-6 bg-card">
            <h2 className="text-xl font-semibold mb-4 text-card-foreground">Token Launch Successful! 🚀</h2>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">Transaction Hash</div>
                        <div className="text-sm font-mono truncate max-w-[200px]">{signature}</div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                        onClick={() => window.open(`https://solscan.io/tx/${signature}`, '_blank')}
                    >
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">Token Contract</div>
                        <div className="text-sm font-mono truncate max-w-[200px]">{mint}</div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                        onClick={() => window.open(`https://pump.fun/mint/${mint}`, '_blank')}
                    >
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">Metadata URI</div>
                        <div className="text-sm font-mono truncate max-w-[200px]">{metadataUri}</div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                        onClick={() => window.open(metadataUri, '_blank')}
                    >
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}

export const pumpfunTools = {
    launchToken: {
        description: 'Launch a token on PumpFun',
        displayName: '💊 Deploy new token',
        parameters: z.object(
            {
                name: z.string().describe("The name of the token"),
                symbol: z.string().describe("The symbol of the token"),
                description: z.string().describe("The description of the token"),
                image: z.string().describe("The image of the token"),
                initalBuySOL: z.number().describe("The amount of SOL to buy the token"),
                website: z.string().optional().describe("The website url of the token"),
                twitter: z.string().optional().describe("The twitter url of the token"),
                telegram: z.string().optional().describe("The telegram url of the token"),
            }
        ),
        execute: async ({ name, symbol, description, image, initalBuySOL, website, twitter, telegram }: {
            name: string,
            symbol: string,
            description: string,
            image: string,
            initalBuySOL: number,
            website?: string,
            twitter?: string,
            telegram?: string
        }) => {
            try {
                const agentResponse = await retrieveAgentKit();
                const agent = agentResponse?.data?.data?.agent;

                if (!agent) {
                    return { success: false, error: "Failed to retrieve agent" }
                }

                const result = await agent.launchPumpFunToken(
                    name,
                    symbol,
                    description,
                    image,
                    {
                        initialLiquiditySOL: initalBuySOL,
                        website,
                        twitter,
                        telegram,
                    }
                );

                return { success: true, data: result };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : "Failed to launch token"
                };
            }
        },
        render: (result: unknown) => {
            const typedResult = result as { success: boolean, data: any, error?: string };

            if (!typedResult.success) {
                return (
                    <Card className="p-6 bg-destructive/10">
                        <h2 className="text-xl font-semibold mb-2 text-destructive">Launch Failed</h2>
                        <pre className="text-sm text-destructive/80">{JSON.stringify(typedResult, null, 2)}</pre>
                    </Card>
                );
            }

            const data = typedResult.data as { signature: string, mint: string, metadataUri: string };
            return <LaunchResult {...data} />;
        }
    },
}