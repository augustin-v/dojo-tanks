import { useEffect, useState } from "react";
import { QueryBuilder, ParsedEntity } from "@dojoengine/sdk";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { MapTiles as MapTilesType, Tank as TankType, SchemaType } from "../typescript/models.gen";
import tankSvg from '../assets/tank-svgrepo-com.svg';


export function MapTiles({ tank }: { tank?: TankType }) {
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
            default: return 'bg-gray-200';
        }
    };

    const renderMap = () => {
        const grid = [];
        const size = { x: 18, y: 12 }; // Matches the contract's map size

        console.log("Current tank data:", tank);

        for (let y = 0; y < size.y; y++) {
            for (let x = 0; x < size.x; x++) {
                const tile = mapTiles[`${x}-${y}`];
                const tileType = tile?.tile_type || { Empty: {} };
                const isTankHere = tank && 
                    tank.position && 
                    tank.position.x.toString() === x.toString() && 
                    tank.position.y.toString() === y.toString();

                if (isTankHere) {
                    console.log("Tank should render at:", x, y); // Debug log
                }
                
                grid.push(
                    <div 
                        key={`${x}-${y}`}
                        className={`w-12 h-12 flex items-center justify-center ${getTileColor(tileType)} ${isTankHere ? 'relative' : ''}`}
                        title={`${x},${y}: ${Object.keys(tileType)[0]}`}
                    >
                        {isTankHere && (
                            <div 
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ transform: `rotate(${tank.rotation.toString()}deg)` }}
                        >
                            <img 
                                src={tankSvg} 
                                alt="Tank"
                                className="w-8 h-8" // Adjust size as needed
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
        <div className="mt-8 bg-gray-800 p-4 rounded-lg w-fit mx-auto">
            <h2 className="text-white text-xl mb-4">Game Map</h2>
            <div className="grid grid-cols-18 gap-1 w-[864px]">
                {renderMap()}
            </div>
        </div>
    );
}
