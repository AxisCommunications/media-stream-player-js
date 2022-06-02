import React, { useState, useCallback, useEffect, useRef } from 'react'
import { DateTime, Duration } from 'luxon'
import styled from 'styled-components'
import { VideoProperties } from './PlaybackArea'

function isHTMLMediaElement(el: HTMLElement): el is HTMLMediaElement {
  return (el as HTMLMediaElement).buffered !== undefined
}

const ProgressWrapper = styled.div`
  flex-grow: 2;
  padding: 0 32px;
  display: flex;
  align-items: center;
`

const ProgressBarContainer = styled.div`
  margin: 0;
  width: 100%;
  height: 24px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const ProgressBar = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  height: 1px;
  position: relative;
  width: 100%;

  ${ProgressBarContainer}:hover > & {
    height: 3px;
  }
`

const ProgressBarPlayed = styled.div.attrs<{ readonly fraction: number }>(
  ({ fraction }) => {
    return {
      style: { transform: `scaleX(${fraction})` },
    }
  },
)<{ readonly fraction: number }>`
  background-color: rgb(240, 180, 0);
  height: 100%;
  position: absolute;
  top: 0;
  transform: scaleX(0);
  transform-origin: 0 0;
  width: 100%;
`

const ProgressBarBuffered = styled(ProgressBarPlayed).attrs<{
  readonly fraction: number
}>(({ fraction }) => {
  return {
    style: { transform: `scaleX(${fraction})` },
  }
})<{ readonly fraction: number }>`
  background-color: rgba(255, 255, 255, 0.2);
`

const ProgressTimestamp = styled.div.attrs<{ readonly left: number }>(
  ({ left }) => {
    return {
      style: { left: `${left}px` },
    }
  },
)<{ readonly left: number }>`
  background-color: rgb(56, 55, 51);
  border-radius: 3px;
  bottom: 200%;
  color: #fff;
  font-size: 9px;
  padding: 5px;
  position: absolute;
  text-align: center;
`

const ProgressIndicator = styled.div`
  color: rgb(240, 180, 0);
  padding-left: 24px;
  font-size: 10px;
  white-space: nowrap;
`

interface ProgressProps {
  readonly videoProperties?: VideoProperties
  readonly startTime?: string // 2021-02-03T12:21:57.465715Z
  readonly duration?: number
  readonly onSeek: (offset: number) => void
}

/**
 * Progress
 *
 * Compute progress of played and buffered amounts of media. This includes any
 * media before the actual start of the video.
 *
 * The range on videoProperties specifies where we started to play (meaning,
 * the time corresponding to currentTime = 0), and where the playback stops.
 * To avoid having to collect extra data about the actual media length, we
 * treat the end of the range as the end of the actual media (i.e. a simple
 * way to establish the duration).
 *
 * Example:
 *  - range = [0, undefined] => start from the beginning, unknown end
 *  - range = [8, 19] => start from 8s into the media, stop at 19s in which
 *    case currentTime = 0 is actually 8s. In this case the media is actually
 *    25s long, but we cannot display that in our progress. So this system
 *    only works correctly when playing back from any starting point till the
 *    end of the media (i.e. no "chunks" within).
 *
 *    media        0 ------------------------------------------------- 25s
 *    range                     8s ----------------------------- 19s
 *    currentTime               0s ----------------------------- 11s
 *    progress     0 ------------------------------------------- 19s
 *
 *  So we treat the start of the range as offset for total progress, and the
 *  end of the range as total duration. That means we do not handle situations
 *  where the duration is longer than the end of the range.
 *
 * When computing progress, if the duration is Infinity (live playback), we
 * use the total buffered time as a (temporary) duration.
 */
