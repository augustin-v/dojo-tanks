import { useEffect, useState } from "react";
import { QueryBuilder, ParsedEntity } from "@dojoengine/sdk";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { MapTiles as MapTilesType, Tank as TankType, SchemaType } from "../typescript/models.gen";
import tankSvg from '../assets/tank-svgrepo-com.svg';


export function MapTiles({ 
    tank, 
    localPosition,
    localRotation 
}: { 
    tank?: TankType;
    localPosition?: { x: number, y: number };
    localRotation?: number;
}) {
    const { sdk } = useDojoSDK();
    const [mapTiles, setMapTiles] = useState<Record<string, MapTilesType>>({});

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
        return grid;
    };

    return (
        <div className="mt-4 bg-amber-50/10 p-3 rounded-lg w-fit mx-auto shadow-lg">
            <div className="grid grid-cols-18 gap-[1px] w-[576px]">
                {renderMap()}
            </div>
        </div>
    );
}
