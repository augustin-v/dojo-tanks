
#[starknet::interface]
trait IActions<T> {
    fn spawn_game(ref self: T) -> u32;
    fn move_tank(ref self: T, game_id: u32, direction: u32);
    fn rotate_tank(ref self: T, game_id: u32, rotation: u32);
    fn shoot(ref self: T, game_idea: u32);
}

#[dojo::contract]
pub mod actions {
    use super::IActions;
    use dojo_tanks::models::{Tank, Projectile, MapTiles, Game, GameStatus, Vec2, TileType};
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use dojo::model::{ModelStorage, ModelValueStorage};
    use dojo::event::EventStorage;

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
    #[derive(Drop, Clone, Serde)]
    #[dojo::event]
    pub struct GameSpawned {
        #[key]
        game_id: u32,
        player: ContractAddress
    }



    #[abi(embed_v0)]
    impl ActionsImpl of IActions<ContractState> {
        fn spawn_game(ref self: ContractState) -> u32 {
            let mut world = self.world_default();
            let game_id = get_block_timestamp();
            let player = get_caller_address();
            
            let game = Game {
                game_id: game_id.try_into().unwrap(),
                status: GameStatus::InProgress,
                player_count: 1
            };
            world.write_model(@game);
            let tank = Tank {
                player,
                is_alive: true,
                position: Vec2 { x: 9, y: 6 }, // Center of 18x12 map
                rotation: 0,
                speed: 1
            };
            world.write_model(@tank);

            // init map tiles 18x12
            let mut x: u8 = 0;
            while x < 18 {
                let mut y: u8 = 0;
                while y < 12 {
                    let tile = MapTiles {
                        game_id: game_id.try_into().unwrap(),
                        position: Vec2 { x, y },
                        tile_type: TileType::Empty
                    };
                    world.write_model(@tile);
                    y += 1;
                };
                x += 1
            };
            (game_id % 20).try_into().unwrap()
        }

        fn move_tank(ref self: ContractState, game_id: u32, direction: u32) {
            let mut world = self.world_default();
            let player = get_caller_address();

            let mut tank: Tank = world.read_model(player);

            match direction {
                0 => { tank.position.y = tank.position.y + tank.speed}, // UP
                1 => { tank.position.x = tank.position.x + tank.speed }, // RIGHT
                2 => { tank.position.y = tank.position.y - tank.speed }, // DOWN
                3 => { tank.position.x = tank.position.x - tank.speed }, // LEFT
                _ => {}
            };

            world.write_model(@tank);

            world.emit_event(@TankMoved { player, position: tank.position, game_id });
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