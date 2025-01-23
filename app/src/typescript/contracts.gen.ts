import { DojoProvider, DojoCall } from "@dojoengine/core";
import { Account, AccountInterface, BigNumberish, CairoOption, CairoCustomEnum, ByteArray } from "starknet";
import * as models from "./models.gen";

export function setupWorld(provider: DojoProvider) {

	const build_actions_moveTank_calldata = (gameId: BigNumberish, direction: BigNumberish): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "move_tank",
			calldata: [gameId, direction],
		};
	};

	const actions_moveTank = async (snAccount: Account | AccountInterface, gameId: BigNumberish, direction: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_moveTank_calldata(gameId, direction),
				"dojo_tanks",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_rotateTank_calldata = (gameId: BigNumberish, rotation: BigNumberish): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "rotate_tank",
			calldata: [gameId, rotation],
		};
	};

	const actions_rotateTank = async (snAccount: Account | AccountInterface, gameId: BigNumberish, rotation: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_rotateTank_calldata(gameId, rotation),
				"dojo_tanks",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_shoot_calldata = (gameIdea: BigNumberish): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "shoot",
			calldata: [gameIdea],
		};
	};

	const actions_shoot = async (snAccount: Account | AccountInterface, gameIdea: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_shoot_calldata(gameIdea),
				"dojo_tanks",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_spawn_calldata = (): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "spawn",
			calldata: [],
		};
	};

	const actions_spawn = async (snAccount: Account | AccountInterface) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_spawn_calldata(),
				"dojo_tanks",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};



	return {
		actions: {
			moveTank: actions_moveTank,
			buildMoveTankCalldata: build_actions_moveTank_calldata,
			rotateTank: actions_rotateTank,
			buildRotateTankCalldata: build_actions_rotateTank_calldata,
			shoot: actions_shoot,
			buildShootCalldata: build_actions_shoot_calldata,
			spawn: actions_spawn,
			buildSpawnCalldata: build_actions_spawn_calldata,
		},
	};
}