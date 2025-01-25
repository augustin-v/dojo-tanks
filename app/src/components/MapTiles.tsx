import { useEffect, useState } from "react";
import { QueryBuilder, ParsedEntity } from "@dojoengine/sdk";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { MapTiles as MapTilesType, Tank as TankType, SchemaType } from "../typescript/models.gen";
import tankSvg from '../assets/tank-svgrepo-com.svg';
import bulletSvg from '../assets/bullet.svg'


interface Bullet {
    id: number;
    x: number;
    y: number;
    direction: number;
    bounced: boolean;
}

export function MapTiles({ 
    tank, 
    localPosition,
    localRotation,
    bulletId, 
}: { 
    tank?: TankType;
    localPosition?: { x: number, y: number };
    localRotation?: number;
    bulletId?: number | null;
}) {
    const { sdk } = useDojoSDK();
    const [mapTiles, setMapTiles] = useState<Record<string, MapTilesType>>({});
    const [bullets, setBullets] = useState<Bullet[]>([]);

    useEffect(() => {
        if (bulletId !== null && bulletId !== undefined && localPosition && localRotation) {
            const newBullet: Bullet = {
                id: bulletId,
                x: localPosition.x,
                y: localPosition.y,
                direction: localRotation,
                bounced: false
            };
            setBullets(prev => [...prev, newBullet]);
        }
    }, [bulletId, localPosition, localRotation]);

    // Animate bullets
    useEffect(() => {
        const BULLET_SPEED = 0.3;
        let animationFrame: number;

        const updateBullets = () => {
            setBullets(prevBullets => 
                prevBullets.filter(bullet => {
                    // Convert direction to radians
                    const rad = (bullet.direction - 90) * Math.PI / 180;
                    
                    // Calculate new position
                    let newX = bullet.x + Math.cos(rad) * BULLET_SPEED;
                    let newY = bullet.y + Math.sin(rad) * BULLET_SPEED;

                    // Handle bouncing
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

                    // Update position
                    bullet.x = Math.max(0, Math.min(17, newX));
                    bullet.y = Math.max(0, Math.min(11, newY));

                    // Remove bullet if it's out of bounds after bounce
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
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [sdk]);

    const getTileColor = (tileType: any) => {
        const tileString = Object.keys(tileType)[0];
        switch(tileString) {
            case 'Wall': return 'bg-gray-800';
            case 'Destrucible': return 'bg-brown-500';
            default: return 'bg-amber-100'; // Dirt-like color
        }
    };

    const renderMap = () => {
        const grid = [];
        const size = { x: 18, y: 12 };
        
        // First render the base grid with tanks
        for (let y = 0; y < size.y; y++) {
            for (let x = 0; x < size.x; x++) {
                const tile = mapTiles[`${x}-${y}`];
                const tileType = tile?.tile_type || { Empty: {} };
                const isTankHere = localPosition && 
                    Math.floor(localPosition.x) === x && 
                    Math.floor(localPosition.y) === y;
                
                grid.push(
                    <div 
                        key={`${x}-${y}`}
                        className={`w-8 h-8 flex items-center justify-center ${getTileColor(tileType)} 
                            border-[0.5px] border-amber-200/20`}
                    >
                        {isTankHere && (
                            <div 
                                className="absolute"
                                style={{
                                    transform: `translate(
                                        ${(localPosition.x - Math.floor(localPosition.x)) * 32}px,
                                        ${(localPosition.y - Math.floor(localPosition.y)) * 32}px
                                    )`,
                                    transition: 'transform 0.1s linear',
                                    willChange: 'transform'
                                }}
                            >
                                <img 
                                    src={tankSvg} 
                                    alt="Tank"
                                    className="w-6 h-6"
                                    style={{ 
                                        transform: `rotate(${localRotation || 0}deg)`,
                                        transition: 'transform 0.1s ease-out'
                                    }}
                                />
                            </div>
                        )}
                    </div>
                );
            }
        }
    
        // Then add bullets on top
        bullets.forEach(bullet => {
            const gridX = Math.floor(bullet.x);
            const gridY = Math.floor(bullet.y);
            const offsetX = (bullet.x - gridX) * 32;
            const offsetY = (bullet.y - gridY) * 32;
    
            grid.push(
                <div 
                    key={`bullet-${bullet.id}`}
                    className="absolute"
                    style={{
                        transform: `translate(
                            ${gridX * 32 + offsetX}px,
                            ${gridY * 32 + offsetY}px
                        )`,
                        transition: 'transform 0.05s linear',
                        willChange: 'transform',
                        zIndex: 20
                    }}
                >
                    <img 
                        src={bulletSvg} 
                        alt="Bullet"
                        className="w-2 h-2"
                        style={{ 
                            transform: `rotate(${bullet.direction}deg)`
                        }}
                    />
                </div>
            );
        });
    
        return grid;
    };
    
    return (
        <div className="mt-4 bg-amber-50/10 p-3 rounded-lg w-fit mx-auto shadow-lg">
            <div className="grid grid-cols-18 gap-[1px] w-[576px] relative">
                {renderMap()}
            </div>
        </div>
    );
    
    
}
