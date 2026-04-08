import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(user: User) {
    const [totalListings, activeListings, totalBookings, totalDeals, revenueResult] =
      await Promise.all([
        this.prisma.listing.count({ where: { ownerId: user.id } }),
        this.prisma.listing.count({
          where: { ownerId: user.id, status: 'LIVE' },
        }),
        this.prisma.booking.count({ where: { userId: user.id } }),
        this.prisma.offer.count({
          where: {
            OR: [{ senderId: user.id }, { receiverId: user.id }],
          },
        }),
        this.prisma.booking.findMany({
          where: {
            listing: { ownerId: user.id },
          },
          include: {
            listing: { select: { price: true } },
          },
        }),
      ]);

    const estimatedRevenue = revenueResult.reduce(
      (sum, b) => sum + (b.listing?.price || 0),
      0,
    );

    return {
      totalListings,
      activeListings,
      totalBookings,
      totalDeals,
      estimatedRevenue,
    };
  }
}
