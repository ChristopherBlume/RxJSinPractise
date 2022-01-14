import { Observable } from "rxjs";

export function createHTTPObservable(url: string): Observable<any> {
    return new Observable(observer => {
      // Browser fetch-API
      fetch(url)
        .then(httpResponseFromBackend => {
          return httpResponseFromBackend.json(); // returns promise containing the httpResponseFromBackend payload
        })
        .then(body => { // JSON Body of the httpResponseFromBackend
          observer.next(body); // used to emit values in the observable 
          observer.complete(); // terminate observable
        })
        .catch(err => {
          observer.error(err);
        }); 
    });
}


