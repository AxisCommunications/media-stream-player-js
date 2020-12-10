import React, { useState, useRef, useCallback, useContext } from 'react'
import styled from 'styled-components'

import { useUserActive } from './hooks/useUserActive'

import { Button } from './components/Button'
import { Play, Pause, Stop, Refresh, CogWheel, Screenshot } from './img'
import { Settings } from './Settings'
import { Format } from './utils'
import { VideoPlayerContext } from './VideoPlayerProvider'

export const ControlArea = styled.div<{ readonly visible: boolean }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transition: opacity 0.3s ease-in-out;
`

export const ControlBar = styled.div`
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

const VolumeContainer = styled.div`
  margin-left: 8px;
`

interface ControlsProps {
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
    readonly volume?: string
  }
  readonly showStatsOverlay: boolean
  readonly toggleStats: () => void
}

export const Controls: React.FC<ControlsProps> = ({
  onPlay,
  onStop,
  onRefresh,
  onScreenshot,
  onFormat,
  onVapix,
  labels,
  showStatsOverlay,
  toggleStats,
}) => {
  const { play, host, parameters, api, volume, setVolume } = useContext(
    VideoPlayerContext,
  )
  const controlArea = useRef(null)
  const userActive = useUserActive(controlArea)

  const [settings, setSettings] = useState(false)
  const toggleSettings = useCallback(
    () => setSettings((currentSettings) => !currentSettings),
    [setSettings],
  )

  const onVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (setVolume !== undefined) {
        setVolume(parseFloat(e.target.value))
      }
    },
    [setVolume],
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
        {host !== undefined && (
          <Button onClick={onStop}>
            <Stop title={labels?.stop} />
          </Button>
        )}
        {host !== undefined && (
          <Button onClick={onRefresh}>
            <Refresh title={labels?.refresh} />
          </Button>
        )}
        {host !== undefined && (
          <Button onClick={onScreenshot}>
            <Screenshot title={labels?.screenshot} />
          </Button>
        )}
        {volume !== undefined ? (
          <VolumeContainer title={labels?.volume}>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              onChange={onVolumeChange}
              value={volume ?? 0}
            />
          </VolumeContainer>
        ) : null}
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
