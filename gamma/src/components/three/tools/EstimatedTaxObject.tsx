import { QuarterDocs } from '../models/QuarterDocs'
import type { ToolObjectProps } from './MutualFundObject'

/**
 * Estimated Tax Calculator — four quarterly payment sheets, Q1–Q4, that
 * assemble into an ordered row on a silver rail. Optional per-quarter `lift`
 * raises a sheet when that quarter's payment is larger.
 */
export function EstimatedTaxObject({ progress = 0, lift, ...group }: ToolObjectProps & { lift?: number[] }) {
  return (
    <group {...group}>
      <QuarterDocs assemble={progress} lift={lift} gap={1.08} sheetScale={0.74} />
    </group>
  )
}
