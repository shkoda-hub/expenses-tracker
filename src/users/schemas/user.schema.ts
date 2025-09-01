import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'users', timestamps: true })
export class User {
  _id: Types.ObjectId;

  @Prop({ type: String, length: 50, unique: true })
  email: string;

  @Prop({ type: String, length: 100, select: true })
  passwordHash: string;

  @Prop({ type: String, length: 100, select: false })
  userName: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('expenses', {
  ref: 'Expense',
  foreignField: 'userId',
  localField: '_id',
});
