import { useEffect, useMemo, useState } from "react";
import { ParsedEntity, QueryBuilder } from "@dojoengine/sdk";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { AccountInterface, addAddressPadding, BigNumberish } from "starknet";
import { useAccount } from "@starknet-react/core";
import { WalletAccount } from "./wallet-account";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { Tank, SchemaType } from "./typescript/models.gen";
import { MapTiles } from "./components/MapTiles";

function App() {
    const { useDojoStore, client, sdk } = useDojoSDK();
    const { account } = useAccount();
    const state = useDojoStore((state) => state);
    const [isSpawning, setIsSpawning] = useState(false);
    const [tankData, setTankData] = useState<Tank | undefined>();

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
                    if (error) {
                        console.error("Error setting up tank sync:", error);
                    } else if (Array.isArray(data) && data[0] && 'models' in data[0]) {
                        const tankEntity = data[0] as ParsedEntity<SchemaType>;
                        if (tankEntity.models?.dojo_tanks?.Tank) {
                            setTankData(tankEntity.models.dojo_tanks.Tank as Tank);
                        }
                    }
                },
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
                            <p>Tank Position: x: {tankData.position.x.toString()}, y: {tankData.position.y.toString()}</p>
                            <p>Rotation: {tankData.rotation.toString()}</p>
                        </div>
                    )}
                </div>

                <MapTiles tank={tankData} />
            </div>
        </div>
    );
}



export default App;
