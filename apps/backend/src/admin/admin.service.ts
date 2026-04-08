import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { serializeUser } from '../common/utils/serialize';
import { User } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getPendingUsers() {
    const users = await this.prisma.user.findMany({
      where: { isVerified: false, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return users.map(serializeUser);
  }

  async getPendingListings() {
    const listings = await this.prisma.listing.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: { owner: true, images: true },
    });
    return listings.map((l) => ({
      ...l,
      owner: l.owner ? serializeUser(l.owner) : undefined,
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
      images: l.images.map((img) => ({
        id: img.id,
        url: img.url,
        listingId: img.listingId,
      })),
    }));
  }

  async approveUser(id: string, admin: User) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id },
        data: { isVerified: true },
      }),
      this.prisma.adminAction.create({
        data: {
          adminId: admin.id,
          action: 'APPROVE_USER',
          targetUserId: id,
        },
      }),
    ]);

    return { message: 'User approved' };
  }

  async rejectUser(id: string, reason: string | undefined, admin: User) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id },
        data: { isActive: false },
      }),
      this.prisma.adminAction.create({
        data: {
          adminId: admin.id,
          action: 'REJECT_USER',
          targetUserId: id,
          reason,
        },
      }),
    ]);

    return { message: 'User rejected' };
  }

  async approveListing(id: string, admin: User) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.status !== 'PENDING') {
      throw new BadRequestException('Listing is not pending approval');
    }

    await this.prisma.$transaction([
      this.prisma.listing.update({
        where: { id },
        data: { status: 'LIVE' },
      }),
      this.prisma.adminAction.create({
        data: {
          adminId: admin.id,
          action: 'APPROVE_LISTING',
          targetListingId: id,
        },
      }),
    ]);

    return { message: 'Listing approved and now live' };
  }

  async rejectListing(id: string, reason: string | undefined, admin: User) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.status !== 'PENDING') {
      throw new BadRequestException('Listing is not pending approval');
    }

    await this.prisma.$transaction([
      this.prisma.listing.update({
        where: { id },
        data: { status: 'REJECTED' },
      }),
      this.prisma.adminAction.create({
        data: {
          adminId: admin.id,
          action: 'REJECT_LISTING',
          targetListingId: id,
          reason,
        },
      }),
    ]);

    return { message: 'Listing rejected' };
  }
}
