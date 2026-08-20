'use client'
import { HelpCircle } from 'lucide-react'

/**
 * The product score chip.
 *
 * Extracted from five byte-identical copies (AddFoodModal, Companies, Dashboard,
 * Explore, ProductDetail) so the UNRATED case has exactly one implementation.
 * That matters: a null score used to render as an empty chip with tone "poor",
 * because `null >= 75` is false and `null >= 50` is false — so a product we
 * simply have no data for looked like a product we had judged badly.
 *
 * An unrated product now says so, and looks visibly different from a verdict.
 */
export default function ScoreBadge({ score, grade, large = false }) {
  if (score == null || !grade) {
    return (
      <div
        className={`score-badge unrated ${large ? 'large' : ''}`}
        title="Not enough published label data to score this pack"
      >
        <strong><HelpCircle size={large ? 22 : 15} /></strong>
        <span>no data</span>
      </div>
    )
  }
  const tone = score >= 75 ? 'good' : score >= 50 ? 'fair' : 'poor'
  return (
    <div className={`score-badge ${tone} ${large ? 'large' : ''}`}>
      <strong>{grade}</strong>
      <span>{score}</span>
    </div>
  )
}
