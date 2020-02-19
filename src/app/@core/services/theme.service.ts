import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import * as Color from 'color';
import { AuthService } from './auth.service';
import { TodoUser } from 'utils';
import { DbService } from './db.service';


@Injectable({ providedIn: 'root' })
export class ThemeService {

    themes = THEMES;
    activeTheme: Theme;

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private auth: AuthService,
        private db: DbService) {

        this.auth.user$.subscribe(user => {
            if (user) {
                this.applyCSS(user.settings.css);
                this.activeTheme = user.settings.theme;
            }
        });
    }

    setTheme(theme: Theme) {
        if(theme) this.updateDb(genCSSText(theme), theme);
    }

    setThemeWithCSS(css: string) {
        this.updateDb(css);
    }

    private updateDb(css: string, theme: Theme | '' = '') {
        return this.db.updateDb({
            settings: {
                css,
                theme
            }
        } as TodoUser);
    }

    private applyCSS(css: string) {
        this.document.documentElement.style.cssText = css;
    }

    useDefault() {
        this.setThemeWithCSS('');
    }
}

const getColorContrast = (color, ratio = 0.8) => {
    const c = Color(color);
    return (c.isDark() ? c.lighten(ratio) : c.darken(ratio)).hex();
}

const toRGBString = (color) => Color(color).rgb().array().toString();

const DEFAULTS = {
    primary: '#3880ff',
    secondary: '#0cd1e8',
    tertiary: '#7044ff',
    dark: '#222428',
    medium: '#989aa2',
    light: '#f4f5f8',
    success: '#10dc60',
    warning: '#ffce00',
    danger: '#f04141',
    background: 'white',
    text: 'black',
    border: '#d9d9d9'
}

const THEMES = {
    light: DEFAULTS,
    dark: {
        ...DEFAULTS,
        background: getColorContrast(DEFAULTS.background),
        text: getColorContrast(DEFAULTS.background, 0),
        border: getColorContrast(DEFAULTS.border, 0.2),
        dark: getColorContrast(DEFAULTS.background, 0)
    },
    grey: {
        ...DEFAULTS,
        background: getColorContrast(DEFAULTS.background, 0.6),
        text: getColorContrast(DEFAULTS.background, 0.1),
        border: getColorContrast(DEFAULTS.border, 0.3)
    },
    sepia: {
        ...DEFAULTS,
        background: '#ffefcc',
        text: 'black',
        border: getColorContrast(DEFAULTS.border, 0.5)
    }

};

export type Theme = keyof typeof THEMES;

const genCSSText = (theme: Theme) => {

    const {
        primary,
        secondary,
        tertiary,
        dark,
        medium,
        light,
        success,
        danger,
        warning,
        background,
        text,
        border,
    } = THEMES[theme];

    const ratioShade = 0.1;
    const ratioTint = 0.1;

    return `
    --ion-background-color: ${background};
    --ion-text-color: ${text};
    --ion-border-color: ${border}
  
    --ion-color-primary: ${primary};
    --ion-color-primary-rgb: ${toRGBString(primary)};
    --ion-color-primary-contrast: ${getColorContrast(primary)};
    --ion-color-primary-contrast-rgb: ${toRGBString(primary)};
    --ion-color-primary-shade:  ${Color(primary).darken(ratioShade)};
    --ion-color-primary-tint:  ${Color(primary).lighten(ratioTint)};

    --ion-color-secondary: ${secondary};
    --ion-color-secondary-rgb: ${toRGBString(secondary)};
    --ion-color-secondary-contrast: ${getColorContrast(secondary)};
    --ion-color-secondary-contrast-rgb: ${toRGBString(secondary)};
    --ion-color-secondary-shade:  ${Color(secondary).darken(ratioShade)};
    --ion-color-secondary-tint: ${Color(secondary).lighten(ratioTint)};

    --ion-color-tertiary:  ${tertiary};
    --ion-color-tertiary-rgb: ${toRGBString(tertiary)};
    --ion-color-tertiary-contrast: ${getColorContrast(tertiary)};
    --ion-color-tertiary-contrast-rgb: ${toRGBString(tertiary)};
    --ion-color-tertiary-shade: ${Color(tertiary).darken(ratioShade)};
    --ion-color-tertiary-tint:  ${Color(tertiary).lighten(ratioTint)};

    --ion-color-dark: ${dark};
    --ion-color-dark-rgb: ${toRGBString(dark)};
    --ion-color-dark-contrast: ${getColorContrast(dark)};
    --ion-color-dark-contrast-rgb: ${toRGBString(dark)};
    --ion-color-dark-shade: ${Color(dark).darken(ratioShade)};
    --ion-color-dark-tint: ${Color(dark).lighten(ratioTint)};
    
    --ion-color-medium: ${medium};
    --ion-color-medium-rgb: ${toRGBString(medium)};
    --ion-color-medium-contrast: ${getColorContrast(medium)};
    --ion-color-medium-contrast-rgb: ${toRGBString(medium)};
    --ion-color-medium-shade: ${Color(medium).darken(ratioShade)};
    --ion-color-medium-tint: ${Color(medium).lighten(ratioTint)};
    
    --ion-color-light: ${light};
    --ion-color-light-rgb: ${toRGBString(light)};
    --ion-color-light-contrast: $${getColorContrast(light)};
    --ion-color-light-contrast-rgb: ${toRGBString(light)};
    --ion-color-light-shade: ${Color(light).darken(ratioShade)};
    --ion-color-light-tint: ${Color(light).lighten(ratioTint)};

    --ion-color-success: ${success};
    --ion-color-success-rgb: ${toRGBString(success)};
    --ion-color-success-contrast: ${getColorContrast(success)};
    --ion-color-success-contrast-rgb: ${toRGBString(success)};
    --ion-color-success-shade: ${Color(success).darken(ratioShade)};
    --ion-color-success-tint: ${Color(success).lighten(ratioTint)};

    --ion-color-warning: ${warning};
    --ion-color-warning-rgb: ${toRGBString(warning)};
    --ion-color-warning-contrast: ${getColorContrast(warning)};
    --ion-color-warning-contrast-rgb: ${toRGBString(warning)};
    --ion-color-warning-shade: ${Color(warning).darken(ratioShade)};
    --ion-color-warning-tint: ${Color(warning).lighten(ratioTint)};

    --ion-color-danger: ${danger};
    --ion-color-danger-rgb: ${toRGBString(danger)};
    --ion-color-danger-contrast: ${getColorContrast(danger)};
    --ion-color-danger-contrast-rgb: ${toRGBString(danger)};
    --ion-color-danger-shade: ${Color(danger).darken(ratioShade)};
    --ion-color-danger-tint: ${Color(danger).lighten(ratioTint)};
    `;


}
