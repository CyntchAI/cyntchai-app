import { useRef, useEffect } from "react"
import { SendHorizontal } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { BorderBeam } from "@/components/ui/border-beam"

interface ConversationInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => Promise<void>
}

const MAX_CHARS = 2000

export function ConversationInput({ value, onChange, onSubmit }: ConversationInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!value.trim()) return
    await onSubmit(value)
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    if (newValue.length <= MAX_CHARS) {
      onChange(newValue)
      return
    }
    toast.error("Maximum character limit reached")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }, [value])

  return (
    <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative rounded-xl bg-muted">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            maxLength={MAX_CHARS}
            placeholder="Start a new conversation..."
            className="min-h-[110px] w-full px-4 py-3 text-base bg-transparent border-0 focus-visible:ring-0 resize-none overflow-hidden"
          />

          <div className="flex items-center justify-between px-4 py-2 border-t">
            <span className="text-xs text-muted-foreground">
              {value.length}/{MAX_CHARS}
            </span>

            <Button
              type="submit"
              size="icon"
              variant="ghost"
              disabled={!value.trim()}
              className="h-8 w-8 rounded-lg transition-all duration-200 ease-in-out
                hover:bg-primary hover:text-primary-foreground 
                active:scale-95 
                disabled:opacity-50 disabled:cursor-not-allowed
                group relative flex items-center justify-center"
            >
              <SendHorizontal
                className="h-4 w-4 transition-transform duration-200 
                  ease-out group-hover:scale-110"
              />
            </Button>
          </div>
        </form>

        <BorderBeam size={250} duration={8} delay={9} />
      </div>
    </div>
  )
} 