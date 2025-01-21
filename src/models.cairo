use starknet::{ContractAddress};

#[derive(Drop, Copy, Serde, Debug)]
#[dojo::model]
pub struct Tank {
    #[key]
    player: ContractAddress,
    pub is_alive: bool,
    pub position: Vec2,
    pub rotation: u32,
    pub speed: u8,
    pub shots_fired: u32,
    pub last_move_timestamp: u64,
    pub velocity: Vec2
}

#[derive(Drop, Clone, Serde, Debug)]
#[dojo::model]
pub struct Projectile {
    #[key]
    id: u32,
    #[key]
    player: ContractAddress,
    position: Vec2,
    velocity: Vec2,
    direction: Vec2,
    spawn_timestamp: u64,
    active: bool,
    reload_time: u8,
}


#[derive(Copy, Drop, Serde, Debug, Introspect)]
#[dojo::model]
pub struct MapTiles {
    #[key]
    game_id: u32,
    #[key]
    position: Vec2,
    tile_type: TileType
}

#[derive(Serde, Drop, Copy, PartialEq, Introspect, Debug)]
enum TileType {
    Wall,
    Destrucible,
    Empty
}

#[derive(Drop, Copy, Serde, Debug, Introspect)]
pub struct Vec2 {
    pub x: u8,
    pub y: u8
}

#[derive(Drop, Copy, Serde, Debug)]
#[dojo::model]
pub struct Game {
    #[key]
    game_id: u32,
    pub status: GameStatus,
    pub player_count: u8,
    pub last_sync: u64
}

#[derive(Serde, Drop, Copy, PartialEq, Introspect, Debug)]
enum GameStatus {
    Waiting,
    InProgress,
    Completed
}