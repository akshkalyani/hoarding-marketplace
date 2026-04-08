import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { serializeUser } from '../common/utils/serialize';
import { User } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  private serializeMessage(msg: any) {
    return {
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      sender: msg.sender ? serializeUser(msg.sender) : undefined,
      content: msg.content,
      createdAt: msg.createdAt?.toISOString?.() ?? msg.createdAt,
    };
  }

  private serializeListing(listing: any) {
    if (!listing) return null;
    return {
      id: listing.id,
      ownerId: listing.ownerId,
      title: listing.title,
      description: listing.description,
      type: listing.type,
      price: listing.price,
      landmarks: listing.landmarks,
      latitude: listing.latitude,
      longitude: listing.longitude,
      images: (listing.images || []).map((img: any) => ({
        id: img.id,
        url: img.url,
        listingId: img.listingId,
      })),
      status: listing.status,
      isFeatured: listing.isFeatured,
      createdAt: listing.createdAt?.toISOString?.() ?? listing.createdAt,
      updatedAt: listing.updatedAt?.toISOString?.() ?? listing.updatedAt,
    };
  }

  private serializeConversation(conv: any) {
    return {
      id: conv.id,
      offerId: conv.offerId || null,
      listingId: conv.listingId || null,
      listing: this.serializeListing(conv.listing),
      offer: conv.offer
        ? {
            id: conv.offer.id,
            listings: (conv.offer.offerListings || []).map((ol: any) => ({
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
            })),
          }
        : null,
      participants: (conv.participants || []).map((p: any) => serializeUser(p)),
      messages: (conv.messages || []).map((m: any) => this.serializeMessage(m)),
      createdAt: conv.createdAt?.toISOString?.() ?? conv.createdAt,
    };
  }

  private conversationIncludes() {
    return {
      participants: true,
      listing: {
        include: { images: true },
      },
      offer: {
        include: {
          offerListings: {
            include: { listing: { include: { images: true } } },
          },
        },
      },
    };
  }

  async findAll(user: User) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: { some: { id: user.id } },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        ...this.conversationIncludes(),
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return conversations.map((c) => this.serializeConversation(c));
  }

  async findOne(id: string, user: User) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        ...this.conversationIncludes(),
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: true },
        },
      },
    });

    if (!conv) throw new NotFoundException('Conversation not found');

    const isParticipant = conv.participants.some((p) => p.id === user.id);
    if (!isParticipant) throw new ForbiddenException('Access denied');

    return this.serializeConversation(conv);
  }

  async startListingConversation(listingId: string, user: User) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.ownerId === user.id) {
      throw new BadRequestException('Cannot start a conversation with yourself');
    }

    // Check if a conversation already exists between these users for this listing
    const existing = await this.prisma.conversation.findFirst({
      where: {
        listingId,
        AND: [
          { participants: { some: { id: user.id } } },
          { participants: { some: { id: listing.ownerId } } },
        ],
      },
      include: {
        ...this.conversationIncludes(),
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: true },
        },
      },
    });

    if (existing) {
      return this.serializeConversation(existing);
    }

    // Create new conversation linked to the listing
    const conv = await this.prisma.conversation.create({
      data: {
        listingId,
        participants: {
          connect: [{ id: user.id }, { id: listing.ownerId }],
        },
      },
      include: {
        ...this.conversationIncludes(),
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: true },
        },
      },
    });

    return this.serializeConversation(conv);
  }

  async sendMessage(conversationId: string, content: string, user: User) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    });

    if (!conv) throw new NotFoundException('Conversation not found');

    const isParticipant = conv.participants.some((p) => p.id === user.id);
    if (!isParticipant) throw new ForbiddenException('Access denied');

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        content,
      },
    });

    return this.serializeMessage(message);
  }
}