export const Progress: React.FC<ProgressProps> = ({
  videoProperties,
  startTime,
  duration,
  onSeek,
}) => {
  const [progress, setProgress] = useState({
    playedFraction: 0,
    bufferedFraction: 0,
    counter: '',
  })

  const [totalDuration, setTotalDuration] = useState(duration)
  const __mediaTimeline = useRef({
    startDateTime:
      startTime !== undefined ? DateTime.fromISO(startTime) : undefined,
  })

  useEffect(() => {
    if (videoProperties === undefined) {
      return
    }
    const { el, pipeline, range } = videoProperties
    if (el === null || pipeline === undefined) {
      return
    }

    // Extract range and update duration accordingly.
    const [start = 0, end = duration] = range ?? [0, duration]
    const __duration = duration ?? end ?? Infinity
    setTotalDuration(__duration)

    const updateProgress = () => {
      const played = start + pipeline.currentTime
      const buffered =
        isHTMLMediaElement(el) && el.buffered.length > 0
          ? start + el.buffered.end(el.buffered.length - 1)
          : played
      const total = __duration === Infinity ? buffered : __duration

      const counter = `${Duration.fromMillis(played * 1000).toFormat(
        'h:mm:ss',
      )} / ${Duration.fromMillis(total * 1000).toFormat('h:mm:ss')}`
      setProgress({
        playedFraction: played / total,
        bufferedFraction: buffered / total,
        counter,
      })
    }
    updateProgress()

    // Use progress events on media elements
    if (isHTMLMediaElement(el)) {
      el.addEventListener('ended', updateProgress)
      el.addEventListener('progress', updateProgress)
      el.addEventListener('timeupdate', updateProgress)
      return () => {
        el.removeEventListener('timeupdate', updateProgress)
        el.removeEventListener('progress', updateProgress)
        el.removeEventListener('ended', updateProgress)
      }
    }

    // Use polling when not a media element
    const progressInterval = setInterval(updateProgress, 1000)
    return () => {
      clearInterval(progressInterval)
    }
  }, [videoProperties, duration, startTime, setTotalDuration])

  const seek = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (totalDuration === undefined) {
        return
      }

      const { left, width } = e.currentTarget.getBoundingClientRect()
      const fraction = (e.pageX - left) / width

      onSeek(fraction * totalDuration)
    },
    [totalDuration, onSeek],
  )

  const [timestamp, setTimestamp] = useState({ left: 0, label: '' })
  const __progressBarContainerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (startTime !== undefined) {
      __mediaTimeline.current.startDateTime = DateTime.fromISO(startTime)
    }

    const el = __progressBarContainerRef.current
    if (el === null || totalDuration === undefined) {
      return
    }

    const { left, width } = el.getBoundingClientRect()
    const showTimestamp = (e: Event) => {
      const offset = (e as PointerEvent).pageX - left
      const offsetMillis = (offset / width) * totalDuration * 1000

      setTimestamp({
        left: offset,
        label:
          __mediaTimeline.current.startDateTime !== undefined
            ? __mediaTimeline.current.startDateTime
                .plus(offsetMillis)
                .toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)
            : Duration.fromMillis(offsetMillis).toFormat('h:mm:ss'),
      })
    }

    const start = () => {
      el.addEventListener('pointermove', showTimestamp)
    }
    const stop = () => {
      setTimestamp({ left: 0, label: '' })
      el.removeEventListener('pointermove', showTimestamp)
    }

    el.addEventListener('pointerover', start)
    el.addEventListener('pointerout', stop)
    return () => {
      el.removeEventListener('pointerout', stop)
      el.removeEventListener('pointerover', start)
    }
  }, [startTime, totalDuration])

  return (
    <ProgressWrapper>
      <ProgressBarContainer onClick={seek} ref={__progressBarContainerRef}>
        <ProgressBar>
          <ProgressBarPlayed fraction={progress.playedFraction} />
          <ProgressBarBuffered fraction={progress.bufferedFraction} />
          {timestamp.left !== 0 ? (
            <ProgressTimestamp left={timestamp.left}>
              {timestamp.label}
            </ProgressTimestamp>
          ) : null}
        </ProgressBar>
      </ProgressBarContainer>
      <ProgressIndicator>
        {totalDuration === Infinity ? '∙ LIVE' : progress.counter}
      </ProgressIndicator>
    </ProgressWrapper>
  )
}
