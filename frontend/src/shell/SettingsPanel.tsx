import { useState } from 'react'
import { Button } from '../components/Button'
import { Overlay } from '../components/Overlay'
import { Field } from '../components/form/Field'
import { Segmented } from '../components/form/Segmented'
import { Select } from '../components/form/Select'
import { Slider } from '../components/form/Slider'
import { useEngine } from '../engine/context'
import { AGE_DEF, BASE } from '../settings/defaults'
import type { Settings } from '../settings/types'
import { isIOS, isStandalone, useInstall } from './install'

const TABS = [['age', '나이와 난이도'], ['time', '시간'], ['control', '조작'], ['sound', '소리'], ['rest', '쉬는 시간'], ['app', '앱 설치']] as const
type Tab = (typeof TABS)[number][0]

const H2 = ({ children }: { children: string }) => <h2 className="jua" style={{ margin: 0, fontSize: 32 }}>{children}</h2>

function koVoices(): SpeechSynthesisVoice[] {
  try { return speechSynthesis.getVoices().filter(v => /ko/i.test(v.lang)) } catch { return [] }
}

function InstallPane() {
  const { canInstall, install } = useInstall()
  if (isStandalone()) return <p className="muted">이미 앱으로 실행 중이에요. 인터넷이 없어도 놀 수 있어요.</p>
  if (canInstall) {
    return (
      <>
        <p className="muted">버튼을 누르면 이 기기에 앱으로 설치돼요. 설치하면 홈 화면 아이콘으로 바로 열리고, 인터넷이 없어도 놀 수 있어요.</p>
        <Button primary style={{ maxWidth: 260 }} onClick={() => void install()}>앱으로 설치하기</Button>
      </>
    )
  }
  if (isIOS()) {
    return (
      <>
        <p className="muted">아이폰과 아이패드는 Safari에서 설치해요.</p>
        <ol className="muted" style={{ lineHeight: 1.9 }}>
          <li>Safari로 이 주소를 열어요.</li>
          <li>아래쪽(아이패드는 위쪽) 공유 버튼을 눌러요.</li>
          <li>"홈 화면에 추가"를 눌러요.</li>
        </ol>
      </>
    )
  }
  return <p className="muted">브라우저 메뉴(⋮)에서 "앱 설치" 또는 "홈 화면에 추가"를 누르면 설치돼요.</p>
}

