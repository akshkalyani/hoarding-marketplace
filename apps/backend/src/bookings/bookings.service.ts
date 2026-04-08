import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async findMine(user: User) {
    const bookings = await this.prisma.booking.findMany({
      where: { userId: user.id },
      orderBy: { startDate: 'desc' },
      include: {
        listing: {
          select: { id: true, title: true },
        },
      },
    });

    return bookings.map((b) => ({
      id: b.id,
      listingId: b.listingId,
      userId: b.userId,
      startDate: b.startDate.toISOString(),
      endDate: b.endDate.toISOString(),
      listing: b.listing ? { title: b.listing.title } : undefined,
      createdAt: b.createdAt.toISOString(),
    }));
  }
}
