import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameService } from './game.service';
import { GameGateway } from './game/game.gateway';
import { GameModel, GameSchema } from './game/schemas/game.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: GameModel.name, schema: GameSchema }]),
  ],
  providers: [GameService, GameGateway],
})
export class GameModule {}
