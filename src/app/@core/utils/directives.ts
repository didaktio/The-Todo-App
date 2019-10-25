import { AfterContentInit, Directive, ElementRef } from '@angular/core';

@Directive({ selector: '[divider]' })
export class DividerNoLineDirective implements AfterContentInit {
    constructor(private el: ElementRef) { }

    ngAfterContentInit() {
        this.el.nativeElement.children.item(0).style.margin = '16px 0px';
    }
}
