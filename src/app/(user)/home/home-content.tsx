"use client"

import { useState, useMemo, useEffect } from "react"
import BlurFade from "@/components/ui/blur-fade"
import TypingAnimation from "@/components/ui/typing-animation"
import { SuggestionCard } from "./suggestion-card"
import { getRandomSuggestions } from "./data/suggestions"
import { IntegrationsGrid } from "./components/integrations-grid"
import { ConversationInput } from "./conversation-input"
import { useChat } from 'ai/react'
import { v4 as uuidv4 } from "uuid"
import ChatInterface from "@/app/(user)/chat/[id]/chat-interface"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Loader2, ExternalLink } from "lucide-react"
import { RiTwitterXFill } from "@remixicon/react"
import Link from "next/link"
import { SolanaUtils } from "@/lib/solana"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { checkEAPTransaction } from "@/server/actions/eap"

const EAP_PRICE = 0.5
const RECEIVE_WALLET_ADDRESS = process.env.NEXT_PUBLIC_EAP_RECEIVE_WALLET_ADDRESS!

const EAP_BENEFITS = [
    "Support platform growth",
    "Early access to features",
    "Unlimited AI interactions",
    "Join early governance and decisions",
];

interface SectionTitleProps {
    children: React.ReactNode
}

function SectionTitle({ children }: SectionTitleProps) {
    return (
        <h2 className="text-sm font-medium text-muted-foreground/80 mb-2 px-1">
            {children}
        </h2>
    )
}

