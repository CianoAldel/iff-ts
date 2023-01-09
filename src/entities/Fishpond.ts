import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, ManyToOne } from "typeorm";
import { Products } from "./Products";
import { Fishschedules } from "./Fishschedules";

// enum Type {
//   "species",
//   "product",
// }

@Entity("fish_pond")
export class Fishpond {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column("int", { nullable: true })
  user_id!: number;

  @Column("varchar", { nullable: true })
  fish_pond_id!: string;

  @Column("int", { nullable: true })
  fish_pond_name!: string;

  @Column("datetime", { nullable: true })
  schedules!: Date;

  @Column("varchar", { nullable: true })
  note!: string;

  @Column("varchar", { nullable: true })
  status!: string;

  @Column("datetime", { nullable: true })
  createdAt!: string;

  @Column("datetime", { nullable: true })
  updatedAt!: string;

  @OneToMany(() => Fishschedules, (fishschedules) => fishschedules.fishpond)
  @JoinColumn({ name: "id" })
  fishschedules!: Fishschedules[];

  @ManyToOne(() => Products, (products) => products.id)
  @JoinColumn({ name: "products_id" })
  products!: Products;
}