import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { OperationsService } from './operations.service';
import { CreateOperationDto, CloseOperationDto } from './dto/operation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('operations')
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}
  
  @Patch(':id/update-score')
  updateScore(@Param('id') id: string, @Request() req, @Body() data: any) {
    return this.operationsService.updateScore(id, req.user.userId, data);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    return this.operationsService.findAll(
      req.user.userId, 
      req.user.role,
      { 
        page: page ? parseInt(page) : 1, 
        limit: limit ? parseInt(limit) : 20,
        status: status as any,
        startDate,
        endDate,
        search,
      }
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.operationsService.findOne(id, req.user.userId, req.user.role);
  }

  @Post()
  create(@Request() req, @Body() createOperationDto: CreateOperationDto) {
    return this.operationsService.create(req.user.userId, createOperationDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req, @Body() updateDto: CreateOperationDto) {
    return this.operationsService.update(id, req.user.userId, req.user.role, updateDto);
  }

  @Patch(':id/close')
  close(@Param('id') id: string, @Request() req, @Body() closeDto: CloseOperationDto) {
    return this.operationsService.close(id, req.user.userId, req.user.role, closeDto);
  }

  @Patch(':id/void')
  void(@Param('id') id: string, @Request() req) {
    return this.operationsService.void(id, req.user.userId, req.user.role);
  }

  @Patch(':id/link-game')
  linkGame(@Param('id') id: string, @Request() req, @Body() body: { sofascoreEventId: string }) {
    return this.operationsService.linkGame(id, req.user.userId, req.user.role, body.sofascoreEventId);
  }


  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.operationsService.remove(id, req.user.userId, req.user.role);
  }
}
