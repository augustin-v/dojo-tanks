import type { SchemaType as ISchemaType } from "@dojoengine/sdk";

import { CairoCustomEnum, BigNumberish } from 'starknet';

type WithFieldOrder<T> = T & { fieldOrder: string[] };

// Type definition for `dojo_tanks::models::Game` struct
export interface Game {
	game_id: BigNumberish;
	status: GameStatusEnum;
	player_count: BigNumberish;
	last_sync: BigNumberish;
}

// Type definition for `dojo_tanks::models::GameValue` struct
export interface GameValue {
	status: GameStatusEnum;
	player_count: BigNumberish;
	last_sync: BigNumberish;
}

// Type definition for `dojo_tanks::models::MapTiles` struct
export interface MapTiles {
	game_id: BigNumberish;
	position: Vec2;
	tile_type: TileTypeEnum;
}

// Type definition for `dojo_tanks::models::MapTilesValue` struct
export interface MapTilesValue {
	tile_type: TileTypeEnum;
}

// Type definition for `dojo_tanks::models::Projectile` struct
export interface Projectile {
	id: BigNumberish;
	player: string;
	position: Vec2;
	velocity: Vec2;
	direction: Vec2;
	spawn_timestamp: BigNumberish;
	active: boolean;
	reload_time: BigNumberish;
}

// Type definition for `dojo_tanks::models::ProjectileValue` struct
export interface ProjectileValue {
	position: Vec2;
	velocity: Vec2;
	direction: Vec2;
	spawn_timestamp: BigNumberish;
	active: boolean;
	reload_time: BigNumberish;
}

// Type definition for `dojo_tanks::models::Tank` struct
export interface Tank {
	player: string;
	is_alive: boolean;
	position: Vec2;
	rotation: BigNumberish;
	speed: BigNumberish;
	shots_fired: BigNumberish;
	last_move_timestamp: BigNumberish;
	velocity: Vec2;
}

// Type definition for `dojo_tanks::models::TankValue` struct
export interface TankValue {
	is_alive: boolean;
	position: Vec2;
	rotation: BigNumberish;
	speed: BigNumberish;
	shots_fired: BigNumberish;
	last_move_timestamp: BigNumberish;
	velocity: Vec2;
}

// Type definition for `dojo_tanks::models::Vec2` struct
export interface Vec2 {
	x: BigNumberish;
	y: BigNumberish;
}

// Type definition for `dojo_tanks::systems::actions::actions::GameSpawned` struct
export interface GameSpawned {
	game_id: BigNumberish;
	player: string;
}

// Type definition for `dojo_tanks::systems::actions::actions::GameSpawnedValue` struct
export interface GameSpawnedValue {
	player: string;
}

// Type definition for `dojo_tanks::systems::actions::actions::ProjectileFired` struct
export interface ProjectileFired {
	player: string;
	projectile_id: BigNumberish;
	position: Vec2;
}

// Type definition for `dojo_tanks::systems::actions::actions::ProjectileFiredValue` struct
export interface ProjectileFiredValue {
	position: Vec2;
}

// Type definition for `dojo_tanks::systems::actions::actions::TankMoved` struct
export interface TankMoved {
	player: string;
	position: Vec2;
	game_id: BigNumberish;
}

// Type definition for `dojo_tanks::systems::actions::actions::TankMovedValue` struct
export interface TankMovedValue {
	position: Vec2;
	game_id: BigNumberish;
}

// Type definition for `dojo_tanks::models::GameStatus` enum
export type GameStatus = {
	Waiting: string;
	InProgress: string;
	Completed: string;
}
export type GameStatusEnum = CairoCustomEnum;

// Type definition for `dojo_tanks::models::TileType` enum
export type TileType = {
	Wall: string;
	Destrucible: string;
	Empty: string;
}
export type TileTypeEnum = CairoCustomEnum;

