import { Field, ObjectType } from "type-graphql";
import IAdminItems from "@utils/admin/IAdminItems";
import Place from "@schemas/place.schema";

@ObjectType({implements: IAdminItems})
export default abstract class AdminPlaces extends IAdminItems{
  @Field(() => [Place])
  places!: Place[];
}