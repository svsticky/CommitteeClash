import React from 'react';

/**
 * Type extension for REACT.CSSProperties that allows safe use of custom CSS properties
 *
 * Normally, React.CSSProperties only accepts standard CSS properties, but with this extension,
 * you can safely use custom properties (CSS variables) as well.
 *
 * CSSCustomProperties extends React.CSSProperties with an index signature that matches
 * any key starting with `--`, typed as `string | number`. This enables type-safe inline
 * styles for CSS variables in React components.
 */
export type CSSCustomProperties = React.CSSProperties & {
  [key: `--${string}`]: string | number;
};
