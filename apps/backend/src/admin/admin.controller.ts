import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users/pending')
  getPendingUsers() {
    return this.adminService.getPendingUsers();
  }

  @Get('listings/pending')
  getPendingListings() {
    return this.adminService.getPendingListings();
  }

  @Post('users/:id/approve')
  approveUser(@Param('id') id: string, @CurrentUser() admin: any) {
    return this.adminService.approveUser(id, admin);
  }

  @Post('users/:id/reject')
  rejectUser(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @CurrentUser() admin: any,
  ) {
    return this.adminService.rejectUser(id, body.reason, admin);
  }

  @Post('listings/:id/approve')
  approveListing(@Param('id') id: string, @CurrentUser() admin: any) {
    return this.adminService.approveListing(id, admin);
  }

  @Post('listings/:id/reject')
  rejectListing(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @CurrentUser() admin: any,
  ) {
    return this.adminService.rejectListing(id, body.reason, admin);
  }
}
