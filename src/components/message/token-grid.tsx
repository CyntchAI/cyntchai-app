'use client'

import { cn } from "@/lib/utils"
import Image from "next/image"
import { ExternalLink } from "lucide-react"
import { formatNumber } from "@/lib/format"

interface Token {
    address: string
    name: string
    symbol: string
    marketCap: number
    volume24: number
    liquidity: number
    transactions24h: number
    image: string
}

interface TokenGridProps {
    tokens: Token[]
    className?: string
    isLoading?: boolean
}

interface TokenCardProps {
    token: Token
    className?: string
}

function TokenCardSkeleton() {
    return (
        <div className="group relative overflow-hidden rounded-xl bg-muted/40 p-4 animate-pulse">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted" />
                    <div className="space-y-2">
                        <div className="h-5 w-24 bg-muted rounded" />
                        <div className="h-3 w-32 bg-muted rounded" />
                    </div>
                </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-1">
                        <div className="h-3 w-16 bg-muted rounded" />
                        <div className="h-4 w-20 bg-muted rounded" />
                    </div>
                ))}
            </div>
        </div>
    )
}

function TokenCard({ token, className }: TokenCardProps) {
    return (
        <a
            href={`https://dexscreener.com/solana/${token.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "group relative block overflow-hidden rounded-xl bg-background/50",
                "border border-border/50",
                "transition-all duration-300 ease-out",
                "hover:-translate-y-1 hover:border-border/80 hover:bg-muted/20",
                "hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.2)]",
                "active:translate-y-0 active:shadow-none",
                className
            )}
        >
            {/* Token Info */}
            <div className="flex items-center gap-3 p-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                    <Image
                        src={token.image || "/placeholder.png"}
                        alt={token.name}
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        fill
                        sizes="40px"
                    />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-medium">
                            {token.name}
                        </h3>
                        <span className="shrink-0 rounded-full bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {token.symbol}
                        </span>
                    </div>
                    <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-sm font-medium">$0.0234</span>
                        <span className="text-[10px] text-green-500">+12.5%</span>
                    </div>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-px bg-border/50">
                <div className="bg-background/50 p-3">
                    <p className="text-[10px] font-medium text-muted-foreground">Market Cap</p>
                    <p className="mt-0.5 text-sm font-medium">{formatNumber(token.marketCap, "currency")}</p>
                </div>
                <div className="bg-background/50 p-3">
                    <p className="text-[10px] font-medium text-muted-foreground">24h Volume</p>
                    <p className="mt-0.5 text-sm font-medium">{formatNumber(token.volume24, "currency")}</p>
                </div>
            </div>

            {/* Additional Info */}
            <div className="flex items-center justify-between border-t border-border/50 px-3 py-2 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-2">
                    <span>2.4K holders</span>
                    <span className="h-3 w-px bg-border/50" />
                    <span>Listed 2d ago</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="rounded bg-muted/50 px-1.5 py-0.5">
                        {formatNumber(token.transactions24h, "number")} txns
                    </span>
                </div>
            </div>
        </a>
    )
}

export function TokenGrid({ tokens, className, isLoading = false }: TokenGridProps) {
    if (isLoading) {
        return (
            <div className={cn(
                "grid gap-4",
                "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
                className
            )}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <TokenCardSkeleton key={i} />
                ))}
            </div>
        )
    }

    if (!tokens?.length) return null

    return (
        <div className={cn(
            "grid gap-4",
            tokens.length === 1
                ? "grid-cols-1"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
            className
        )}>
            {tokens.map((token) => (
                <TokenCard key={token.address} token={token} />
            ))}
        </div>
    )
} 