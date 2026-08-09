import { useState, useRef, useCallback } from 'react'

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isSupported] = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  const recognitionRef = useRef(null)
  const finalRef = useRef('')
  const timerRef = useRef(null)
  const [seconds, setSeconds] = useState(0)

  const start = useCallback(() => {
    finalRef.current = ''
    setTranscript('')
    setSeconds(0)
    setIsRecording(true)

    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)

    if (!isSupported) return  // simulation happens outside

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new SR()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-IN'

    rec.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalRef.current += e.results[i][0].transcript + ' '
        else interim += e.results[i][0].transcript
      }
      setTranscript(finalRef.current + interim)
    }

    rec.onerror = (e) => {
      console.warn('Speech recognition error:', e.error)
    }

    rec.onend = () => {
      setIsRecording(false)
      clearInterval(timerRef.current)
    }

    rec.start()
    recognitionRef.current = rec
  }, [isSupported])

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsRecording(false)
    clearInterval(timerRef.current)
  }, [])

  const clear = useCallback(() => {
    setTranscript('')
    finalRef.current = ''
    setSeconds(0)
  }, [])

  const setManual = useCallback((text) => {
    setTranscript(text)
    finalRef.current = text
  }, [])

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  return { transcript, isRecording, isSupported, seconds, start, stop, clear, setManual, formatTime }
}
