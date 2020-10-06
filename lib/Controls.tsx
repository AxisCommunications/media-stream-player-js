import React, { useState, useRef } from 'react'
import styled from 'styled-components'

import useUserActive from './hooks/useUserActive'

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
  play?: boolean
  src?: string
  parameters: VapixParameters
  onPlay: () => void
  onStop: () => void
  onRefresh: () => void
  onScreenshot: () => void
  format?: Format
  onFormat: (format: Format) => void
  onVapix: (key: string, value: string) => void
  labels?: {
    play?: string
    pause?: string
    stop?: string
    refresh?: string
    screenshot?: string
    settings?: string
  }
  showStatsOverlay: boolean
  toggleStats: () => void
}

export const Controls: React.FC<ControlsProps> = ({
  play,
  src,
  parameters,
  onPlay,
  onStop,
  onRefresh,
  onScreenshot,
  format,
  onFormat,
  onVapix,
  labels,
  showStatsOverlay,
  toggleStats,
}) => {
  const controlArea = useRef(null)
  const userActive = useUserActive(controlArea)

  const [settings, setSettings] = useState(false)

  return (
    <ControlArea ref={controlArea} visible={!play || settings || userActive}>
      <ControlBar>
        <Button onClick={onPlay}>
          {play ? (
            <Pause title={labels?.pause} />
          ) : (
            <Play title={labels?.play} />
          )}
        </Button>
        {src && (
          <Button onClick={onStop}>
            <Stop title={labels?.stop} />
          </Button>
        )}
        {src && (
          <Button onClick={onRefresh}>
            <Refresh title={labels?.refresh} />
          </Button>
        )}
        {src && (
          <Button onClick={onScreenshot}>
            <Screenshot title={labels?.screenshot} />
          </Button>
        )}
        <Progress />
        <Time />
        <Button onClick={() => setSettings(!settings)}>
          <CogWheel title={labels?.settings} />
        </Button>
      </ControlBar>
      {settings && (
        <Settings
          parameters={parameters}
          format={format}
          onFormat={onFormat}
          onVapix={onVapix}
          showStatsOverlay={showStatsOverlay}
          toggleStats={toggleStats}
        />
      )}
    </ControlArea>
  )
}
