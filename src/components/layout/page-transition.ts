import { PAGE_TRANSITION_TIMING } from '@/constants/page-transition';

const STILL_TRANSITION = '0ms';

const pageRestingStyle = { filter: 'blur(0px)', opacity: 1, y: 0 } as const;
const pageEnterStyle = { filter: 'blur(8px)', opacity: 0, y: 16 } as const;
const pageExitStyle = { filter: 'blur(8px)', opacity: 0, y: -12 } as const;

const chromeRestingStyle = { opacity: 1, y: 0 } as const;
const chromeHiddenOffsetByEdge = { bottom: 18, top: -18 } as const;

export type PageChromeEdge = keyof typeof chromeHiddenOffsetByEdge;

export function getPageMotionProps(reducedMotion: boolean) {
  return {
    ...pageRestingStyle,
    transition: reducedMotion ? STILL_TRANSITION : PAGE_TRANSITION_TIMING.total,
    enterStyle: reducedMotion ? pageRestingStyle : pageEnterStyle,
    exitStyle: reducedMotion ? pageRestingStyle : pageExitStyle,
  } as const;
}

export function getPageChromeMotionProps(edge: PageChromeEdge, reducedMotion: boolean) {
  const hiddenStyle = { opacity: 0, y: chromeHiddenOffsetByEdge[edge] } as const;

  return {
    ...chromeRestingStyle,
    transition: reducedMotion ? STILL_TRANSITION : PAGE_TRANSITION_TIMING.phase,
    enterStyle: reducedMotion ? chromeRestingStyle : hiddenStyle,
    exitStyle: reducedMotion ? chromeRestingStyle : hiddenStyle,
  } as const;
}
