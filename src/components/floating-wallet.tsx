'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Wallet, ChevronDown, ExternalLink, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'
import { WalletPortfolio as Portfolio } from '@/types/helius/portfolio'
import { motion, AnimatePresence } from 'framer-motion'

interface FloatingWalletProps {
    data: Portfolio
    className?: string
    isLoading?: boolean
}

export function FloatingWallet({ data, className, isLoading = false }: FloatingWalletProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [imagesLoaded, setImagesLoaded] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Preload all token images
        if (data.tokens.length > 0) {
            Promise.all(
                data.tokens.map((token) => {
                    if (!token.imageUrl) return Promise.resolve()
                    return new Promise((resolve) => {
                        const img = new Image()
                        img.src = token.imageUrl
                        img.onload = resolve
                        img.onerror = resolve
                    })
                })
            ).then(() => setImagesLoaded(true))
        } else {
            setImagesLoaded(true)
        }
    }, [data.tokens])

    if (!mounted || !imagesLoaded) return null

    return (
        <div
            className={cn(
                'absolute right-4 bottom-full mb-1 z-50',
                className
            )}
        >
            <motion.div
                layout
                animate={{
                    width: isExpanded ? 300 : 'auto'
                }}
                transition={{
                    type: "spring",
                    bounce: 0,
                    duration: 0.3,
                    stiffness: 500,
                    damping: 40
                }}
                className="relative will-change-transform"
            >
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 340 }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{
                                height: {
                                    type: "spring",
                                    bounce: 0,
                                    duration: 0.3,
                                    stiffness: 500,
                                    damping: 40
                                },
                                opacity: {
                                    duration: 0.15
                                }
                            }}
                            className="absolute bottom-full left-0 right-0 mb-1 overflow-hidden rounded-2xl bg-muted will-change-transform"
                        >
                            <div className="h-[340px] flex flex-col">
                                <div className="p-3 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-[10px] font-medium">
                                            <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                                                <TrendingUp className="h-3 w-3 shrink-0" />
                                                <span>{data.tokens.length}</span>
                                            </div>
                                            <div className="text-muted-foreground">
                                                {formatNumber(data.totalBalance, 'currency')}
                                            </div>
                                        </div>
                                        <a
                                            href={`https://solscan.io/account/${data.address}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary"
                                        >
                                            <span className="truncate max-w-[120px]">
                                                {data.address.slice(0, 4)}...{data.address.slice(-4)}
                                            </span>
                                            <ExternalLink className="h-3 w-3 shrink-0" />
                                        </a>
                                    </div>
                                </div>

                                <ScrollArea className="flex-1 -mx-3 px-3">
                                    <div className="space-y-px">
                                        {data.tokens.map((token, index) => (
                                            <motion.a
                                                key={index}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                    transition: {
                                                        type: "spring",
                                                        bounce: 0,
                                                        duration: 0.2,
                                                        delay: index * 0.01
                                                    }
                                                }}
                                                href={`https://solscan.io/account/${data.address}#portfolio`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group block rounded-xl transition-colors duration-150 ease-out hover:bg-background/80"
                                            >
                                                <div className="flex items-center justify-between p-2">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <Avatar className="h-8 w-8 rounded-lg bg-background shrink-0">
                                                            <AvatarImage
                                                                src={token.imageUrl}
                                                                alt={token.name}
                                                                className="object-cover transition-transform duration-150 group-hover:scale-105"
                                                            />
                                                            <AvatarFallback className="rounded-lg text-xs">
                                                                {token.symbol.slice(0, 2)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="truncate text-sm font-medium text-foreground">{token.name}</div>
                                                                <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                                                    {token.symbol}
                                                                </span>
                                                            </div>
                                                            <div className="mt-0.5 text-xs text-muted-foreground">
                                                                {token.balance.toLocaleString(undefined, {
                                                                    maximumFractionDigits: 4
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                                                        <div className="text-sm font-medium text-foreground">
                                                            {formatNumber(token.balance * token.pricePerToken, 'currency')}
                                                        </div>
                                                        {token.pricePerToken > 0 && (
                                                            <div className="text-[10px] text-muted-foreground">
                                                                @ {token.pricePerToken.toFixed(4)} $
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.a>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    layout
                    className="flex items-center gap-1.5 rounded-2xl bg-muted px-3 py-2 cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <Wallet className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className={cn("min-w-0", isExpanded && "flex-1")}>
                        <AnimatePresence mode="wait">
                            {isExpanded ? (
                                <motion.span
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ type: "spring", bounce: 0.2 }}
                                    className="block text-sm text-muted-foreground"
                                >
                                    Embedded Wallet
                                </motion.span>
                            ) : (
                                <motion.span
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 4 }}
                                    transition={{ type: "spring", bounce: 0.2 }}
                                    className="block text-sm text-muted-foreground"
                                >
                                    {formatNumber(data.totalBalance, 'currency')}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ type: "spring", bounce: 0.2 }}
                        className="h-4 w-4 text-muted-foreground shrink-0"
                    >
                        <ChevronDown className="h-3.5 w-3.5" />
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    )
} 