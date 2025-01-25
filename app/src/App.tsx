import { useEffect, useState } from "react";
import { ParsedEntity, QueryBuilder } from "@dojoengine/sdk";
import { AccountInterface, addAddressPadding } from "starknet";
import { useAccount } from "@starknet-react/core";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { Tank, SchemaType } from "./typescript/models.gen";
import { MapTiles } from "./components/MapTiles";
import { WalletAccount } from "./wallet-account";
import { useMovement } from "./hooks/useMovement";
import { useCallback } from "react";
import { ShootinComponent } from "./components/ShootinComponent";


function App() {
    const { useDojoStore, client, sdk } = useDojoSDK();
    const { account } = useAccount();
    const [isSpawning, setIsSpawning] = useState(false);
    const [tankData, setTankData] = useState<Tank | undefined>();
    const [entityId, setEntityId] = useState<string>();
    const [localPosition, setLocalPosition] = useState<{ x: number, y: number }>();
    const [bulletId, setBulletId] = useState<number | null>(null);

    const [localRotation, setLocalRotation] = useState<number>(0);
  
    useEffect(() => {
        if (tankData) {
            setLocalPosition({
                x: Number(tankData.position.x),
                y: Number(tankData.position.y)
            });
        }
    }, [tankData]);

    useMovement({
        account: account || null,
        localPosition: localPosition || { x: 0, y: 0 }, // This is a workaround, better to initialize state properly
        setLocalPosition: useCallback((pos: { x: number, y: number }) => {
            setLocalPosition(pos);
        }, []),
        setLocalRotation: useCallback((rot: number) => {
            setLocalRotation(rot);
        }, [])
    });
    

    useEffect(() => {
        if (!account) return;
    
        let unsubscribe: (() => void) | undefined;
        
        const subscribeToTank = async () => {
            const subscription = await sdk.subscribeEntityQuery({
                query: new QueryBuilder()
                    .namespace("dojo_tanks", (n) =>
                        n.entity("Tank", (e) =>
                            e.eq(
                                "player",
                                addAddressPadding(account.address)
                            )
                        )
                    )
                    .build(),
                    callback: ({ error, data }) => {
                        console.log("Subscription update received:", data);
                        if (error) {
                            console.error("Error setting up tank sync:", error);
                        } else {
                            const entityId = Object.keys(data)[0];
                            const entity = data[entityId];
                            
                            if (entity?.models?.dojo_tanks?.Tank) {
                                console.log("Setting tank data:", entity.models.dojo_tanks.Tank);
                                setTankData(entity.models.dojo_tanks.Tank as Tank);
                            }
                        }
                    }
                    
            });
    
            unsubscribe = () => subscription.cancel();
        };
    
        subscribeToTank();
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [sdk, account]);

    const handleSpawn = async () => {
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
    };

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

                <MapTiles 
    tank={tankData} 
    localPosition={localPosition}  // Add fallback
    localRotation={localRotation}
/>
            </div>
        </div>
    );
}

export default App;
