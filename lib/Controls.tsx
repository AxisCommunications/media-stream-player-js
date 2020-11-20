import React, { useState, useRef, useCallback } from 'react'
import styled from 'styled-components'

import { useUserActive } from './hooks/useUserActive'

import { Button } from './components/Button'
import { Format } from './Player'
import { Play, Pause, Stop, Refresh, CogWheel, Screenshot } from './img'
import { Settings } from './Settings'
import { VapixParameters } from './PlaybackArea'

const ControlArea = styled.div<{ readonly visible: boolean }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transition: opacity 0.3s ease-in-out;
`

const ControlBar = styled.div`
  width: 100%;
  height: 32px;
  background: rgb(0, 0, 0, 0.66);
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
`

const Progress = styled.div`
  flex-grow: 2;
`
const Time = styled.div``

interface ControlsProps {
  readonly play?: boolean
  readonly src?: string
  readonly parameters: VapixParameters
  readonly onPlay: () => void
  readonly onStop: () => void
  readonly onRefresh: () => void
  readonly onScreenshot: () => void
  readonly onFormat: (format: Format) => void
  readonly onVapix: (key: string, value: string) => void
  readonly labels?: {
    readonly play?: string
    readonly pause?: string
    readonly stop?: string
    readonly refresh?: string
    readonly screenshot?: string
    readonly settings?: string
  }
  readonly showStatsOverlay: boolean
  readonly toggleStats: () => void
  readonly api: string
}

export const Controls: React.FC<ControlsProps> = ({
  play,
  src,
  parameters,
  onPlay,
  onStop,
  onRefresh,
  onScreenshot,
  onFormat,
  onVapix,
  labels,
  showStatsOverlay,
  toggleStats,
  api,
}) => {
  const controlArea = useRef(null)
  const userActive = useUserActive(controlArea)

  const [settings, setSettings] = useState(false)
  const toggleSettings = useCallback(
    () => setSettings((currentSettings) => !currentSettings),
    [setSettings],
  )

  return (
    <ControlArea
      ref={controlArea}
      visible={play !== true || settings || userActive}
    >
      <ControlBar>
        <Button onClick={onPlay}>
          {play === true ? (
            <Pause title={labels?.pause} />
          ) : (
            <Play title={labels?.play} />
          )}
        </Button>
        {src !== undefined && (
          <Button onClick={onStop}>
            <Stop title={labels?.stop} />
          </Button>
        )}
        {src !== undefined && (
          <Button onClick={onRefresh}>
            <Refresh title={labels?.refresh} />
          </Button>
        )}
        {src !== undefined && (
          <Button onClick={onScreenshot}>
            <Screenshot title={labels?.screenshot} />
          </Button>
        )}
        <Progress />
        <Time />
        <Button onClick={toggleSettings}>
          <CogWheel title={labels?.settings} />
        </Button>
      </ControlBar>
      {settings && (
        <Settings
          parameters={parameters}
          api={api}
          onFormat={onFormat}
          onVapix={onVapix}
          showStatsOverlay={showStatsOverlay}
          toggleStats={toggleStats}
        />
      )}
    </ControlArea>
  )
}
