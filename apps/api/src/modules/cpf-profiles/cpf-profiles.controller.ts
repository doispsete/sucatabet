import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { CpfProfilesService } from './cpf-profiles.service';
import { CreateCpfProfileDto } from './dto/create-cpf-profile.dto';
import { UpdateCpfProfileDto } from './dto/update-cpf-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('cpf-profiles')
export class CpfProfilesController {
  constructor(private readonly cpfProfilesService: CpfProfilesService) {}

  @Post()
  create(@Request() req, @Body() createCpfProfileDto: CreateCpfProfileDto) {
    return this.cpfProfilesService.create(req.user.userId, createCpfProfileDto);
  }

  @Get()
  findAll(@Request() req, @Query('userId') targetUserId?: string) {
    return this.cpfProfilesService.findAll(req.user.userId, req.user.role, targetUserId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.cpfProfilesService.findOne(id, req.user.userId, req.user.role);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req, @Body() updateCpfProfileDto: UpdateCpfProfileDto) {
    return this.cpfProfilesService.update(id, req.user.userId, req.user.role, updateCpfProfileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.cpfProfilesService.remove(id, req.user.userId, req.user.role);
  }
}
