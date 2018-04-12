import * as React from 'react';
import './Layout.css';

import { TChildren } from './types';

const logo = require('../assets/logo.svg');

export function Layout (
    { children }:
    { children: TChildren }
): JSX.Element {
    return (
        <div className="Layout">
            <header>
                <img src={logo} className="Layout-logo" alt="logo"/>
                <h1>Welcome to React</h1>
            </header>
            {children}
        </div>
    );
}

export function InnerLayout ({ leftPanel, children }: { leftPanel: JSX.Element, children: TChildren }): JSX.Element {
    return (
        <div className="InnerLayout">
            <div className="InnerLayout-left">
                {leftPanel}
            </div>
            <div className="InnerLayout-main">
                {children}
            </div>
        </div>
    );
}
