export const mockTelemetryFindFirst = jest.fn();
export const mockTelemetryFindMany = jest.fn();

export const mockUserFindFirst = jest.fn();
export const mockUserUpdate = jest.fn();

export const mockVehicleFindMany = jest.fn();
export const mockVehicleFindFirst = jest.fn();

export const mockSupplyFindMany = jest.fn();

export const mockFleetFindMany = jest.fn();

export const mockDeviceFindMany = jest.fn();

export const PrismaClient = jest.fn().mockImplementation(() => ({
    telemetry: {
        findFirst: mockTelemetryFindFirst,
        findMany: mockTelemetryFindMany,
    },
    users: {
        findFirst: mockUserFindFirst,
        update: mockUserUpdate,
    },
    vehicle: {
        findMany: mockVehicleFindMany,
        findFirst: mockVehicleFindFirst,
        update: jest.fn(),
        create: jest.fn(),
    },
    supply: {
        findMany: mockSupplyFindMany,
    },
    fleet: {
        findMany: mockFleetFindMany,
        create: jest.fn(),
    },
    device: {
        findMany: mockDeviceFindMany,
    },
}));
