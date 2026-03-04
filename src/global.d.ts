import type * as ReactTypes from 'react';

declare global {
    namespace React {
        type ComponentType<P = {}> = ReactTypes.ComponentType<P>;
        type ReactNode = ReactTypes.ReactNode;
    }
}
