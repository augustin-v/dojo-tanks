
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
    use alexandria_math::trigonometry::{fast_sin, fast_cos};

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
            let player = get_caller_address();
            
            let game = Game {
                game_id: 1,
                status: GameStatus::InProgress,
                player_count: 1,
                last_sync: get_block_timestamp().try_into().unwrap()
            };
            world.write_model(@game);
            let tank = Tank {
                player,
                is_alive: true,
                position: Vec2 { x: 9, y: 6 }, // Center of 18x12 map
                rotation: 90,
                speed: 1,
                shots_fired: 0,
                last_move_timestamp: get_block_timestamp().try_into().unwrap(),
                velocity: Vec2 { x: 0, y: 0 }
            };
            world.write_model(@tank);

            // init map tiles 18x12
            let mut x: u8 = 0;
            while x < 18 {
                let mut y: u8 = 0;
                while y < 12 {
                    let tile = MapTiles {
                        game_id: 1,
                        position: Vec2 { x, y },
                        tile_type: TileType::Empty
                    };
                    world.write_model(@tile);
                    y += 1;
                };
                x += 1
            };
            1
        }

        fn move_tank(ref self: ContractState, game_id: u32, direction: u32) {
            let mut world = self.world_default();
            let player = get_caller_address();
            let timestamp = get_block_timestamp();
            let mut tank: Tank = world.read_model(player);

            match direction {
                0 => { // UP
                    tank.velocity = Vec2 { x: 0, y: tank.speed };
                },
                1 => { // RIGHT
                    tank.velocity = Vec2 { x: tank.speed, y: 0 };
                },
                2 => { // DOWN
                    if tank.position.y >= tank.speed {
                        tank.velocity = Vec2 { x: 0, y: tank.speed };
                    }
                },
                3 => { // LEFT
                    if tank.position.x >= tank.speed {
                        tank.velocity = Vec2 { x: tank.speed, y: 0 };
                    }
                },
                _ => {}
            };
        
            if direction == 2 && tank.position.y >= tank.speed {
                tank.position.y = tank.position.y - tank.velocity.y;
            } else if direction == 3 && tank.position.x >= tank.speed {
                tank.position.x = tank.position.x - tank.velocity.x;
            } else if direction < 2 {
                tank.position.x = tank.position.x + tank.velocity.x;
                tank.position.y = tank.position.y + tank.velocity.y;
            }
        
            tank.last_move_timestamp = timestamp;
            world.write_model(@tank);
            world.emit_event(@TankMoved { player, position: tank.position, game_id });
        
        }

        fn rotate_tank(ref self: ContractState, game_id: u32, rotation: u32) {
            let mut world = self.world_default();
            let player = get_caller_address();
            let mut tank: Tank = world.read_model(player);

            tank.rotation = rotation % 360; // 360 degrees
            world.write_model(@tank);
        }

        fn shoot(ref self: ContractState, game_idea: u32) {
            let mut world = self.world_default();
            let player = get_caller_address();
            let mut tank: Tank = world.read_model(player);
            let timestamp = get_block_timestamp();

            let projectile_id = tank.shots_fired;
            tank.shots_fired += 1;
            let projectile = Projectile {
                id: projectile_id,
                player,
                position: tank.position,
                velocity: Vec2 { x: 1, y: 1 },
                direction: Vec2 {
                    x: (fast_cos(tank.rotation.into()).try_into().expect('"failed"') * tank.speed).try_into().unwrap(),
                    y: (fast_sin(tank.rotation.into()).try_into().expect('"failed2"') * tank.speed).try_into().unwrap()
                },
                spawn_timestamp: timestamp,
                active: true,
                reload_time: 5
            };

            world.write_model(@projectile);
            world.emit_event(@ProjectileFired {
                player,
                projectile_id,
                position: tank.position
              });
        }
    }
    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn world_default(self: @ContractState) -> dojo::world::WorldStorage {
            self.world(@"dojo_tanks")
        }
    }
}