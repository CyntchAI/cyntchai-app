'use client'

import { useState } from "react"
import { DefaultToolResultRenderer, getToolConfig } from "@/ai/providers"
import * as Collapsible from "@radix-ui/react-collapsible"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToolResultProps {
    toolName: string
    result: unknown
    expanded?: boolean
    header: React.ReactNode
}

export function ToolResult({ toolName, result, expanded, header }: ToolResultProps) {
    const config = getToolConfig(toolName)!
    const isCollapsible = config.isCollapsible === true
    const [isOpen, setIsOpen] = useState(expanded ?? !isCollapsible)

    const content = config.render ? config.render(result) : DefaultToolResultRenderer({ result })
    if (!content) return null

    const headerContent = (
        <div className="flex items-center w-full gap-2">
            {header}
            {isCollapsible && (
                <ChevronDown
                    className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-200 ml-auto",
                        isOpen && "transform rotate-180"
                    )}
                />
            )}
        </div>
    )

    if (!isCollapsible) {
        return (
            <div className="w-full">
                <div className="w-full px-3 py-2 bg-muted/40 rounded-lg">
                    {headerContent}
                </div>
                <div className="mt-2 px-4">
                    {content}
                </div>
            </div>
        )
    }

    return (
        <Collapsible.Root
            open={isOpen}
            onOpenChange={setIsOpen}
            className="w-full"
        >
            <Collapsible.Trigger className="w-full">
                <div className="w-full px-3 py-2 bg-muted/40 hover:bg-muted/60 transition-colors rounded-lg cursor-pointer">
                    {headerContent}
                </div>
            </Collapsible.Trigger>

            <Collapsible.Content>
                <div className="mt-2 px-4">
                    {content}
                </div>
            </Collapsible.Content>
        </Collapsible.Root>
    )
}