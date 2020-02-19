import { Component, OnInit, Input } from '@angular/core';

import { TodoItem } from 'utils';
import { formatDateShort } from 'utils';


@Component({
  selector: 'item',
  templateUrl: './item-widget.component.html',
  styleUrls: ['./item-widget.component.scss'],
})
export class ItemWidgetComponent implements OnInit {

  constructor() { }

  @Input() item: TodoItem['history'][number];
  formatDateShort = formatDateShort;

  ngOnInit() {}

}
