import { DojoProvider, DojoCall } from "@dojoengine/core";
import { Account, AccountInterface, BigNumberish, CairoOption, CairoCustomEnum, ByteArray } from "starknet";
import * as models from "./models.gen";

export function setupWorld(provider: DojoProvider) {

	const build_actions_gotHit_calldata = (gameId: BigNumberish, projectileId: BigNumberish): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "got_hit",
			calldata: [gameId, projectileId],
		};
	};

	const actions_gotHit = async (snAccount: Account | AccountInterface, gameId: BigNumberish, projectileId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_gotHit_calldata(gameId, projectileId),
				"dojo_tanks",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

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

	const build_actions_shoot_calldata = (gameId: BigNumberish): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "shoot",
			calldata: [gameId],
		};
	};

	const actions_shoot = async (snAccount: Account | AccountInterface, gameId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_shoot_calldata(gameId),
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

	const build_actions_validatePosition_calldata = (gameId: BigNumberish, x: BigNumberish, y: BigNumberish, rotation: BigNumberish): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "validate_position",
			calldata: [gameId, x, y, rotation],
		};
	};

	const actions_validatePosition = async (snAccount: Account | AccountInterface, gameId: BigNumberish, x: BigNumberish, y: BigNumberish, rotation: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_validatePosition_calldata(gameId, x, y, rotation),
				"dojo_tanks",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};



	return {
		actions: {
			gotHit: actions_gotHit,
			buildGotHitCalldata: build_actions_gotHit_calldata,
			moveTank: actions_moveTank,
			buildMoveTankCalldata: build_actions_moveTank_calldata,
			rotateTank: actions_rotateTank,
			buildRotateTankCalldata: build_actions_rotateTank_calldata,
			shoot: actions_shoot,
			buildShootCalldata: build_actions_shoot_calldata,
			spawn: actions_spawn,
			buildSpawnCalldata: build_actions_spawn_calldata,
			validatePosition: actions_validatePosition,
			buildValidatePositionCalldata: build_actions_validatePosition_calldata,
		},
	};
}