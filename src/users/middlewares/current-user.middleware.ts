import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UsersService } from '../users.service';
import { User } from '../user.entity';

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private usersService: UsersService) {}
  async use(
    req: Request & { currentUser: User },
    res: Response,
    next: NextFunction,
  ) {
    const { userId } = req.session || {};
    if (userId) {
      req.currentUser = await this.usersService.findOne(userId);
    }

    next();
  }
}
