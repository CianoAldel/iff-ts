import { Request, Response } from "express";
import db from "../../data-source";
import { Users } from "../../entities/Users";
import { Equal, IsNull } from "typeorm";
import { Userinfos } from "../../entities/Userinfos";
import { Addresses } from "../../entities/Addresses";
import { Auctions } from "../../entities/Auctions";
import { Biddings } from "../../entities/Biddings";

interface Bidder {
  role?: string;
  bidder?: string;
}

const userController = {
  index: async (req: Request, res: Response) => {
    const { filter, page } = req.query;
    const pageSize = 100;

    let offset: number;
    let limit: number;

    offset = (Number(page) - 1) * Number(pageSize) || 0;
    limit = Number(pageSize) || 20;

    const where: Bidder = {
      role: "user",
    };

    if (filter) {
      where.bidder = "false";
    }

    const users = await db.getRepository(Users).find({
      where: { role: where.role, bidder: filter ? where.bidder : IsNull() },
      order: { id: "desc" },
      skip: offset,
      take: limit,
    });

    res.json(users);
  },
  update: async (req: Request, res: Response) => {
    const objects: { name: string; firstName: string; lastName: string; phone: string } = req.body;

    const user = await db.getRepository(Users).findOne({
      where: {
        id: req.user!.id,
      },
    });

    user!.name = objects.name;

    if (!user) return res.status(404);

    await db.getRepository(Users).save(user);

    const userInfos = await db.getRepository(Userinfos).findOneBy({
      user_id: req.user!.id,
    });

    if (!userInfos) {
      const myUserInfos = new Userinfos();
      myUserInfos.user_id = req.user!.id;
      myUserInfos.firstName = objects.firstName;
      myUserInfos.lastName = objects.lastName;
      myUserInfos.phone = objects.phone;
      myUserInfos.createdAt = new Date();
      myUserInfos.updatedAt = new Date();
      await db.getRepository(Userinfos).save(myUserInfos);
    } else {
      userInfos.firstName = objects.firstName;
      userInfos.lastName = objects.lastName;
      userInfos.phone = objects.phone;
      await db.getRepository(Userinfos).save(userInfos);
    }

    res.json({ message: "success" });
  },
  address: {
    index: async (req: Request, res: Response) => {
      const { id } = req.user!;
      const addresses = await db.getRepository(Addresses).find({
        order: { createdAt: "DESC" },
        where: {
          user_id: id,
        },
      });

      res.json(addresses);
    },
    create: async (req: Request, res: Response) => {
      const object: {
        name: string;
        phone: string;
        address: string;
        district: string;
        amphoe: string;
        province: string;
        zipcode: string;
      } = req.body;

      const info = `${object.district},${object.amphoe},${object.province},${object.zipcode}`;

      const address = new Addresses();
      address.user_id = req.user!.id;
      address.name = object.name;
      address.phone = object.phone;
      address.address = object.address;
      address.info = info;
      address.createdAt = new Date();
      address.updatedAt = new Date();
      await db.getRepository(Userinfos).save(address);

      res.json({ message: "success" });
    },
    update: async (req: Request, res: Response) => {},
    delete: async (req: Request, res: Response) => {},
  },
  auction: {
    index: async (req: Request, res: Response) => {
      const { id } = req.user!;
      // res.json(query);
      let winner = req.params;

      const query = await db
        .getRepository(Auctions)
        .createQueryBuilder("auctions")
        .innerJoinAndSelect("auctions.biddings", "biddings")
        .innerJoinAndSelect("auctions.products", "products")
        .innerJoinAndSelect("products.productimages", "productimages")
        .select((subquery) => {
          return subquery.from(Biddings, "biddings").select("COUNT(*)").where(`auctions.id = biddings.auction_id`);
        }, "biddingCount")
        .select((subquery) => {
          return subquery.from(Biddings, "biddings").select("SUM(bidding)").where(`auctions.id = biddings.auction_id`);
        }, "totalBidding")
        .where(
          !winner
            ? `((SELECT biddings.user_id FROM Biddings WHERE biddings.auction_id = auctions.id ORDER BY createdAt DESC LIMIT 1) <> ${id})`
            : `((SELECT biddings.user_id FROM Biddings WHERE biddings.auction_id = auctions.id ORDER BY createdAt DESC LIMIT 1) = ${id} AND TIMESTAMPDIFF(SECOND, now(), endDate) <= 0)`
        )
        .getRawAndEntities();

      if ((query.entities.length && query.raw.length) == 0) return res.status(404).json({ message: "ไม่พบข้อมูล" });

      const data = {
        ...query.entities[0],
        biddingCount: query.raw[0].biddingCount as number,
        totalBidding: query.raw[0].totalBidding as number,
      };

      res.json(data);
    },
  },
  delete: async (req: Request, res: Response) => {
    const { id } = req.params;
    await db.getRepository(Users).delete({ id: Number(id) });

    res.json({ message: "success" });
  },
  // verify
  verify: async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await db.getRepository(Users).findOneBy({ id: Number(id) });
    user!.bidder = "true";
    await db.getRepository(Users).save(user!);
    res.json({ message: "success" });
  },

  getByRole: async (req: Request, res: Response) => {
    const resultRole = await db.getRepository(Users).findOne({ where: { role: String(req.query.role) } });

    if (!resultRole) {
      return res.json({ status: false, message: "ไม่พบผู้ใช้บทบาทนี้" });
    }

    res.json({ status: true, data: resultRole });
  },

  getById: async (req: Request, res: Response) => {
    const userById = await db.getRepository(Users).findOne({ where: { id: Number(req.query.id) } });

    if (!userById) {
      return res.json({ status: false, message: "ไม่พบผู้ใช้ไอดีนี้" });
    }

    res.json({ status: true, data: userById });
  },

  gets: async (req: Request, res: Response) => {
    const userList = await db.getRepository(Users).find();

    if (!userList) {
      return res.json({ status: false, message: "ไม่พบผู้ใช้" });
    }

    res.json({ status: true, data: userList });
  },

  updateUser: async (req: Request, res: Response) => {
    const objects: { name: string; displayName: string; role: string; phone: string; email: string } = req.body;

    const user = await db.getRepository(Users).findOne({ where: { id: Number(req.query.id) } });

    if (!user) {
      return res.json({ status: false, message: "ไม่พบผู้ใช้" });
    }

    user.name = objects.name;
    user.displayName = objects.displayName;
    user.email = objects.email;
    user.role = objects.role;

    res.json({ status: true, message: "อัพเดทผู้ใช้สำเร็จแล้ว" });
  },
};

export default userController;
