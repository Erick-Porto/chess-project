import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GameDocument = HydratedDocument<GameModel>;

@Schema({ timestamps: true })
export class GameModel {
  @Prop({ required: true, unique: true })
  roomId: string;

  @Prop()
  whiteSocketId: string;

  @Prop()
  whitePlayerName: string;

  @Prop()
  blackSocketId: string;

  @Prop()
  blackPlayerName: string;

  @Prop({ default: [] })
  moves: Array<{
    from: { row: number; col: number };
    to: { row: number; col: number };
  }>;
}

export const GameSchema = SchemaFactory.createForClass(GameModel);
