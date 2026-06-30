import type { CSSProperties } from 'react';

export type StyleVars = CSSProperties & Record<`--${string}`, string | number>;
