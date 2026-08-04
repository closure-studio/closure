import { PAGE_TRANSITION_TIMING } from '@/constants/page-transition';
import { getPageChromeMotionProps, getPageMotionProps } from './page-transition';

describe('page transition motion', () => {
  it('derives the complete transition from two shared phases', () => {
    expect(PAGE_TRANSITION_TIMING.phaseMs).toBe(200);
    expect(PAGE_TRANSITION_TIMING.phase).toBe(`${PAGE_TRANSITION_TIMING.phaseMs}ms`);
    expect(PAGE_TRANSITION_TIMING.totalMs).toBe(PAGE_TRANSITION_TIMING.phaseMs * 2);
    expect(PAGE_TRANSITION_TIMING.total).toBe(`${PAGE_TRANSITION_TIMING.totalMs}ms`);
  });

  it('uses the shared Dashboard motion for page transitions', () => {
    expect(getPageMotionProps(false)).toEqual({
      filter: 'blur(0px)',
      opacity: 1,
      y: 0,
      transition: PAGE_TRANSITION_TIMING.total,
      enterStyle: { filter: 'blur(8px)', opacity: 0, y: 16 },
      exitStyle: { filter: 'blur(8px)', opacity: 0, y: -12 },
    });
  });

  it('moves top and bottom chrome toward their respective edges', () => {
    expect(getPageChromeMotionProps('top', false)).toMatchObject({
      transition: PAGE_TRANSITION_TIMING.phase,
      enterStyle: { opacity: 0, y: -18 },
      exitStyle: { opacity: 0, y: -18 },
    });
    expect(getPageChromeMotionProps('bottom', false)).toMatchObject({
      transition: PAGE_TRANSITION_TIMING.phase,
      enterStyle: { opacity: 0, y: 18 },
      exitStyle: { opacity: 0, y: 18 },
    });
  });

  it('keeps page and chrome content still when reduced motion is enabled', () => {
    expect(getPageMotionProps(true)).toMatchObject({
      transition: '0ms',
      enterStyle: { filter: 'blur(0px)', opacity: 1, y: 0 },
      exitStyle: { filter: 'blur(0px)', opacity: 1, y: 0 },
    });
    expect(getPageChromeMotionProps('top', true)).toMatchObject({
      transition: '0ms',
      enterStyle: { opacity: 1, y: 0 },
      exitStyle: { opacity: 1, y: 0 },
    });
  });
});
