'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils/tailwind-utils'
import { useKeyboardShortcut } from '@/lib/hooks/use-keyboard-shortcut'
import { Button } from '@/components/ui/button'
import { Type } from 'lucide-react'
import { Dropdown } from '@/components/ui/dropdown'

interface EditOverlayProps {
  elementId: string
  initialContent: string
  initialStyles?: {
    fontSize: string
    color: string
  }
  position: { x: number; y: number }
  onSave: (content: string, styles: { color: string; fontSize: string }) => void
  onCancel: () => void
}

interface EditableStyles {
  color: string
  fontSize: string
}

const fontSizes = [
  { label: 'Extra Small', value: 'text-xs' },
  { label: 'Small', value: 'text-sm' },
  { label: 'Base', value: 'text-base' },
  { label: 'Large', value: 'text-lg' },
  { label: 'Extra Large', value: 'text-xl' },
  { label: '2XL', value: 'text-2xl' },
  { label: '3XL', value: 'text-3xl' },
  { label: '4XL', value: 'text-4xl' },
  { label: '5XL', value: 'text-5xl' },
  { label: '6XL', value: 'text-6xl' },
] as const

const colors = [
  { label: 'Default', value: '' },
  { label: 'Black', value: 'text-black dark:text-white' },
  { label: 'Gray', value: 'text-gray-600 dark:text-gray-300' },
  { label: 'Red', value: 'text-red-600 dark:text-red-400' },
  { label: 'Blue', value: 'text-blue-600 dark:text-blue-400' },
  { label: 'Green', value: 'text-green-600 dark:text-green-400' },
  { label: 'Yellow', value: 'text-yellow-600 dark:text-yellow-400' },
  { label: 'Purple', value: 'text-purple-600 dark:text-purple-400' },
  { label: 'Pink', value: 'text-pink-600 dark:text-pink-400' },
] as const

export function EditOverlay({
  elementId,
  initialContent,
  initialStyles,
  position,
  onSave,
  onCancel,
}: EditOverlayProps) {
  const editRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [content, setContent] = useState(initialContent)
  const [styles, setStyles] = useState<EditableStyles>({
    color: initialStyles?.color || '',
    fontSize: initialStyles?.fontSize || 'text-base',
  })

  // Initialize content when component mounts
  useEffect(() => {
    if (editRef.current) {
      editRef.current.innerText = initialContent
      editRef.current.focus()
    }
  }, [initialContent])

  const handleSave = useCallback(() => {
    const updatedStyles = {
      fontSize: styles.fontSize,
      color: styles.color,
    }

    onSave(content, updatedStyles)
  }, [content, styles, onSave])

  // Register keyboard shortcuts
  useKeyboardShortcut('Enter', handleSave, false)
  useKeyboardShortcut('Escape', onCancel, false)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
  }

  const handleBlur = (e: React.FocusEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement
    const isWithinOverlay = overlayRef.current?.contains(relatedTarget)
    const isDropdownMenu = relatedTarget?.closest('[role="menu"]')
    const isDropdownTrigger = relatedTarget?.closest('[role="button"]')

    if (!isWithinOverlay && !isDropdownMenu && !isDropdownTrigger) {
      onCancel()
    }
  }

  const colorOptions = colors.map((color) => ({
    label: color.label,
    value: color.value,
    preview: (
      <div
        className={cn(
          'w-4 h-4 rounded-full bg-current shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]',
          color.value || 'bg-black dark:bg-white'
        )}
      />
    ),
  }))

  const fontSizeOptions = fontSizes.map((size) => ({
    label: size.label,
    value: size.value,
  }))

  return (
    <div
      ref={overlayRef}
      className="edit-overlay-container fixed z-50 bg-white dark:bg-neutral-800 shadow-lg rounded-lg p-4"
      style={{
        top: position.y,
        left: position.x,
        minWidth: '320px',
        maxWidth: '480px',
      }}
    >
      <div className="flex flex-col gap-4 relative">
        {/* Text Editor */}
        <div className="relative">
          <div
            ref={editRef}
            contentEditable
            className="min-h-[1em] outline-none rounded px-3 py-2 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            onInput={(e) => setContent(e.currentTarget.innerText)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            suppressContentEditableWarning
          />
        </div>

        {/* Style Controls */}
        <div className="flex gap-2 items-center">
          {/* Font Color */}
          <Dropdown
            value={styles.color}
            options={colorOptions}
            onChange={(value) => setStyles({ ...styles, color: value })}
            className="w-[100px]"
          />

          {/* Font Size */}
          <Dropdown
            value={styles.fontSize}
            options={fontSizeOptions}
            onChange={(value) => setStyles({ ...styles, fontSize: value })}
            triggerIcon={
              <Type className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
            }
            className="w-[120px]"
          />

          <div className="flex-1" />

          {/* Save Button */}
          <Button
            onClick={handleSave}
            size="sm"
            className="bg-pink-500 hover:bg-pink-600 text-white"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}
