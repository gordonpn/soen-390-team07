import { IUserEntity, UserEntity } from './../entities/User';
import { IUser } from './../models/UserModel';
import { UserRepository } from './../repository/UserRepository';
import { inject, injectable } from 'inversify';
import TYPES from '../constants/types';
import bcrypt from 'bcryptjs';
import { IConfig } from 'config';
import validator from 'validator';
import { BadRequestError, NotApprovedError, NotFoundError } from '../errors';
import { generateToken } from '../middlewares/authentication';

const requests: any[] = [];

@injectable()
export class UserService {
  @inject(TYPES.config) private config: IConfig;
  constructor(@inject(TYPES.UserRepository) private userRepo: UserRepository) {}

  public async registerUser(body: IUser): Promise<IUserEntity> {
    if (!body.password) {
      throw new BadRequestError('Password missing in body');
    }

    if (!validator.isStrongPassword(body.password)) {
      throw new BadRequestError(
        'Password must contain a capital, a lower case, a number and a symbol.'
      );
    }

    const salt = await bcrypt.genSalt(this.config.get<number>('salt'));
    const hash = await bcrypt.hash(body.password, salt);
    body.password = hash;

    const user = await this.userRepo.create(body);
    return UserEntity.buildUser(user);
  }

  public async loginUser(body: IUser): Promise<IUserEntity> {
    const user: IUser = await this.userRepo.findByEmail(body);
    if (!body.password) throw new BadRequestError('Password missing in body');

    if (!user.approved) throw new NotApprovedError('User has not yet been approved');

    const passwordMatch = await bcrypt.compare(body.password, user.password);
    if (!passwordMatch) {
      throw new BadRequestError('Username or password is invalid');
    }

    return UserEntity.buildUser(user);
  }

  public async getUsers(): Promise<IUserEntity[]> {
    const users: IUser[] = await this.userRepo.getList();
    return UserEntity.buildUsers(users);
  }

  public async deleteUser(body: IUser): Promise<IUserEntity | null> {
    const deletedUser: IUser | null = await this.userRepo.deleteByEmail(body);
    if (!deletedUser) {
      throw new NotFoundError(`User with email ${body.email} was not found`);
    }
    return UserEntity.buildUser(deletedUser);
  }

  public async updateUser(username: string, body: IUser): Promise<IUserEntity> {
    const updatedUser: IUser | null = await this.userRepo.updateByUsername(username, body);
    if (!updatedUser) {
      throw new NotFoundError(`User with username ${username} was not found`);
    }
    return UserEntity.buildUser(updatedUser);
  }

  public async forgotPassword(body: IUser): Promise<string> {
    console.log('forgotPassword');
    const email = body.email;

    try {
      await this.userRepo.findByEmail(body);

      const user: IUserEntity = UserEntity.buildUser(await this.userRepo.findByEmail(body));
      const accessToken = generateToken(user);

      let existed = false;
      for (const i in requests) {
        if (email === requests[i].email) {
          requests[i].accessToken = accessToken;
          existed = true;
          break;
        }
      }

      if (!existed) {
        requests.push({ email, accessToken });
        existed = false;
        console.log(requests);
      }
      return accessToken;
    } catch (err) {
      throw new NotFoundError(`User with email ${body.email} was not found`);
    }
  }

  public async resetPassword(token: string, pass: string): Promise<string> {
    let email;
    let found = false;

    for (const i in requests) {
      if (requests[i].accessToken === token) {
        found = true;
        email = requests[i].email;
        break;
      }
    }

    if (found) {
      const salt = await bcrypt.genSalt(this.config.get<number>('salt'));
      const hash = await bcrypt.hash(pass, salt);
      const newPass = hash;
      try {
        await this.userRepo.updateByEmail(email, { password: newPass } as IUser);
        for (const i in requests) if (requests[i].email === email) requests.splice(parseInt(i), 1);
        found = false;
      } catch (err) {
        throw new NotFoundError('Bad Token Request');
      }
      return email;
    } else {
      throw new NotFoundError('Bad Token Request');
    }
  }
}
