'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import * as Tone from 'tone';
import { Midi } from '@tonejs/midi';

interface MidiPlayerProps {
  midiFile?: File;
  midiUrl?: string;
  startTime?: number; // Start time in seconds (optional - play specific section)
  endTime?: number;   // End time in seconds (optional - play specific section)
}

export default function MidiPlayer({ midiFile, midiUrl, startTime, endTime }: MidiPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const synthRef = useRef<Tone.PolySynth | null>(null);
  const midiDataRef = useRef<Midi | null>(null);
  const partRef = useRef<Tone.Part | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const loopTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Initialize synth
  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 1,
      },
    }).toDestination();

    return () => {
      synthRef.current?.dispose();
    };
  }, []);

  // Load MIDI file
  useEffect(() => {
    const loadMidi = async () => {
      try {
        let arrayBuffer: ArrayBuffer;

        if (midiFile) {
          arrayBuffer = await midiFile.arrayBuffer();
        } else if (midiUrl) {
          const response = await fetch(midiUrl);
          arrayBuffer = await response.arrayBuffer();
        } else {
          return;
        }

        const midi = new Midi(arrayBuffer);
        midiDataRef.current = midi;

        // Determine playback range
        const playStart = startTime ?? 0;
        const playEnd = endTime ?? midi.duration;

        // Get duration (use section duration if specified)
        setDuration(playEnd - playStart);

        // Create note events - filter by time range if specified
        const notes: Array<{ time: number; note: string; duration: number; velocity: number }> = [];

        midi.tracks.forEach((track) => {
          track.notes.forEach((note) => {
            // Only include notes within the specified time range
            if (note.time >= playStart && note.time < playEnd) {
              notes.push({
                time: note.time - playStart, // Adjust time to start from 0
                note: note.name,
                duration: note.duration,
                velocity: note.velocity,
              });
            }
          });
        });

        // Create Tone.Part for playback
        if (partRef.current) {
          partRef.current.dispose();
        }

        partRef.current = new Tone.Part((time, note) => {
          synthRef.current?.triggerAttackRelease(
            note.note,
            note.duration,
            time,
            note.velocity
          );
        }, notes);

        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load MIDI:', error);
      }
    };

    loadMidi();

    return () => {
      if (partRef.current) {
        partRef.current.dispose();
      }
      if (loopTimeoutRef.current) {
        clearTimeout(loopTimeoutRef.current);
      }
    };
  }, [midiFile, midiUrl, startTime, endTime]);

  // Update volume
  useEffect(() => {
    if (synthRef.current) {
      const db = isMuted ? -Infinity : Tone.gainToDb(volume / 100);
      synthRef.current.volume.value = db;
    }
  }, [volume, isMuted]);

  const handleStop = useCallback(() => {
    Tone.Transport.stop();
    Tone.Transport.seconds = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  // Animation frame for progress
  useEffect(() => {
    const updateProgress = () => {
      if (isPlaying && Tone.Transport.state === 'started') {
        const current = Tone.Transport.seconds;
        setCurrentTime(current);

        // Stop at end time if reached
        if (current >= duration) {
          handleStop();
          return;
        }

        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, duration, handleStop]);

  const handlePlay = async () => {
    if (!isLoaded || !partRef.current) return;

    await Tone.start();

    if (Tone.Transport.state === 'stopped') {
      partRef.current.start(0);
      Tone.Transport.start();
    } else {
      Tone.Transport.start();
    }

    setIsPlaying(true);
  };

  const handlePause = () => {
    Tone.Transport.pause();
    setIsPlaying(false);
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    Tone.Transport.seconds = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!midiFile && !midiUrl) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={duration}
              step={0.1}
              onValueChange={handleSeek}
              disabled={!isLoaded}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!isPlaying ? (
                <Button
                  size="sm"
                  onClick={handlePlay}
                  disabled={!isLoaded}
                >
                  <Play className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handlePause}
                >
                  <Pause className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={handleStop}
                disabled={!isLoaded}
              >
                <Square className="h-4 w-4" />
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2 w-32">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={100}
                step={1}
                onValueChange={(value) => {
                  setVolume(value[0]);
                  if (value[0] > 0) setIsMuted(false);
                }}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
