import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fromEvent, noop, Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { createHTTPObservable } from '../common/util';

@Component({
  selector: 'about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor() {}

  ngOnInit() {}
}
  

