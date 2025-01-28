// src/App.tsx
import { useEffect, useState, useMemo, useCallback } from "react";
import { ParsedEntity, QueryBuilder } from "@dojoengine/sdk";
import { AccountInterface, addAddressPadding } from "starknet";
import { useAccount } from "@starknet-react/core";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { Tank, SchemaType } from "./typescript/models.gen";
import { WalletAccount } from "./wallet-account";
import { ShootinComponent } from "./components/ShootinComponent";
import { WebGLRenderer } from "./components/WebGLRenderer";

function App() {
  const { useDojoStore, client, sdk } = useDojoSDK();
  const { account } = useAccount();
  const [isSpawning, setIsSpawning] = useState(false);
  const [tankData, setTankData] = useState<Tank | undefined>();
  const [entityId, setEntityId] = useState<string>();
  const [localPosition, setLocalPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [localRotation, setLocalRotation] = useState<number>(0);
  const [bullets, setBullets] = useState<Array<{
    id: number;
    x: number;
    y: number;
    direction: number;
    bounced: boolean;
  }>>([]);
  const [mapTiles, setMapTiles] = useState<Record<string, MapTilesType>>({});

  const handleMove = useCallback((dx: number, dy: number) => {
    setLocalPosition(prev => ({
      x: Math.max(0, Math.min(17, prev.x + dx)),
      y: Math.max(0, Math.min(11, prev.y + dy))
    }));
  }, []);

  const handleRotate = useCallback((dRotation: number) => {
    setLocalRotation(prev => (prev + dRotation + 360) % 360);
  }, []);


  // Convert tank data for WebGL renderer
  const tanksArray = useMemo(() => {
    return tankData ? [{
      ...tankData,
      position: {
        x: Number(tankData.position.x),
        y: Number(tankData.position.y)
      }
    }] : [];
  }, [tankData]);
  const handleSpawn = useCallback(async () => {
    if (!account) return;
    
    try {
      setIsSpawning(true);
      await client.actions.spawn(account);
      
      const entity = await sdk.getEntities({
        query: new QueryBuilder()
          .namespace("dojo_tanks", (n) => 
            n.entity("Tank", (e) => 
              e.eq("player", addAddressPadding(account.address))
            )
          )
          .build(),
        callback: ({ error, data }) => {
          if (error) {
            console.error("Error getting tank entity:", error);
          } else if (Array.isArray(data) && data[0]) {
            const tankEntity = data[0] as ParsedEntity<SchemaType>;
            if (tankEntity.models?.dojo_tanks?.Tank) {
              setTankData(tankEntity.models.dojo_tanks.Tank as Tank);
            }
          }
        }
      });
    } catch (error) {
      console.error("Error spawning tank:", error);
    } finally {
      setIsSpawning(false);
    }
  }, [account, client.actions, sdk]);

  // Subscribe to map tiles
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const subscribeToMap = async () => {
      const subscription = await sdk.subscribeEntityQuery({
        query: new QueryBuilder<SchemaType>()
          .namespace("dojo_tanks", (n) =>
            n.entity("MapTiles", (e) => e)
          )
          .build(),
        callback: ({ error, data }) => {
          if (error) {
            console.error("Error setting up map sync:", error);
          } else if (Array.isArray(data)) {
            const tiles = data.reduce((acc: Record<string, MapTilesType>, entity) => {
              if ('models' in entity) {
                const parsedEntity = entity as ParsedEntity<SchemaType>;
                const mapTile = parsedEntity.models?.dojo_tanks?.MapTiles;
                if (mapTile?.position) {
                  const key = `${mapTile.position.x.toString()}-${mapTile.position.y.toString()}`;
                  acc[key] = mapTile as MapTilesType;
                }
              }
              return acc;
            }, {});
            setMapTiles(tiles);
          }
        },
      });

      unsubscribe = () => subscription.cancel();
    };

    subscribeToMap();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [sdk]);

  // Bullet animation logic (same as previous MapTiles component)
  useEffect(() => {
    const BULLET_SPEED = 0.3;
    let animationFrame: number;

    const updateBullets = () => {
      setBullets(prevBullets => 
        prevBullets.filter(bullet => {
          const rad = (bullet.direction - 90) * Math.PI / 180;
          let newX = bullet.x + Math.cos(rad) * BULLET_SPEED;
          let newY = bullet.y + Math.sin(rad) * BULLET_SPEED;

          if (!bullet.bounced) {
            if (newX <= 0 || newX >= 17) {
              bullet.direction = 180 - bullet.direction;
              bullet.bounced = true;
            }
            if (newY <= 0 || newY >= 11) {
              bullet.direction = 360 - bullet.direction;
              bullet.bounced = true;
            }
          }

          bullet.x = Math.max(0, Math.min(17, newX));
          bullet.y = Math.max(0, Math.min(11, newY));

          return !(bullet.bounced && (
            bullet.x <= 0 || bullet.x >= 17 ||
            bullet.y <= 0 || bullet.y >= 11
          ));
        })
      );
      animationFrame = requestAnimationFrame(updateBullets);
    };

    animationFrame = requestAnimationFrame(updateBullets);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Existing tank subscription and movement logic remains the same
  // ...

  return (
    <div className="bg-black min-h-screen w-full p-4">
      <div className="max-w-7xl mx-auto">
        <WalletAccount />
        <div className="mt-8">
          <button
            className={`px-4 py-2 rounded ${
              isSpawning 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
            onClick={handleSpawn}
            disabled={isSpawning || !account}
          >
            {isSpawning ? 'Spawning...' : 'Spawn Tank'}
          </button>
          
          {tankData && (
            <div className="mt-4 text-white">
              <p>Onchain Tank Position: x: {tankData.position.x.toString()}, y: {tankData.position.y.toString()}</p>
              <ShootinComponent />
            </div>
          )}
        </div>

        <WebGLRenderer 
      mapTiles={mapTiles}
      tanks={tanksArray}
      bullets={bullets}
      localPosition={localPosition}
      localRotation={localRotation}
      onMove={handleMove}
      onRotate={handleRotate}
    />
      </div>
    </div>
  );
}

export default App;