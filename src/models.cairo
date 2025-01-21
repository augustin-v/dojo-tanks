use starknet::{ContractAddress};

#[derive(Drop, Clone, Serde, Debug)]
#[dojo::model]
pub struct Tank {
    #[key]
    player: ContractAddress,
    is_alive: bool,
    position: Vec2,
    rotation: u32,
    speed: u8
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
    active: bool,
    reload_time: u8
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
    x: u8,
    y: u8
}

#[derive(Drop, Copy, Serde, Debug)]
pub struct Game {
    #[key]
    game_id: u32,
    status: GameStatus,
    player_count: u8
}

#[derive(Serde, Drop, Copy, PartialEq, Introspect, Debug)]
enum GameStatus {
    Waiting,
    InProgress,
    Completed
}