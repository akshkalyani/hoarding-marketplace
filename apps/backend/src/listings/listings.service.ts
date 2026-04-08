import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { serializeUser } from '../common/utils/serialize';
import { CreateListingDto, UpdateListingDto } from './dto/create-listing.dto';
import { FilterListingsDto } from './dto/filter-listings.dto';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class ListingsService {
  constructor(private prisma: PrismaService) {}

  private serializeListing(listing: any) {
    return {
      ...listing,
      owner: listing.owner ? serializeUser(listing.owner) : undefined,
      createdAt: listing.createdAt?.toISOString?.() ?? listing.createdAt,
      updatedAt: listing.updatedAt?.toISOString?.() ?? listing.updatedAt,
      images: (listing.images || []).map((img: any) => ({
        id: img.id,
        url: img.url,
        listingId: img.listingId,
      })),
      bookings: (listing.bookings || []).map((b: any) => ({
        id: b.id,
        listingId: b.listingId,
        userId: b.userId,
        startDate: b.startDate?.toISOString?.() ?? b.startDate,
        endDate: b.endDate?.toISOString?.() ?? b.endDate,
        createdAt: b.createdAt?.toISOString?.() ?? b.createdAt,
      })),
    };
  }

  async findAll(filters: FilterListingsDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ListingWhereInput = {
      status: 'LIVE', // only show live listings in marketplace
    };

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }

    if (filters.landmarks) {
      const landmarkList = filters.landmarks.split(',').map((l) => l.trim());
      where.landmarks = { hasSome: landmarkList };
    }

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        include: {
          images: true,
          owner: true,
        },
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      data: listings.map((l) => this.serializeListing(l)),
      total,
      page,
      limit,
    };
  }

  async findMine(userId: string) {
    const listings = await this.prisma.listing.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
      include: { images: true },
    });
    return listings.map((l) => this.serializeListing(l));
  }

  async findOne(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        images: true,
        owner: true,
        bookings: true,
      },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    return this.serializeListing(listing);
  }

  async create(dto: CreateListingDto, user: User) {
    const listing = await this.prisma.listing.create({
      data: {
        ownerId: user.id,
        title: dto.title,
        description: dto.description,
        type: dto.type,
        price: dto.price,
        landmarks: dto.landmarks,
        latitude: dto.latitude,
        longitude: dto.longitude,
        status: 'DRAFT',
        availableFrom: dto.availableFrom ? new Date(dto.availableFrom) : null,
        availableTo: dto.availableTo ? new Date(dto.availableTo) : null,
      },
      include: { images: true },
    });
    return this.serializeListing(listing);
  }

  async update(id: string, dto: UpdateListingDto, user: User) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.ownerId !== user.id) throw new ForbiddenException('Not your listing');

    const data: any = { ...dto };
    if (dto.availableFrom) data.availableFrom = new Date(dto.availableFrom);
    if (dto.availableTo) data.availableTo = new Date(dto.availableTo);

    const updated = await this.prisma.listing.update({
      where: { id },
      data,
      include: { images: true, owner: true, bookings: true },
    });
    return this.serializeListing(updated);
  }

  async remove(id: string, user: User) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.ownerId !== user.id && !user.roles.includes('ADMIN')) {
      throw new ForbiddenException('Not your listing');
    }

    await this.prisma.listing.delete({ where: { id } });
  }

  async uploadImages(listingId: string, files: Express.Multer.File[], user: User) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.ownerId !== user.id) throw new ForbiddenException('Not your listing');

    const images = await Promise.all(
      files.map((file) =>
        this.prisma.listingImage.create({
          data: {
            listingId,
            url: `/uploads/${file.filename}`,
          },
        }),
      ),
    );

    return images.map((img) => ({
      id: img.id,
      url: img.url,
      listingId: img.listingId,
    }));
  }

  async submit(id: string, user: User) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.ownerId !== user.id) throw new ForbiddenException('Not your listing');
    if (listing.status !== 'DRAFT') {
      throw new BadRequestException('Only draft listings can be submitted');
    }

    await this.prisma.listing.update({
      where: { id },
      data: { status: 'PENDING' },
    });

    return { message: 'Listing submitted for approval' };
  }
}
