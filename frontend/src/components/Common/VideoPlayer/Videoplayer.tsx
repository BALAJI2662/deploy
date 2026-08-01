import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { SetStateAction, useCallback, useEffect, useRef, useState } from 'react'
import ReactPlayer from 'react-player/lazy'

export default function Videoplayer({ width = "100%", height = "100%", videoUrl, thumbnail }: { videoUrl: string, thumbnail?: string, width?: string, height?: string }) {
    const [playing, setPlaying] = useState(false)
    // const [volume, setVolume] = useState(0.5)
    const [muted, setMuted] = useState(false)
    const [seeking, setSeeking] = useState(false)
    const [played, setPlayed] = useState<number>(0)
    const [isFullScreen, setIsFullScreen] = useState(false)
    const [showControles, setShowControles] = useState(true)
    const [showThumbnail, setShowThumbnail] = useState(thumbnail ? true : false)

    const playerRef = useRef<ReactPlayer | null>(null);
    const PlayerContainerRef = useRef<HTMLInputElement>(null)
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const HandlePlaying = () => {
        setPlaying(!playing)
        setShowThumbnail(false)
    }

    useEffect(()=>{
        const handleKeyDown = (event: { code: string; preventDefault: () => void }) => {
            if (event.code === 'Space') {
              event.preventDefault();
              HandlePlaying()
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => {
          document.removeEventListener('keydown', handleKeyDown);
        };
    },[])

    const HandleOnProgress = (state: { played: SetStateAction<number> }) => {
        if (!seeking) {
            setPlayed(state.played)
        }
    }

    const handleRewind = () => {
        playerRef.current?.seekTo(playerRef.current.getCurrentTime() - 5)
    }

    const handleForward = () => {
        playerRef.current?.seekTo(playerRef.current.getCurrentTime() + 5)
    }

    const handleMute = () => {
        setMuted(!muted)
    }

    const handleSeekChange = (event: number[]) => {
        setPlayed(event[0])
        setSeeking(true)
    }

    const handleSeekMouseUp = () => {
        setSeeking(false)
        playerRef.current?.seekTo(played)
    }

    const pad = (string: number) => {
        return ("0" + string).slice(-2)
    }

    const formatTime = (seconds: number) => {
        const date = new Date(seconds * 1000)
        const hh = date.getUTCHours()
        const mm = date.getUTCMinutes()
        const ss = date.getUTCSeconds()

        if (hh) {
            return `${hh} : ${pad(mm)} : ${ss}`
        }
        else {
            return `${mm} : ${ss}`
        }
    }

    const handleFullScreen = useCallback(() => {
        if (!isFullScreen) {
            if (PlayerContainerRef.current?.requestFullscreen) {
                PlayerContainerRef.current.requestFullscreen()
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen()
            }
        }
    }, [isFullScreen])

    useEffect(() => {
        const handleFullScreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        }
        document.addEventListener("fullscreenchange", handleFullScreenChange)
        return () => {
            document.removeEventListener("fullscreenchange", handleFullScreenChange)
        }
    }, [])

    const HandleShowControles = () => {
        setShowControles(true)
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current)
        }
        controlsTimeoutRef.current = setTimeout(() => setShowControles(false), 3000)
    }
    
    return (
        <div className={`relative border transition-all duration-400 ease-in-out overflow-hidden rounded-lg
            ${isFullScreen} ? "w-screen h-screen" : ""`}
            style={{ width, height }}
            ref={PlayerContainerRef}
            onMouseMove={HandleShowControles}
            onMouseLeave={() => setShowControles(false)}
        >
            <ReactPlayer
                ref={playerRef}
                url={videoUrl}
                playing={playing}
                muted={muted}
                // volume={volume}
                width={'100%'}
                height={'100%'}
                light={showThumbnail && thumbnail ? <img className='w-full h-full' src={thumbnail} alt="thumbnail" /> : ''}
                className="rounded-lg absolute top-0 left-0"
                onProgress={HandleOnProgress}
            />
            {
                showControles &&
                <div className={`absolute bottom-0 left-0 right-0 bg-black/70 p-4 transition-opacity duration-300 
                    ${showControles ? "opacity-100" : "opacity-0"}`}
                >
                    <Slider
                        className='w-full bg-black mb-4 cursor-pointer'
                        value={[played * 100]}
                        max={100}
                        step={0.1}
                        onValueChange={(value) => handleSeekChange([value[0] / 100])}
                        onValueCommit={handleSeekMouseUp}
                    />
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-2 max-sm:space-x-0'>
                            <Button variant="ghost" size='icon' onClick={HandlePlaying} className='text-white'>
                                {
                                    playing ? <i className="fa-solid fa-pause"></i> : <i className="fa-solid fa-play"></i>
                                }
                            </Button>
                            <div className='flex gap-3 max-sm:gap-0'>
                                <Button variant="ghost" size='icon' onClick={handleRewind} className='text-white hover:bg-card/20'>
                                    <i className="fa-solid fa-backward"></i>
                                </Button>
                                <Button variant="ghost" size='icon' onClick={handleForward} className='text-white hover:bg-card/20'>
                                    <i className="fa-solid fa-forward"></i>
                                </Button>
                            </div>
                            <Button variant="ghost" size='icon' onClick={handleMute} className='text-white bg-transparent hover:bg-card/20'>
                                {
                                    muted ? <i className="fa-solid fa-volume-xmark"></i> : <i className="fa-solid fa-volume-high"></i>
                                }
                            </Button>
                        </div>

                        <div className='flex items-center space-x-3 mx-0'>
                            <div className='text-white text-sm'>
                                {
                                    formatTime(played * (playerRef.current?.getDuration() || 0))
                                } /
                                {
                                    formatTime(playerRef.current?.getDuration() || 0)
                                }
                            </div>
                            <Button variant="ghost" size='icon' onClick={handleFullScreen} className='text-white bg-transparent hover:bg-card/20'>
                                {
                                    isFullScreen ? <i className="fa-solid fa-compress"></i> : <i className="fa-solid fa-expand"></i>
                                }
                            </Button>
                        </div>
                    </div>
                </div>
            }
        </div >
    )
}