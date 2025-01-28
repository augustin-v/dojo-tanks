import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { MapTiles as MapTilesType, Tank as TankType } from "../typescript/models.gen";
import tankPng from '../assets/tanks.png';
import bulletPng from '../assets/bullet.png';

interface WebGLRendererProps {
  mapTiles: Record<string, MapTilesType>;
  tanks: TankType[];
  bullets: Array<{
    id: number;
    x: number;
    y: number;
    direction: number;
    bounced: boolean;
  }>;
  localPosition?: { x: number; y: number };
  localRotation?: number;
  onMove?: (dx: number, dy: number) => void;
  onRotate?: (dRotation: number) => void;
}

class GameScene extends Phaser.Scene {
    private tank: Phaser.GameObjects.Sprite | null = null; // Make tank nullable
    private bullets: Phaser.GameObjects.Sprite[] = [];
    private mapTiles: Phaser.GameObjects.Rectangle[] = [];
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
    public onMove!: (dx: number, dy: number) => void;
    public onRotate!: (dRotation: number) => void;
    // Store the props data
    private gameData: {
      tanks: TankType[];
      bullets: Array<{
        id: number;
        x: number;
        y: number;
        direction: number;
        bounced: boolean;
      }>;
      mapTiles: Record<string, MapTilesType>;
      localPosition?: { x: number; y: number };
      localRotation?: number;
    };
  
    constructor(data: WebGLRendererProps) {
        super({ key: 'GameScene' });
        this.onMove = data.onMove || (() => {});
        this.onRotate = data.onRotate || (() => {});
      }
  
    preload() {
      this.load.image('tank', tankPng);
      this.load.image('bullet', bulletPng);
    }
  
    create() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D') as Record<string, Phaser.Input.Keyboard.Key>;
    
      // Create tank sprite
      this.tank = this.add.sprite(400, 300, 'tank');
      this.tank.setOrigin(0.5);
      
      // Create map tiles
      Object.entries(this.gameData.mapTiles).forEach(([key, tile]) => {
        const [x, y] = key.split('-').map(Number);
        const tileType = Object.keys(tile.tile_type)[0];
        const color = this.getTileColor(tileType);
        
        const rect = this.add.rectangle(
          x * 32,
          y * 32,
          32,
          32,
          color
        );
        rect.setOrigin(0);
        this.mapTiles.push(rect);
      });
    }
  
    // Inside the GameScene class
    update() {
        const speed = 0.1;
        let dx = 0;
        let dy = 0;
    
        if (this.wasd.W?.isDown || this.cursors.up?.isDown) dy -= speed;
        if (this.wasd.S?.isDown || this.cursors.down?.isDown) dy += speed;
        if (this.wasd.A?.isDown || this.cursors.left?.isDown) dx -= speed;
        if (this.wasd.D?.isDown || this.cursors.right?.isDown) dx += speed;
    
        if (dx !== 0 || dy !== 0) this.onMove(dx, dy);
    
        // Handle rotation
        const rotationSpeed = 3;
        let dRotation = 0;
        if (this.cursors.left?.isDown) dRotation -= rotationSpeed;
        if (this.cursors.right?.isDown) dRotation += rotationSpeed;
    
        if (dRotation !== 0) this.onRotate(dRotation);
    
        // Update tank position/rotation from React state
        if (this.gameData.localPosition) {
          this.tank.setPosition(
            (this.gameData.localPosition.x + 0.5) * 32,
            (this.gameData.localPosition.y + 0.5) * 32
          );
        }
        if (this.gameData.localRotation !== undefined) {
          this.tank.setRotation(Phaser.Math.DegToRad(this.gameData.localRotation));
        }
    
        this.updateBullets();
      }
  
    private getTileColor(tileType: string): number {
      switch(tileType) {
        case 'Wall': return 0x2d2d2d;
        case 'Destrucible': return 0x8b4513;
        default: return 0xf4e8c1;
      }
    }
  
    private updateBullets() {
      // Clear old bullets
      this.bullets.forEach(bullet => bullet.destroy());
      this.bullets = [];
  
      // Create new bullets
      this.gameData.bullets.forEach(bulletData => {
        const bullet = this.add.sprite(
          bulletData.x * 32,
          bulletData.y * 32,
          'bullet'
        );
        bullet.setRotation(bulletData.direction * Math.PI / 180);
        this.bullets.push(bullet);
      });
    }
  
    updateGameData(newData: any) {
      this.gameData = newData;
    }
  }
  
  export function WebGLRenderer(props: WebGLRendererProps) {
    const gameRef = useRef<Phaser.Game | null>(null);
    const sceneRef = useRef<GameScene | null>(null);
    
    useEffect(() => {
      if (gameRef.current) return;
  
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: 'phaser-game',
        width: 576,
        height: 384,
        
        backgroundColor: '#f4e8c1',
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
          }
        },
        scene: new GameScene(props)
      };
  
      gameRef.current = new Phaser.Game(config);
      sceneRef.current = gameRef.current.scene.getScene('GameScene') as GameScene;
  
      return () => {
        if (gameRef.current) {
          gameRef.current.destroy(true);
          gameRef.current = null;
          sceneRef.current = null;
        }
      };
    }, []);
  
    // Update scene data when props change
    useEffect(() => {
        if (sceneRef.current) {
          sceneRef.current.onMove = props.onMove || (() => {});
          sceneRef.current.onRotate = props.onRotate || (() => {});
        }
      }, [props.onMove, props.onRotate]);
  
    return (
        <div 
          id="phaser-game" 
          className="mt-4 bg-amber-50/10 p-3 rounded-lg mx-auto shadow-lg"
          style={{ width: '576px', height: '384px' }} // Add fixed dimensions
        />
      );  }
  