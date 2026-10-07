import type { MotionValue } from 'framer-motion'
import type { SceneVariant } from '../components/Scene'

export type DocumentKind = 'planner' | 'funds' | 'estimate' | 'audit' | 'entity' | 'client' | 'opportunities' | 'platform' | 'form'
export type Vector = [number, number, number]
export type SceneMotion = { reduced: boolean; progress: MotionValue<number>; variant: SceneVariant; mobile: boolean }
export type SceneDocument = { kind: DocumentKind; position: Vector; rotation?: Vector; width?: number; height?: number; index?: number; spread?: Vector }
