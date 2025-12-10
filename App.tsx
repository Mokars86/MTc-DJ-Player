
import React, { useState, useEffect } from 'react';
import { AppMode, DeckId, DeckState, MixerState, Track, EffectType, Notification } from './types';
import { TopBar } from './components/TopBar';
import { Footer } from './components/Footer';
import { Deck } from './components/Deck';
import { Mixer } from './components/Mixer';
import { EffectsRack } from './components/EffectsRack';
import { SamplerGrid } from './components/SamplerGrid';
import { LibraryPanel } from './components/LibraryPanel';
import { SplashScreen } from './components/SplashScreen';
import { ToastContainer } from './components/ui/Toast.tsx';
import { MOCK_TRACKS } from './constants';
import { getAITransitionSuggestion } from './services/geminiService';
import { audioEngine } from './services/audioEngine';

const INITIAL_DECK_STATE: DeckState = {
  track: null,
  isPlaying: false,
  volume: 100,
  gain: 50, // Default mid gain
  pitch: 0,
  eq: { high: 50, mid: 50, low: 50 },
  filter: 0,
  loopActive: false,
  loopLength: 4,
  cuePoints: [null, null, null, null, null, null, null, null],
  currentTime: 0,
  activeEffects: [],
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<AppMode>(AppMode.DJ);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Library State
  const [libraryTracks, setLibraryTracks] = useState<Track[]>(MOCK_TRACKS);
  
  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const addNotification = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const [deckA, setDeckA] = useState<DeckState>({ ...INITIAL_DECK_STATE, track: MOCK_TRACKS[0] });
  const [deckB, setDeckB] = useState<DeckState>({ ...INITIAL_DECK_STATE, track: MOCK_TRACKS[1] });
  
  const [mixer, setMixer] = useState<MixerState>({
    crossfader: 0,
    masterVolume: 80
  });

  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  // Audio Engine Synchronization Loop (UI Updates)
  useEffect(() => {
    let animationFrame: number;
    const updateLoop = () => {
        const updateDeckTime = (deck: DeckState, setDeck: React.Dispatch<React.SetStateAction<DeckState>>) => {
            if (deck.isPlaying && deck.track) {
                setDeck(prev => {
                    let nextTime = prev.currentTime + 0.016; // 60fps approx fallback
                    if (nextTime >= prev.track!.duration) {
                        nextTime = 0; 
                        // Loop logic would go here
                    }
                    return { ...prev, currentTime: nextTime };
                });
            }
        };

        updateDeckTime(deckA, setDeckA);
        updateDeckTime(deckB, setDeckB);
        animationFrame = requestAnimationFrame(updateLoop);
    };

    animationFrame = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animationFrame);
  }, [deckA.isPlaying, deckB.isPlaying]); 

  // Sync Mixer State to Audio Engine
  useEffect(() => {
    // Volume Control
    const volA_Fader = deckA.volume / 100;
    const volB_Fader = deckB.volume / 100;
    
    // Equal Power Crossfader Curve
    let x = (mixer.crossfader + 1) / 2; // 0 to 1
    const gainA = Math.cos(x * 0.5 * Math.PI) * volA_Fader;
    const gainB = Math.cos((1 - x) * 0.5 * Math.PI) * volB_Fader;
    
    audioEngine.deckA.setVolume(gainA);
    audioEngine.deckB.setVolume(gainB);

    // Filter
    audioEngine.deckA.setFilter(deckA.filter);
    audioEngine.deckB.setFilter(deckB.filter);

    // Gain (Trim) - Map 0-100 to 0.0-2.0 (boost allowed)
    audioEngine.deckA.setInputGain(deckA.gain / 50);
    audioEngine.deckB.setInputGain(deckB.gain / 50);
    
    // Effects
    audioEngine.deckA.updateEffects(deckA.activeEffects);
    audioEngine.deckB.updateEffects(deckB.activeEffects);

    // Update Master Volume
    audioEngine.setMasterVolume(mixer.masterVolume / 100);
    
  }, [
      mixer.crossfader, 
      mixer.masterVolume, 
      deckA.volume, deckB.volume, 
      deckA.filter, deckB.filter, 
      deckA.gain, deckB.gain,
      deckA.activeEffects, deckB.activeEffects
  ]);

  const handleImportTracks = (files: FileList) => {
    const newTracks: Track[] = Array.from(files).map((file, i) => ({
      id: `local-${Date.now()}-${i}`,
      title: file.name.replace(/\.[^/.]+$/, ""),
      artist: "Local File",
      bpm: 120 + Math.floor(Math.random() * 20),
      key: "5A",
      duration: 180, // We guess duration until loaded
      coverUrl: "https://picsum.photos/200/200?grayscale",
      genre: "Unknown",
      moodIntensity: 50,
      audioSrc: URL.createObjectURL(file)
    }));

    setLibraryTracks(prev => [...newTracks, ...prev]);
    addNotification(`Imported ${newTracks.length} tracks`, 'success');
  };

  const handleLoadTrack = async (track: Track, deckId: 'A' | 'B') => {
    const setDeck = deckId === 'A' ? setDeckA : setDeckB;
    
    // Ensure engine is active
    audioEngine.resume();
    
    // Reset Deck UI State
    setDeck(prev => ({ 
        ...prev, 
        track, 
        isPlaying: false, 
        currentTime: 0,
        cuePoints: [null, null, null, null, null, null, null, null]
    }));

    // Load into Audio Engine
    if (track.audioSrc) {
        addNotification(`Loading audio for "${track.title}"...`, 'info');
        const duration = await audioEngine.loadTrack(deckId as DeckId, track.audioSrc);
        if (duration > 0) {
            setDeck(prev => ({ 
                ...prev, 
                track: { ...track, duration } // Update with real duration
            }));
            addNotification(`Ready to play`, 'success');
        } else {
             addNotification(`Error loading audio`, 'warning');
        }
    } else {
        // Fallback for mock tracks
        // Ensure the engine knows this deck is "stopped" or reset
        const engineDeck = deckId === 'A' ? audioEngine.deckA : audioEngine.deckB;
        engineDeck.pause();
        addNotification(`Loaded Mock "${track.title}" to Deck ${deckId}`, 'success');
    }
  };

  const togglePlay = (deckId: DeckId) => {
    audioEngine.resume(); // Ensure context is unlocked by user interaction
    const isA = deckId === DeckId.A;
    const deck = isA ? deckA : deckB;
    const setDeck = isA ? setDeckA : setDeckB;
    const engineDeck = isA ? audioEngine.deckA : audioEngine.deckB;

    if (deck.isPlaying) {
        engineDeck.pause();
        setDeck(prev => ({ ...prev, isPlaying: false }));
    } else {
        if (!deck.track) {
            addNotification("Load a track first!", "warning");
            return;
        }
        engineDeck.bpm = deck.track.bpm;
        engineDeck.play();
        setDeck(prev => ({ ...prev, isPlaying: true }));
    }
  };

  const handleSeek = (deckId: DeckId, time: number) => {
      audioEngine.resume();
      const setDeck = deckId === DeckId.A ? setDeckA : setDeckB;
      setDeck(prev => ({ ...prev, currentTime: time }));
      audioEngine.seek(deckId, time);
  };

  const handleCue = (deckId: DeckId, index: number, action: 'set' | 'jump' | 'delete') => {
      audioEngine.resume();
      const setDeck = deckId === DeckId.A ? setDeckA : setDeckB;
      
      setDeck(prev => {
          const newCues = [...prev.cuePoints];
          if (action === 'set') {
              newCues[index] = prev.currentTime;
              addNotification(`Cue ${index + 1} Set`, 'info');
          } else if (action === 'jump') {
              const jumpTime = newCues[index];
              if (jumpTime !== null) {
                  audioEngine.seek(deckId, jumpTime); // Seek engine
                  // If we jump, we might want to ensure play continues if it was playing
                  return { ...prev, currentTime: jumpTime, cuePoints: newCues };
              }
          } else if (action === 'delete') {
              newCues[index] = null;
              addNotification(`Cue ${index + 1} Deleted`, 'info');
          }
          return { ...prev, cuePoints: newCues };
      });
  };

  const handleSync = (targetDeckId: DeckId) => {
      const sourceDeck = targetDeckId === DeckId.A ? deckB : deckA;
      const setTarget = targetDeckId === DeckId.A ? setDeckA : setDeckB;

      if (sourceDeck.track) {
          const targetEngine = targetDeckId === DeckId.A ? audioEngine.deckA : audioEngine.deckB;
          targetEngine.bpm = sourceDeck.track.bpm;
          
          setTarget(prev => {
             if (prev.track) {
                 return { ...prev, pitch: sourceDeck.pitch }; 
             }
             return prev;
          });
          addNotification("BPM Synced", "success");
      }
  };

  const handleEffectDrop = (deckId: DeckId, effect: EffectType) => {
      const setDeck = deckId === DeckId.A ? setDeckA : setDeckB;
      setDeck(prev => {
          if (!prev.activeEffects.includes(effect)) {
              addNotification(`${effect} applied to Deck ${deckId}`, 'success');
              return { ...prev, activeEffects: [...prev.activeEffects, effect] };
          }
          return prev;
      });
  };

  const handleRemoveEffect = (deckId: DeckId, effect: EffectType) => {
      const setDeck = deckId === DeckId.A ? setDeckA : setDeckB;
      setDeck(prev => ({
          ...prev,
          activeEffects: prev.activeEffects.filter(e => e !== effect)
      }));
  };

  useEffect(() => {
    if (deckA.track && deckB.track) {
      getAITransitionSuggestion(deckA.track.title, deckB.track.title).then(suggestion => {
        setAiSuggestion(suggestion);
      });
    }
  }, [deckA.track, deckB.track]);

  return (
    <>
      {loading && <SplashScreen onComplete={() => {
        setLoading(false);
        // Attempt to resume audio context when splash is done (user clicked or waited)
        audioEngine.resume();
      }} />}
      <ToastContainer notifications={notifications} removeNotification={removeNotification} />
      
      <div className="w-screen h-screen flex flex-col bg-transparent font-sans selection:bg-teal-500/30 transition-colors duration-500">
        <TopBar currentMode={mode} setMode={setMode} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        
        <div className="flex-1 flex overflow-hidden relative p-4 gap-4">
          <div className="absolute inset-0 pointer-events-none z-0 opacity-20 transition-all duration-1000">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-200 dark:bg-teal-900 rounded-full mix-blend-screen filter blur-[120px] animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-100 dark:bg-teal-700 rounded-full mix-blend-screen filter blur-[120px] animate-pulse delay-1000"></div>
          </div>

          <div className="flex-1 flex flex-col z-10 min-w-[300px]">
            <Deck 
              id={DeckId.A} 
              state={deckA} 
              onTogglePlay={() => togglePlay(DeckId.A)}
              onLoadTrack={(t) => handleLoadTrack(t, 'A')}
              onSeek={(time) => handleSeek(DeckId.A, time)}
              onSetCue={(i) => handleCue(DeckId.A, i, 'set')}
              onJumpCue={(i) => handleCue(DeckId.A, i, 'jump')}
              onDeleteCue={(i) => handleCue(DeckId.A, i, 'delete')}
              onSync={() => handleSync(DeckId.A)}
              onDropEffect={(fx) => handleEffectDrop(DeckId.A, fx)}
              onRemoveEffect={(fx) => handleRemoveEffect(DeckId.A, fx)}
            />
          </div>

          <div className="flex flex-col gap-4 items-center z-10">
            <Mixer 
              mixerState={mixer}
              deckAState={deckA}
              deckBState={deckB}
              setCrossfader={(val) => setMixer(prev => ({ ...prev, crossfader: val }))}
              setVolumeA={(val) => setDeckA(prev => ({...prev, volume: val}))}
              setVolumeB={(val) => setDeckB(prev => ({...prev, volume: val}))}
              setEqA={(band, val) => setDeckA(prev => ({...prev, eq: {...prev.eq, [band]: val}}))}
              setEqB={(band, val) => setDeckB(prev => ({...prev, eq: {...prev.eq, [band]: val}}))}
              setFilterA={(val) => setDeckA(prev => ({...prev, filter: val}))}
              setFilterB={(val) => setDeckB(prev => ({...prev, filter: val}))}
              setGainA={(val) => setDeckA(prev => ({...prev, gain: val}))}
              setGainB={(val) => setDeckB(prev => ({...prev, gain: val}))}
              setMasterVolume={(val) => setMixer(prev => ({...prev, masterVolume: val}))}
            />
            
            <div className="w-full bg-white/60 dark:bg-glass-100 border border-black/5 dark:border-white/10 rounded-lg p-2 text-center backdrop-blur-md">
              <p className="text-[10px] uppercase text-teal-600 dark:text-teal-400 font-bold mb-1">AI Mix Assist</p>
              <p className="text-xs text-slate-800 dark:text-white/80 animate-pulse">
                  {aiSuggestion || "Analyzing tracks..."}
              </p>
            </div>
          </div>

          <div className="flex-1 flex flex-col z-10 min-w-[300px]">
            <Deck 
              id={DeckId.B} 
              state={deckB} 
              onTogglePlay={() => togglePlay(DeckId.B)}
              onLoadTrack={(t) => handleLoadTrack(t, 'B')}
              onSeek={(time) => handleSeek(DeckId.B, time)}
              onSetCue={(i) => handleCue(DeckId.B, i, 'set')}
              onJumpCue={(i) => handleCue(DeckId.B, i, 'jump')}
              onDeleteCue={(i) => handleCue(DeckId.B, i, 'delete')}
              onSync={() => handleSync(DeckId.B)}
              onDropEffect={(fx) => handleEffectDrop(DeckId.B, fx)}
              onRemoveEffect={(fx) => handleRemoveEffect(DeckId.B, fx)}
            />
          </div>

          <div className="z-20">
              <EffectsRack />
          </div>
        </div>

        <div className="h-64 flex gap-4 px-4 pb-2 z-10">
          <div className="w-1/3 max-w-[400px]">
              <SamplerGrid />
          </div>
          <div className="flex-1">
              <LibraryPanel 
                tracks={libraryTracks}
                onLoadTrack={handleLoadTrack} 
                onImportTracks={handleImportTracks}
              />
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default App;