export interface SchemaType extends ISchemaType {
	dojo_tanks: {
		Game: WithFieldOrder<Game>,
		GameValue: WithFieldOrder<GameValue>,
		MapTiles: WithFieldOrder<MapTiles>,
		MapTilesValue: WithFieldOrder<MapTilesValue>,
		Projectile: WithFieldOrder<Projectile>,
		ProjectileValue: WithFieldOrder<ProjectileValue>,
		Tank: WithFieldOrder<Tank>,
		TankValue: WithFieldOrder<TankValue>,
		Vec2: WithFieldOrder<Vec2>,
		GameSpawned: WithFieldOrder<GameSpawned>,
		GameSpawnedValue: WithFieldOrder<GameSpawnedValue>,
		ProjectileFired: WithFieldOrder<ProjectileFired>,
		ProjectileFiredValue: WithFieldOrder<ProjectileFiredValue>,
		TankMoved: WithFieldOrder<TankMoved>,
		TankMovedValue: WithFieldOrder<TankMovedValue>,
	},
}
export const schema: SchemaType = {
	dojo_tanks: {
		Game: {
			fieldOrder: ['game_id', 'status', 'player_count', 'last_sync'],
			game_id: 0,
		status: new CairoCustomEnum({ 
					Waiting: "",
				InProgress: undefined,
				Completed: undefined, }),
			player_count: 0,
			last_sync: 0,
		},
		GameValue: {
			fieldOrder: ['status', 'player_count', 'last_sync'],
		status: new CairoCustomEnum({ 
					Waiting: "",
				InProgress: undefined,
				Completed: undefined, }),
			player_count: 0,
			last_sync: 0,
		},
		MapTiles: {
			fieldOrder: ['game_id', 'position', 'tile_type'],
			game_id: 0,
		position: { x: 0, y: 0, },
		tile_type: new CairoCustomEnum({ 
					Wall: "",
				Destrucible: undefined,
				Empty: undefined, }),
		},
		MapTilesValue: {
			fieldOrder: ['tile_type'],
		tile_type: new CairoCustomEnum({ 
					Wall: "",
				Destrucible: undefined,
				Empty: undefined, }),
		},
		Projectile: {
			fieldOrder: ['id', 'player', 'position', 'velocity', 'direction', 'spawn_timestamp', 'active', 'reload_time'],
			id: 0,
			player: "",
		position: { x: 0, y: 0, },
		velocity: { x: 0, y: 0, },
		direction: { x: 0, y: 0, },
			spawn_timestamp: 0,
			active: false,
			reload_time: 0,
		},
		ProjectileValue: {
			fieldOrder: ['position', 'velocity', 'direction', 'spawn_timestamp', 'active', 'reload_time'],
		position: { x: 0, y: 0, },
		velocity: { x: 0, y: 0, },
		direction: { x: 0, y: 0, },
			spawn_timestamp: 0,
			active: false,
			reload_time: 0,
		},
		Tank: {
			fieldOrder: ['player', 'is_alive', 'position', 'rotation', 'speed', 'shots_fired', 'last_move_timestamp', 'velocity'],
			player: "",
			is_alive: false,
		position: { x: 0, y: 0, },
			rotation: 0,
			speed: 0,
			shots_fired: 0,
			last_move_timestamp: 0,
		velocity: { x: 0, y: 0, },
		},
		TankValue: {
			fieldOrder: ['is_alive', 'position', 'rotation', 'speed', 'shots_fired', 'last_move_timestamp', 'velocity'],
			is_alive: false,
		position: { x: 0, y: 0, },
			rotation: 0,
			speed: 0,
			shots_fired: 0,
			last_move_timestamp: 0,
		velocity: { x: 0, y: 0, },
		},
		Vec2: {
			fieldOrder: ['x', 'y'],
			x: 0,
			y: 0,
		},
		GameSpawned: {
			fieldOrder: ['game_id', 'player'],
			game_id: 0,
			player: "",
		},
		GameSpawnedValue: {
			fieldOrder: ['player'],
			player: "",
		},
		ProjectileFired: {
			fieldOrder: ['player', 'projectile_id', 'position'],
			player: "",
			projectile_id: 0,
		position: { x: 0, y: 0, },
		},
		ProjectileFiredValue: {
			fieldOrder: ['position'],
		position: { x: 0, y: 0, },
		},
		TankMoved: {
			fieldOrder: ['player', 'position', 'game_id'],
			player: "",
		position: { x: 0, y: 0, },
			game_id: 0,
		},
		TankMovedValue: {
			fieldOrder: ['position', 'game_id'],
		position: { x: 0, y: 0, },
			game_id: 0,
		},
	},
};
export enum ModelsMapping {
	Game = 'dojo_tanks-Game',
	GameStatus = 'dojo_tanks-GameStatus',
	GameValue = 'dojo_tanks-GameValue',
	MapTiles = 'dojo_tanks-MapTiles',
	MapTilesValue = 'dojo_tanks-MapTilesValue',
	Projectile = 'dojo_tanks-Projectile',
	ProjectileValue = 'dojo_tanks-ProjectileValue',
	Tank = 'dojo_tanks-Tank',
	TankValue = 'dojo_tanks-TankValue',
	TileType = 'dojo_tanks-TileType',
	Vec2 = 'dojo_tanks-Vec2',
	GameSpawned = 'dojo_tanks-GameSpawned',
	GameSpawnedValue = 'dojo_tanks-GameSpawnedValue',
	ProjectileFired = 'dojo_tanks-ProjectileFired',
	ProjectileFiredValue = 'dojo_tanks-ProjectileFiredValue',
	TankMoved = 'dojo_tanks-TankMoved',
	TankMovedValue = 'dojo_tanks-TankMovedValue',
}