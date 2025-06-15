import { Permission } from '../restapi/utils/enums';
import { Sensor } from './sensor';
import { User } from './user';

export interface Project {
    id: number;
    name: string;
    projectAccess: ProjectAccess[];
    sensors: Sensor[];
}

export interface ProjectAccess {
    id: number;
    user: User;
    project: Project;
    permission: Permission;
}
