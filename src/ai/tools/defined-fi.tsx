import { z } from "zod"
import { filterSolanaTokens } from "@/lib/solana/integrations/defined_fi"
import { TokenData } from "@/lib/solana/integrations/defined_fi";
import { TokenGrid } from "@/components/message/token-grid";

type FilterTokensParams = {
    maxVolume24h: number;
    minVolume24h: number;
    maxLiquidity: number;
    minLiquidity: number;
    maxMarketCap: number;
    minMarketCap: number;
    minTransactions24h?: number;
    createdWithinHours: number;
    excludeScams?: boolean;
    sortBy: 'trendingScore24' | 'marketCap' | 'volume24' | 'liquidity' | 'transactions24h';
    sortDirection: 'ASC' | 'DESC';
    limit: number;
    offset?: number;
}

type FilterTokensResponse = {
    data: {
        filterTokens: {
            results: TokenData[];
        };
    };
};

export const definedTools = {
    filterTrendingTokens: {
        displayName: "🔍 Trending Tokens",
        description: 'Filter and search for trending Solana tokens based on various criteria.',
        parameters: z.object({
            maxVolume24h: z.number().default(100000000000).describe('Maximum 24-hour trading volume in USD'),
            minVolume24h: z.number().default(0).describe('Minimum 24-hour trading volume in USD'),
            maxLiquidity: z.number().default(250000000).describe('Maximum liquidity in USD'),
            minLiquidity: z.number().default(0).describe('Minimum liquidity in USD'),
            maxMarketCap: z.number().default(1000000000000).describe('Maximum market cap in USD'),
            minMarketCap: z.number().default(0).describe('Minimum market cap in USD'),
            createdWithinHours: z.number().default(48).describe('Only show tokens created within the last N hours'),
            sortBy: z.enum(['trendingScore24', 'marketCap', 'volume24', 'liquidity', 'transactions24h']).default('trendingScore24').describe('Sort results by this metric'),
            sortDirection: z.enum(['ASC', 'DESC']).default('DESC').describe('Sort direction'),
            limit: z.number().min(1).max(20).default(50).describe('Maximum number of results to return')
        }),
        execute: async ({
            maxVolume24h,
            minVolume24h,
            maxLiquidity,
            minLiquidity,
            maxMarketCap,
            minMarketCap,
            createdWithinHours,
            sortBy,
            sortDirection,
            limit
        }: FilterTokensParams) => {
            const filters: any = {
                potentialScam: false,
                network: [1399811149]
            }

            if (maxVolume24h || minVolume24h) {
                filters.volume24 = {}
                if (maxVolume24h) filters.volume24.lte = maxVolume24h
                if (minVolume24h) filters.volume24.gte = minVolume24h
            }

            if (maxLiquidity || minLiquidity) {
                filters.liquidity = {}
                if (maxLiquidity) filters.liquidity.lte = maxLiquidity
                if (minLiquidity) filters.liquidity.gte = minLiquidity
            }

            if (maxMarketCap || minMarketCap) {
                filters.marketCap = {}
                if (maxMarketCap) filters.marketCap.lte = maxMarketCap
                if (minMarketCap) filters.marketCap.gte = minMarketCap
            }

            if (createdWithinHours) {
                filters.createdAt = {
                    gte: Math.floor(Date.now() / 1000) - (createdWithinHours * 3600)
                }
            }

            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('filterTrendingTokens timeout after 10s')), 10000);
            });

            try {
                const response = await Promise.race([
                    filterSolanaTokens({
                        filters,
                        statsType: "FILTERED",
                        offset: 0,
                        limit: 50,
                        rankings: [
                            {
                                attribute: 'trendingScore24',
                                direction: 'DESC'
                            }
                        ]
                    }),
                    timeoutPromise
                ]) as FilterTokensResponse;

                const tokens = response.data.filterTokens.results
                    .slice(0, limit)
                    .map((token: TokenData) => ({
                        address: token.token.address,
                        name: token.token.name,
                        symbol: token.token.symbol,
                        marketCap: token.marketCap,
                        volume24: token.volume24,
                        liquidity: token.liquidity,
                        transactions24h: token.uniqueTransactions24,
                        trendingScore24: token.uniqueTransactions24,
                        image: token.token.imageThumbUrl
                    }))
                    .sort((a, b) => {
                        const getValue = (obj: any, key: string) => parseFloat(obj[key] || '0');
                        if (sortDirection === 'ASC') {
                            return getValue(a, sortBy) - getValue(b, sortBy);
                        }
                        return getValue(b, sortBy) - getValue(a, sortBy);
                    });

                return {
                    suppressFollowUp: true,
                    data: tokens
                };
            } catch (error) {
                console.error('[filterTrendingTokens] Error:', error);
                return {
                    error: 'EXECUTION_ERROR'
                };
            }
        },
        render: (raw: unknown) => {
            const result = (raw as { data: any }).data;
            return (
                <TokenGrid
                    tokens={Array.isArray(result) ? result : []}
                    className="mt-3"
                    isLoading={!Array.isArray(result)}
                />
            )
        }
    }
}