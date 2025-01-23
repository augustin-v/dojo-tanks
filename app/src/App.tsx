import { useEffect, useMemo } from "react";
import { ParsedEntity, QueryBuilder } from "@dojoengine/sdk";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { AccountInterface, addAddressPadding } from "starknet";
import { useAccount } from "@starknet-react/core";
import { WalletAccount } from "./wallet-account";
import { useDojoSDK, useModel } from "@dojoengine/sdk/react";
import { ModelsMapping } from "./typescript/models.gen";

function App() {
    const { useDojoStore, client, sdk } = useDojoSDK();
    const { account } = useAccount();
    const state = useDojoStore((state) => state);

    const entityId = useMemo(() => {
        if (account) {
            return getEntityIdFromKeys([BigInt(account.address)]);
        }
        return BigInt(0);
    }, [account]);

    useEffect(() => {
        let unsubscribe: (() => void) | undefined;

        const subscribe = async (account: AccountInterface) => {
            const subscription = await sdk.subscribeEntityQuery({
                query: new QueryBuilder()
                    .namespace("dojo_tanks", (n) =>
                        n
                            .entity("Tank", (e) =>
                                e.eq(
                                    "player",
                                    addAddressPadding(account.address)
                                )
                            )
                            .entity("Game", (e) => e.eq("game_id", "1"))
                    )
                    .build(),
                callback: ({ error, data }) => {
                    if (error) {
                        console.error("Error setting up entity sync:", error);
                    } else if (data && data[0]) {
                        state.updateEntity(data[0]);
                    }
                },
            });

            unsubscribe = () => subscription.cancel();
        };

        if (account) {
            subscribe(account);
        }

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [sdk, account]);

    const tank = useModel(entityId as string, ModelsMapping.Tank);

    return (
        <div className="bg-black min-h-screen w-full p-4">
            <div className="max-w-7xl mx-auto">
                <WalletAccount />
                
                <div className="mt-8">
                    <button
                        className="bg-blue-500 px-4 py-2 rounded"
                        onClick={() => client.actions.spawn(account!)}
                    >
                        Spawn Game
                    </button>
                    
                    {tank && (
                        <div className="mt-4 text-white">
                            <p>Tank Position: x: {tank.position.x}, y: {tank.position.y}</p>
                            <p>Rotation: {tank.rotation}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
