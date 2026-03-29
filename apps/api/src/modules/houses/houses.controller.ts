import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { HousesService } from './houses.service';
import { CreateHouseDto, UpdateHouseDto } from './dto/house.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('houses')
export class HousesController {
  constructor(private readonly housesService: HousesService) {}

  @Get()
  findAll() {
    return this.housesService.findAll();
  }

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Req() req: any, @Body() createHouseDto: CreateHouseDto) {
    return this.housesService.create(req.user.userId, createHouseDto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Req() req: any, @Body() updateHouseDto: UpdateHouseDto) {
    return this.housesService.update(id, req.user.userId, updateHouseDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.housesService.remove(id, req.user.userId);
  }
}
