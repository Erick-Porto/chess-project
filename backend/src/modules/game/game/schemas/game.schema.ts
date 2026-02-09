import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GameDocument = HydratedDocument<GameModel>;

@Schema({ timestamps: true })
export class GameModel {
  @Prop({ required: true, unique: true })
  roomId: string;

  @Prop()
  whiteSocketId: string;

  @Prop({ required: false })
  whitePlayerName?: string;

  @Prop()
  blackSocketId: string;

  @Prop({ required: false })
  blackPlayerName?: string;

  @Prop({ required: false })
  winner?: string;

  @Prop([
    {
      from: { row: Number, col: Number },
      to: { row: Number, col: Number },
      notation: { type: String, required: false },
      promotion: { type: String, required: false },
    },
  ])
  moves: Record<string, unknown>[];
}

export const GameSchema = SchemaFactory.createForClass(GameModel);
