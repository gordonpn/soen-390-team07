// Inversify stuff
import { Container } from 'inversify';
import TYPES from './constants/types';

// Config package binds the config/default.js file
import config, { IConfig } from 'config';

// Controllers import autobinds them to the application
import './controllers/BikeController';
import './controllers/UserController';
import './controllers/MaterialController';

// Services (make sure to bind it to a singleton)
import { BikeService } from './services/BikeService';
import { UserService } from './services/UserService';
import { MaterialService } from './services/MaterialService';

// repositories
import { BikeRepository } from './repository/BikeRepository';
import { UserRepository } from './repository/UserRepository';
import { MaterialRepository } from './repository/MaterialRepository';

// utils
import winston, { Logger } from 'winston';
import { MongoConnection } from './utils/MongoConnection';

const logger: Logger = winston.createLogger({});
// just for dev purposes now
logger.add(
  new winston.transports.Console({
    format: winston.format.simple(),
  })
);

// Global container
const container = new Container();

container.bind<IConfig>(TYPES.config).toConstantValue(config);
container.bind<Logger>(TYPES.logger).toConstantValue(logger);

const mongoConnection = new MongoConnection(config);
container.bind<MongoConnection>(TYPES.MongoConnection).toConstantValue(mongoConnection);

container.bind<BikeService>(TYPES.BikeService).to(BikeService).inSingletonScope();
container.bind<BikeRepository>(TYPES.BikeRepository).to(BikeRepository).inSingletonScope();
container.bind<UserService>(TYPES.UserService).to(UserService).inSingletonScope();
container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope();
container.bind<MaterialService>(TYPES.MaterialService).to(MaterialService).inSingletonScope();
container
  .bind<MaterialRepository>(TYPES.MaterialRepository)
  .to(MaterialRepository)
  .inSingletonScope();
export { container };
