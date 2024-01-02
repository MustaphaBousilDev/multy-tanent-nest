import {
  BadRequestException,
  MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
import { TenancyController } from './tenancy.controller';
import { TenancyService } from './tenancy.service';
import { Tenancy } from './tenancy.entity';
import { NextFunction, Request } from 'express';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Connection, createConnection, getConnection } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { TenantProvider } from './tenancy.provider';
import { User } from 'src/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tenancy])],
  providers: [TenancyService, TenantProvider],
  exports: [TenantProvider],
  controllers: [TenancyController],
})
export class TenancyModule {
  constructor(
    private readonly connection: Connection,
    private readonly configService: ConfigService,
    private readonly tenantService: TenancyService,
  ) {}

  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(async (req: Request, res: Response, next: NextFunction) => {
        const name: string = req.params['tenant'];
        const tenant: Tenancy = await this.tenantService.findOne(name);

        if (!tenant) {
          throw new BadRequestException(
            'Database Connection Error',
            'This tenant does not exists',
          );
        }

        try {
          getConnection(tenant.name);
          next();
        } catch (e) {
          await this.connection.query(
            `CREATE DATABASE IF NOT EXISTS ${tenant.name}`,
          );

          const createdConnection: Connection = await createConnection({
            name: tenant.name,
            type: 'mysql',
            host: this.configService.get('DB_HOST'),
            port: +this.configService.get('DB_PORT'),
            username: this.configService.get('DB_USER'),
            password: this.configService.get('DB_PASSWORD'),
            database: tenant.name,
            entities: [User], // Add User Entity
            ssl: true,
            synchronize: true,
          });

          if (createdConnection) {
            next();
          } else {
            throw new BadRequestException(
              'Database Connection Error',
              'There is a Error with the Database!',
            );
          }
        }
      })
      .exclude({ path: '/api/tenants', method: RequestMethod.ALL })
      .forRoutes('*');
  }
}
