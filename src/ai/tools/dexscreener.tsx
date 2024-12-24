import { z } from "zod";
import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

// Types
interface DexScreenerOrder {
    type: 'tokenProfile' | 'communityTakeover' | 'tokenAd' | 'trendingBarAd';
    status: 'processing' | 'cancelled' | 'on-hold' | 'approved' | 'rejected';
    paymentTimestamp: number;
}

interface DexScreenerPair {
    chainId: string;
    dexId: string;
    url: string;
    pairAddress: string;
    labels: string[];
    baseToken: {
        address: string;
        name: string;
        symbol: string;
    };
    quoteToken: {
        address: string;
        name: string;
        symbol: string;
    };
    priceNative: string;
    priceUsd: string;
    liquidity: {
        usd: number;
        base: number;
        quote: number;
    };
    fdv: number;
    marketCap: number;
    pairCreatedAt: number;
    info?: {
        imageUrl?: string;
        websites?: { url: string }[];
        socials?: { platform: string; handle: string }[];
    };
    boosts?: {
        active: number;
    };
}

interface DexScreenerPairResponse {
    schemaVersion: string;
    pairs: DexScreenerPair[];
}

const OrdersResult = ({ orders }: { orders: DexScreenerOrder[] }) => {
    if (!orders.length) {
        return (
            <Card className="p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground">No, this token hasn&apos;t paid for any DexScreener promotional services. This means they haven&apos;t invested in marketing features like token profile promotion or community takeover on DexScreener.</p>
            </Card>
        );
    }

    return (
        <Card className="p-4 space-y-4 bg-muted/50">
            <h3 className="text-lg font-medium">Token Orders</h3>
            <div className="space-y-3">
                {orders.map((order, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{order.type}</span>
                                <Badge variant={
                                    order.status === 'approved' ? 'default' :
                                        order.status === 'processing' ? 'secondary' :
                                            order.status === 'rejected' ? 'destructive' :
                                                'outline'
                                }>
                                    {order.status}
                                </Badge>
                            </div>
                            {order.paymentTimestamp > 0 && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Paid at: {new Date(order.paymentTimestamp * 1000).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const TokenProfile = ({ pair }: { pair: DexScreenerPair }) => {
    return (
        <Card className="p-4 space-y-4 bg-muted/50">
            <div className="flex items-center gap-3">
                {pair.info?.imageUrl && (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                        <Image
                            src={pair.info.imageUrl}
                            alt={pair.baseToken.symbol}
                            className="object-cover"
                            fill
                            sizes="48px"
                            onError={(e) => {
                                // @ts-expect-error - Type 'string' is not assignable to type 'never'
                                e.target.src = '/placeholder.png'
                            }}
                        />
                    </div>
                )}
                <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        {pair.baseToken.name}
                        <span className="text-sm text-muted-foreground">
                            ({pair.baseToken.symbol})
                        </span>
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-mono">
                            {pair.baseToken.address.slice(0, 4)}...{pair.baseToken.address.slice(-4)}
                        </span>
                        <a
                            href={pair.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center hover:text-foreground"
                        >
                            View on DexScreener
                            <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-background/50">
                    <div className="text-sm font-medium">Price USD</div>
                    <div className="mt-1 text-2xl font-semibold">
                        ${Number(pair.priceUsd).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    </div>
                </div>
                <div className="p-3 rounded-lg bg-background/50">
                    <div className="text-sm font-medium">Liquidity</div>
                    <div className="mt-1 text-2xl font-semibold">
                        ${pair.liquidity.usd.toLocaleString()}
                    </div>
                </div>
            </div>

            {(pair.info?.websites?.length || pair.info?.socials?.length) && (
                <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-3">Links</h4>
                    <div className="flex flex-wrap gap-2">
                        {pair.info?.websites?.map((website, index) => (
                            <a
                                key={index}
                                href={website.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-2.5 py-1.5 rounded-md bg-background hover:bg-accent text-sm"
                            >
                                Website
                                <ExternalLink className="ml-1.5 h-3 w-3" />
                            </a>
                        ))}
                        {pair.info?.socials?.map((social, index) => (
                            <a
                                key={index}
                                href={`https://${social.platform}.com/${social.handle}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-2.5 py-1.5 rounded-md bg-background hover:bg-accent text-sm capitalize"
                            >
                                {social.platform}
                                <ExternalLink className="ml-1.5 h-3 w-3" />
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
};

export const dexscreenerTools = {
    getTokenOrders: {
        displayName: "🔍 Check Token Orders",
        description: "Check if a token has paid for DexScreener promotional services. Use this to verify if a token has invested in marketing or visibility on DexScreener, which can indicate the team's commitment to marketing and visibility. Returns order types (tokenProfile, communityTakeover, etc.) and their statuses.",
        parameters: z.object({
            chainId: z.string().describe("The blockchain identifier (e.g., 'solana', 'ethereum')"),
            tokenAddress: z.string().describe("The token address to check")
        }),
        execute: async ({ chainId, tokenAddress }: { chainId: string, tokenAddress: string }) => {
            try {
                const response = await fetch(
                    `https://api.dexscreener.com/orders/v1/${chainId}/${tokenAddress}`,
                    {
                        headers: {
                            'Accept': 'application/json'
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(`Failed to fetch token orders: ${response.statusText}`);
                }

                const orders = await response.json() as DexScreenerOrder[];
                return {
                    suppressFollowUp: true,
                    data: orders
                };
            } catch (error) {
                throw new Error(`Failed to get token orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        render: (raw: unknown) => {
            const result = (raw as { data: DexScreenerOrder[] }).data;
            return <OrdersResult orders={result} />;
        }
    },
    getTokenProfile: {
        displayName: "📊 Token Profile",
        description: "Get comprehensive information about a token from DexScreener. Use this when users want to know more about a token, including its price, liquidity, market cap, and social links (Telegram, Twitter, Website). This is particularly useful for due diligence or when users ask about token details, social presence, or market metrics.",
        parameters: z.object({
            mint: z.string().describe("The token's mint/contract address to check")
        }),
        execute: async ({ mint }: { mint: string }) => {
            try {
                const response = await fetch(
                    `https://api.dexscreener.com/latest/dex/tokens/${mint}`,
                    {
                        headers: { 'Accept': 'application/json' }
                    }
                );

                console.log(response)

                if (!response.ok) {
                    throw new Error(`Failed to fetch token profile: ${response.statusText}`);
                }

                const data = await response.json() as DexScreenerPairResponse;

                if (!data.pairs.length) {
                    throw new Error('No pair data found');
                }

                // Use the first pair with the highest liquidity
                const sortedPairs = data.pairs.sort((a, b) => b.liquidity.usd - a.liquidity.usd);
                return {
                    suppressFollowUp: true,
                    data: sortedPairs[0]
                };
            } catch (error) {
                throw new Error(`Failed to get token profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        render: (raw: unknown) => {
            const result = (raw as { data: DexScreenerPair }).data;
            return <TokenProfile pair={result} />;
        }
    }
}
