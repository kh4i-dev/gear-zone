export function getClampedInterval(interval: number): number {
  return Math.max(3000, Math.min(5000, interval))
}

export function shouldAutoSlide({
  isVisible,
  hovered,
  reducedMotion,
  hasEnoughItems,
}: {
  isVisible: boolean
  hovered: boolean
  reducedMotion: boolean
  hasEnoughItems: boolean
}): boolean {
  return isVisible && !hovered && !reducedMotion && hasEnoughItems
}

export function shouldRenderStaticRow({
  totalItems,
  visibleCount,
}: {
  totalItems: number
  visibleCount: number
}): boolean {
  return totalItems > 0 && totalItems <= visibleCount
}

export interface ClonedListInput<T> {
  items: T[]
  cloneCount: number
  getKey: (item: T, idx: number) => string
  clonePrefix: string
}

export interface ClonedItem<T> {
  item: T
  key: string
}

export function buildClonedList<T>(input: ClonedListInput<T>): ClonedItem<T>[] {
  const { items, cloneCount, getKey, clonePrefix } = input
  if (cloneCount === 0 || items.length <= cloneCount) {
    return items.map((item, idx) => ({ item, key: getKey(item, idx) }))
  }

  const prepended: ClonedItem<T>[] = items.slice(-cloneCount).map((item, idx) => ({
    item,
    key: `${clonePrefix}-prepend-${getKey(item, idx)}`,
  }))

  const appended: ClonedItem<T>[] = items.slice(0, cloneCount).map((item, idx) => ({
    item,
    key: `${clonePrefix}-append-${getKey(item, idx)}`,
  }))

  const real: ClonedItem<T>[] = items.map((item, idx) => ({
    item,
    key: getKey(item, idx),
  }))

  return [...prepended, ...real, ...appended]
}

export function getInitialVirtualIndex({
  cloneCount,
  hasClones,
}: {
  cloneCount: number
  hasClones: boolean
}): number {
  return hasClones ? cloneCount : 0
}

export function getNextVirtualIndex(virtualIndex: number): number {
  return virtualIndex + 1
}

export function getPreviousVirtualIndex(virtualIndex: number): number {
  return virtualIndex - 1
}

export function getTranslateAmount(virtualIndex: number, itemWidth: number): number {
  return virtualIndex * itemWidth
}

export interface VirtualLoopResetInput {
  virtualIndex: number
  totalItems: number
  cloneCount: number
}

export interface VirtualLoopReset {
  shouldReset: boolean
  virtualIndex: number
}

export function getVirtualLoopReset({
  virtualIndex,
  totalItems,
  cloneCount,
}: VirtualLoopResetInput): VirtualLoopReset {
  if (totalItems === 0 || cloneCount === 0) {
    return { shouldReset: false, virtualIndex }
  }

  if (virtualIndex >= totalItems + cloneCount) {
    return { shouldReset: true, virtualIndex: cloneCount }
  }

  if (virtualIndex < cloneCount) {
    return { shouldReset: true, virtualIndex: totalItems + cloneCount - 1 }
  }

  return { shouldReset: false, virtualIndex }
}

export type SwipeAction = 'next' | 'previous'

export function getSwipeAction({
  touchStart,
  touchEnd,
  threshold = 50,
}: {
  touchStart: number | null
  touchEnd: number | null
  threshold?: number
}): SwipeAction | null {
  if (touchStart == null || touchEnd == null) return null

  const distance = touchStart - touchEnd
  if (distance > threshold) return 'next'
  if (distance < -threshold) return 'previous'

  return null
}
