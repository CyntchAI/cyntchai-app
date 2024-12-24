import { z } from "zod";
import { formatNumber } from "@/lib/format";
import { searchJupiterTokens, getJupiterTokenPrice, type TokenPrice } from "@/server/actions/jupiter";
import Image from "next/image";

// Types
interface JupiterToken {
    address: string;
    name: string;
    symbol: string;
    logoURI: string | null;
}

function TokenCard({ token }: { token: JupiterToken }) {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-muted/50 p-4">
            <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl">
                    <Image
                        src={token.logoURI || "/placeholder.png"}
                        alt={token.name}
                        className="object-cover"
                        fill
                        sizes="40px"
                        onError={(e) => {
                            // @ts-expect-error - Type 'string' is not assignable to type 'never'
                            e.target.src = 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
                        }}
                    />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="truncate text-base font-medium">
                            {token.name}
                        </h3>
                        <span className="shrink-0 rounded-md bg-background/50 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            {token.symbol}
                        </span>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                        <span className="font-mono">
                            {token.address.slice(0, 4)}...{token.address.slice(-4)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PriceCard({ token, price }: { token: JupiterToken; price: TokenPrice }) {
    const priceValue = parseFloat(price.price);
    const formattedPrice = priceValue < 0.01
        ? priceValue.toExponential(2)
        : formatNumber(priceValue, "number");

    return (
        <div className="relative overflow-hidden rounded-2xl bg-muted/50 p-4">
            <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl">
                    <Image
                        src={token.logoURI || "/placeholder.png"}
                        alt={token.name}
                        className="object-cover"
                        fill
                        sizes="40px"
                        onError={(e) => {
                            // @ts-expect-error - Type 'string' is not assignable to type 'never'
                            e.target.src = 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
                        }}
                    />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="truncate text-base font-medium">
                            {token.name}
                        </h3>
                        <span className="shrink-0 rounded-md bg-background/50 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            {token.symbol}
                        </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                        <span className="text-lg font-semibold">
                            ${formattedPrice}
                        </span>
                        {price.extraInfo?.confidenceLevel && (
                            <span className={
                                price.extraInfo.confidenceLevel === "high" ? "text-xs px-1.5 py-0.5 rounded-md bg-green-500/10 text-green-500" :
                                    price.extraInfo.confidenceLevel === "medium" ? "text-xs px-1.5 py-0.5 rounded-md bg-yellow-500/10 text-yellow-500" :
                                        "text-xs px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-500"
                            }>
                                {price.extraInfo.confidenceLevel}
                            </span>
                        )}
                    </div>
                    {price.extraInfo?.quotedPrice && (
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div>
                                Buy: ${formatNumber(parseFloat(price.extraInfo.quotedPrice.buyPrice), "currency")}
                            </div>
                            <div>
                                Sell: ${formatNumber(parseFloat(price.extraInfo.quotedPrice.sellPrice), "currency")}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export const jupiterTools = {
    searchToken: {
        displayName: "🔍 Search Token",
        description: "Search for any Solana token by name or symbol to get its contract address (mint), along with detailed information like volume and logo. Useful for getting token addresses for further operations.",
        parameters: z.object({
            query: z.string().describe("Token name or symbol to search for"),
        }),
        execute: async ({ query }: { query: string }) => {
            try {
                const tokens = await searchJupiterTokens(query);
                const searchQuery = query.toLowerCase();

                // Search and rank tokens
                const results = tokens
                    .filter(token =>
                        token.name.toLowerCase().includes(searchQuery) ||
                        token.symbol.toLowerCase().includes(searchQuery)
                    )
                    .sort((a, b) => {
                        // Exact matches first
                        const aExact = a.symbol.toLowerCase() === searchQuery || a.name.toLowerCase() === searchQuery;
                        const bExact = b.symbol.toLowerCase() === searchQuery || b.name.toLowerCase() === searchQuery;
                        if (aExact && !bExact) return -1;
                        if (!aExact && bExact) return 1;
                        return 0;
                    })
                    .slice(0, 1);

                return {
                    success: true,
                    data: results
                };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : "Failed to search tokens"
                };
            }
        },
        render: (result: unknown) => {
            const typedResult = result as { success: boolean, data?: JupiterToken[], error?: string };

            if (!typedResult.success) {
                return (
                    <div className="relative overflow-hidden rounded-2xl bg-destructive/5 p-4">
                        <div className="flex items-center gap-3">
                            <p className="text-sm text-destructive">Error: {typedResult.error}</p>
                        </div>
                    </div>
                );
            }

            if (!typedResult.data?.length) {
                return (
                    <div className="relative overflow-hidden rounded-2xl bg-muted/50 p-4">
                        <div className="flex items-center gap-3">
                            <p className="text-sm text-muted-foreground">No tokens found</p>
                        </div>
                    </div>
                );
            }

            return (
                <div className="space-y-2">
                    {typedResult.data.map((token) => (
                        <TokenCard key={token.address} token={token} />
                    ))}
                </div>
            );
        }
    },

    getTokenPrice: {
        displayName: "💰 Get Token Price",
        description: "Get the current price of any Solana token in USDC, including detailed information like buy/sell prices and confidence level.",
        parameters: z.object({
            tokenAddress: z.string().describe("The token's mint address"),
            showExtraInfo: z.boolean().default(true).describe("Whether to show additional price information like buy/sell prices and confidence level"),
        }),
        execute: async ({ tokenAddress, showExtraInfo }: { tokenAddress: string, showExtraInfo: boolean }) => {
            try {
                const token = await searchJupiterTokens(tokenAddress);
                if (!token.length) {
                    return {
                        success: false,
                        error: "Token not found"
                    };
                }

                const price = await getJupiterTokenPrice(tokenAddress, showExtraInfo);
                if (!price) {
                    return {
                        success: false,
                        error: "Price data not available"
                    };
                }

                return {
                    success: true,
                    data: {
                        token: token[0],
                        price
                    }
                };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : "Failed to get token price"
                };
            }
        },
        render: (result: unknown) => {
            const typedResult = result as {
                success: boolean,
                data?: {
                    token: JupiterToken,
                    price: TokenPrice
                },
                error?: string
            };

            if (!typedResult.success) {
                return (
                    <div className="relative overflow-hidden rounded-2xl bg-destructive/5 p-4">
                        <div className="flex items-center gap-3">
                            <p className="text-sm text-destructive">Error: {typedResult.error}</p>
                        </div>
                    </div>
                );
            }

            if (!typedResult.data) {
                return (
                    <div className="relative overflow-hidden rounded-2xl bg-muted/50 p-4">
                        <div className="flex items-center gap-3">
                            <p className="text-sm text-muted-foreground">No price data available</p>
                        </div>
                    </div>
                );
            }

            return <PriceCard token={typedResult.data.token} price={typedResult.data.price} />;
        }
    }
}
