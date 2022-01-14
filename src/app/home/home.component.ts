import {Component, OnInit} from '@angular/core';
import {Course} from "../model/course";
import {interval, noop, Observable, of, timer} from 'rxjs';
import {catchError, delayWhen, map, retryWhen, shareReplay, tap} from 'rxjs/operators';
import { createHTTPObservable } from '../common/util';


@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    beginnerCourses: Course[];
    advancedCourses: Course[];

    constructor() {}

    ngOnInit() {

        // Define HTTP to initiate Backendrequest
        const http$ = createHTTPObservable('/api/courses');
        
        // Get Courses as Observable
        const courses$ = http$.pipe(
        map(response => Object.values(response["payload"]))
        );
        
        courses$.subscribe(
        (courses: Course[]) => {
            this.beginnerCourses = courses.filter((course: Course) => course.category == 'BEGINNER');
            this.advancedCourses = courses.filter((course: Course) => course.category == 'ADVANCED');
        },
        noop, // rxjs noop function - no operation
        () => console.log("completed")
        );
    }

}
