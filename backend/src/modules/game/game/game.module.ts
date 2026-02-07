import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { GameModel, GameSchema } from './schemas/game.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: GameModel.name, schema: GameSchema }]),
  ],
  providers: [GameService, GameGateway],
  exports: [GameService],
})
export class GameModule {}
