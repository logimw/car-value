import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      find(email): Promise<User[]> {
        return Promise.resolve([
          { id: 1, email, password: 'testpassword' } as User,
        ]);
      },
      findOne(id: number): null | Promise<User | undefined> {
        return Promise.resolve({
          id,
          email: 'test@test.com',
          password: 'testpassword',
        } as User);
      },
      // async remove(id: number): Promise<User> {},
      // create(email: string, password: string): Promise<User> {},
    };
    fakeAuthService = {
      // async signUp(email: string, password: string): Promise<User> {},
      async signIn(email: string, password: string): Promise<User> {
        return Promise.resolve({ id: 1, email, password } as User);
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: fakeUsersService },
        { provide: AuthService, useValue: fakeAuthService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await controller.findAllUsers('test@test.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('test@test.com');
  });

  it('findUser returns a single user with the given id', async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
  });

  it('findUser throws an error if user with given id is not found', async () => {
    fakeUsersService.findOne = () => null;
    await expect(controller.findUser('1')).rejects.toThrowError(
      'user not found',
    );
  });

  it('signIn updates session object and returns user', async () => {
    const session = { userId: '' };
    const user = await controller.signIn(
      { email: 'test@test.com', password: 'testpassword' },
      session,
    );

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
