
#[starknet::interface]
trait IActions<T> {
    fn spawn_game(ref self: T) -> u32;
    fn join_game(ref self: T, game_id: u32);
    fn move_tank(ref self: T, game_id: u32, direction: u32, speed: u8);
    fn rotate_tank(ref self: T, game_id: u32, rotation: u32);
    fn shoot(ref self: T, game_idea: u32);
}

#[dojo::contract]
pub mod actions {
    use super::IActions;
    use dojo_tanks::models::{Tank, Projectile, MapTiles, Game, GameStatus, Vec2};
    use starknet::{ContractAddress, get_caller_address};

    #[derive(Drop, Clone, Serde)]
    #[dojo::event]
    struct ProjectileFired {
        #[key]
        player: ContractAddress,
        #[key]
        projectile_id: u32,
        position: Vec2
    }


    #[derive(Drop, Clone, Serde, Debug)]
    #[dojo::event]
    pub struct TankMoved {
        #[key]
        player: ContractAddress,
        position: Vec2,
        game_id: u32
    }


    #[abi(embed_v0)]
    impl ActionsImpl of IActions<ContractState> {
        fn spawn_game(ref self: ContractState) -> u32 {
            1
        }

        fn join_game(ref self: ContractState, game_id: u32){

        }

        fn move_tank(ref self: ContractState, game_id: u32, direction: u32, speed: u8) {

        }

        fn rotate_tank(ref self: ContractState, game_id: u32, rotation: u32) {

        }

        fn shoot(ref self: ContractState, game_idea: u32) {

        }
    }
    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn world_default(self: @ContractState) -> dojo::world::WorldStorage {
            self.world(@"wii_tanks")
        }
    }
}