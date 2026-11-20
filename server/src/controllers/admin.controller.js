import prisma from '../prisma.js';
import { hashPassword } from '../utils/password.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalStores,
        totalRatings,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const {
      search = '',
      name = '',
      email = '',
      address = '',
      role = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (role && ['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'].includes(role)) {
      where.role = role;
    }

    if (name) {
      where.name = { contains: name };
    }

    if (email) {
      where.email = { contains: email };
    }

    if (address) {
      where.address = { contains: address };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { address: { contains: search } },
      ];
    }

    const validSortFields = ['name', 'email', 'address', 'role', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const [totalCount, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          role: true,
          createdAt: true,
          ownedStores: {
            select: {
              id: true,
              name: true,
              ratings: {
                select: {
                  rating: true,
                },
              },
            },
          },
        },
        orderBy: { [sortField]: order },
        skip,
        take: limitNum,
      }),
    ]);

    // Format users with store rating for store owners
    const formattedUsers = users.map((user) => {
      let storeRating = null;
      let storeName = null;

      if (user.role === 'STORE_OWNER' && user.ownedStores.length > 0) {
        const store = user.ownedStores[0];
        storeName = store.name;
        if (store.ratings.length > 0) {
          const sum = store.ratings.reduce((acc, curr) => acc + curr.rating, 0);
          storeRating = Number((sum / store.ratings.length).toFixed(1));
        } else {
          storeRating = 0;
        }
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        createdAt: user.createdAt,
        storeRating,
        storeName,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        users: formattedUsers,
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

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        ownedStores: {
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
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    let storeRating = null;
    let storeDetails = null;

    if (user.role === 'STORE_OWNER' && user.ownedStores.length > 0) {
      const store = user.ownedStores[0];
      const count = store.ratings.length;
      const sum = store.ratings.reduce((acc, curr) => acc + curr.rating, 0);
      const avg = count > 0 ? Number((sum / count).toFixed(1)) : 0;

      storeRating = avg;
      storeDetails = {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: avg,
        totalRatings: count,
      };
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          address: user.address,
          role: user.role,
          createdAt: user.createdAt,
          storeRating,
          store: storeDetails,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, address, role } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        address,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const getStores = async (req, res, next) => {
  try {
    const {
      search = '',
      name = '',
      email = '',
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

    if (email) {
      where.email = { contains: email };
    }

    if (address) {
      where.address = { contains: address };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { address: { contains: search } },
      ];
    }

    const validSortFields = ['name', 'email', 'address', 'createdAt'];
    const isSortingByRating = sortBy === 'rating';
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

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
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          ratings: {
            select: {
              rating: true,
            },
          },
        },
        ...(isSortingByRating ? {} : { orderBy: { [sortField]: order } }),
      }),
    ]);

    // Calculate dynamic average rating
    let formattedStores = stores.map((store) => {
      const count = store.ratings.length;
      const sum = store.ratings.reduce((acc, curr) => acc + curr.rating, 0);
      const overallRating = count > 0 ? Number((sum / count).toFixed(1)) : 0;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        createdAt: store.createdAt,
        owner: store.owner,
        overallRating,
        totalRatings: count,
      };
    });

    if (isSortingByRating) {
      formattedStores.sort((a, b) => {
        return order === 'asc'
          ? a.overallRating - b.overallRating
          : b.overallRating - a.overallRating;
      });
    }

    const paginatedStores = isSortingByRating
      ? formattedStores.slice(skip, skip + limitNum)
      : formattedStores.slice(skip, skip + limitNum);

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

export const createStore = async (req, res, next) => {
  try {
    const { name, email, address, ownerId } = req.body;

    // Check if ownerId is provided, verify it exists and is STORE_OWNER
    if (ownerId) {
      const owner = await prisma.user.findUnique({
        where: { id: ownerId },
      });

      if (!owner) {
        return res.status(400).json({
          success: false,
          message: 'Selected store owner does not exist.',
        });
      }

      if (owner.role !== 'STORE_OWNER') {
        return res.status(400).json({
          success: false,
          message: 'The selected user does not have the STORE_OWNER role.',
        });
      }
    }

    const store = await prisma.store.create({
      data: {
        name,
        email: email.toLowerCase(),
        address,
        ownerId: ownerId || null,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Store created successfully.',
      data: {
        store: {
          ...store,
          overallRating: 0,
          totalRatings: 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
