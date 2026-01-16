import { VehicleType } from "@root/generated/prisma";

export interface IVehicleResponse {
    id: string;
    name: string | null;
    deviceId?: string | null;
    fleetId?: string | null;
    type: VehicleType;
}