export function SettingsPanel({ settings, roundsPlayed, onSave }: { settings: Settings; roundsPlayed: number; onSave(next: Settings): void }) {
  const engine = useEngine()
  const [draft, setDraft] = useState<Settings>({ ...settings, age: settings.age ?? 3 })
  const [tab, setTab] = useState<Tab>('time')
  const set = (patch: Partial<Settings>) => setDraft(d => ({ ...d, ...patch }))
  const cyc = Math.round(draft.scan * 3 * 10) / 10
  const voices = koVoices()

  // Apply the new settings first: setPreview(null) re-picks the voice from the saved settings.
  const save = () => { onSave(draft); engine.speaker.setPreview(null) }
  const reset = () => { const age = draft.age ?? 3; setDraft({ ...BASE, age, ...AGE_DEF[age] }) }
  const tryVoice = () => {
    engine.speaker.hush()
    engine.speaker.setPreview({ ...settings, ...draft })
    engine.speak('안녕! 나는 몽실이야. 모두 세 마리! 숫자를 찾아 보자.', () => engine.speaker.setPreview(null))
  }

  return (
    <Overlay>
      <div className="sheet" role="dialog" aria-label="보호자 설정">
        <nav className="nav" aria-label="설정 메뉴">
          <p className="jua" style={{ fontSize: 28, margin: '0 0 14px 10px' }}>보호자 설정</p>
          <div id="tabs" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {TABS.map(([id, l]) => (
              <button key={id} type="button" className={'navbtn' + (tab === id ? ' on' : '')} onClick={() => setTab(id)}>{l}</button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <Button onClick={reset}>기본값으로 되돌리기</Button>
          <Button primary onClick={save}>저장하고 게임으로</Button>
        </nav>
        <div className="pane">
          {tab === 'age' && (
            <>
              <H2>나이와 난이도</H2>
              <p className="muted">나이를 바꾸면 시간 설정도 그 나이의 기본값으로 바뀌어요. 게임 난이도는 나이에 따라 자동으로 정해져요.</p>
              <Segmented variant="buttons" value={draft.age} options={[3, 4, 5].map(n => ({ value: n as 3 | 4 | 5, label: n + '세' }))} onChange={n => set({ age: n, ...AGE_DEF[n] })} />
            </>
          )}
          {tab === 'time' && (
            <>
              <H2>시간</H2>
              <p className="muted">아이가 자주 놓치면 늘리고, 지루해하면 줄이세요.</p>
              <div className="box">
                <Field label="스페이스바 깜박임: 카드 한 장에 머무는 시간" value={draft.scan + '초'}><Slider label="스페이스바 깜박임" min={1} max={5} step={0.1} value={draft.scan} onChange={v => set({ scan: v })} /></Field>
                <Field label="미니게임 한 문제 시간 (터치)" value={draft.touchTime + '초'}><Slider label="미니게임 한 문제 시간" min={5} max={30} step={1} value={draft.touchTime} onChange={v => set({ touchTime: v })} /></Field>
                <p className="muted">힌트는 한 문제 시간의 절반이 지나면 나와요. 스페이스바로 할 때는 불빛이 두 바퀴 도는 시간으로 자동 계산해요(카드 3장이면 {cyc * 2}초, 힌트 {cyc}초).</p>
              </div>
            </>
          )}
          {tab === 'control' && (
            <>
              <H2>조작</H2>
              <div className="box">
                <Segmented name="ctl" value={draft.control} options={[{ value: 'both', label: '터치와 스페이스바 둘 다' }, { value: 'touch', label: '터치만' }, { value: 'space', label: '스페이스바만' }]} onChange={v => set({ control: v })} />
              </div>
              <p className="muted">터치만 고르면 깜박임이 꺼져요. 스페이스바만 고르면 화면을 눌러도 반응하지 않아요.</p>
            </>
          )}
          {tab === 'sound' && (
            <>
              <H2>소리</H2>
              <div className="box">
                <Field label="몽실이 목소리 크기" value={draft.voiceVol}><Slider label="몽실이 목소리 크기" min={0} max={100} step={5} value={draft.voiceVol} onChange={v => set({ voiceVol: v })} /></Field>
                <Field label="말 빠르기 (1이 보통)" value={draft.rate}><Slider label="말 빠르기" min={0.5} max={1.3} step={0.05} value={draft.rate} onChange={v => set({ rate: v })} /></Field>
                <Field label="목소리 높이 (1이 보통)" value={draft.pitch}><Slider label="목소리 높이" min={0.6} max={1.8} step={0.1} value={draft.pitch} onChange={v => set({ pitch: v })} /></Field>
                <Field label="문장 사이 쉬는 시간" value={draft.gap + '초'}><Slider label="문장 사이 쉬는 시간" min={0} max={2} step={0.1} value={draft.gap} onChange={v => set({ gap: v })} /></Field>
                <Field label="목소리 종류">
                  <Select label="목소리 종류" value={draft.voiceName} options={[{ value: '', label: '기본 목소리' }, ...voices.map(v => ({ value: v.name, label: v.name }))]} onChange={v => set({ voiceName: v })} />
                  {!voices.length && <p className="muted">이 기기에서 한국어 목소리를 찾지 못했어요.</p>}
                </Field>
                <Button style={{ alignSelf: 'flex-start', padding: '0 22px' }} onClick={tryVoice}>들어보기</Button>
                <Field label="효과음 크기" value={draft.fxVol}><Slider label="효과음 크기" min={0} max={100} step={5} value={draft.fxVol} onChange={v => set({ fxVol: v })} /></Field>
              </div>
              <p className="muted">몽실이 목소리는 지금은 기기에 들어 있는 읽어주기 음성을 써요. 기기에 한국어 음성이 없으면 소리가 나지 않을 수 있어요.</p>
            </>
          )}
          {tab === 'rest' && (
            <>
              <H2>쉬는 시간</H2>
              <div className="box">
                <Field label="몇 판 하면 몽실이가 쉬자고 할까요" value={draft.rounds + '판'}><Slider label="쉬는 판 수" min={1} max={10} step={1} value={draft.rounds} onChange={v => set({ rounds: v })} /></Field>
                <p className="muted">게임 하나를 끝까지 하면 1판이에요. 지금까지 {roundsPlayed}판 했어요.</p>
              </div>
            </>
          )}
          {tab === 'app' && (
            <>
              <H2>앱 설치</H2>
              <div className="box"><InstallPane /></div>
            </>
          )}
        </div>
      </div>
    </Overlay>
  )
}
