import { useState, useEffect } from 'react'
import { CLOCK_INTERVAL } from './constants'

export function useClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const fmt = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    setTime(fmt())
    const id = setInterval(() => setTime(fmt()), CLOCK_INTERVAL)
    return () => clearInterval(id)
  }, [])
  return time
}
