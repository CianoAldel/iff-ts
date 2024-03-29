import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, ManyToOne } from "typeorm";
import { Products } from "./Products";

// enum Type {
//   "species",
//   "product",
// }

@Entity("fish_health")
export class Fishhealth {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({ type: "varchar", nullable: true })
  product_id!: string;

  @Column("int", { nullable: true })
  user_id!: number;

  @Column("varchar", { nullable: true })
  symptom!: number;

  // @Column("varchar", { nullable: true })
  // status_health!: string;

  // @Column("varchar", { nullable: true })
  // status!: number;

  @Column("varchar", { nullable: true })
  note!: string;

  @Column("datetime", { nullable: true })
  history_date!: Date;

  @Column("datetime", { nullable: true })
  createdAt!: Date;

  @Column("datetime", { nullable: true })
  updatedAt!: Date;

  @ManyToOne(() => Products, (products) => products.fishhealth)
  @JoinColumn({ name: "product_id" })
  products!: Products;
}
