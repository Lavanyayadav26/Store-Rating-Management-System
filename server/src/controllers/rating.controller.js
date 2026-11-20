import prisma from '../prisma.js';

export const submitRating = async (req, res, next) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user.id;

    // Check if store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.',
      });
    }

    // Upsert rating: If rating exists for this user and store, update it; otherwise create a new one.
    const savedRating = await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
      update: {
        rating,
      },
      create: {
        userId,
        storeId,
        rating,
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully.',
      data: {
        rating: savedRating,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateRating = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    const existingRating = await prisma.rating.findUnique({
      where: { id },
    });

    if (!existingRating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found.',
      });
    }

    // Security check: Only the owner of the rating can update it
    if (existingRating.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot modify another user\'s rating.',
      });
    }

    const updatedRating = await prisma.rating.update({
      where: { id },
      data: { rating },
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Rating updated successfully.',
      data: {
        rating: updatedRating,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyRatings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const [totalCount, ratings] = await Promise.all([
      prisma.rating.count({ where: { userId } }),
      prisma.rating.findMany({
        where: { userId },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              email: true,
              address: true,
              ratings: {
                select: {
                  rating: true,
                },
              },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    const formattedRatings = ratings.map((r) => {
      const storeRatings = r.store.ratings;
      const count = storeRatings.length;
      const sum = storeRatings.reduce((acc, curr) => acc + curr.rating, 0);
      const overallRating = count > 0 ? Number((sum / count).toFixed(1)) : 0;

      return {
        id: r.id,
        rating: r.rating,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        store: {
          id: r.store.id,
          name: r.store.name,
          email: r.store.email,
          address: r.store.address,
          overallRating,
          totalRatings: count,
        },
      };
    });

    res.status(200).json({
      success: true,
      data: {
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
