import { Field, ObjectType } from "type-graphql";
import IAdminItems from "@utils/admin/IAdminItems";
import Sensor from "@schemas/sensor.schema";

@ObjectType({implements: IAdminItems})
export default abstract class AdminSensors extends IAdminItems{
  @Field(() => [Sensor])
  sensors!: Sensor[];
}