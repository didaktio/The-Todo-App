import { NgModule } from '@angular/core';

import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas, faRecycle, faBell, faUserPlus, faSlidersH, faSignOutAlt, faPlusSquare, faEdit } from '@fortawesome/free-solid-svg-icons';
import { fab, faCcVisa, faCcMastercard, faApplePay } from '@fortawesome/free-brands-svg-icons';


@NgModule({
    declarations: [],
    imports: [
        FontAwesomeModule
    ],
    exports: [
        FontAwesomeModule
    ],
    providers: [
    ],
})
export class FontsModule {
    constructor(library: FaIconLibrary) {
        // library.addIconPacks(fas, fab)
        library.addIcons(
            faRecycle,
            faBell,
            faUserPlus,
            faSlidersH,
            faSignOutAlt,
            faPlusSquare,
            faEdit,
            faCcVisa,
            faCcMastercard,
            faApplePay
        );
    }
}