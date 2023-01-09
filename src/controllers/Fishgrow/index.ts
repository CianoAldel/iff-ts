import { Request, Response } from "express";
import db from "../../data-source";
import { Fishgrow } from "../../entities/Fishgrow";
import { FishGrowType } from "../../interface/FishGrow";
import { TypedRequest } from "../../interface/TypedRequest";

const fishgrowController = {
  show: async (req: Request, res: Response) => {
    const data = await db.getRepository(Fishgrow).find({
      relations: {
        products: true,
      },
    });

    res.json(data);
  },

  add: async (req: TypedRequest<FishGrowType>, res: Response) => {
    const fishgrow = new Fishgrow();

    fishgrow.products_id = req.body.products_id;
    fishgrow.width = req.body.width;
    fishgrow.length = req.body.length;
    fishgrow.grade = req.body.grade;
    fishgrow.weight = req.body.weight;
    fishgrow.note = req.body.note;
    fishgrow.status = req.body.status;
    fishgrow.createdAt = new Date();
    fishgrow.updatedAt = new Date();

    await db.getRepository(Fishgrow).save(fishgrow);
  },

  delete: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await db.getRepository(Fishgrow).delete({ id: id });

    res.status(200).json({ success: true, deleteId: id });
  },
  update: async (req: TypedRequest<FishGrowType>, res: Response) => {
    const id = Number(req.body.id);

    const data = await db.getRepository(Fishgrow).findOneBy({
      id: id,
    });

    if (data) {
      data.products_id = req.body.products_id;
      data.width = req.body.width;
      data.length = req.body.length;
      data.grade = req.body.grade;
      data.weight = req.body.weight;
      data.note = req.body.note;
      data.status = req.body.status;
      data.createdAt = new Date();
      data.updatedAt = new Date();

      await db.getRepository(Fishgrow).save(data);
    }
  },
};

export default fishgrowController;