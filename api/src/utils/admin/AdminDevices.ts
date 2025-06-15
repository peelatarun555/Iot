import { Field, ObjectType } from "type-graphql";
import IAdminItems from "@utils/admin/IAdminItems";
import Device from "@schemas/device.schema";

@ObjectType({implements: IAdminItems})
export default abstract class AdminDevices extends IAdminItems{
  @Field(() => [Device])
  devices!: Device[];
}