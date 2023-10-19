import * as s from "./stream.js"

export function now(): number {
  const perf = typeof typeof window !== 'undefined' && 'performance' in window ? window.performance : null;

  // @ts-ignore
  const perfNow: () => number = perf && (perf.now || perf.webkitNow || perf.msNow || perf.oNow || perf.mozNow)
  const hrTime: () => number = (process && process.hrtime && function () { const t = process.hrtime(); return (t[0] * 1e9 + t[1]) / 1e6; })
  const dateNow = Date.now
  
  return (perfNow || hrTime || dateNow).call(perf);
}


export function animationFrame(): s.Stream<number> {
  let requestAnimFrame: (cb: FrameRequestCallback) => any = (cb) => setTimeout(() => cb(now()), 1000 / 60)
  let cancelAnimFrame: (handle: number) => any = window.clearTimeout;
  if(typeof window === 'undefined') {
    return new s.Stream((sink: any) => {
      const handle = setImmediate(function tick(t) {
        sink.value(t);
        requestAnimFrame(tick);
      });
      return () => clearImmediate(handle);
    });
  }

  if (window.requestAnimationFrame) {
    requestAnimFrame = window.requestAnimationFrame;
    cancelAnimFrame = window.cancelAnimationFrame;
    // @ts-ignore
  } else if (window.mozRequestAnimationFrame) {
    // @ts-ignore
    requestAnimFrame = window.mozRequestAnimationFrame;
    // @ts-ignore
    cancelAnimFrame = window.mozCancelAnimationFrame;
    // @ts-ignore
  } else if (window.webkitRequestAnimationFrame) {
    // @ts-ignore
    requestAnimFrame = window.webkitRequestAnimationFrame;
    // @ts-ignore
    cancelAnimFrame = window.webkitCancelAnimationFrame;
    // @ts-ignore
  } else if (window.msRequestAnimationFrame) {
    // @ts-ignore
    requestAnimFrame = window.msRequestAnimationFrame;
    // @ts-ignore
    cancelAnimFrame = window.msCancelAnimationFrame;
    // @ts-ignore
  } else if (window.oRequestAnimationFrame) {
    // @ts-ignore
    requestAnimFrame = window.oRequestAnimationFrame;
    // @ts-ignore
    cancelAnimFrame = window.oCancelAnimationFrame;
  }
  return new s.Stream((sink: any) => {
    const handle = requestAnimFrame(function tick(t) {
      sink.value(t);
      requestAnimFrame(tick);
    });
    return () => cancelAnimFrame(handle);
  });
}
