'use client'

/**
 * In-page tab strip for a nav section.
 *
 * THE CLUTTER PROBLEM THIS SOLVES: the sidebar had twelve flat destinations
 * before this release and four more features were being added. Sixteen items is
 * not a menu, it is a list to be scanned every time. Grouping them into six
 * sections with tabs inside means the sidebar SHRANK while the app grew, and
 * related screens (scan a barcode / scan a label / your avoid list) now sit next
 * to each other where you would look for them.
 *
 * Every old `navigate('<view>')` call site still works untouched — the view id
 * remains the single source of truth and sections are a presentation layer over
 * it.
 */
export default function SectionTabs({ tabs, current, onSelect }) {
  if (!tabs || tabs.length < 2) return null
  return (
    <div className="section-tabs" role="tablist">
      {tabs.map((t) => {
        const Icon = t.icon
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={current === t.id}
            className={current === t.id ? 'on' : ''}
            onClick={() => onSelect(t.id)}
          >
            {Icon && <Icon size={15} />}
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
