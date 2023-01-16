import db from "../../data-source";
import { TypedRequestBody } from "../../interface/TypedRequest";
import { Schedules } from "../../interface/FishSchedules";
import { Fishschedules } from "../../entities/Fishschedules";
import moment from "moment";
import { Fishschedulestock } from "../../entities/Fishschedulestock";
import { Request, Response, query } from "express";

const fishscheduleStockController = {
  show: async (req: Request, res: Response) => {
    //รับ query กับ body

    // if (req.query.manage_status != null && req.query.status != null) {
    const result = await db
      .getRepository(Fishschedulestock)
      .createQueryBuilder("fishschedulestock")
      .leftJoinAndSelect("fishschedulestock.fishschedules", "fishschedules")
      .leftJoinAndSelect("fishschedulestock.products", "products")
      .leftJoinAndSelect("products.fishpond", "fishpond")
      .where("fishschedules.status = :status", {
        status: req.query.status,
      })
      .orWhere("fishschedules.manage_status = :manage_status", {
        manage_status: req.query.manage_status,
      })
      .getMany();

    if (!result) return res.status(400).json({ message: "no status in your request" });

    res.json(result);
  },
};

export default fishscheduleStockController;