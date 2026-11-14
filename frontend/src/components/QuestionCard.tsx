import type { ReactNode } from 'react'
import { SpeakerIcon } from './SpeakerIcon'
import { TapButton } from './TapButton'

/** The quiz "mystery card" (a "?" back, or the revealed `front`) beside the speaker replay button. */
export function QuestionCard({ front, width, onReplay }: { front: ReactNode | null; width: number; onReplay(): void }) {
  return (
    <div className="row" style={{ gap: 20 }}>
      {front ? (
        <div className="tap pop" style={{ width, height: 170, cursor: 'default' }}>{front}</div>
      ) : (
        <div className="tap card-back" style={{ width, height: 170, cursor: 'default' }}>
          <span className="jua" style={{ fontSize: 60, color: '#fff' }}>?</span>
        </div>
      )}
      <TapButton label="다시 듣기" style={{ width: 96, height: 96 }} onPick={onReplay}>
        <SpeakerIcon />
      </TapButton>
    </div>
  )
}
