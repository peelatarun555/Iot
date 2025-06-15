import { Field, Int, InterfaceType } from "type-graphql";

@InterfaceType()
export default abstract class IAdminItems {
  @Field(() => Int)
  index!: number;
  @Field(() => Int)
  take!: number;
  @Field(() => Int)
  total!: number;
}