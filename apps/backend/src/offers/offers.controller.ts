import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto, CounterOfferDto } from './dto/create-offer.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('offers')
@UseGuards(JwtAuthGuard)
export class OffersController {
  constructor(private offersService: OffersService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.offersService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.offersService.findOne(id, user);
  }

  @Post()
  create(@Body() dto: CreateOfferDto, @CurrentUser() user: any) {
    return this.offersService.create(dto, user);
  }

  @Post(':id/accept')
  accept(@Param('id') id: string, @CurrentUser() user: any) {
    return this.offersService.accept(id, user);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @CurrentUser() user: any) {
    return this.offersService.reject(id, user);
  }

  @Post(':id/counter')
  counter(
    @Param('id') id: string,
    @Body() dto: CounterOfferDto,
    @CurrentUser() user: any,
  ) {
    return this.offersService.counter(id, dto, user);
  }
}
