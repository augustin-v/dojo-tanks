import { useEffect, useState } from "react";
import { addAddressPadding } from "starknet";
import { useAccount } from "@starknet-react/core";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { QueryBuilder } from "@dojoengine/sdk";
import { ParsedEntity } from "@dojoengine/sdk";
import { ProjectileFired, SchemaType } from "../typescript/models.gen";

export function ShootinComponent() {
  const { client, sdk } = useDojoSDK();
  const { account } = useAccount();
  
  // Keep track of the last bullet ID we fired
  const [bulletId, setBulletId] = useState<number | null>(null);

  // 1) EFFECT: subscribe to "ProjectileFired" events for the current player
  useEffect(() => {
    if (!account) return;
    let unsubscribe: (() => void) | undefined;

    const subscribeToProjectileFired = async () => {
      const subscription = await sdk.subscribeEntityQuery({
        query: new QueryBuilder<SchemaType>()
          .namespace("dojo_tanks", (n) =>
            n.entity("ProjectileFired", (e) =>
              e.eq("player", addAddressPadding(account.address))
            )
          )
          .build(),
        callback: ({ error, data }) => {
          if (error) {
            console.error("Error subscribing to ProjectileFired:", error);
          } else {
            // data can be an object keyed by entityId, each containing “ProjectileFired”
            // example => { "0x123...": { models: { dojo_tanks: { ProjectileFired: {...} } } } }
            const entityId = Object.keys(data)[0];
            const entity = data[entityId];

            if (entity?.models?.dojo_tanks?.ProjectileFired) {
              const projectileData = entity.models.dojo_tanks.ProjectileFired as ProjectileFired;
              console.log("ProjectileFired event data:", projectileData);
              
              // 2) store the projectile_id from the event
              setBulletId(Number(projectileData.projectile_id));
            }
          }
        },
      });

      unsubscribe = () => subscription.cancel();
    };

    subscribeToProjectileFired();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [sdk, account]);

  // 3) FUNCTION: call the “shoot” action from your bindings
  const handleShoot = async () => {
    if (!account) return;
    try {
      const gameId = 1; // or whichever game ID you want
      console.log("Shooting projectile…");
      await client.actions.shoot(account, gameId);
      console.log("Shoot transaction sent!");
    } catch (error) {
      console.error("Error shooting projectile:", error);
    }
  };

  return (
    <div style={{ color: "white" }}>
      <button onClick={handleShoot}>Shoot</button>
      {bulletId !== null && (
        <p>Last bullet ID: {bulletId}</p>
      )}
    </div>
  );
}
