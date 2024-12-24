import { INTEGRATIONS } from "../data/integrations"
import { IntegrationCard } from "./integration-card"

export function IntegrationsGrid() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {INTEGRATIONS.map((item, index) => (
                <IntegrationCard
                    key={item.label}
                    item={item}
                    index={index}
                    onClick={() => {
                        // TODO: Implement integration click handler
                        console.log(`Clicked ${item.label}`)
                    }}
                />
            ))}
        </div>
    )
} 