import prisma from '../prisma.js';

export const getOwnerDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find the store owned by this user
    const store = await prisma.store.findFirst({
      where: { ownerId: userId },
      include: {
        ratings: {
          select: {
            id: true,
            rating: true,
          },
        },
      },
    });

    if (!store) {
      return res.status(200).json({
        success: true,
        message: 'No store currently associated with this owner account.',
        data: {
          store: null,
          averageRating: 0,
          totalRatings: 0,
        },
      });
    }

    const totalRatings = store.ratings.length;
    const sum = store.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = totalRatings > 0 ? Number((sum / totalRatings).toFixed(1)) : 0;

    // Rating distribution (1 to 5 stars)
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    store.ratings.forEach((r) => {
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating]++;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        store: {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address,
        },
        averageRating,
        totalRatings,
        distribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getOwnerRatings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    // Find store owned by user
    const store = await prisma.store.findFirst({
      where: { ownerId: userId },
    });

    if (!store) {
      return res.status(200).json({
        success: true,
        data: {
          ratings: [],
          pagination: {
            total: 0,
            page: pageNum,
            limit: limitNum,
            totalPages: 0,
          },
        },
      });
    }

    const where = {
      storeId: store.id,
    };

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
        ],
      };
    }

    const validSortFields = ['rating', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const [totalCount, ratings] = await Promise.all([
      prisma.rating.count({ where }),
      prisma.rating.findMany({
        where,
        select: {
          id: true,
          rating: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { [sortField]: order },
        skip,
        take: limitNum,
      }),
    ]);

    const formattedRatings = ratings.map((r) => ({
      id: r.id,
      rating: r.rating,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      userName: r.user.name,
      userEmail: r.user.email,
    }));

    res.status(200).json({
      success: true,
      data: {
        store: {
          id: store.id,
          name: store.name,
        },
        ratings: formattedRatings,
        pagination: {
          total: totalCount,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalCount / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
