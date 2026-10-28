"use client"

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Bot, Briefcase, FileText, HelpCircle, Search, Send, User as UserIcon, X } from 'lucide-react'
import { useUser } from '@/contexts/userContext/userContext'

type ChatMessage = {
  id: number
  role: 'bot' | 'user'
  text: string
  link?: { href: string; label: string }
}

let messageId = 0
const nextId = () => {
  messageId += 1
  return messageId
}

export default function AskTriMergeAI() {
  const { state } = useUser()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'Candidate' | 'Employer'>(state.user?.accountType === 'EMPLOYER' ? 'Employer' : 'Candidate')
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: nextId(), role: 'bot', text: "Hi! I'm TriMerge AI. Ask a question or pick a quick action below to get started." },
  ])
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  const candidateActions = [
    { href: '/browse-jobs', label: 'Find jobs', icon: Search, reply: "Great! You can search and filter every open role here." },
    { href: '/personal-information/step-one', label: 'Resume help', icon: FileText, reply: 'Head here to upload your resume and credentials.' },
  ]

  const employerActions = [
    { href: '/join-now?role=recruiter', label: 'Post jobs', icon: Briefcase, reply: 'Start here to create an employer account and post a position.' },
    { href: 'mailto:careers@trimergeconsulting.com', label: 'Hiring help', icon: HelpCircle, reply: 'Our team can help directly, reach out any time.' },
  ]

  const actions = mode === 'Candidate' ? candidateActions : employerActions

  const respond = (userText: string, botText: string, link?: { href: string; label: string }) => {
    setMessages((current) => [...current, { id: nextId(), role: 'user', text: userText }])
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages((current) => [...current, { id: nextId(), role: 'bot', text: botText, link }])
    }, 600)
  }

  const onQuickAction = (action: (typeof actions)[number]) => {
    respond(action.label, action.reply, { href: action.href, label: action.label })
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    setInput('')
    respond(
      trimmed,
      "Thanks for the message! I'm a preview of TriMerge AI, so I can't fully answer that yet. Try one of the quick actions above, or reach out to our team directly."
    )
  }

  return (
    <div style={{ position: 'fixed', right: '1.5rem', bottom: '1.5rem', zIndex: 500 }}>
      {open && (
        <div className="tp-card tp-fade-up" style={{ width: '21rem', padding: 0, marginBottom: '0.85rem', display: 'grid', gridTemplateRows: 'auto auto 1fr auto auto', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', padding: '1rem 1.1rem', borderBottom: '1px solid rgba(148,163,184,0.16)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <Bot size={18} color="var(--tp-primary)" />
              <span style={{ fontWeight: 800 }}>Ask TriMerge AI</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close Ask TriMerge AI" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--tp-muted)', display: 'grid', placeItems: 'center', padding: '0.2rem' }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.5rem', padding: '0.85rem 1.1rem 0' }}>
            {(['Candidate', 'Employer'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMode(tab)}
                className={mode === tab ? 'tp-btn-primary' : 'tp-btn-secondary'}
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div ref={scrollRef} style={{ display: 'grid', gap: '0.6rem', padding: '0.9rem 1.1rem', maxHeight: '16rem', overflowY: 'auto' }}>
            {messages.map((message) => (
              <div key={message.id} style={{ display: 'flex', flexDirection: 'column', alignItems: message.role === 'user' ? 'flex-end' : 'flex-start', gap: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--tp-muted)', fontSize: '0.72rem', fontWeight: 700 }}>
                  {message.role === 'bot' ? <Bot size={12} /> : <UserIcon size={12} />}
                  {message.role === 'bot' ? 'TriMerge AI' : 'You'}
                </div>
                <div style={{
                  maxWidth: '85%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '14px',
                  fontSize: '0.88rem',
                  lineHeight: 1.5,
                  background: message.role === 'user' ? 'var(--tp-primary)' : 'rgba(29,78,216,0.07)',
                  color: message.role === 'user' ? 'white' : 'var(--tp-ink)',
                }}>
                  {message.text}
                </div>
                {message.link && (
                  <Link href={message.link.href} className="tp-footer-link" style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--tp-primary)' }}>
                    Go to {message.link.label} &rarr;
                  </Link>
                )}
              </div>
            ))}
            {typing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--tp-muted)', fontSize: '0.82rem' }}>
                <Bot size={12} /> TriMerge AI is typing&hellip;
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', padding: '0 1.1rem 0.85rem' }}>
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => onQuickAction(action)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.7rem', borderRadius: '999px', border: '1px solid rgba(29,78,216,0.18)', background: 'rgba(29,78,216,0.06)', color: 'var(--tp-primary)', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  <Icon size={13} />
                  {action.label}
                </button>
              )
            })}
          </div>

          <form onSubmit={onSubmit} style={{ display: 'flex', gap: '0.5rem', padding: '0.85rem 1.1rem', borderTop: '1px solid rgba(148,163,184,0.16)' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              aria-label="Message TriMerge AI"
              style={{ flex: 1, minWidth: 0, padding: '0.65rem 0.85rem', borderRadius: '999px', border: '1px solid rgba(148,163,184,0.24)', outline: 'none', fontSize: '0.88rem' }}
            />
            <button type="submit" disabled={!input.trim()} aria-label="Send message" className="tp-btn-primary" style={{ padding: '0.65rem', borderRadius: '999px', opacity: input.trim() ? 1 : 0.5, cursor: input.trim() ? 'pointer' : 'not-allowed' }}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="tp-btn-primary"
        aria-expanded={open}
        style={{ borderRadius: '999px', padding: '0.9rem 1.25rem' }}
      >
        <Bot size={18} />
        Ask TriMerge AI
      </button>
    </div>
  )
}
