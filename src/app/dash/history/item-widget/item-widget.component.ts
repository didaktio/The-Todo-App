import { Component, OnInit, Input } from '@angular/core';

import { TodoItem } from 'src/app/utils/models';
import { formatDateShort } from 'src/app/utils/methods';


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
