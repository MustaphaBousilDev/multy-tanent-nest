import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { EntityManager, Repository } from 'typeorm';
import { CreateTenantDto, ReadTenantDto } from './dto';
import { Tenancy } from './tenancy.entity';

@Injectable()
export class TenancyService {
  constructor(
    @InjectRepository(Tenancy)
    private readonly tenantRepository: Repository<Tenancy>,
  ) {}

  async findAll(): Promise<ReadTenantDto[]> {
    // const tenants = await this.tenantRepository.find();

    // return tenants.map((tenant) => plainToClass(ReadTenantDto, tenant));
    return this.tenantRepository.find();
  }

  async findOne(name: string) {
    return await this.tenantRepository.findOne({ where: { name } });
  }

  async create(tenant: CreateTenantDto): Promise<ReadTenantDto> {
    const createdTenant = await this.tenantRepository.save(tenant);

    return plainToClass(ReadTenantDto, createdTenant);
  }
}
