import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { serializeUser } from '../common/utils/serialize';
import { CreateOfferDto, CounterOfferDto } from './dto/create-offer.dto';
import { User } from '@prisma/client';

@Injectable()
export class OffersService {
  constructor(private prisma: PrismaService) {}

  private serializeOffer(offer: any) {
    return {
      id: offer.id,
      senderId: offer.senderId,
      receiverId: offer.receiverId,
      sender: offer.sender ? serializeUser(offer.sender) : undefined,
      receiver: offer.receiver ? serializeUser(offer.receiver) : undefined,
      listings: (offer.offerListings || []).map((ol: any) => ({
        id: ol.listing.id,
        ownerId: ol.listing.ownerId,
        title: ol.listing.title,
        description: ol.listing.description,
        type: ol.listing.type,
        price: ol.listing.price,
        landmarks: ol.listing.landmarks,
        latitude: ol.listing.latitude,
        longitude: ol.listing.longitude,
        images: (ol.listing.images || []).map((img: any) => ({
          id: img.id,
          url: img.url,
          listingId: img.listingId,
        })),
        status: ol.listing.status,
        isFeatured: ol.listing.isFeatured,
        createdAt: ol.listing.createdAt?.toISOString?.() ?? ol.listing.createdAt,
        updatedAt: ol.listing.updatedAt?.toISOString?.() ?? ol.listing.updatedAt,
      })),
      totalPrice: offer.totalPrice,
      negotiatedPrice: offer.negotiatedPrice,
      status: offer.status,
      conversationId: offer.conversation?.id || null,
      createdAt: offer.createdAt?.toISOString?.() ?? offer.createdAt,
      updatedAt: offer.updatedAt?.toISOString?.() ?? offer.updatedAt,
    };
  }

  private offerIncludes() {
    return {
      sender: true,
      receiver: true,
      conversation: true,
      offerListings: {
        include: {
          listing: {
            include: { images: true },
          },
        },
      },
    };
  }

  async findAll(user: User) {
    const offers = await this.prisma.offer.findMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
      orderBy: { createdAt: 'desc' },
      include: this.offerIncludes(),
    });
    return offers.map((o) => this.serializeOffer(o));
  }

  async findOne(id: string, user: User) {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
      include: this.offerIncludes(),
    });
    if (!offer) throw new NotFoundException('Offer not found');
    if (offer.senderId !== user.id && offer.receiverId !== user.id) {
      throw new ForbiddenException('Access denied');
    }
    return this.serializeOffer(offer);
  }

  async create(dto: CreateOfferDto, user: User) {
    // Verify all listings exist
    const listings = await this.prisma.listing.findMany({
      where: { id: { in: dto.listingIds } },
    });
    if (listings.length !== dto.listingIds.length) {
      throw new BadRequestException('Some listings not found');
    }

    // Determine receiverId: use provided value, or auto-derive from first listing owner
    const receiverId = dto.receiverId || listings[0]?.ownerId;
    if (!receiverId) {
      throw new BadRequestException('Receiver ID is required');
    }

    // Verify receiver exists
    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
    });
    if (!receiver) {
      throw new BadRequestException('Receiver not found');
    }

    if (receiverId === user.id) {
      throw new BadRequestException('Cannot send an offer to yourself');
    }

    // Create offer + conversation in a transaction
    const offer = await this.prisma.$transaction(async (tx) => {
      const newOffer = await tx.offer.create({
        data: {
          senderId: user.id,
          receiverId,
          totalPrice: dto.totalPrice,
          negotiatedPrice: dto.negotiatedPrice || null,
          status: 'PENDING',
          offerListings: {
            create: dto.listingIds.map((listingId) => ({ listingId })),
          },
        },
      });

      // Auto-create conversation linked to offer
      await tx.conversation.create({
        data: {
          offerId: newOffer.id,
          participants: {
            connect: [{ id: user.id }, { id: receiverId }],
          },
        },
      });

      return tx.offer.findUnique({
        where: { id: newOffer.id },
        include: this.offerIncludes(),
      });
    });

    return this.serializeOffer(offer);
  }

  async accept(id: string, user: User) {
    const offer = await this.prisma.offer.findUnique({ where: { id } });
    if (!offer) throw new NotFoundException('Offer not found');
    if (offer.receiverId !== user.id) throw new ForbiddenException('Only receiver can accept');
    if (offer.status !== 'PENDING' && offer.status !== 'COUNTERED') {
      throw new BadRequestException('Offer cannot be accepted');
    }

    await this.prisma.offer.update({
      where: { id },
      data: { status: 'ACCEPTED' },
    });

    return { message: 'Offer accepted' };
  }

  async reject(id: string, user: User) {
    const offer = await this.prisma.offer.findUnique({ where: { id } });
    if (!offer) throw new NotFoundException('Offer not found');
    if (offer.receiverId !== user.id) throw new ForbiddenException('Only receiver can reject');
    if (offer.status !== 'PENDING' && offer.status !== 'COUNTERED') {
      throw new BadRequestException('Offer cannot be rejected');
    }

    await this.prisma.offer.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    return { message: 'Offer rejected' };
  }

  async counter(id: string, dto: CounterOfferDto, user: User) {
    const offer = await this.prisma.offer.findUnique({ where: { id } });
    if (!offer) throw new NotFoundException('Offer not found');
    if (offer.receiverId !== user.id && offer.senderId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.offer.update({
      where: { id },
      data: {
        negotiatedPrice: dto.negotiatedPrice,
        status: 'COUNTERED',
      },
    });

    return { message: 'Counter offer sent' };
  }
}