export function HomeContent() {
    const suggestions = useMemo(() => getRandomSuggestions(4), [])
    const [showChat, setShowChat] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const chatId = useMemo(() => uuidv4(), [])
    const { user, isLoading } = useUser()
    const [verifyingTx, setVerifyingTx] = useState<string | null>(null)
    const [verificationAttempts, setVerificationAttempts] = useState(0)
    const MAX_VERIFICATION_ATTEMPTS = 20 // 20 attempts * 3s = 60s total

    const { messages, input, handleSubmit, setInput } = useChat({
        id: chatId,
        initialMessages: [],
        body: { id: chatId },
        onFinish: () => {
            window.history.replaceState({}, "", `/chat/${chatId}`)
        },
    });

    // Verification effect
    useEffect(() => {
        if (!verifyingTx) return

        const verify = async () => {
            try {
                const response = await checkEAPTransaction({ txHash: verifyingTx })
                if (response?.data?.success) {
                    toast.success("EAP Purchase Successful", {
                        description: "Your Early Access Program purchase has been verified. Please refresh the page."
                    })
                    setVerifyingTx(null)
                    return
                }

                // Continue verification if not reached max attempts
                if (verificationAttempts < MAX_VERIFICATION_ATTEMPTS) {
                    setVerificationAttempts(prev => prev + 1)
                } else {
                    // Max attempts reached, show manual verification message
                    toast.error("Verification Timeout", {
                        description: "Please visit the FAQ page to manually verify your transaction."
                    })
                    setVerifyingTx(null)
                }
            } catch (error) {
                console.error("Verification error:", error)
                // Continue verification if not reached max attempts
                if (verificationAttempts < MAX_VERIFICATION_ATTEMPTS) {
                    setVerificationAttempts(prev => prev + 1)
                }
            }
        }

        const timer = setTimeout(verify, 3000)
        return () => clearTimeout(timer)
    }, [verifyingTx, verificationAttempts])

    const handleSend = async (value: string) => {
        if (!value.trim()) return

        if (!user?.earlyAccess) {
            return
        }

        setShowChat(true)

        const fakeEvent = new Event('submit') as any
        fakeEvent.preventDefault = () => { }

        await handleSubmit(fakeEvent, { data: { content: value } })
    }

    const handlePurchase = async () => {
        if (!user) return
        setIsProcessing(true)
        setVerificationAttempts(0)

        try {
            const tx = await SolanaUtils.sendTransferWithMemo({
                to: RECEIVE_WALLET_ADDRESS,
                amount: EAP_PRICE,
                memo: `{
                    "type": "EAP_PURCHASE",
                    "user_id": "${user.id}"
                }`
            })

            if (tx) {
                setVerifyingTx(tx)
                toast.success("Transaction Sent", {
                    description: "Transaction has been sent. Verifying your purchase..."
                })
            } else {
                toast.error("Transaction Failed", {
                    description: "Failed to send the transaction. Please try again."
                })
            }
        } catch (error) {
            console.error("Transaction error:", error)

            let errorMessage = "Failed to send the transaction. Please try again."

            if (error instanceof Error) {
                const errorString = error.toString()
                if (errorString.includes('TransactionExpiredBlockheightExceededError')) {
                    toast.error("Transaction Timeout", {
                        description: <>
                            <span className="font-semibold">Transaction might have been sent successfully.</span>
                            <br />
                            If SOL was deducted from your wallet, please visit the FAQ page and input your transaction hash for manual verification.
                        </>
                    })
                    return
                }
                errorMessage = error.message
            }

            toast.error("Transaction Failed", {
                description: errorMessage
            })
        } finally {
            setIsProcessing(false)
        }
    }

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (showChat) {
        return (
            <ChatInterface id={chatId} initialMessages={messages} />
        )
    }

    const hasEAP = user?.earlyAccess === true

    const mainContent = (
        <div className={cn(
            "flex-1 flex flex-col items-center justify-center px-6 max-w-6xl mx-auto w-full",
            !hasEAP ? "h-screen py-0" : "py-12"
        )}>
            <BlurFade delay={0.2}>
                <TypingAnimation
                    className="text-4xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 mb-12"
                    duration={50}
                    text="How can I assist you?"
                />
            </BlurFade>

            <div className="w-full max-w-3xl mx-auto space-y-8">
                <BlurFade delay={0.1}>
                    <ConversationInput
                        value={input}
                        onChange={setInput}
                        onSubmit={handleSend}
                    />
                </BlurFade>

                {hasEAP && (
                    <div className="space-y-8">
                        <BlurFade delay={0.2}>
                            <div className="space-y-2">
                                <SectionTitle>Suggestions</SectionTitle>
                                <div className="grid grid-cols-2 gap-4">
                                    {suggestions.map((suggestion, index) => (
                                        <SuggestionCard
                                            key={suggestion.title}
                                            {...suggestion}
                                            delay={0.3 + index * 0.1}
                                            onSelect={setInput}
                                        />
                                    ))}
                                </div>
                            </div>
                        </BlurFade>

                        <BlurFade delay={0.4}>
                            <div className="space-y-2">
                                <SectionTitle>Integrations</SectionTitle>
                                <IntegrationsGrid />
                            </div>
                        </BlurFade>
                    </div>
                )}
            </div>
        </div>
    )

    if (!hasEAP) {
        return (
            <div className="relative w-full h-screen overflow-hidden">
                <div className="absolute inset-0 backdrop-blur-md bg-background/30 z-10" />
                {mainContent}
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                    <div className="w-full max-w-xl mx-auto px-6">
                        <Card className="relative overflow-hidden border-white/[0.1] bg-white/[0.02] dark:bg-black/[0.02] backdrop-blur-sm backdrop-saturate-150 p-8">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-white/[0.02] dark:from-white/[0.02] dark:to-white/[0.01] pointer-events-none" />
                            <div className="relative space-y-6">
                                <div className="space-y-2 text-center">
                                    <h2 className="text-2xl font-semibold">Early Access Program</h2>
                                    <div className="text-muted-foreground">
                                        We&apos;re currently limiting <Badge>BETA</Badge> access to a limited number of users to ensure a stable service and while keep refining features.
                                    </div>
                                </div>

                                <Card className="border-teal-500/10 bg-white/[0.01] dark:bg-black/[0.01] backdrop-blur-sm p-6">
                                    <h3 className="font-semibold mb-4">EAP Benefits</h3>
                                    <div className="space-y-3">
                                        {EAP_BENEFITS.map((benefit, index) => (
                                            <div key={index} className="flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 mt-1 text-teal-500" />
                                                <span className="text-sm">{benefit}</span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>

                                <div className="bg-white/[0.01] dark:bg-black/[0.01] backdrop-blur-sm rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">Payment</span>
                                        <span className="text-lg font-semibold">{EAP_PRICE} SOL</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Funds will be allocated to cover expenses such as LLM  integration, RPC data services, infrastructure maintenance, and other operational costs, all aimed at ensuring the platform&apos;s stability and reliability.
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <Link
                                        href="https://x.com/neur_sh"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center"
                                    >
                                        <RiTwitterXFill className="w-4 h-4 mr-2" />
                                        Follow Updates
                                    </Link>
                                    <Button
                                        onClick={handlePurchase}
                                        disabled={isProcessing}
                                        className="bg-teal-500/70 hover:bg-teal-500/90 dark:bg-teal-500/60 dark:hover:bg-teal-500/80 ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing
                                            </>
                                        ) : (
                                            `Join EAP (${EAP_PRICE} SOL)`
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            {mainContent}

            <Dialog open={!!verifyingTx} onOpenChange={() => setVerifyingTx(null)}>
                <DialogContent className="sm:max-w-md">
                    <div className="space-y-4">
                        <div className="space-y-2 text-center">
                            <h2 className="text-lg font-semibold">Verifying Purchase</h2>
                            <p className="text-sm text-muted-foreground">
                                Please wait while we verify your EAP purchase.
                            </p>
                        </div>

                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>

                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center justify-between gap-2">
                                <span>Transaction Hash:</span>
                                <code className="text-xs">{verifyingTx}</code>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span>Verification Attempts:</span>
                                <span>{verificationAttempts} / {MAX_VERIFICATION_ATTEMPTS}</span>
                            </div>
                        </div>

                        <div className="flex justify-between gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => window.open(`https://solscan.io/tx/${verifyingTx}`, '_blank')}
                            >
                                View on Solscan
                                <ExternalLink className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => setVerifyingTx(null)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
} 