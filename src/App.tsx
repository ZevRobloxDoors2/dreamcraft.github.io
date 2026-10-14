import React, { useEffect, useRef, useState } from 'react';
import { Game } from './game/game';

export function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<Game | null>(null);

  const [screen, setScreen] = useState<'mainMenu' | 'worldScreen' | 'playing' | 'inventory' | 'settings' | 'marketplace'>('mainMenu');
  const [health, setHealth] = useState<number>(20);
  const [inventory, setInventory] = useState<string[]>(['dirt', 'stone', 'wood']);
  const [selectedSlot, setSelectedSlot] = useState<number>(0);
  const [resumeText, setResumeText] = useState<string>('Play');

  useEffect(() => {
    if (!canvasRef.current) return;
    const game = new Game(canvasRef.current);
    gameRef.current = game;

    game.onHealthChange = (h) => setHealth(h);
    game.onInventoryChange = (inv) => setInventory(inv);
    game.onStateChange = (state) => {
      if (state === 'paused') {
        setScreen('mainMenu');
        setResumeText('Resume Game');
      }
    };

    game.init((h) => setHealth(h));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' && game.gameState === 'playing') {
        document.exitPointerLock();
        setScreen('inventory');
      }
      if (game.gameState === 'playing' && e.key >= '1' && e.key <= '9') {
        const slot = parseInt(e.key) - 1;
        setSelectedSlot(slot);
        game.selectedSlot = slot;
      }
    };

    const handlePointerLockChange = () => {
      if (document.pointerLockElement !== document.body) {
        if (game.gameState === 'playing') {
          game.pauseGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      game.destroy();
    };
  }, []);

  const handlePlayClick = () => {
    setScreen('worldScreen');
  };

  const handleStartGame = () => {
    if (gameRef.current) {
      gameRef.current.startGame();
      setScreen('playing');
    }
  };

  const handleBackToMenu = () => {
    setScreen('mainMenu');
  };

  const handleCloseInventory = () => {
    setScreen('playing');
    if (gameRef.current) {
      gameRef.current.player.controls.lock();
      gameRef.current.gameState = 'playing';
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-['VT323'] select-none">
      <canvas id="gameCanvas" ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />

      {/* Crosshair */}
      {screen === 'playing' && (
        <div id="crosshair" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-2xl pointer-events-none z-10 drop-shadow-[1px_1px_0_#000]">
          +
        </div>
      )}

      {/* UI Container */}
      <div id="uiContainer" className="absolute inset-0 z-20 pointer-events-auto">
        {/* Main Menu */}
        {screen === 'mainMenu' && (
          <div id="mainMenu" className="w-full h-full flex flex-col items-center justify-center bg-black/30">
            <div className="title-container relative mt-2.5 mb-8 text-center">
              <h1 className="bedrock-title text-[90px] text-white m-0 drop-shadow-[4px_4px_0_#333] tracking-wider">Dreamcraft</h1>
              <div className="splash-text absolute -bottom-3.5 -right-12 text-[#FFFF00] text-[30px] -rotate-[20deg] drop-shadow-[2px_2px_0_#3f3f00] animate-pulse">
                Now with Trees!
              </div>
            </div>
            <div className="bedrock-button-stack flex flex-col items-center gap-2">
              <button onClick={handlePlayClick} className="mc-button">{resumeText}</button>
              <button onClick={() => setScreen('settings')} className="mc-button">Settings</button>
              <button onClick={() => setScreen('marketplace')} className="mc-button">Marketplace</button>
            </div>
          </div>
        )}

        {/* World Select Screen */}
        {screen === 'worldScreen' && (
          <div id="worldScreen" className="w-full h-full bg-[#333] flex flex-col items-center justify-center">
            <div className="java-world-box text-center">
              <h1 className="java-title text-white text-[40px] drop-shadow-[2px_2px_0_#000] mb-5">Select World</h1>
              <div className="world-list bg-black/80 border-2 border-black w-[600px] h-[300px] overflow-y-auto text-white mb-5 text-left">
                <div className="world-item p-4 border-2 border-transparent hover:border-white hover:bg-white/10 cursor-pointer">
                  <strong className="text-xl">New World</strong><br />
                  <span className="text-[#aaa] text-base">Survival Mode, Version 1.0</span>
                </div>
              </div>
              <div className="java-button-row flex gap-5 justify-center">
                <button onClick={handleStartGame} className="mc-button">Play Selected World</button>
                <button onClick={handleBackToMenu} className="mc-button">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Screen */}
        {screen === 'settings' && (
          <div className="w-full h-full bg-[#333]/90 flex flex-col items-center justify-center text-white">
            <h1 className="text-4xl mb-6 drop-shadow">Settings</h1>
            <div className="bg-black/60 p-6 border-2 border-black w-[500px] flex flex-col gap-4 text-xl">
              <div className="flex justify-between items-center">
                <span>Render Distance</span>
                <span className="text-[#aaa]">Chunk Loading (8 Chunks)</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Sound Volume</span>
                <span className="text-[#aaa]">100%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Graphics</span>
                <span className="text-[#aaa]">Fancy</span>
              </div>
              <button onClick={handleBackToMenu} className="mc-button mx-auto mt-4">Back to Menu</button>
            </div>
          </div>
        )}

        {/* Marketplace Screen */}
        {screen === 'marketplace' && (
          <div className="w-full h-full bg-[#333]/90 flex flex-col items-center justify-center text-white">
            <h1 className="text-4xl mb-6 drop-shadow">Marketplace</h1>
            <div className="bg-black/60 p-6 border-2 border-black w-[600px] h-[350px] overflow-y-auto flex flex-col gap-4">
              <div className="p-3 bg-white/10 border border-white/20 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-[#FFFF00]">Cyberpunk Voxel Pack</h3>
                  <p className="text-sm text-[#aaa]">Futuristic neon blocks and textures.</p>
                </div>
                <button className="mc-button !w-[120px] !h-[40px] !text-lg">Free</button>
              </div>
              <div className="p-3 bg-white/10 border border-white/20 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-[#FFFF00]">Medieval Castle Expansion</h3>
                  <p className="text-sm text-[#aaa]">Cobblestone walls, banners and torches.</p>
                </div>
                <button className="mc-button !w-[120px] !h-[40px] !text-lg">Free</button>
              </div>
              <button onClick={handleBackToMenu} className="mc-button mx-auto mt-4">Back to Menu</button>
            </div>
          </div>
        )}

        {/* Inventory UI */}
        {screen === 'inventory' && (
          <div id="inventoryUI" className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="inventory-window bg-[#c6c6c6] p-5 border-2 border-black rounded-[4px] w-[520px] text-[#333]">
              <div className="inv-top-row flex justify-between mb-5">
                <div className="player-preview-box w-[100px] h-[150px] bg-black border-2 border-[#555] flex items-center justify-center text-white text-base">
                  Player Preview
                </div>
                
                <div className="crafting-section">
                  <h3 className="m-0 mb-2.5 text-[#333] text-xl">Crafting</h3>
                  <div className="crafting-container flex items-center gap-3.5">
                    <div className="crafting-grid grid grid-cols-2 gap-1">
                      <div className="inv-slot" />
                      <div className="inv-slot" />
                      <div className="inv-slot" />
                      <div className="inv-slot" />
                    </div>
                    <div className="crafting-arrow text-3xl font-bold text-[#333]">➔</div>
                    <div className="inv-slot result-slot w-[44px] h-[44px]" />
                  </div>
                </div>
              </div>

              <h2 className="text-xl m-0 mb-1">Inventory</h2>
              <div className="inventory-grid grid grid-cols-9 gap-1 mt-2.5">
                {Array.from({ length: 27 }).map((_, i) => (
                  <div key={i} className="inv-slot">
                    {inventory[i] ? inventory[i].slice(0, 3).toUpperCase() : ''}
                  </div>
                ))}
              </div>

              <button onClick={handleCloseInventory} className="mc-button mx-auto mt-4 block !w-[150px] !h-[40px] !text-lg">Resume</button>
            </div>
          </div>
        )}
      </div>

      {/* HUD (Health + Hotbar) */}
      {screen === 'playing' && (
        <div id="hud" className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex flex-col items-center z-[100]">
          <div id="healthBar" className={`flex gap-0.5 mb-1.5 h-5 ${health <= 4 ? 'low-health' : ''}`}>
            {Array.from({ length: 10 }).map((_, i) => {
              const currentHearts = Math.ceil(health / 2);
              const isEmpty = i >= currentHearts;
              return (
                <div
                  key={i}
                  className={`heart w-[18px] h-[18px] inline-block border ${
                    isEmpty ? 'bg-[#555] border-[#222]' : 'bg-[#ff3333] border-[#990000]'
                  } rotate-45 m-0.5 ${health <= 4 ? 'animate-[heartBob_0.5s_infinite]' : ''}`}
                />
              );
            })}
          </div>
          <div id="hotbar" className="flex gap-0.5 p-1 bg-black/40 border-2 border-black">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                onClick={() => {
                  setSelectedSlot(i);
                  if (gameRef.current) gameRef.current.selectedSlot = i;
                }}
                className={`inv-slot w-[44px] h-[44px] bg-[#8b8b8b] border-2 border-[#373737] border-b-white border-r-white flex items-center justify-center text-xs text-white cursor-pointer ${
                  selectedSlot === i ? '!border-3 !border-white' : ''
                }`}
              >
                {inventory[i] ? inventory[i].slice(0, 3).toUpperCase() : ''}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
