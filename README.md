# RxJS in Practise

## Introduction

### What are Streams?

In Javascript everything is asynchronous

Example:

- Responses from the backend bringing new values.
- Timeouts in the frontend
- User Interaction (CLicks, Mouse-overs..)

As an example you can build the following streams of values:

```javascript
  ngOnInit() {
    // Streams of Events (Pointer Event)
    document.addEventListener('click', (e) => {
      console.log(e);
    })

    // Intervals - Code that is peroidically executed by the runtime. Example: Long Pulling of data.
    let counter = 0;
    setInterval(() => {
      console.log(counter);
      counter++;
    }, 1000);

    // Special type of stream - needs only one value and completes. Similar to a request to the backend.
    setTimeout(() =>{
      console.log("finished..."); // emits once, then it is finished..
    }, 3000);
  }
```

Intervals and Streams of Events are multivalue streams and they are never completed!
When is a stream completed?

### What is RxJS? What Problems does it solve?

Reactive Extensions for Javascript

Combining multiple types of asynchronous events. (Backend response, mouseclicks, timeouts, ...). In "normal" javascript combining streams can result in callback hell:

**BAD**

```javascript
document.addEventListener("click", (e) => {
  console.log(e);
  setTimeout(() => {
    console.log("finished...");
    let counter = 0;
    setInterval(() => {
      console.log(counter);
      counter++;
    }, 1000);
  }, 3000);
});
```

RxJs provides a better way of solving such issues. (Combining multiple streams of values in a maintainable way)

### What is an Observable? A Simple Explanation

A stream of values can be an intervall that emits values over time.

```javascript
// Declaring a RxJS Observable (Observable<Number>)
const interval$ = interval(1000); // interval$ is a definition of a stream of values (like a blueprint for how the stream will behave if we instantiate it.)

interval$.subscribe((val) => console.log("stream 1 " + val)); // An observable will only become a stream if we subscribe to it. Once we subscribe to the observable we have a stream of values.
```

"vals" describes the current value of the stream. In our case its counting from 1 - ~.

The definition of a stream is an observable.

We can also combine multiple streams very easily:

```javascript
// Declaring a RxJS Observable (Observable<Number>)
const interval$ = interval(1000); // interval$ is a definition of a stream of values (like a blueprint for how the stream will behave if we instantiate it.)

interval$.subscribe((val) => console.log("stream 1 " + val)); // An observable will only become a stream if we subscribe to it. Once we subscribe to the observable we have a stream of values.
// "val" describes the values of the stream

interval$.subscribe((val) => console.log("stream 2 " + val));
```

Another Observable Snippet:

```javascript
// Declaring a RxJS Observable (Observable<Number>)
const interval$ = timer(3000, 1000); // interval$ is a definition of a stream of values (like a blueprint for how the stream will behave if we instantiate it.) timer methods wait 3 seconds and emits a value after that.

interval$.subscribe((val) => console.log("stream 1 => " + val)); // wait 3 seconds before emitting the value.

const click$ = fromEvent(document, "click"); // Defines a stream of clicks document=source (could be a specific button).
click$.subscribe((evt) => console.log(evt));
```

Conclusion:
An Observable is a blueprint for a stream. We can derive concrete instances of streams from an observable, by calling subscribe() on it.

### Core RxJS Concepts - Errors, Completions and Subscriptions

More into the subscribe() method:

It has 3 possbile Arguments that you can pass in:

```javascript
  ngOnInit() {

    const interval$ = timer(3000, 1000);

    const sub = interval$.subscribe(
      // 1. Argument = Value Callback: Gives us the values that being emitted by the stream itself.
      val => console.log("stream 1 => " + val),
      // 2. Argument = Error Handler: Some of those streams might go wrong.
      err => console.log(err),
      // 3. Argument = Stream terminates itself (report stream completion)
      () => console.log("completed")
   );

   setTimeout(() => sub.unsubscribe(), 5000); // Unsubscribe (Stop emitting values after 5 seconds)

  }
```

### How Observables work under the hood

Observable vs Promise:

- A Promise gets immediately executed once we define it.
- An Observable only executes once we subscribe to it.

Custom Observable for http stream:

```javascript
  ngOnInit() {
    // The constructor takes in a function that is going to implement the behaviour of our observable.
    // This function takes in a parameter observer. The observer allows us to emit new values, error out or complete the observable.
    const http$ = new Observable(observer => {
      // Browser fetch-API
      fetch('/api/courses')
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

    http$.subscribe(
      courses => console.log(courses),
      noop, // rxjs noop function - no operation
      () => console.log("completed")
    );
  }
```

Why transforming a promise-based fetch-call into an Observable?

--> We can now use all the rxjs operators to easily combine with other streams, like click-handlers, timeouts, ...

## Essential RxJS Operators + Reactive Design

### What are RxJS Operators? Learn the map() Operator.

With map we can get certain values from an observable:

```javascript
  ngOnInit() {
    // The constructor takes in a function that is going to implement the behaviour of our observable.
    // This function takes in a parameter observer. The observer allows us to emit new values, error out or complete the observable.
    const http$ = createHTTPObservable('/api/courses');

    // Whenever we want to derive new Observables from existing Observables we need rxjs operators (like pipe())
    // pipe() function allows us to chain multiple operators in order to produce a new observable.
    const courses$ = http$.pipe(
      map(response => Object.values(response["payload"]))
    );

    courses$.subscribe(
      courses => console.log(courses),
      noop, // rxjs noop function - no operation
      () => console.log("completed")
    );
  }
```

### Building Components - Imperative Design

In the home component we can use the courses Observable to assign their values to local arrays:

```javascript
export class HomeComponent implements OnInit {
  beginnerCourses: Course[];
  advancedCourses: Course[];

  constructor() {}

  ngOnInit() {
    // Define HTTP to initiate Backendrequest
    const http$ = createHTTPObservable("/api/courses");

    // Get Courses as Observable
    const courses$ = http$.pipe(
      map((response) => Object.values(response["payload"]))
    );

    courses$.subscribe(
      (courses: Course[]) => {
        this.beginnerCourses = courses.filter(
          (course: Course) => course.category == "BEGINNER"
        );
        this.advancedCourses = courses.filter(
          (course: Course) => course.category == "ADVANCED"
        );
      },
      noop, // rxjs noop function - no operation
      () => console.log("completed")
    );
  }
}
```

But this is more a imperative design and does not scale well in more complex situations. This also leads to callback hell!

### Building Components - Reactive Design
