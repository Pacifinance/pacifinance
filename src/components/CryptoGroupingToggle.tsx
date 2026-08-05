import styled from 'styled-components';
import type { CryptoGroupingMode } from '../hooks/useCryptoGroupingPref';

interface CryptoGroupingToggleProps {
  theme: Record<string, unknown>;
  mode: CryptoGroupingMode;
  onChange: (mode: CryptoGroupingMode) => void;
  separateLabel: string;
  combinedLabel: string;
  explanation: string;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.8rem;
  color: ${(p) => p.theme.textColor};
`;

const Controls = styled.div`
  display: inline-flex;
  align-self: flex-start;
  padding: 3px;
  border: 1px solid ${(p) => p.theme.mode === 'dark' ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.12)'};
  border-radius: 10px;
  background: ${(p) => p.theme.mode === 'dark' ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.03)'};

  button {
    border: 0;
    border-radius: 7px;
    padding: 0.45rem 0.7rem;
    background: transparent;
    color: ${(p) => p.theme.textColor};
    font-size: 0.72rem;
    font-weight: 700;
    cursor: pointer;
  }

  button[aria-pressed='true'] {
    background: ${(p) => p.theme.buttonBackgroundColor};
    color: white;
  }
`;

const Explanation = styled.p`
  margin: 0;
  max-width: 680px;
  font-size: 0.7rem;
  line-height: 1.45;
  opacity: 0.65;
`;

export default function CryptoGroupingToggle({
  theme, mode, onChange, separateLabel, combinedLabel, explanation,
}: CryptoGroupingToggleProps) {
  return (
    <Wrapper theme={theme}>
      <Controls theme={theme} role="group">
        <button type="button" aria-pressed={mode === 'separate'} onClick={() => onChange('separate')} data-umami-event="crypto-view-separate">
          {separateLabel}
        </button>
        <button type="button" aria-pressed={mode === 'combined'} onClick={() => onChange('combined')} data-umami-event="crypto-view-combined">
          {combinedLabel}
        </button>
      </Controls>
      <Explanation>{explanation}</Explanation>
    </Wrapper>
  );
}
