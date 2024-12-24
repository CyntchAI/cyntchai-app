import { Copy, ExternalLink } from "lucide-react";
import bs58 from 'bs58';

import { Button } from "@/components/ui/button";

interface Props {
    text: string
    /**
     * Whether to show Solscan link
     */
    showSolscan?: boolean
}

/**
 * Copyable text component with clipboard support and Solscan link
 */
export const CopyableText = ({ text, showSolscan = false }: Props) => {
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    }

    // Validate if it's a valid bs58 address
    const isValidBs58 = (text: string): boolean => {
        try {
            const decoded = bs58.decode(text);
            return decoded.length === 32; // Solana address should be 32 bytes
        } catch {
            return false;
        }
    }

    const isValidBase58 = isValidBs58(text);
    const shouldShowSolscanLink = showSolscan && isValidBase58;

    return (
        <div className="flex items-center gap-2 w-full select-none">
            <div className="flex-1 min-w-0">
                <span className="font-mono text-sm block truncate">{text}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(text)}
                    className="h-6 w-6 hover:bg-sidebar-accent/50"
                >
                    <Copy className="h-3.5 w-3.5" />
                </Button>
                {shouldShowSolscanLink && (
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-6 w-6 hover:bg-sidebar-accent/50"
                    >
                        <a
                            href={`https://solscan.io/account/${text}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                    </Button>
                )}
            </div>
        </div>
    )
}