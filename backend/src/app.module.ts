import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameModule } from './modules/game/game/game.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/chess',
    ),
    GameModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
