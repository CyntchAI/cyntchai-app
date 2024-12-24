import Image from "next/image"
import { motion } from "framer-motion"
import type { Integration } from "../data/integrations"

interface IntegrationCardProps {
    item: Integration
    index: number
    onClick?: () => void
}

interface IntegrationCardStyles extends React.CSSProperties {
    '--integration-primary': string
    '--integration-secondary': string
}

export function IntegrationCard({ item, index, onClick }: IntegrationCardProps) {
    return (
        <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{
                scale: 1.01,
                transition: { duration: 0.2 }
            }}
            whileTap={{
                scale: 0.99,
                transition: { duration: 0.1 }
            }}
            onClick={onClick}
            className="group relative flex w-full items-center gap-3 rounded-xl bg-muted p-4 
        transition-all duration-200 overflow-hidden"
            style={{
                '--integration-primary': item.theme.primary,
                '--integration-secondary': item.theme.secondary,
            } as IntegrationCardStyles}
        >
            <motion.div
                initial={false}
                whileHover={{
                    scale: 1.05,
                    transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden flex items-center justify-center z-10"
                style={{
                    background: `linear-gradient(135deg, ${item.theme.primary}15, ${item.theme.secondary}10)`,
                }}
            >
                <Image
                    src={item.icon}
                    alt={item.label}
                    width={24}
                    height={24}
                    className="z-10 group-hover:scale-105 transition-transform duration-300"
                />
            </motion.div>

            <div className="flex-1 text-left space-y-0.5 z-10">
                <motion.div
                    className="font-medium text-sm transition-colors duration-300"
                    initial={false}
                >
                    {item.label}
                </motion.div>
                {item.description && (
                    <motion.div
                        className="text-xs text-muted-foreground/70 line-clamp-1"
                        initial={false}
                    >
                        {item.description}
                    </motion.div>
                )}
            </div>

            {/* Theme color overlay on hover */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    background: `linear-gradient(135deg, ${item.theme.primary}10, ${item.theme.secondary}05)`,
                }}
            />
        </motion.button>
    )
} 