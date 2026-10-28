"use client"

import React from 'react'
import { Select as RadixSelect } from 'radix-ui'
import { Check, ChevronDown } from 'lucide-react'

export type SelectOption = { value: string; label: string }

type SelectProps = {
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  ariaLabel?: string
  triggerClassName?: string
  triggerStyle?: React.CSSProperties
}

export function Select({ value, onValueChange, options, placeholder, ariaLabel, triggerClassName, triggerStyle }: SelectProps) {
  return (
    <RadixSelect.Root value={value || undefined} onValueChange={onValueChange}>
      <RadixSelect.Trigger type="button" aria-label={ariaLabel} className={triggerClassName} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', cursor: 'pointer', ...triggerStyle }}>
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <ChevronDown size={16} color="var(--tp-muted)" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content position="popper" sideOffset={6} className="tp-select-content">
          <RadixSelect.ScrollUpButton className="tp-select-scroll">
            <ChevronDown size={14} style={{ transform: 'rotate(180deg)' }} />
          </RadixSelect.ScrollUpButton>
          <RadixSelect.Viewport className="tp-select-viewport">
            {options.map((opt) => (
              <RadixSelect.Item key={opt.value} value={opt.value} className="tp-select-item">
                <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className="tp-select-indicator">
                  <Check size={14} />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
          <RadixSelect.ScrollDownButton className="tp-select-scroll">
            <ChevronDown size={14} />
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
}
