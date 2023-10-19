/*
 * A stripped down Promise implementation, primarily here for adding
 * the ability to wait for observables to close using a promise chain.
 *
 * We offer no guarantees it'll be Promises/A+ compliant, but it's
 * reasonably close.
 */

 
export type Executor<A> = (resolve: (result: A) => void, reject: (error: Error) => void) => void;

export default class ErxPromise<A, Err = any> extends Promise<A> {
  resolved: boolean;
  failed: boolean;

  value: A;
  error: Err;

  protected _resolve: (result: A) => void;
  protected _reject: (error: Error) => void;
  
  constructor(executor: Executor<A>) {

    const exec: {
      onResolve: ErxPromise<A, Err>['_resolve'],
      onReject: ErxPromise<A, Err>['_reject']
    } = {
      onResolve: () => {},
      onReject: () => {}
    };

    super((resolve, reject) => {


      exec.onResolve = (value: A) => {
        this.resolved = true;
        this.value = value;
        resolve(value);
      }

      exec.onReject = (reason: any) => {
        this.failed = true;
        this.error = reason as Err;
        reject(reason as Err);
      }

      executor(exec.onResolve, exec.onReject)
    });

    this.resolved = false; this.failed = false;
    this._resolve = exec.onResolve; this._reject = exec.onReject;
  }


  static sequence<A>(as: Promise<A>[]): Promise<Array<A>> {
    return new Promise((resolve, reject) => {
      const out = new Array(as.length)
      let done = 0, err = false;
      as.forEach((p, i) => {
        p.then((val) => {
          if (!err) {
            out[i] = val;
            done += 1;
            if (done === as.length) {
              resolve(out);
            }
          }
        }, (error) => {
          err = true;
          reject(error);
        });
      });
    });
  }
}
