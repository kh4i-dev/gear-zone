import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  getClampedInterval,
  shouldAutoSlide,
  buildClonedList,
  getTranslateAmount,
  getInitialVirtualIndex,
  getNextVirtualIndex,
  getPreviousVirtualIndex,
  getVirtualLoopReset,
  getSwipeAction,
  shouldRenderStaticRow,
} from './carouselLogic'

describe('ProductRowCarousel Logic', () => {
  const items10 = Array.from({ length: 10 }, (_, i) => ({ id: `item-${i}`, label: `Item ${i}` }))
  const items12 = Array.from({ length: 12 }, (_, i) => ({ id: `item-${i + 1}`, label: `${i + 1}` }))

  describe('buildClonedList', () => {
    function getKey(item: { id: string }, idx: number) { return item.id }

    it('1. builds cloned list with cloneCount items prepended and appended', () => {
      const result = buildClonedList({ items: items10, cloneCount: 3, getKey, clonePrefix: 'card' })
      // 3 prepended + 10 real + 3 appended = 16
      expect(result.length).toBe(16)
      expect(result[0].key).toContain('item-7')
      expect(result[1].key).toContain('item-8')
      expect(result[2].key).toContain('item-9')
      expect(result[3].key).toBe('item-0')
      expect(result[12].key).toBe('item-9')
      expect(result[13].key).toContain('item-0')
      expect(result[15].key).toContain('item-2')
    })

    it('2. returns original list when cloneCount is 0', () => {
      const result = buildClonedList({ items: items10, cloneCount: 0, getKey, clonePrefix: 'card' })
      expect(result.length).toBe(10)
      expect(result[0].key).toBe('item-0')
    })

    it('3. returns original list when items.length <= cloneCount', () => {
      const fewItems = items10.slice(0, 2)
      const result = buildClonedList({ items: fewItems, cloneCount: 3, getKey, clonePrefix: 'card' })
      expect(result.length).toBe(2)
      expect(result[0].key).toBe('item-0')
    })

    it('4. clone keys are prefixed to avoid React key collisions', () => {
      const result = buildClonedList({ items: items10, cloneCount: 2, getKey, clonePrefix: 'card' })
      const realKeys = result.map(r => r.key)
      const prependKeys = realKeys.filter(k => k.startsWith('card-prepend-'))
      const appendKeys = realKeys.filter(k => k.startsWith('card-append-'))
      expect(prependKeys.length).toBe(2)
      expect(appendKeys.length).toBe(2)
    })
  })

  describe('getTranslateAmount', () => {
    it('5. translate uses the virtual rendered index directly', () => {
      expect(getTranslateAmount(3, 100)).toBe(300)
      expect(getTranslateAmount(8, 100)).toBe(800)
    })

    it('6. initial virtualIndex equals cloneCount when clones are rendered', () => {
      expect(getInitialVirtualIndex({ cloneCount: 4, hasClones: true })).toBe(4)
      expect(getInitialVirtualIndex({ cloneCount: 4, hasClones: false })).toBe(0)
    })
  })

  describe('virtual index movement and loop reset', () => {
    it('7. next moves from the last real item into the appended clone area', () => {
      const totalItems = 12
      const cloneCount = 4
      const lastRealVirtualIndex = totalItems + cloneCount - 1

      expect(getNextVirtualIndex(lastRealVirtualIndex)).toBe(16)
    })

    it('8. transitionEnd after appended clone resets invisibly to cloneCount', () => {
      expect(getVirtualLoopReset({ virtualIndex: 16, totalItems: 12, cloneCount: 4 })).toEqual({
        shouldReset: true,
        virtualIndex: 4,
      })
    })

    it('9. previous moves from the first real item into the prepended clone area', () => {
      expect(getPreviousVirtualIndex(4)).toBe(3)
    })

    it('10. transitionEnd after prepended clone resets invisibly to the last real item', () => {
      expect(getVirtualLoopReset({ virtualIndex: 3, totalItems: 12, cloneCount: 4 })).toEqual({
        shouldReset: true,
        virtualIndex: 15,
      })
    })

    it('11. no clamp forces the carousel to 0 during normal loop travel', () => {
      expect(getVirtualLoopReset({ virtualIndex: 15, totalItems: 12, cloneCount: 4 })).toEqual({
        shouldReset: false,
        virtualIndex: 15,
      })
      expect(getNextVirtualIndex(15)).toBe(16)
    })

    it('12. touch swipe next uses the same virtual-index next action', () => {
      expect(getSwipeAction({ touchStart: 240, touchEnd: 120 })).toBe('next')
    })

    it('13. touch swipe previous uses the same virtual-index previous action', () => {
      expect(getSwipeAction({ touchStart: 120, touchEnd: 240 })).toBe('previous')
    })

    it('14. ignores short touch movement', () => {
      expect(getSwipeAction({ touchStart: 120, touchEnd: 100 })).toBeNull()
    })

    it('15. virtual rendered indices produce the expected seamless visual flow', () => {
      const rendered = buildClonedList({
        items: items12,
        cloneCount: 4,
        getKey: item => item.id,
        clonePrefix: 'card',
      })
      const visibleLabelsAt = (virtualIndex: number) => (
        rendered.slice(virtualIndex, virtualIndex + 4).map(({ item }) => item.label)
      )

      expect(visibleLabelsAt(12)).toEqual(['9', '10', '11', '12'])
      expect(visibleLabelsAt(13)).toEqual(['10', '11', '12', '1'])
      expect(visibleLabelsAt(14)).toEqual(['11', '12', '1', '2'])
      expect(visibleLabelsAt(15)).toEqual(['12', '1', '2', '3'])
      expect(visibleLabelsAt(4)).toEqual(['1', '2', '3', '4'])
    })
  })

  describe('shouldAutoSlide', () => {
    it('16. carousel disables auto-slide when there are not enough products to loop', () => {
      const canAutoSlide = shouldAutoSlide({
        isVisible: true,
        hovered: false,
        reducedMotion: false,
        hasEnoughItems: false,
      })
      expect(canAutoSlide).toBe(false)
    })

    it('17. hidden tab pauses carousel (isVisible = false)', () => {
      expect(shouldAutoSlide({ isVisible: false, hovered: false, reducedMotion: false, hasEnoughItems: true })).toBe(false)
    })

    it('18. hover pauses carousel (hovered = true)', () => {
      expect(shouldAutoSlide({ isVisible: true, hovered: true, reducedMotion: false, hasEnoughItems: true })).toBe(false)
    })

    it('19. reduced motion disables carousel (reducedMotion = true)', () => {
      expect(shouldAutoSlide({ isVisible: true, hovered: false, reducedMotion: true, hasEnoughItems: true })).toBe(false)
    })

    it('20. auto-slide is fully enabled when all conditions satisfied', () => {
      expect(shouldAutoSlide({ isVisible: true, hovered: false, reducedMotion: false, hasEnoughItems: true })).toBe(true)
    })
  })

  describe('static row fallback', () => {
    it('21. renders a static row instead of a transform track when a category has too few products to loop', () => {
      expect(shouldRenderStaticRow({ totalItems: 1, visibleCount: 4 })).toBe(true)
      expect(shouldRenderStaticRow({ totalItems: 4, visibleCount: 4 })).toBe(true)
      expect(shouldRenderStaticRow({ totalItems: 5, visibleCount: 4 })).toBe(false)
      expect(shouldRenderStaticRow({ totalItems: 0, visibleCount: 4 })).toBe(false)
    })
  })

  describe('getClampedInterval', () => {
    it('22. interval clamps between 3000ms and 5000ms', () => {
      expect(getClampedInterval(1500)).toBe(3000)
      expect(getClampedInterval(2999)).toBe(3000)
      expect(getClampedInterval(4000)).toBe(4000)
      expect(getClampedInterval(6000)).toBe(5000)
    })
  })

  describe('ProductRowCarousel source contract', () => {
    it('23. carousel does not use scrollLeft and transform together', () => {
      const source = readFileSync(
        join(process.cwd(), 'src/components/domain/ProductRowCarousel.tsx'),
        'utf8',
      )

      expect(source).toContain('translate3d')
      expect(source).not.toContain('scrollLeft')
      expect(source).not.toContain('scroll-snap')
    })

    it('24. virtualIndex is initialized from cloneCount, not corrected from 0 after paint', () => {
      const source = readFileSync(
        join(process.cwd(), 'src/components/domain/ProductRowCarousel.tsx'),
        'utf8',
      )

      expect(source).toContain('useState(() => initialVirtualIndex)')
      expect(source).not.toContain('const [virtualIndex, setVirtualIndex] = useState(0)')
    })

    it('25. /products category rows pause auto-slide on hover and respect reduced motion defaults', () => {
      const source = readFileSync(
        join(process.cwd(), 'src/components/domain/ProductCategoryCarousel.tsx'),
        'utf8',
      )

      expect(source).toContain('autoSlideInterval={4000}')
      expect(source).not.toContain('pauseOnHover={false}')
      expect(source).not.toContain('respectReducedMotion={false}')
    })

    it('26. handleTransitionEnd filters by propertyName and target to ignore bubbled events from children', () => {
      const source = readFileSync(
        join(process.cwd(), 'src/components/domain/ProductRowCarousel.tsx'),
        'utf8',
      )

      expect(source).toContain('e.propertyName')
      expect(source).toContain(`e.target !== e.currentTarget`)
    })
  })
})
