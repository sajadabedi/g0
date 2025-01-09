'use client'

import { Button } from '@/components/ui/button'
import { useChatStore } from '@/lib/hooks/use-chat'
import { useKeyboardShortcut } from '@/lib/hooks/use-keyboard-shortcut'
import { usePreviewStore } from '@/lib/stores/use-preview-store'
import { useWebsiteVersionStore } from '@/lib/stores/use-website-version-store'
import { EXAMPLE_PROMPTS } from '@/lib/system-prompt'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import * as Tooltip from '@radix-ui/react-tooltip'
import { ArrowUp, History, PanelRightClose, PanelRightOpen, Square } from 'lucide-react'
import { useState } from 'react'
import { LoadingDots } from '../ui/loading-dots'

export function ChatInterface() {
  const [isExpanded, setIsExpanded] = useState(true)
  const { messages, sendMessage, isLoading, removeMessagesAfter, stopGeneration } =
    useChatStore()
  const { versions } = useWebsiteVersionStore()
  const { revertToVersion } = usePreviewStore()
  const [inputValue, setInputValue] = useState('')

  // Toggle chat with Command+/
  useKeyboardShortcut('/', () => setIsExpanded((prev) => !prev))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    setInputValue('')
    await sendMessage(inputValue)
  }

  const handleStop = () => {
    stopGeneration()
  }

  const handleExampleClick = async (prompt: string) => {
    if (isLoading) return

    // Clear any existing input
    setInputValue('')

    try {
      await sendMessage(prompt)
    } catch (error) {
      console.error('Failed to send example message:', error)
    }
  }

  const handleRevertToVersion = async (messageId: string) => {
    const version = versions.find((v) => v.messageId === messageId)
    if (!version) return

    // First revert the preview to update the website state
    revertToVersion(version.id)

    // Then remove messages after this one
    removeMessagesAfter(messageId)
  }

  return (
    <div
      className={`relative border-r dark:border-neutral-800 transition-[width] duration-300 ease-in-out ${
        isExpanded ? 'w-[400px]' : 'w-[50px]'
      }`}
    >
      <Tooltip.Provider delayDuration={400}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-2 group text-black dark:text-white"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <PanelRightOpen size={18} /> : <PanelRightClose size={18} />}
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs text-white shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
              side="right"
              align="center"
              sideOffset={5}
            >
              {isExpanded ? 'Collapse' : 'Expand'} (⌘+/)
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>

      {isExpanded && (
        <div className="h-full flex flex-col pt-12 text-black dark:text-white dark:bg-neutral-900 ">
          <ScrollArea.Root className="flex-1 overflow-hidden">
            <ScrollArea.Viewport className="h-full">
              <div className="pb-4">
                {messages.length === 0 ? (
                  <div className="h-[calc(100vh-12rem)] flex flex-col items-center justify-center p-4 space-y-4">
                    <p className="text-sm text-center text-gray-600 dark:text-neutral-400 w-[80%]">
                      Starter templates to get you started.
                    </p>
                    <div className="w-full max-w-sm justify-center flex flex-wrap gap-2">
                      {EXAMPLE_PROMPTS.map(({ label, prompt }) => (
                        <button
                          key={label}
                          onClick={() => handleExampleClick(prompt)}
                          className="px-3 py-1 text-gray-600 dark:text-neutral-400 text-sm bg-gray-100 dark:bg-neutral-800 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                          disabled={isLoading}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 p-4">
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`group relative p-3 rounded-xl text-gray-800 dark:text-white text-[14px] font-[450] ${
                            msg.role === 'user'
                              ? 'bg-gray-100 dark:bg-neutral-800 max-w-[80%]'
                              : 'bg-transparent'
                          }`}
                        >
                          {msg.content === 'Creating your website...' ||
                          msg.content === 'Modifying your website...' ? (
                            <LoadingDots />
                          ) : (
                            msg.content
                          )}
                          {msg.role === 'user' &&
                            versions.some((v) => v.messageId === msg.id) && (
                              <button
                                onClick={() => handleRevertToVersion(msg.id!)}
                                className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Revert to this version"
                              >
                                <History className="w-4 h-4" />
                              </button>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
              className="flex select-none touch-none p-0.5 bg-gray-100 dark:bg-neutral-800 transition-colors duration-150 ease-out hover:bg-muted/20 data-[orientation=vertical]:w-2 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2"
              orientation="vertical"
            >
              <ScrollArea.Thumb className="flex-1 bg-gray-50 dark:bg-neutral-800 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>

          <div className="border-t dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900">
            <form onSubmit={handleSubmit} className="p-3">
              <div className="relative flex items-center">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Describe your website..."
                  className="w-full px-3 font-[450] py-2 text-sm rounded-md bg-transparent caret-pink-500 text-black dark:text-white focus:outline-none"
                  disabled={isLoading}
                />
                <Tooltip.Provider delayDuration={400}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        type={isLoading ? 'button' : 'submit'}
                        onClick={isLoading ? handleStop : undefined}
                        className="absolute right-0 group text-black dark:text-white hover:bg-transparent"
                        disabled={!inputValue.trim() && !isLoading}
                      >
                        {isLoading ? (
                          <Square className="h-4 w-4 fill-current" />
                        ) : (
                          <div className="h-5 w-5 group-disabled:opacity-0 flex items-center justify-center rounded-full bg-black dark:bg-white">
                            <ArrowUp className="h-3 w-3 text-white dark:text-black" />
                          </div>
                        )}
                      </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs text-white dark:text-black shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                        side="top"
                        align="center"
                        sideOffset={5}
                      >
                        {isLoading ? 'Stop generating' : 'Send message'}
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
