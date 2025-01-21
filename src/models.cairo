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
    active: bool
}

#[derive(Drop, Copy, Serde, Debug, Introspect)]
pub struct Vec2 {
    x: u8,
    y: u8
}

