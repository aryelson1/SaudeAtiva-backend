import { Request, Response, NextFunction } from 'express';
import prisma from '@routes/common/prisma';
import { NotFoundError, PermissionError } from '@root/api/errors';

export const authorize = (permissionName: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {

        const userId = req.user?.id;

        if (!userId) {
            throw new NotFoundError('User not found');
        }

        const user = await prisma.users.findFirst({
            where: {
                id: userId,
                userRoles: {
                    some: {
                        role: {
                            rolePermissions: {
                                some: {
                                    permission: {
                                        name: permissionName
                                    }
                                }
                            }
                        },
                    },
                }
            }
        });

        if (!user) {
            throw new PermissionError();
        }

        next();
    };
};
