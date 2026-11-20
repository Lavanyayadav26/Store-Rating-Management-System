import prisma from '../prisma.js';

export const getStores = async (req, res, next) => {
  try {
    const {
      search = '',
      name = '',
      address = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (name) {
      where.name = { contains: name };
    }

    if (address) {
      where.address = { contains: address };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { address: { contains: search } },
      ];
    }

    const currentUserId = req.user ? req.user.id : null;

    const [totalCount, stores] = await Promise.all([
      prisma.store.count({ where }),
      prisma.store.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          createdAt: true,
          ratings: {
            select: {
              id: true,
              userId: true,
              rating: true,
            },
          },
        },
      }),
    ]);

    // Format stores with dynamic average rating and current user's submitted rating
    let formattedStores = stores.map((store) => {
      const count = store.ratings.length;
      const sum = store.ratings.reduce((acc, curr) => acc + curr.rating, 0);
      const overallRating = count > 0 ? Number((sum / count).toFixed(1)) : 0;

      let userRating = null;
      let userRatingId = null;

      if (currentUserId) {
        const foundRating = store.ratings.find((r) => r.userId === currentUserId);
        if (foundRating) {
          userRating = foundRating.rating;
          userRatingId = foundRating.id;
        }
      }

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        createdAt: store.createdAt,
        overallRating,
        totalRatings: count,
        userRating,
        userRatingId,
      };
    });

    const isSortingByRating = sortBy === 'rating';
    const validSortFields = ['name', 'address', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    if (isSortingByRating) {
      formattedStores.sort((a, b) => {
        return order === 'asc'
          ? a.overallRating - b.overallRating
          : b.overallRating - a.overallRating;
      });
    } else {
      formattedStores.sort((a, b) => {
        if (a[sortField] < b[sortField]) return order === 'asc' ? -1 : 1;
        if (a[sortField] > b[sortField]) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const paginatedStores = formattedStores.slice(skip, skip + limitNum);

    res.status(200).json({
      success: true,
      data: {
        stores: paginatedStores,
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

export const getStoreById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user ? req.user.id : null;

    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        ratings: {
          select: {
            id: true,
            userId: true,
            rating: true,
          },
        },
      },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.',
      });
    }

    const count = store.ratings.length;
    const sum = store.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    const overallRating = count > 0 ? Number((sum / count).toFixed(1)) : 0;

    let userRating = null;
    let userRatingId = null;

    if (currentUserId) {
      const foundRating = store.ratings.find((r) => r.userId === currentUserId);
      if (foundRating) {
        userRating = foundRating.rating;
        userRatingId = foundRating.id;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        store: {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address,
          overallRating,
          totalRatings: count,
          userRating,
          userRatingId,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
