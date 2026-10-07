import type { ComponentType } from 'react'
import type { ToolId } from '@/config/tools'
import { AuditRiskObject } from './AuditRiskObject'
import { EntityObject } from './EntityObject'
import { EstimatedTaxObject } from './EstimatedTaxObject'
import { MutualFundObject, type ToolObjectProps } from './MutualFundObject'
import { PlannerObject } from './PlannerObject'

export interface ToolObjectSpec {
  Component: ComponentType<ToolObjectProps>
  /** Uniform scale so every tool object occupies a similar footprint on a plinth. */
  scale: number
  /** Vertical centre of the object above its base, for camera framing. */
  centerY: number
  /** Plinth radius in object space. */
  plinth: number
  /** Approximate world width at `scale` — used to frame the camera. */
  width: number
  /** Resting animation progress when the object is idle in a group shot. */
  idle: number
  /** Short plate caption. */
  caption: string
}

/** The 3D identity of each tool — what it looks like in the gallery, story and tool header. */
export const TOOL_OBJECTS: Record<ToolId, ToolObjectSpec> = {
  'mutual-fund': { Component: MutualFundObject, scale: 0.95, centerY: 1.35, plinth: 1.5, width: 3, idle: 0.45, caption: 'Mutual Fund' },
  'estimated-tax': { Component: EstimatedTaxObject, scale: 0.72, centerY: 0.95, plinth: 2.6, width: 3.3, idle: 0.85, caption: 'Estimated Tax' },
  'audit-risk': { Component: AuditRiskObject, scale: 0.78, centerY: 1.55, plinth: 1.6, width: 3.2, idle: 0.19, caption: 'Audit Risk' },
  'entity-comparison': { Component: EntityObject, scale: 0.62, centerY: 0.9, plinth: 2.9, width: 4, idle: 0.55, caption: 'Entity Comparison' },
  'tax-planner': { Component: PlannerObject, scale: 0.68, centerY: 1.5, plinth: 2.3, width: 3, idle: 0.8, caption: 'Tax Planner' },
}
