import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { FreebetsService } from './freebets.service';
import { CreateFreebetDto, UpdateFreebetDto } from './dto/freebet.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('freebets')
export class FreebetsController {
  constructor(private readonly freebetsService: FreebetsService) {}

  @Get()
  findAll(@Request() req) {
    return this.freebetsService.findAll(req.user.userId, req.user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.freebetsService.findOne(id, req.user.userId, req.user.role);
  }

  @Post()
  create(@Request() req, @Body() createFreebetDto: CreateFreebetDto) {
    return this.freebetsService.create(req.user.userId, createFreebetDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req, @Body() updateFreebetDto: UpdateFreebetDto) {
    return this.freebetsService.update(id, req.user.userId, req.user.role, updateFreebetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.freebetsService.remove(id, req.user.userId, req.user.role);
  }
}
