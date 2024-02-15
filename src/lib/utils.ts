export function createDeferredPromise<T>(): Promise<T> & {
  resolve: (value: T) => void
  reject: (reason?: any) => void
} {
  let resolve
  let reject

  const promise = new Promise<T>((thisResolve, thisReject) => {
    resolve = thisResolve
    reject = thisReject
  })

  resolve = resolve as unknown as (value: T) => void
  reject = reject as unknown as (reason?: any) => void

  return Object.assign(promise, { resolve, reject })
}
