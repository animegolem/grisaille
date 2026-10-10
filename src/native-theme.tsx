import { useState } from 'react';
import { flushSync, type EventPayload, type StyleDesc } from '@gpuix/react';
import type { MusicTheme, SurfaceName, ThemePair } from './theme';
import { useThemePair } from './use-theme';

export function surface(theme: MusicTheme, name: SurfaceName): Pick<StyleDesc, 'background'> {
  const paint = theme.surfaces[name];
  // An unpainted wrapper also lets pointer hits reach its parent.
  return { background: paint === 'transparent' ? undefined : paint };
}
export function inputTheme(pair: ThemePair) {
  return { appearance: 'dark' as const, bg: 'transparent', text: pair.colors.text,
    textMuted: pair.colors.placeholder, textFaint: pair.colors.placeholder, textDim: pair.colors.placeholder,
    accent: pair.colors.accent, caret: pair.colors.caret };
}

type InputProps = {
  testId?: string; value: string; placeholder: string; autoFocus?: boolean; style?: StyleDesc;
  onChange: (event: EventPayload) => void; onSubmit?: (event: EventPayload) => void;
  onFocus?: (event: EventPayload) => void; onBlur?: (event: EventPayload) => void;
};
/**
 * GPUIX 0.7 hardcodes its placeholder gray. Keep its editor/caret/IME and paint
 * only the visible placeholder here. Pre-edit is emitted as the exact value.
 * No composition-end API exists: conservatively latch hiding until blur, so
 * transient empty pre-edit echoes cannot flash a placeholder over marked text.
 */
export function ThemedInput({ testId, value, placeholder, style = {}, onChange, onBlur, ...props }: InputProps) {
  const pair = useThemePair();
  const [hideUntilBlur, setHideUntilBlur] = useState(false);
  const textStyle = { fontFamily: style.fontFamily, fontSize: style.fontSize, lineHeight: style.lineHeight };
  return <div style={{ ...style, position: 'relative', minWidth: 0 }}>
    <input {...props} testId={testId} value={value} placeholder="" theme={inputTheme(pair)}
      onChange={event => flushSync(() => { setHideUntilBlur(true); onChange(event); })}
      onBlur={event => flushSync(() => { setHideUntilBlur(false); onBlur?.(event); })}
      style={{ ...textStyle, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        padding: style.padding, paddingLeft: style.paddingLeft, paddingTop: style.paddingTop,
        minWidth: 0, color: pair.colors.text, selectionColor: pair.colors.textSelection }} />
    {!value && !hideUntilBlur && <text testId={testId ? `${testId}-placeholder` : undefined}
      style={{ ...textStyle, position: 'absolute', top: style.paddingTop ?? style.padding ?? 0,
        left: style.paddingLeft ?? style.padding ?? 0, right: 0, color: pair.colors.placeholder,
        whiteSpace: 'nowrap', textOverflow: 'ellipsis', pointerEvents: 'none', userSelect: 'none' }}>{placeholder}</text>}
  </div>;
}
